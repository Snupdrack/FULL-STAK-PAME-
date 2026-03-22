# 🚀 DEPLOYMENT GUIDE - VERCEL + RENDER + TU DOMINIO

**Objetivo**: Desplegar CONER completamente en tu dominio personalizado
- Frontend: **Vercel**
- Backend: **Render**
- Base de Datos: **MongoDB Atlas** (ya configurada)
- Dominio: **tudominio.com**

---

## 📋 PRE-REQUISITOS

✅ Cuenta en **Vercel** (vercel.com) - FREE
✅ Cuenta en **Render** (render.com) - FREE con límites
✅ Cuenta en **MongoDB Atlas** (ya tienes)
✅ Dominio personalizado (ej: tudominio.com)
✅ GitHub (para conectar repositorio)

---

## 🚀 PASO 1: PREPARAR REPOSITORIO EN GITHUB

### 1.1 Crear Repository en GitHub

```bash
# 1. Ve a https://github.com/new
# 2. Nombre: coner-production
# 3. Descripción: "CONER - Production Deployment"
# 4. Público o Privado (a tu preferencia)
# 5. Crear repository
```

### 1.2 Subir código a GitHub

```bash
cd /c/Users/snupd/OneDrive/Desktop/APP\ CONER/INTERFAS-CONER--main/INTERFAS-CONER--main

# Inicializar git (si no está inicializado)
git init
git add .
git commit -m "CONER Production Ready - Deployment v1.0"

# Agregar remote y subir
git remote add origin https://github.com/TU_USUARIO/coner-production.git
git branch -M main
git push -u origin main
```

**Resultado**: Código en GitHub y listo para conectar

---

## 📦 PARTE A: BACKEND EN RENDER

### A.1 Crear cuenta en Render

```
1. Ve a https://render.com
2. Sign up con GitHub (es más fácil)
3. Autoriza el acceso a tus repos
```

### A.2 Crear Web Service para Backend

```
1. En Render Dashboard → New +
2. Selecciona "Web Service"
3. Conecta tu repo: coner-production
4. Configura:
   - Name: coner-api
   - Root Directory: ./backend
   - Environment: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn server:app --workers 4 \
                   --worker-class uvicorn.workers.UvicornWorker \
                   --bind 0.0.0.0:8000
```

### A.3 Agregar Variables de Entorno (Render)

En Render Dashboard → coner-api → Environment:

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/coner_prod?retryWrites=true
DB_NAME=coner_production
JWT_SECRET=your_random_jwt_secret_here_32_chars_min
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com
API_URL=https://api.example.com/v1/imss/historial-laboral
API_KEY=your_api_key_here
API_TIMEOUT=30
```

**⚠️ IMPORTANTE**:
- Genera JWT_SECRET con: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Usa tu MongoDB Atlas URL real
- CORS_ORIGINS = tu dominio

### A.4 Deploy Backend

```
1. Render detectará cambios en GitHub automáticamente
2. O manualmente: trigger deploy en Render
3. Espera ~2 minutos
4. Verifica URL: https://coner-api.render.com
5. Health check: https://coner-api.render.com/api/health
```

**Resultado**: Backend en `https://coner-api.render.com`

---

## 🎨 PARTE B: FRONTEND EN VERCEL

### B.1 Crear cuenta en Vercel

```
1. Ve a https://vercel.com
2. Sign up con GitHub
3. Autoriza acceso a repos
```

### B.2 Importar Proyecto en Vercel

```
1. En Vercel Dashboard → Add New... → Project
2. Selecciona: coner-production
3. Configura Root Directory si pide: ./frontend
4. Framework: Create React App
```

### B.3 Configurar Variables de Entorno (Vercel)

En Vercel → coner-production → Settings → Environment Variables:

```
REACT_APP_BACKEND_URL=https://coner-api.render.com
```

**Importante**: Esto apunta al backend en Render

### B.4 Deploy Frontend

