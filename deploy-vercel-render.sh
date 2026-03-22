#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# VERCEL + RENDER DEPLOYMENT SCRIPT
# Guía paso a paso para deployar CONER con Vercel + Render
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║           🚀 CONER - VERCEL + RENDER DEPLOYMENT GUIDE                ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# ═══════════════════════════════════════════════════════════════════════════
# PASO 1: PRE-REQUISITOS
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[PASO 1/5]${NC} Verificando Pre-requisitos..."
echo ""

# Check GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓${NC} GitHub CLI instalado"
else
    echo -e "${YELLOW}⚠${NC} GitHub CLI NO instalado (opcional pero útil)"
    echo "   Instalar: https://cli.github.com"
fi

# Check Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} Git instalado: $(git --version | awk '{print $3}')"
else
    echo -e "${RED}✗${NC} Git NO instalado"
    echo "   Instalar: https://git-scm.com"
    exit 1
fi

echo ""
echo -e "${BLUE}Pre-requisitos a tener listos:${NC}"
echo ""
echo "  [ ] Cuenta en Vercel (vercel.com)"
echo "  [ ] Cuenta en Render (render.com)"
echo "  [ ] Cuenta en GitHub (github.com)"
echo "  [ ] MongoDB Atlas URL configurada"
echo "  [ ] Dominio personalizado (tudominio.com)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PASO 2: GIT & GITHUB
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[PASO 2/5]${NC} Preparar GitHub"
echo ""
echo "Instrucciones:"
echo "  1. Ve a https://github.com/new"
echo "  2. Nombre: coner-production"
echo "  3. Descripción: 'CONER - Production Deployment'"
echo "  4. Selecciona: Público (para Vercel/Render)"
echo "  5. Crear repository"
echo ""
echo -e "${YELLOW}Presiona ENTER cuando hayas creado el repo...${NC}"
read -p ""

echo ""
echo "Subiendo código a GitHub..."
echo ""

# Git initialization
if [ ! -d .git ]; then
    git init
    echo -e "${GREEN}✓${NC} Git inicializado"
else
    echo -e "${GREEN}✓${NC} Git ya inicializado"
fi

# Git add and commit
git add .
git commit -m "CONER Production Ready - Initial Deployment" || true
echo -e "${GREEN}✓${NC} Cambios commiteados"

echo ""
echo -e "${YELLOW}Ahora sube a GitHub:${NC}"
echo ""
echo "  git remote add origin https://github.com/TU_USUARIO/coner-production.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo -e "${YELLOW}Presiona ENTER cuando hayas subido a GitHub...${NC}"
read -p ""

# ═══════════════════════════════════════════════════════════════════════════
# PASO 3: DEPLOY BACKEND EN RENDER
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[PASO 3/5]${NC} Deploy Backend en Render"
echo ""
echo "Instrucciones:"
echo "  1. Ve a https://render.com"
echo "  2. Sign up con GitHub"
echo "  3. Click: 'New +' → 'Web Service'"
echo "  4. Conecta tu repo: coner-production"
echo "  5. Configura:"
echo "     - Name: coner-api"
echo "     - Root Directory: ./backend"
echo "     - Environment: Python 3"
echo "     - Build Command: pip install -r requirements.txt"
echo "     - Start Command: gunicorn server:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000"
echo ""
echo "  6. Settings → Environment Variables. Agrega:"
echo ""

cat << 'EOF'
     MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/coner_prod?retryWrites=true
     DB_NAME=coner_production
     JWT_SECRET=<genera_uno_nuevo>
     CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com,https://api.tudominio.com
     API_URL=https://api.example.com/v1/imss/historial-laboral
     API_KEY=<tu_api_key>
     API_TIMEOUT=30
EOF

echo ""
echo -e "${YELLOW}Presiona ENTER cuando hayas deployado en Render...${NC}"
read -p ""

echo -e "${GREEN}✓${NC} Backend deployado en Render"
echo "   URL: https://coner-api.render.com"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PASO 4: DEPLOY FRONTEND EN VERCEL
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[PASO 4/5]${NC} Deploy Frontend en Vercel"
echo ""
echo "Instrucciones:"
echo "  1. Ve a https://vercel.com"
echo "  2. Sign up con GitHub"
echo "  3. Click: 'Add New' → 'Project'"
echo "  4. Selecciona: coner-production"
echo "  5. Configura Root Directory: ./frontend"
echo "  6. Framework: Create React App (auto-detectará)"
echo "  7. Settings → Environment Variables. Agrega:"
echo ""
echo "     REACT_APP_BACKEND_URL=https://coner-api.render.com"
echo ""
echo "  8. Click Deploy"
echo ""
echo -e "${YELLOW}Presiona ENTER cuando hayas deployado en Vercel...${NC}"
read -p ""

echo -e "${GREEN}✓${NC} Frontend deployado en Vercel"
echo "   URL: https://coner-production.vercel.app"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PASO 5: CONFIGURAR DOMINIO
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${BLUE}[PASO 5/5]${NC} Configurar Dominio Personalizado"
echo ""
echo "Instrucciones para VERCEL (Frontend):"
echo "  1. Vercel Dashboard → Settings → Domains"
echo "  2. Click 'Add Domain'"
echo "  3. Ingresa: tudominio.com"
echo "  4. Vercel mostrará records DNS"
echo "  5. Ve a tu registrador (GoDaddy, Namecheap, etc)"
echo "  6. Agrega los records sugeridos por Vercel"
echo "  7. Espera 24-48 horas para propagación"
echo ""
echo "Instrucciones para RENDER (Backend):"
echo "  1. Render Dashboard → coner-api → Settings"
echo "  2. Custom Domains"
echo "  3. Agrega: api.tudominio.com"
echo "  4. Render generará un CNAME"
echo "  5. Ve a tu registrador y agrega el CNAME:"
echo ""
echo "     CNAME: api → coner-api.render.com"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# VERIFICACIÓN FINAL
# ═══════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[VERIFICACIÓN FINAL]${NC}"
echo ""
echo "Prueba estos URLs después de 24 horas:"
echo ""
echo -e "  ${GREEN}✓${NC} Frontend:   https://tudominio.com"
echo -e "  ${GREEN}✓${NC} Backend:    https://api.tudominio.com/api/health"
echo -e "  ${GREEN}✓${NC} API Docs:   https://api.tudominio.com/docs"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${GREEN}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETADO${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Tu aplicación CONER está en producción:"
echo ""
echo -e "  Frontend:  ${BLUE}https://tudominio.com${NC}"
echo -e "  Backend:   ${BLUE}https://api.tudominio.com${NC}"
echo ""
echo "Monitoreo:"
echo "  • Vercel Logs: https://vercel.com/dashboard"
echo "  • Render Logs: https://render.com/dashboard"
echo ""
echo "Documentación:"
echo "  • Ver: DEPLOY_VERCEL_RENDER.md"
echo ""
