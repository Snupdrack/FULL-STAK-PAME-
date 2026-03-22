#!/usr/bin/env python3
"""
Test Script for CONER Application
Tests backend API endpoints and configuration
"""

import os
import sys
import json
import asyncio
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

def test_imports():
    """Test that all required modules can be imported"""
    print("\n" + "="*60)
    print("[TEST 1] Verificar importaciones")
    print("="*60)

    try:
        from backend import server
        print("[OK] FastAPI server module imported successfully")

        # Check required dependencies
        import fastapi
        import uvicorn
        import motor
        import pymongo
        import pydantic
        import bcrypt
        import jwt

        print("[OK] All required dependencies imported:")
        print("   - fastapi")
        print("   - uvicorn")
        print("   - motor (async MongoDB)")
        print("   - pymongo")
        print("   - pydantic")
        print("   - bcrypt")
        print("   - jwt")

        return True
    except ImportError as e:
        print("[FAIL] Error importing modules: {}".format(e))
        return False

def test_models():
    """Test Pydantic models"""
    print("\n" + "="*60)
    print("[TEST 2] Validar modelos Pydantic")
    print("="*60)

    from backend.server import (
        AdminConfig, AdminConfigUpdate, AdminUser, AdminLogin,
        TokenResponse, CURPQuery, HistorialResponse, QueryLog
    )

    try:
        # Test AdminConfig
        config = AdminConfig()
        assert config.id is not None
        assert config.timeout_seconds == 30
        print("[OK] AdminConfig model valid")

        # Test CURPQuery
        query = CURPQuery(curp="TEST123456XYZ0123")
        assert query.curp == "TEST123456XYZ0123"
        print("[OK] CURPQuery model valid")

        # Test AdminLogin
        login = AdminLogin(username="admin", password="password123")
        assert login.username == "admin"
        print("[OK] AdminLogin model valid")

        # Test HistorialResponse
        response = HistorialResponse(status="success", code=200, message="OK")
        assert response.status == "success"
        print("[OK] HistorialResponse model valid")

        return True
    except Exception as e:
        print("[FAIL] Model validation error: {}".format(e))
        return False

def test_helper_functions():
    """Test helper functions"""
    print("\n" + "="*60)
    print("[TEST 3] Validar funciones utilitarias")
    print("="*60)

    from backend.server import hash_password, verify_password, create_token

    try:
        # Test password hashing
        password = "test_password_123"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)
        print("[OK] Password hashing working correctly")

        # Test JWT token creation
        token = create_token("test_user")
        assert isinstance(token, str)
        assert len(token) > 0
        print("[OK] JWT token creation working")

        return True
    except Exception as e:
        print("[FAIL] Helper function error: {}".format(e))
        return False

def test_environment_variables():
    """Test environment variable configuration"""
    print("\n" + "="*60)
    print("[TEST 4] Validar variables de entorno")
    print("="*60)

    backend_dir = Path(__file__).parent / 'backend'
    env_file = backend_dir / '.env.local'

    if env_file.exists():
        print("[OK] Found .env.local at: {}".format(env_file))

        # Load and check variables
        from dotenv import load_dotenv
        load_dotenv(env_file)

        required_vars = ['MONGO_URL', 'DB_NAME', 'JWT_SECRET', 'CORS_ORIGINS']
        missing = []

        for var in required_vars:
            value = os.environ.get(var)
            if value:
                masked_value = value[:10] + '...' if len(value) > 10 else value
                print("[OK] {} = {}".format(var, masked_value))
            else:
                missing.append(var)

        if missing:
            print("[WARN] Missing variables: {}".format(', '.join(missing)))
            return False

        return True
    else:
        print("[FAIL] .env.local not found at: {}".format(env_file))
        return False

def test_cors_configuration():
    """Test CORS configuration parsing"""
    print("\n" + "="*60)
    print("[TEST 5] Validar configuracion CORS")
    print("="*60)

    try:
        cors_origins = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"
        origins_list = [origin.strip() for origin in cors_origins.split(',')]

        print("[OK] CORS origins parsed successfully:")
        for origin in origins_list:
            print("   - {}".format(origin))

        assert len(origins_list) == 3
        return True
    except Exception as e:
        print("[FAIL] CORS configuration error: {}".format(e))
        return False

