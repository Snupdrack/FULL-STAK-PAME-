# 🚀 GUÍA RÁPIDA - DESPLIEGUE LOCAL CONER

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Instalar Dependencias Frontend
```bash
cd frontend
npm install
```

**Tiempo estimado**: 2-3 minutos

---

### Paso 2: Terminal 1 - Iniciar Backend
```bash
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

**Esperado**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**URL**: http://localhost:8000

---

### Paso 3: Terminal 2 - Iniciar Frontend
```bash
cd frontend
npm start
```

**Esperado**:
```
Compiled successfully!
You can now view coner in the browser.
  Local:   http://localhost:3000
```

**URL**: http://localhost:3000

---

## 🔗 URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación web |
| Backend | http://localhost:8000 | API REST |
| Swagger Docs | http://localhost:8000/docs | Documentación interactiva |
| ReDoc | http://localhost:8000/redoc | Docs alternativa |
| Health Check | http://localhost:8000/api/health | Estado del servidor |

---

## ✅ Verificar que Todo Funciona

### Test 1: Backend Health
```bash
curl http://localhost:8000/api/health
```

**Respuesta esperada**:
```json
{
  "status": "healthy",
  "service": "CONER API",
  "timestamp": "2026-03-22T10:30:00Z"
}
```

### Test 2: Acceder al Frontend
Abre en tu navegador: **http://localhost:3000**

Deberías ver:
- Página de inicio con logo CONER
- Formulario de búsqueda
- Sección de administración

### Test 3: Documentación API
Abre: **http://localhost:8000/docs**

Verás:
- Todos los endpoints disponibles
- Posibilidad de testear directamente

---

## 🛠️ Solución de Problemas Comúnes

### ❌ "Port 8000 already in use"
**Solución**:
```bash
# Change port
python -m uvicorn server:app --reload --port 8001
```

### ❌ "Module not found: fastapi"
**Solución**:
```bash
pip install fastapi uvicorn
```

### ❌ "WARN: can't resolve @/"
Ignora este warning, es de webpack.

### ❌ "MongoDB connection refused"
Normal en desarrollo. La app usa modelos en memoria.

### ❌ "npm: command not found"
Instala Node.js desde: https://nodejs.org/

---

## 📊 Pruebas Disponibles

### Ejecutar Suite Completa de Pruebas
```bash
python test_local_deployment.py
```

Resultados:
```
[PASS] - Importaciones
[PASS] - Modelos Pydantic
[PASS] - Funciones Utilitarias
[PASS] - Variables de Entorno
[PASS] - Configuracion CORS
[PASS] - Validacion CURP
[PASS] - Rate Limiting
[PASS] - Rutas API
[PASS] - Configuracion Frontend

Total: 9/9 pruebas exitosas
```

---

## 🔐 Administración Local

### Crear Usuario Admin
```bash
curl -X POST http://localhost:8000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Login Admin
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Respuesta**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "username": "admin"
}
```

### Accerar Panel Admin (Frontend)
1. Abre http://localhost:3000/admin
2. Ingresa credenciales
3. Accesa al panel de control

---

## 🐳 Alternativa: Docker Compose

Si prefieres usar Docker:

```bash
docker-compose up -d
```

Verifica:
```bash
docker-compose ps
docker-compose logs -f
```

Acceso:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## 🧹 Limpiar/Reiniciar

### Detener Servicios
```bash
# Ctrl+C en cada terminal

# O con PM2
pm2 stop all
pm2 delete all
```

### Limpiar Cache
```bash
# Frontend
rm -rf frontend/build node_modules/.cache

# Backend
rm -rf backend/__pycache__
```

### Reinstalar Dependencias
```bash
# Frontend
rm package-lock.json
npm install

# Backend
pip install -r requirements.txt --force-reinstall
```

---

## 📚 Documentación Completa

- **Local Deployment**: `LOCAL_DEPLOYMENT_REPORT.md`
- **Production Deployment**: `PRODUCTION_DEPLOYMENT.md`
- **Production Readiness**: `PRODUCTION_READINESS.md`
- **Este Archivo**: `QUICK_START.md`

---

## 🎯 Checklist de Inicio

- [ ] Python 3.11+ instalado (`python --version`)
- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Clonated/descargado el proyecto
- [ ] `npm install` ejecutado en frontend/
- [ ] Backend iniciado en Terminal 1
- [ ] Frontend iniciado en Terminal 2
- [ ] Accediste a http://localhost:3000
- [ ] Ejecutaste las pruebas (`python test_local_deployment.py`)
- [ ] Consultaste la documentación

---

## 🚀 ¡Listo!

Tu entorno local está configurado y listo para comenzar a desarrollar.

**Inicio rápido**:
```bash
# Terminal 1
cd backend && python -m uvicorn server:app --reload --port 8000

# Terminal 2
cd frontend && npm start
```

Abre: http://localhost:3000

¡Que disfrutes desarrollando! 🎉

---

**Generado**: 22 de Marzo de 2026
**Versión**: 1.0
**Estado**: ✅ Listo para Uso Local
