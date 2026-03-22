#!/usr/bin/env bash

# Start CONER Application Locally
# Este script inicia el backend y frontend del proyecto CONER

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║           🚀 CONER LOCAL START SCRIPT              ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Python
echo -e "${BLUE}[1/4]${NC} Checking Python..."
if ! command -v python &> /dev/null; then
    echo -e "${RED}✗ Python not found${NC}"
    exit 1
fi
python_version=$(python --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python ${python_version} found${NC}"

# Check Node
echo -e "${BLUE}[2/4]${NC} Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "${GREEN}✓ Node ${node_version} and npm ${npm_version} found${NC}"

# Check dependencies
echo -e "${BLUE}[3/4]${NC} Checking dependencies..."
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install -q
fi
echo -e "${GREEN}✓ Frontend dependencies ready${NC}"

cd "$PROJECT_ROOT/backend"
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -q -r requirements.txt
fi
echo -e "${GREEN}✓ Backend dependencies ready${NC}"

# Change to project root
cd "$PROJECT_ROOT"

echo ""
echo -e "${BLUE}[4/4]${NC} Starting services..."
echo ""

# Display instructions
echo -e "${YELLOW}────────────────────────────────────────────────────${NC}"
echo -e "${YELLOW}Open THREE terminals and run the following commands:${NC}"
echo -e "${YELLOW}────────────────────────────────────────────────────${NC}"
echo ""

echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "  cd backend"
echo "  python -m uvicorn server:app --reload --port 8000"
echo ""

echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "  cd frontend"
echo "  npm start"
echo ""

echo -e "${BLUE}Terminal 3 - Monitoring (optional):${NC}"
echo "  npm install -g pm2"
echo "  pm2 start ecosystem.config.js"
echo ""

echo -e "${YELLOW}────────────────────────────────────────────────────${NC}"
echo ""

echo -e "${GREEN}URLs:${NC}"
echo "  Frontend:          ${BLUE}http://localhost:3000${NC}"
echo "  Backend API:       ${BLUE}http://localhost:8000${NC}"
echo "  API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo "  Health Check:      ${BLUE}http://localhost:8000/api/health${NC}"
echo ""

echo -e "${GREEN}Documentation:${NC}"
echo "  Quick Start:       QUICK_START.md"
echo "  Local Deployment:  LOCAL_DEPLOYMENT_REPORT.md"
echo "  Production Setup:  PRODUCTION_DEPLOYMENT.md"
echo ""

echo -e "${GREEN}Test your setup:${NC}"
echo "  python test_local_deployment.py"
echo ""

echo -e "${YELLOW}────────────────────────────────────────────────────${NC}"
echo ""