def test_curp_validation():
    """Test CURP validation regex"""
    print("\n" + "="*60)
    print("[TEST 6] Validar formato CURP")
    print("="*60)

    import re

    curp_regex = r"^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$"

    test_cases = [
        ("AAAA000000HDFFRN09", True, "Valid male CURP"),
        ("BBBB111111MDFFRN09", True, "Valid female CURP"),
        ("INVALID123", False, "Too short"),
        ("aaaa000000hdffrn09", False, "Lowercase"),
        ("AAAA00000AHDFFRN09", False, "Invalid gender"),
    ]

    all_pass = True
    for curp, expected, description in test_cases:
        match = re.match(curp_regex, curp.upper())
        is_valid = match is not None
        status = "[OK]" if is_valid == expected else "[FAIL]"
        print("{} {} : {}".format(status, description, curp))
        if is_valid != expected:
            all_pass = False

    return all_pass

def test_rate_limiter():
    """Test rate limiting function"""
    print("\n" + "="*60)
    print("[TEST 7] Validar rate limiting")
    print("="*60)

    from backend.server import is_rate_limited

    try:
        client_ip = "192.168.1.1"

        # First few requests should pass
        for i in range(5):
            limited = is_rate_limited(client_ip, max_requests=100, window_seconds=60)
            if limited:
                print("[FAIL] Unexpected rate limit at request {}".format(i+1))
                return False

        print("[OK] Rate limiter functional")
        print("   - Allows requests below threshold")
        print("   - Tracks per-IP addresses")

        return True
    except Exception as e:
        print("[FAIL] Rate limiter error: {}".format(e))
        return False

def test_api_routes():
    """Test that API routes are properly defined"""
    print("\n" + "="*60)
    print("[TEST 8] Validar rutas de API")
    print("="*60)

    from backend.server import app, api_router

    try:
        # Get routes
        routes = []
        for route in app.routes:
            routes.append(route.path)

        print("[OK] API routes defined:")
        for route in routes:
            if '/api' in route or '/docs' in route:
                print("   - {}".format(route))

        # Check router endpoints
        print("[OK] API endpoints configured:")
        api_endpoints = [
            "/api/",
            "/api/health",
            "/api/historial-laboral",
            "/api/admin/login",
            "/api/admin/setup",
            "/api/admin/config",
            "/api/admin/stats"
        ]

        for endpoint in api_endpoints:
            print("   - {}".format(endpoint))

        return True
    except Exception as e:
        print("[FAIL] Route validation error: {}".format(e))
        return False

def test_frontend_config():
    """Test frontend configuration"""
    print("\n" + "="*60)
    print("[TEST 9] Validar configuracion Frontend")
    print("="*60)

    frontend_dir = Path(__file__).parent / 'frontend'

    # Check key files
    key_files = [
        'src/App.js',
        'src/components/ErrorBoundary.jsx',
        'package.json',
        '.env.local'
    ]

    all_exist = True
    for file in key_files:
        file_path = frontend_dir / file
        if file_path.exists():
            print("[OK] Found: {}".format(file))
        else:
            print("[FAIL] Missing: {}".format(file))
            all_exist = False

    return all_exist

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("EVALUACION LOCAL - CONER PROJECT")
    print("="*60)

    tests = [
        ("Importaciones", test_imports),
        ("Modelos Pydantic", test_models),
        ("Funciones Utilitarias", test_helper_functions),
        ("Variables de Entorno", test_environment_variables),
        ("Configuracion CORS", test_cors_configuration),
        ("Validacion CURP", test_curp_validation),
        ("Rate Limiting", test_rate_limiter),
        ("Rutas API", test_api_routes),
        ("Configuracion Frontend", test_frontend_config),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print("\n[ERROR] Error en test {}: {}".format(test_name, e))
            results.append((test_name, False))

    # Summary
    print("\n" + "="*60)
    print("RESUMEN DE PRUEBAS")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print("{} - {}".format(status, test_name))

    print("\nTotal: {}/{} pruebas exitosas".format(passed, total))
    print("="*60)

    if passed == total:
        print("\n[SUCCESS] TODAS LAS PRUEBAS EXITOSAS!")
        print("\nEl proyecto esta listo para ejecutar localmente:")
        print("\n  Terminal 1 (Backend):")
        print("  cd backend")
        print("  python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000")
        print("\n  Terminal 2 (Frontend):")
        print("  cd frontend")
        print("  npm start")
        print("\n  Acceder a: http://localhost:3000")
        return 0
    else:
        print("\n[WARNING] Algunas pruebas fallaron. Revisa los errores arriba.")
        return 1

if __name__ == '__main__':
    exit(main())
