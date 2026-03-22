# Production Deployment Guide - CONER API

## Overview

This guide covers deploying the CONER application to production. The application consists of:
- **Backend**: FastAPI Python application
- **Frontend**: React application
- **Database**: MongoDB Atlas (recommended) or MongoDB container

## Pre-Deployment Checklist

- [ ] Review and update all environment variables
- [ ] Set strong MongoDB credentials
- [ ] Generate new JWT_SECRET key
- [ ] Configure CORS_ORIGINS with all your production domains
- [ ] Ensure MongoDB is properly secured and backed up
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

## Security Requirements

### 1. Environment Variables

**Critical**: Never commit `.env` files to version control. Use GitHub Secrets or a secrets management system.

Generate a strong JWT_SECRET:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Backend Security (backend/.env.production)

```
MONGO_URL=mongodb+srv://username:password@your-cluster.mongodb.net/db?retryWrites=true&w=majority
DB_NAME=coner_db_production
JWT_SECRET=<generate-strong-key>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Frontend Security (frontend/.env.production)

```
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## Deployment Methods

### Option 1: Docker Compose (Recommended for quick setup)

#### Prerequisites
- Docker and Docker Compose installed
- MongoDB Atlas account (or use the included MongoDB container)

#### Steps

1. Create `.env` file in project root:
```bash
cp backend/.env.production backend/.env
cp frontend/.env.production frontend/.env
```

2. Update the .env files with production values

3. Start services:
```bash
docker-compose up -d
```

4. Verify services are running:
```bash
docker-compose ps
docker logs coner-backend
docker logs coner-frontend
```

### Option 2: Manual Installation (Linux/Ubuntu)

#### Backend Setup

1. Install dependencies:
```bash
sudo apt-get update
sudo apt-get install -y python3.11 python3-pip python3-venv
```

2. Create virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

3. Create systemd service file (`/etc/systemd/system/coner-backend.service`):
```ini
[Unit]
Description=CONER API Backend
After=network.target

[Service]
Type=notify
User=appuser
Group=appuser
WorkingDirectory=/home/appuser/coner/backend
Environment="PATH=/home/appuser/coner/backend/venv/bin"
ExecStart=/home/appuser/coner/backend/venv/bin/gunicorn server:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 127.0.0.1:8000 \
  --access-logfile /var/log/coner/access.log \
  --error-logfile /var/log/coner/error.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

4. Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable coner-backend
sudo systemctl start coner-backend
sudo systemctl status coner-backend
```

#### Frontend Setup

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Build frontend:
```bash
cd frontend
npm install
npm run build
```

3. Create systemd service file (`/etc/systemd/system/coner-frontend.service`):
```ini
[Unit]
Description=CONER Frontend
After=network.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/home/appuser/coner/frontend
ExecStart=/usr/bin/npx serve -s build -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Option 3: Cloud Deployment

#### AWS EC2
1. Launch Ubuntu 22.04 LTS instance
2. Follow Option 2 (Manual Installation)
3. Configure Security Groups for ports 80, 443, 3000, 8000
4. Set up Nginx as reverse proxy

#### Heroku
```bash
# Backend
heroku create coner-api
heroku config:set MONGO_URL=<your-mongo-url>
heroku config:set JWT_SECRET=<your-secret>
git push heroku backend:main

# Frontend
heroku create coner-app
heroku config:set REACT_APP_BACKEND_URL=https://coner-api.herokuapp.com
git push heroku frontend:main
```

## Nginx Reverse Proxy Configuration

Create `/etc/nginx/sites-available/coner`:

```nginx
upstream backend {
    server 127.0.0.1:8000;
}

upstream frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/coner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring & Maintenance

### Health Checks
- Backend health: `https://yourdomain.com/api/health`
- Frontend: `https://yourdomain.com/`

### Logs
```bash
# Docker
docker-compose logs -f coner-backend
docker-compose logs -f coner-frontend

# Systemd
sudo journalctl -u coner-backend -f
sudo journalctl -u coner-frontend -f
```

### Database Backups (MongoDB Atlas)
- Set up automated daily backups in MongoDB Atlas console
- Configure backup retention (minimum 30 days recommended)
- Test restore procedures monthly

### Updates
```bash
# Backend updates
cd backend && pip install -r requirements.txt --upgrade && \
  sudo systemctl restart coner-backend

# Frontend updates
cd frontend && npm update && npm run build && \
  sudo systemctl restart coner-frontend
```

## Troubleshooting

### Backend won't start
```bash
sudo systemctl status coner-backend
sudo journalctl -u coner-backend -n 50
```

### Frontend shows "Cannot GET"
- Check REACT_APP_BACKEND_URL is set correctly
- Verify backend is running and accessible
- Check browser console for errors

### API errors
- Check MongoDB connection in logs
- Verify environment variables are set correctly
- Check JWT_SECRET hasn't changed

### CORS errors
- Verify CORS_ORIGINS includes your frontend domain
- Check it matches exactly (protocol, domain, port)

## Performance Optimization

1. **Enable Redis caching** (if needed):
   - Update backend to use Redis for session caching
   - Use Redis for rate limiting

2. **CDN for static assets**:
   - Push frontend `build/` to CDN
   - Update CRUD endpoints to serve via CDN

3. **Database optimization**:
   - Create MongoDB indexes on frequently queried fields
   - Archive old query logs periodically

## Support & Maintenance

- Monitor application health daily
- Review logs weekly
- Test disaster recovery monthly
- Update dependencies quarterly
- Review and rotate secrets annually
