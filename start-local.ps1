# PowerShell script to setup and start backend and frontend for development
# Usage: Open PowerShell, cd to this folder and run: .\start-local.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Write-Host "Project root: $root"

# Backend paths
$backendDir = Join-Path $root 'backend'
$venvDir = Join-Path $backendDir '.venv'

# Frontend paths
$frontendDir = Join-Path $root 'frontend'

# Step 1: Backend - create venv and install minimal deps if venv not exists
if (-not (Test-Path $venvDir)) {
    Write-Host "Creating Python virtual environment..."
    python -m venv $venvDir
}

# Activate venv
$activate = Join-Path $venvDir 'Scripts\Activate.ps1'
. $activate

# Install minimal backend dependencies (faster). Uncomment full install if you want all requirements.
Write-Host "Installing minimal backend dependencies (fast)..."
pip install --upgrade pip
pip install fastapi uvicorn motor httpx python-dotenv bcrypt PyJWT
# To install all requirements, uncomment:
# pip install -r (Join-Path $backendDir 'requirements.txt')

# Step 2: Start backend in new PowerShell window
$backendCmd = "& `".\.venv\Scripts\Activate.ps1`"; uvicorn server:app --reload --port 8000"
Write-Host "Starting backend..."
Start-Process powershell -ArgumentList "-NoExit","-Command",$backendCmd -WorkingDirectory $backendDir

# Step 3: Frontend - install and start in new PowerShell window
Write-Host "Installing frontend dependencies (may take time)..."
Push-Location $frontendDir
if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
    npm install
}
Pop-Location

$frontendCmd = "npm start"
Write-Host "Starting frontend..."
Start-Process powershell -ArgumentList "-NoExit","-Command",$frontendCmd -WorkingDirectory $frontendDir

Write-Host "Done. Backend should be at http://localhost:8000 and frontend at http://localhost:3000"
Start-Process "http://localhost:3000"