```
1. Vercel automáticamente deployará después del push a GitHub
2. O manualmente: trigger deploy
3. Espera ~30 segundos
4. Tu app estará en: https://coner-production.vercel.app
```

**Resultado**: Frontend en `https://coner-production.vercel.app`

---

## 🌐 PARTE C: CONECTAR TU DOMINIO

### C.1 Agregar Dominio a Vercel

```
1. Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Ingresa: tudominio.com
4. Vercel mostrará instrucciones DNS
```

### C.2 Configurar DNS en Registrador

Dependiendo de dónde compraste tu dominio (GoDaddy, Namecheap, etc.):

```
1. Ve a tu registrador de dominios
2. Busca DNS Records / Nameservers
3. Agrega records que Vercel sugiere:

   Tipo A:     @ → IP_VERCEL (dado por Vercel)
   Tipo CNAME: www → cname.vercel.com

   O si usas nameservers Vercel (más fácil):
   ns1.vercel.com
   ns2.vercel.com
   ns3.vercel.com
   ns4.vercel.com
```

### C.3 Verificar Dominio

```bash
# Espera 24-48 horas para propagación DNS
# O verifica al instante:
nslookup tudominio.com
```

**Resultado**: Frontend en `https://tudominio.com`

---

## 🔗 PARTE D: CONECTAR BACKEND AL DOMINIO (Opcional pero Recomendado)

### Opción 1: Subdominio (Recomendado)

```
1. En tu registrador, agrega:

   CNAME: api → coner-api.render.com

2. Luego accedes: https://api.tudominio.com
3. Actualiza CORS en Render:

   CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com,https://api.tudominio.com
```

### Opción 2: Mismo dominio con rutas

```
Usa un proxy en Vercel para:
GET /api/* → https://coner-api.render.com/*

(Más complicado, omitir por ahora)
```

**Recomendación**: Usa Opción 1 (subdominio api)

---

## ✅ VERIFICACIÓN FINAL

### Test 1: Frontend accesible

```bash
curl https://tudominio.com
# Debe retornar HTML de React
```

### Test 2: Backend accesible

```bash
curl https://api.tudominio.com/api/health
# Debe retornar: {"status": "healthy", ...}
```

### Test 3: API funcionando

```bash
curl https://api.tudominio.com/docs
# Debe abrir Swagger documentation
```

### Test 4: Login admin

```bash
curl -X POST https://api.tudominio.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"yourpassword"}'
```

---

## 📊 ARQUITECTURA FINAL

```
┌─────────────────────────────────────────┐
│        tudominio.com                    │
│     (Vercel + Dominio Personalizado)    │
│                                         │
│    https://tudominio.com         ◄──┐  │
│    (Frontend React)               │  │  │
│                                   │  │  │
│    https://api.tudominio.com ◄───┘  │  │
│    (Backend FastAPI)                │  │
│                                      │  │
│    MongoDB Atlas                      │  │
│    (Base de datos)            ◄──────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 SEGURIDAD EN PRODUCCIÓN

### CRÍTICO: Environment Variables

Nunca commitees:
- JWT_SECRET
- MONGO_URL
- API_KEY

**✓ Hacer**: Guardar en Vercel/Render variables
**✗ NO hacer**: Poner en .env commiteado

### CRÍTICO: CORS

Verifica que CORS está configurado:

```
CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com,https://api.tudominio.com
```

**NUNCA** uses: `*` o `localhost` en producción

### CRÍTICO: HTTPS

```
✓ Vercel: Automático HTTPS
✓ Render: Automático HTTPS
✓ Dominio: Automático con Let's Encrypt
```

---

## 🆘 TROUBLESHOOTING

### "CORS Error en Frontend"

```
Solución:
1. Verifica CORS_ORIGINS en Render
2. Asegúrate que incluye tudominio.com
3. Si cambias CORS, redeploy en Render
4. Espera 5 minutos y prueba
```

### "Backend no responde"

```
Solución:
1. Verifica MongoDB connection en Render logs
2. Health check: https://coner-api.render.com/api/health
3. Los workers gratuitos de Render duermen después de 15 min
   inactividad, espera ~30 segundos al activar
