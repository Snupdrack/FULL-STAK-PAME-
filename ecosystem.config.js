module.exports = {
  apps: [
    {
      name: 'coner-backend',
      script: 'backend/server.py',
      interpreter: 'python',
      args: '-m uvicorn server:app --reload --host 0.0.0.0 --port 8000',
      cwd: './',
      env: {
        MONGO_URL: 'mongodb://localhost:27017',
        DB_NAME: 'coner_test_db',
        JWT_SECRET: 'test-secret-key-production-ready-12345678901234567890',
        CORS_ORIGINS: 'http://localhost:3000,http://localhost:5173',
        API_URL: 'http://synkdata.online/v1/imss/historial-laboral',
        API_KEY: 'test-api-key',
        API_TIMEOUT: '30'
      },
      watch: ['backend'],
      ignore_watch: ['backend/node_modules', 'backend/__pycache__'],
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log'
    },
    {
      name: 'coner-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        REACT_APP_BACKEND_URL: 'http://localhost:8000'
      },
      watch: true,
      ignore_watch: ['frontend/node_modules', 'frontend/build'],
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log'
    }
  ]
};
