#!/bin/bash
# PROD DEPLOYMENT SCRIPT - CONER
# Automatiza el despliegue a producción en Cloud con Docker Compose

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 CONER PRODUCTION DEPLOYMENT - DOCKER COMPOSE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# ========================================================================
# STEP 1: PRE-DEPLOYMENT CHECKS
# ========================================================================

echo -e "${YELLOW}[STEP 1/6] Pre-Deployment Checks${NC}"
echo -e "${YELLOW}─────────────────────────────────${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not installed${NC}"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not installed${NC}"
    echo "   Install from: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed: $(docker-compose --version)${NC}"

# Check required files
for file in docker-compose.yml Dockerfile.backend Dockerfile.frontend; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Missing: $file${NC}"
        exit 1
    fi
done
echo -e "${GREEN}✓ All required files present${NC}"

# Check .env files
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗ backend/.env not found${NC}"
    echo "   Create from backend/.env.production"
    exit 1
fi
echo -e "${GREEN}✓ backend/.env configured${NC}"

if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}✗ frontend/.env not found${NC}"
    echo "   Create from frontend/.env.production"
    exit 1
fi
echo -e "${GREEN}✓ frontend/.env configured${NC}"

echo ""

# ========================================================================
# STEP 2: VALIDATE ENVIRONMENT VARIABLES
# ========================================================================

echo -e "${YELLOW}[STEP 2/6] Validating Environment Variables${NC}"
echo -e "${YELLOW}─────────────────────────────────────────${NC}"

# Load backend env
source backend/.env

required_vars=("MONGO_URL" "DB_NAME" "JWT_SECRET" "CORS_ORIGINS")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗ Missing: $var${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ All required variables set${NC}"
echo "  - MONGO_URL: ${MONGO_URL:0:20}..."
echo "  - DB_NAME: $DB_NAME"
echo "  - JWT_SECRET: [configured]"
echo "  - CORS_ORIGINS: $CORS_ORIGINS"

echo ""

# ========================================================================
# STEP 3: BUILD DOCKER IMAGES
# ========================================================================

echo -e "${YELLOW}[STEP 3/6] Building Docker Images${NC}"
echo -e "${YELLOW}──────────────────────────────${NC}"

echo "Building backend image..."
docker-compose build coner-backend

echo "Building frontend image..."
docker-compose build coner-frontend

echo -e "${GREEN}✓ Images built successfully${NC}"

echo ""

# ========================================================================
# STEP 4: VALIDATE IMAGES
# ========================================================================

echo -e "${YELLOW}[STEP 4/6] Validating Docker Images${NC}"
echo -e "${YELLOW}────────────────────────────────${NC}"

if docker images | grep -q "coner-backend"; then
    echo -e "${GREEN}✓ Backend image: OK${NC}"
else
    echo -e "${RED}✗ Backend image not found${NC}"
    exit 1
fi

if docker images | grep -q "coner-frontend"; then
    echo -e "${GREEN}✓ Frontend image: OK${NC}"
else
    echo -e "${RED}✗ Frontend image not found${NC}"
    exit 1
fi

echo ""

# ========================================================================
# STEP 5: DEPLOY SERVICES
# ========================================================================

echo -e "${YELLOW}[STEP 5/6] Deploying Services${NC}"
echo -e "${YELLOW}────────────────────────────${NC}"

echo "Starting Docker Compose services..."
docker-compose up -d

echo "Waiting for services to be healthy..."
for i in {1..30}; do
    if docker-compose exec -T coner-backend curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo "  Checking... ($i/30)"
    sleep 1
done

echo ""

# ========================================================================
# STEP 6: VERIFY DEPLOYMENT
# ========================================================================

echo -e "${YELLOW}[STEP 6/6] Verifying Deployment${NC}"
echo -e "${YELLOW}──────────────────────────────${NC}"

echo "Container status:"
docker-compose ps

echo ""
echo "Testing endpoints..."

# Backend health
if curl -s http://localhost:8000/api/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend health check: PASS${NC}"
else
    echo -e "${RED}✗ Backend health check: FAIL${NC}"
fi

# Backend API
if curl -s http://localhost:8000/docs | grep -q "Swagger"; then
    echo -e "${GREEN}✓ Backend API docs: PASS${NC}"
else
    echo -e "${RED}✗ Backend API docs: FAIL${NC}"
fi

# Frontend
if curl -s http://localhost:3000 | grep -q "html\|React"; then
    echo -e "${GREEN}✓ Frontend: PASS${NC}"
else
    echo -e "${RED}✗ Frontend: FAIL${NC}"
fi

echo ""

# ========================================================================
# DEPLOYMENT SUMMARY
# ========================================================================

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"

echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo ""
echo "1. Setup Nginx Reverse Proxy:"
echo "   - Copy nginx.conf to /etc/nginx/sites-available/coner"
echo "   - Enable: sudo ln -s /etc/nginx/sites-available/coner /etc/nginx/sites-enabled/"
echo "   - Test: sudo nginx -t"
echo "   - Reload: sudo systemctl reload nginx"
echo ""
echo "2. Setup SSL Certificate (Let's Encrypt):"
echo "   - sudo certbot certonly --nginx -d yourdomain.com"
echo "   - Update nginx.conf with certificate paths"
echo ""
echo "3. Monitor Services:"
echo "   - Logs: docker-compose logs -f"
echo "   - Status: docker-compose ps"
echo "   - Health: curl http://localhost:8000/api/health"
echo ""
echo "4. Configure Monitoring:"
echo "   - Setup prometheus/alerting (optional)"
echo "   - Enable log aggregation"
echo ""
echo -e "${BLUE}🔗 URLS:${NC}"
echo "   Backend API: http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo "   Frontend:    http://localhost:3000"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   See: PRODUCTION_DEPLOYMENT.md"
echo ""
