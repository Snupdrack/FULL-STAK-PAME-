#!/usr/bin/env bash
# Bash script to setup and start backend and frontend for development
# Usage: chmod +x start-local.sh && ./start-local.sh
set -e
ROOT_DIR=$(dirname "$0")
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Create and activate venv
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  python -m venv "$BACKEND_DIR/.venv"
fi

# Activate venv in subshell for installation
source "$BACKEND_DIR/.venv/bin/activate"

# Install minimal backend deps
pip install --upgrade pip
pip install fastapi uvicorn motor httpx python-dotenv bcrypt PyJWT
# To install full requirements: pip install -r "$BACKEND_DIR/requirements.txt"

# Start backend in background
cd "$BACKEND_DIR"
"$BACKEND_DIR/.venv/bin/uvicorn" server:app --reload --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (pid=$BACKEND_PID)"

# Frontend install and start
cd "$FRONTEND_DIR"
if [ ! -d node_modules ]; then
  npm install
fi
npm start &
FRONTEND_PID=$!

echo "Frontend started (pid=$FRONTEND_PID)"

echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"

echo "Presiona Ctrl+C para detener ambos servidores."

# Trap to clean up background processes on exit
trap "echo -e '\nDeteniendo servidores...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

# Keep script running to listen for Ctrl+C
wait