```

### "Dominio no funciona"

```
Solución:
1. Espera 24-48 horas para propagación DNS
2. Verifica DNS records: nslookup tudominio.com
3. Revisa configuración en registrador
4. En Vercel, verifica que dominio está en Settings
```

### "Certificado SSL pendiente"

```
Solución:
1. Vercel maneja SSL automáticamente
2. Puede tomar 24 horas para algunas registradores
3. Usa https:// siempre (Vercel redirecciona)
```

---

## 📱 TEST DE USO

Después de deploy:

```
1. Abre: https://tudominio.com
2. Ingresa al login admin: /admin
3. Usa admin/tu_password
4. Testea búsqueda de CURP
5. Verifica estadísticas
6. Todo debe funcionar como local
```

---

## 🎯 RESUMEN DE URLs

| Componente | URL | Estado |
|-----------|-----|--------|
| Frontend | https://tudominio.com | ✅ Vercel |
| Backend API | https://api.tudominio.com | ✅ Render |
| API Docs | https://api.tudominio.com/docs | ✅ Swagger |
| Health | https://api.tudominio.com/api/health | ✅ Monitoring |
| Admin Panel | https://tudominio.com/admin | ✅ Dashboard |

---

## 📚 DOCUMENTOS RELACIONADOS

- `PRODUCTION_DEPLOYMENT.md` - Guía general
- `PRODUCTION_READINESS.md` - Checklist
- `nginx.conf` - Para referencia (no usaremos)
- `deploy-to-production.sh` - Para Docker (alternativo)

---

## 🔄 PRÓXIMOS PASOS DESPUÉS DEL DEPLOY

### Día 1-2 (Validación)
- [ ] Test todos los endpoints
- [ ] Verifica CORS funciona
- [ ] Prueba login y admin panel
- [ ] Busca historial laboral
- [ ] Verifica emails (si aplica)

### Semana 1 (Monitoreo)
- [ ] Monitorea logs en Render y Vercel
- [ ] Configura alertas
- [ ] Backup de MongoDB
- [ ] Documentar problemas

### Mes 1 (Optimización)
- [ ] Análisis de performance
- [ ] Optimizar queries
- [ ] Considerar upgrades si necesario
- [ ] Plan de escalado

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Cuánto cuesta?**
- Vercel Frontend: Gratis (hasta 100GB/mes)
- Render Backend: Gratis con límites (1 web service gratis)
- MongoDB Atlas: Gratis (hasta 512MB)
- Total: **Gratis inicialmente**

**P: ¿Cómo agrego más features?**
1. Modificas código local
2. Pushas a GitHub
3. Vercel/Render redeploy automático
4. Estará en https://tudominio.com en 1-5 min

**P: ¿Cómo cambio JWT_SECRET?**
1. Genera nuevo: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Actualiza en Render Environment
3. Redeploy
4. ⚠️ Los tokens JWT existentes se invalidarán

**P: ¿Cómo hago copias de seguridad?**
1. MongoDB Atlas: Backup automático (free)
2. GitHub: Todos los cambios guardados
3. Render: Auto-redeploy en cambios

---

## 🚀 ¡LISTO!

Has completado el deployment de CONER en producción con:
- ✅ Frontend React en Vercel
- ✅ Backend FastAPI en Render
- ✅ Base de datos en MongoDB Atlas
- ✅ Dominio personalizado
- ✅ HTTPS/SSL automático
- ✅ Monitoreo integrado

Tu aplicación está **LIVE** en: **https://tudominio.com** 🎉

---

**Versión**: 1.0 - Vercel + Render
**Fecha**: 22 de Marzo de 2026
**Estado**: Production Ready
