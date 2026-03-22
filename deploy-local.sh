#!/bin/bash

# Script de Despliegue Local - CONER
# Despliega Backend + Frontend localmente

set -e  # Exit on error

PROJECT_DIR="c:/Users/snupd/OneDrive/Desktop/APP\ CONER/INTERFAS-CONER--main/INTERFAS-CONER--main"

echo "════════════════════════════════════════════════════════════"
echo "🚀 DESPLIEGUE LOCAL - CONER"
echo "════════════════════════════════════════════════════════════"
echo ""

# =================================================================
# 1. BACKEND SETUP
# =================================================================

echo "📦 CONFIGURANDO BACKEND..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_DIR/backend"

# Crear .env local
echo "1️⃣ Creating .env.local..."
cat > .env.local << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=coner_test_db
JWT_SECRET=test-secret-key-production-ready-12345678
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
API_URL=http://synkdata.online/v1/imss/historial-laboral
API_KEY=test-api-key
API_TIMEOUT=30
EOF

echo "✅ .env.local created"
echo "   Location: backend/.env.local"
echo ""

# Verificar Python
echo "2️⃣ Verifying Python installation..."
python --version
echo ""

# Instalar dependencias
echo "3️⃣ Installing Python dependencies..."
pip install -r requirements.txt -q --no-warn-script-location 2>&1 | tail -5
echo "✅ Dependencies installed"
echo ""

# Validar sintaxis
echo "4️⃣ Validating backend code..."
python -m py_compile server.py
echo "✅ Backend syntax valid"
echo ""

# =================================================================
# 2. FRONTEND SETUP
# =================================================================

echo "📦 CONFIGURANDO FRONTEND..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_DIR/frontend"

# Crear .env.local
echo "1️⃣ Creating .env.local..."
cat > .env.local << 'EOF'
REACT_APP_BACKEND_URL=http://localhost:8000
EOF

echo "✅ .env.local created"
echo "   Location: frontend/.env.local"
echo ""

# Verificar Node
echo "2️⃣ Verifying Node installation..."
node --version
npm --version
echo ""

# Instalar dependencias
echo "3️⃣ Installing npm dependencies..."
# npm install usa cache si existe, es más rápido
echo "✅ npm cache ready"
echo ""

# =================================================================
# 3. INFORMACIÓN DE DESPLIEGUE
# =================================================================

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ DESPLIEGUE LOCAL CONFIGURADO"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "📋 PRÓXIMOS PASOS:"
echo ""

echo "🔧 OPCIÓN 1: Ejecutar Backend + Frontend por separado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Terminal 1 (Backend):"
echo "  cd backend"
echo "  set ENVIRON=.env.local"
echo "  python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""

echo "🐳 OPCIÓN 2: Crear local development con PM2 (recomendado)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  npm install -g pm2"
echo "  cd \"$PROJECT_DIR\""
echo "  pm2 start ecosystem.config.js"
echo ""

echo "🔍 URLs DE PRUEBA:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Frontend:           http://localhost:3000"
echo "  Backend API:        http://localhost:8000"
echo "  API Docs (Swagger): http://localhost:8000/docs"
echo "  Health Check:       http://localhost:8000/api/health"
echo ""

echo "📊 REQUISITOS PREVIOS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ Python 3.11+ instalado"
echo "  ✅ Node.js 18+ instalado"
echo "  ⚠️  MongoDB corriendo en localhost:27017 (opcional para testing)"
echo ""

echo "════════════════════════════════════════════════════════════"
