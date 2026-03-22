from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import jwt
import bcrypt
import re
from collections import defaultdict
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Load and validate critical environment variables (fail fast)
MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')
JWT_SECRET = os.environ.get('JWT_SECRET')
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '')

missing = []
if not MONGO_URL:
    missing.append('MONGO_URL')
if not DB_NAME:
    missing.append('DB_NAME')
if not JWT_SECRET:
    missing.append('JWT_SECRET')

if missing:
    raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

# MongoDB connection (use defaults but allow overriding)
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# JWT Configuration
# In production ensure JWT_SECRET is strong and not stored in repo
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app with documentation
app = FastAPI(
    title="CONER API",
    description="API para consulta de historial laboral IMSS",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===================== MODELS =====================

class AdminConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    api_url: str = ""
    api_key: str = ""
    timeout_seconds: int = 30
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminConfigUpdate(BaseModel):
    api_url: Optional[str] = None
    api_key: Optional[str] = None
    timeout_seconds: Optional[int] = None

class AdminUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class CURPQuery(BaseModel):
    curp: str
    nss: Optional[str] = None

class HistorialResponse(BaseModel):
    status: str
    code: int
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

class QueryLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    curp: str
    nss: Optional[str] = None
    success: bool
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ===================== HELPER FUNCTIONS =====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_admin_config() -> AdminConfig:
    config = await db.admin_config.find_one({}, {"_id": 0})
    if config:
        if isinstance(config.get('created_at'), str):
            config['created_at'] = datetime.fromisoformat(config['created_at'])
        if isinstance(config.get('updated_at'), str):
            config['updated_at'] = datetime.fromisoformat(config['updated_at'])
        return AdminConfig(**config)
    
    # Create default config if none exists
    default_config = AdminConfig()
    doc = default_config.model_dump()
    # store datetimes as datetime objects (motor/pymongo supports datetime)
    await db.admin_config.insert_one(doc)
    return default_config

# ===================== ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "CONER API - Consultores Especializados en Retiros"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "service": "CONER API",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ----- HISTORIAL LABORAL -----

@api_router.post("/historial-laboral", response_model=HistorialResponse)
async def consultar_historial(query: CURPQuery):
    """Consulta el historial laboral usando la CURP"""
    config = await get_admin_config()

    # Validate config
    if not config.api_url or not config.api_key:
        raise HTTPException(
            status_code=500,
            detail="Configuración de API no completada. Contacte al administrador."
        )

    # Validate CURP format (18 characters)
    if len(query.curp) != 18:
        raise HTTPException(
            status_code=400,
            detail="La CURP debe tener exactamente 18 caracteres"
        )
    # More robust CURP validation (server-side)
    curp_regex = r"^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$" # Adjusted regex for 18 chars
    if not re.match(curp_regex, query.curp.upper()):
        raise HTTPException(status_code=400, detail="El formato de la CURP no es válido")
    
    try:
        # Build query params
        params = {"curp": query.curp.upper()}
        if query.nss:
            params["nss"] = query.nss
        
        async with httpx.AsyncClient(timeout=config.timeout_seconds) as client_http:
            response = await client_http.get(
                config.api_url,
                params=params,
                headers={"x-api-key": config.api_key}
            )
            
            # Log the query
            log_entry = QueryLog(
                curp=query.curp.upper(),
                nss=query.nss,
                success=response.status_code == 200
            )
            log_doc = log_entry.model_dump()
            # keep timestamp as datetime object for MongoDB
            await db.query_logs.insert_one(log_doc)
            
            if response.status_code == 200:
                data = response.json()
                return HistorialResponse(
                    status="success",
                    code=200,
                    message="Consulta realizada correctamente",
                    data=data.get("data") if "data" in data else data
                )
            else:
                error_msg = f"Error de la API externa: {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg = error_data.get("message", error_msg)
                except:
                    pass
                
                return HistorialResponse(
                    status="error",
                    code=response.status_code,
                    message=error_msg,
                    error=error_msg
                )
                
    except httpx.TimeoutException:
        # Log failed query
        log_entry = QueryLog(
            curp=query.curp.upper(),
            nss=query.nss,
            success=False,
            error_message="Timeout al conectar con la API"
        )
        log_doc = log_entry.model_dump()
        # keep timestamp as datetime object for MongoDB
        await db.query_logs.insert_one(log_doc)
        
        return HistorialResponse(
            status="error",
            code=504,
            message="Tiempo de espera agotado al conectar con el servicio",
            error="Timeout"
        )
    except httpx.RequestError as e:
        logger.error(f"Error de conexión: {str(e)}")
        
        # Log failed query
        log_entry = QueryLog(
            curp=query.curp.upper(),
            nss=query.nss,
            success=False,
            error_message=str(e)
        )
        log_doc = log_entry.model_dump()
        # keep timestamp as datetime object for MongoDB
        await db.query_logs.insert_one(log_doc)
        
        return HistorialResponse(
            status="error",
            code=503,
            message="Error al conectar con el servicio de consulta",
            error=str(e)
        )

# ----- ADMIN AUTH -----

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(credentials: AdminLogin):
    """Login de administrador"""
    user = await db.admin_users.find_one({"username": credentials.username}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(credentials.username)
    return TokenResponse(access_token=token, username=credentials.username)

@api_router.post("/admin/setup")
async def admin_setup(credentials: AdminLogin):
    """Crear usuario administrador inicial (solo si no existe ninguno)"""
    existing = await db.admin_users.count_documents({})
    if existing > 0:
        raise HTTPException(status_code=400, detail="Ya existe un usuario administrador")
    
    admin_user = AdminUser(
        username=credentials.username,
        password_hash=hash_password(credentials.password)
    )
    doc = admin_user.model_dump()
    await db.admin_users.insert_one(doc)
    
    return {"message": "Usuario administrador creado exitosamente"}

@api_router.get("/admin/check-setup")
async def check_admin_setup():
    """Verificar si ya existe un usuario administrador"""
    count = await db.admin_users.count_documents({})
    return {"admin_exists": count > 0}

# ----- ADMIN CONFIG -----

@api_router.get("/admin/config")
async def get_config(username: str = Depends(verify_token)):
    """Obtener configuración actual (requiere autenticación)"""
    config = await get_admin_config()
    return {
        "api_url": config.api_url,
        "timeout_seconds": config.timeout_seconds,
        "updated_at": config.updated_at.isoformat()
    }

@api_router.put("/admin/config")
async def update_config(update: AdminConfigUpdate, username: str = Depends(verify_token)):
    """Actualizar configuración (requiere autenticación)"""
    current_config = await get_admin_config()
    
    update_data = {}
    if update.api_url is not None:
        update_data["api_url"] = update.api_url
    if update.api_key is not None:
        update_data["api_key"] = update.api_key
    if update.timeout_seconds is not None:
        update_data["timeout_seconds"] = update.timeout_seconds
    
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await db.admin_config.update_one(
            {"id": current_config.id},
            {"$set": update_data}
        )
    
    return {"message": "Configuración actualizada exitosamente"}

# ----- ADMIN STATS -----

@api_router.get("/admin/stats")
async def get_stats(username: str = Depends(verify_token)):
    """Obtener estadísticas de consultas (requiere autenticación)"""
    total_queries = await db.query_logs.count_documents({})
    successful_queries = await db.query_logs.count_documents({"success": True})
    failed_queries = await db.query_logs.count_documents({"success": False})
    
    # Get recent queries
    recent = await db.query_logs.find(
        {}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    # Serialize datetime fields for JSON response
    recent_serialized = []
    for r in recent:
        if isinstance(r.get('timestamp'), datetime):
            r['timestamp'] = r['timestamp'].isoformat()
        recent_serialized.append(r)
    
    return {
        "total_queries": total_queries,
        "successful_queries": successful_queries,
        "failed_queries": failed_queries,
        "recent_queries": recent_serialized
    }

# Include the router in the main app
app.include_router(api_router)

# Simple in-memory rate limiter
rate_limit_store: defaultdict = defaultdict(list)

def is_rate_limited(client_ip: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
    """Check if client has exceeded rate limit"""
    now = time.time()
    key = client_ip

    # Clean old entries
    rate_limit_store[key] = [timestamp for timestamp in rate_limit_store[key] if now - timestamp < window_seconds]

    if len(rate_limit_store[key]) >= max_requests:
        return True

    rate_limit_store[key].append(now)
    return False

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS.split(',')] if CORS_ORIGINS else [],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
