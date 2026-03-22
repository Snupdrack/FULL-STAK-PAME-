# CONER - Consultores Especializados en Retiros

**Estado de Producción**: ✅ **LISTO PARA PRODUCCIÓN**

## Descripción

CONER es una aplicación web moderna para consultar historiaal laboral del IMSS. Cuenta con:

- **Frontend**: React 18 con interfaz elegante y responsiva
- **Backend**: FastAPI con autenticación JWT
- **Base de Datos**: MongoDB
- **Panel Admin**: Configuración y estadísticas en tiempo real

## 📋 Documentación Importante

- **🚀 [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)** - Resumen completo de optimizaciones
- **📖 [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Guía detallada de deployment
- **⚙️ [backend/.env.example](./backend/.env.example)** - Variables de configuración

## 🚀 Quick Start

### Con Docker (Recomendado)

```bash
# Clonar y preparar
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Actualizar valores en los archivos .env
# Ejecutar con Docker
docker-compose up -d

# Verificar servicios
docker-compose ps
```

### Manual

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn server:app --reload

# Frontend (en otra terminal)
cd frontend
npm install
npm start
```

## ⚙️ Configuración

### Variables Requeridas

#### Backend (.env)
```
MONGO_URL=mongodb://...
DB_NAME=coner_db
JWT_SECRET=<clave-fuerte-generada>
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

## 🔒 Seguridad

✅ Hardcoded secrets removidos
✅ CORS configurado correctamente
✅ JWT tokens con expiración
✅ Rate limiting implementado
✅ Validación de entrada robusta
✅ Error boundaries en React

## 📊 Características

- ✅ Consulta de historial laboral via CURP
- ✅ Descarga de reportes en PDF
- ✅ Panel administrativo protegido
- ✅ Control de configuración de API
- ✅ Estadísticas de consultas
- ✅ Health checks para monitoreo

## 🔍 Verificación

```bash
# Health check
curl http://localhost:8000/api/health

# API Docs
http://localhost:8000/docs

# Frontend
http://localhost:3000

# Admin Panel
http://localhost:3000/admin
```

## 📱 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/admin` | Login de administrador |
| `/admin/panel` | Panel administrativo |
| `/api/health` | Health check |
| `/api/historial-laboral` | Consulta de historial |

## 🐳 Docker

```bash
# Iniciar
docker-compose up -d

# Detener
docker-compose down

# Logs
docker-compose logs -f coner-backend
docker-compose logs -f coner-frontend

# Rebuild
docker-compose up -d --build
```

## 📈 Producción

Para desplegar en producción:

1. Ver [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
2. Generar JWT_SECRET fuerte
3. Configurar CORS_ORIGINS
4. Configurar MongoDB seguro
5. Configurar Nginx con SSL
6. Monitorear salud de servicios

## 🆘 Solución de Problemas

Ver [PRODUCTION_DEPLOYMENT.md - Troubleshooting](./PRODUCTION_DEPLOYMENT.md#troubleshooting)

## 📅 Mantenimiento

- Backups diarios de MongoDB
- Revisión de logs diaria
- Actualización de dependencias mensual
- Auditoría de seguridad trimestral
- Prueba de recuperación trimestral

## 📞 Información

Para más detalles sobre optimizaciones y mejoras:

- [Production Readiness Report](./PRODUCTION_READINESS.md)
- [Deployment Guide](./PRODUCTION_DEPLOYMENT.md)

