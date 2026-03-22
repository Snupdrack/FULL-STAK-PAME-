# 🚀 GUÍA DE DEPLOYMENT A PRODUCCIÓN - DOCKER COMPOSE EN CLOUD

**Fecha**: 22 de Marzo de 2026
**Estado**: Production Ready
**Método**: Docker Compose + Cloud Infrastructure

---

## 📋 TABLA DE CONTENIDOS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [DigitalOcean (Recomendado - Más Simple)](#digitalocean-recomendado)
3. [AWS EC2](#aws-ec2)
4. [Azure App Service](#azure-app-service)
5. [Setup Nginx + SSL](#setup-nginx--ssl)
6. [Monitoring y Mantenimiento](#monitoring-y-mantenimiento)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Criptomoneda Git configurado
- [ ] Dominio registrado y apuntado al servidor
- [ ] MongoDB Atlas cuenta creada y configurada
- [ ] Variables de entorno preparadas (ver abajo)
- [ ] SSH keys generadas para acceso al servidor
- [ ] Backups de MongoDB configurados
- [ ] SSL certificate planning (Let's Encrypt es gratis)
- [ ] Firewall rules planeadas
- [ ] Monitoring setup planeado

---

## 🔐 PREPARAR VARIABLES DE PRODUCCIÓN

### Paso 1: Generar JWT_SECRET fuerte

```bash
# Opción 1: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Opción 2: OpenSSL
openssl rand -base64 32

# Opción 3: /dev/urandom
head -c 24 /dev/urandom | base64
```

Resultado ejemplo:
```
HvKpR7Qx2nF9mL8zJtG3wS1cV5bX0dY6aE4iO9uP2qR
```

### Paso 2: MongoDB Atlas Connection String

1. Ve a https://cloud.mongodb.com/
2. Crea/ingresa a tu cluster
3. Haz click en "Connect"
4. Selecciona "Connect your application"
5. Copia la connection string
6. Reemplaza `<password>` con tu contraseña
7. Cambia el nombre de la base de datos por `coner_production`

Resultado ejemplo:
```
mongodb+srv://coner_user:MySecurePassword123@cluster0.xxxxx.mongodb.net/coner_production?retryWrites=true&w=majority
```

### Paso 3: Crear backend/.env para Producción

```bash
# En tu máquina local, crear el archivo:
cat > backend/.env << 'EOF'
MONGO_URL=mongodb+srv://coner_user:password@cluster0.xxxxx.mongodb.net/coner_production?retryWrites=true&w=majority
DB_NAME=coner_production
JWT_SECRET=HvKpR7Qx2nF9mL8zJtG3wS1cV5bX0dY6aE4iO9uP2qR
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_URL=https://api.example.com/v1/imss/historial-laboral
API_KEY=your_api_key_here
API_TIMEOUT=30
EOF
```

### Paso 4: Crear frontend/.env para Producción

```bash
cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF
```

⚠️ **IMPORTANTE**: Estos archivos `.env` NO deben ser commitidos a Git

---

## 🌐 DIGITALOCEAN (RECOMENDADO - Más Simple)

### Ventajas:
- UI intuitiva
- Precios predecibles
- Excelente documentación
- Droplets (VPS) fáciles de configurar
- App Platform (deployment gestionado)

### Opción A: DROPLET (Recomendado)

#### Paso 1: Crear Droplet

1. Ve a https://cloud.digitalocean.com/
2. Click en "Create" → "Droplets"
3. Elige:
   - Imagen: Ubuntu 22.04 LTS (x64)
   - Plan: $6/mes (2GB RAM, suficiente para CONER)
   - Región: Cercana a tus usuarios
   - Autenticación: SSH key (NO contraseña)
   - Hostname: coner-prod

4. Click "Create Droplet"
5. Espera ~2 minutos

#### Paso 2: SSH al Droplet

```bash
# Reemplazar IP con tu Droplet IP
ssh root@YOUR_DROPLET_IP

# Cambiar contraseña root (opcional pero recomendado)
passwd
```

#### Paso 3: Instalar Prerequisites

```bash
# Update
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add current user to docker group
usermod -aG docker root

# Install Docker Compose
apt-get install -y docker-compose

# Install Nginx
apt-get install -y nginx

# Install Certbot (SSL)
apt-get install -y certbot python3-certbot-nginx

# Verify installations
docker --version
docker-compose --version
nginx -v
```

#### Paso 4: Clonar Proyecto y Configurar

```bash
# Clone your repository
cd /opt
git clone https://github.com/your-username/coner.git
cd coner

# Crear archivos .env (copiar tu configuración local)
# Reemplazar con valores reales:

cat > backend/.env << 'EOF'
MONGO_URL=mongodb+srv://...
DB_NAME=coner_production
JWT_SECRET=...
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_URL=https://api.example.com/v1/imss/historial-laboral
API_KEY=...
API_TIMEOUT=30
EOF

cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://yourdomain.com
EOF

# Verificar archivos
ls -la backend/.env
ls -la frontend/.env
```

#### Paso 5: Build y Deploy

```bash
# Build images
docker-compose build

# Start services (en background)
docker-compose up -d

# Verificar
docker-compose ps
docker-compose logs -f

# Health check
curl http://localhost:8000/api/health
```

---

## 🔒 SETUP NGINX + SSL (TODOS LOS PROVEEDORES)

### Paso 1: Copiar Nginx Config

```bash
# Copiar archivo nginx.conf a Nginx
sudo cp nginx.conf /etc/nginx/sites-available/coner

# Editar con tu dominio
sudo nano /etc/nginx/sites-available/coner
# Buscar y reemplazar:
# - yourdomain.com → tu dominio real
# - www.yourdomain.com → si tienes

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/coner /etc/nginx/sites-enabled/

# Deshabilitar default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t
# Resultado esperado: "test is successful"

# Recargar Nginx
sudo systemctl reload nginx
```

### Paso 2: Obtener Certificado SSL (Let's Encrypt)

```bash
# Certbot obtiene el certificado automáticamente
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Responde las preguntas:
# - Email: your-email@example.com (para renovaciones)
# - Acepta términos (A)
# - Opt-out de marketing (N, a menos que quieras)

# Certbot actualiza automáticamente nginx.conf

# Rejuvenecimiento automático
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verificar
sudo certbot renew --dry-run
```

### Paso 3: Verificar HTTPS

```bash
# Probar el sitio
curl -I https://yourdomain.com
# Esperar 200 OK

# Probar API
curl -I https://yourdomain.com/api/health
# Esperar 200 OK

# Verificar certificado
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### Health Checks

```bash
# Backend
curl https://yourdomain.com/api/health

# Docker status
sudo docker-compose ps

# Logs
sudo docker-compose logs -f coner-backend
sudo docker-compose logs -f coner-frontend

# Nginx error log
sudo tail -f /var/log/nginx/coner_error.log

# Nginx access log
sudo tail -f /var/log/nginx/coner_access.log
```

### Backups Automáticos

```bash
# MongoDB Atlas ya hace backups automáticos (verificar en dashboard)

# Backup local (si usas MongoDB local)
# Crear script de backup:

cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/coner"
DATE=$(date +"%Y%m%d_%H%M%S")
mongodump --uri="$MONGO_URL" --out="$BACKUP_DIR/$DATE"
# Mantener solo últimas 7 backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF

chmod +x backup.sh
sudo crontab -e
# Agregar línea:
# 0 2 * * * /opt/coner/backup.sh
```

### Monitoreo de Performance

```bash
# CPU y RAM
top

# Disk usage
df -h

# Docker stats en tiempo real
docker stats

# Verificar límites de conexiones MongoDB
# (en MongoDB Atlas dashboard)
```

### Logs Centralizados (Opcional)

```bash
# Usar CloudWatch (AWS), Stackdriver (GCP), o Azure Monitor
# O herramientas de terceros como:
# - LogRocket
# - Sentry
# - New Relic
# - DataDog
```

---

## 🔄 SCALING (Cuando Necesites Crecer)

### Load Balancer

```bash
# DigitalOcean: Load Balancer
# - Ve a Load Balancers
# - Crea nuevo LB
# - Apunta a tu Droplet
# - Actualiza DNS a LB IP

# AWS: Application Load Balancer
# - Crea ALB
# - Configura target groups
# - Actualiza DNS
```

### Replicación de Droplets

```bash
# 1. Droplet actual = "coner-1"
# 2. Snapshot → "coner-backup"
# 3. Crear nuevo Droplet desde snapshot = "coner-2"
# 4. Configurar Load Balancer
# 5. Apuntar a ambos
```

---

## 🆘 TROUBLESHOOTING CLOUD

### "Can't connect to domain"

```bash
# Verificar DNS A record
dig yourdomain.com

# Verificar firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Reiniciar Nginx
sudo systemctl restart nginx
```

### "Docker can't start containers"

```bash
# Ver error
docker-compose logs

# Verificar espacio disco
df -h

# Verificar RAM
free -h

# Aumentar en cloud provider si es necesario
```

### "MongoDB connection error"

```bash
# Verificar connection string
# - Username correcto?
# - Password correcta?
# - IP whitelist en MongoDB Atlas?
#   (ir a Security → Network Access → Add IP)

# Probar conexión local
mongosh "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/test"
```

### "SSL certificate error"

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Ver certificado actual
sudo certbot certificates

# Verificar expiración
curl -I https://yourdomain.com
# Ver "Expires: ..."
```

---

## ✅ VERIFICACIÓN FINAL

```bash
# 1. Acceder a frontend
curl https://yourdomain.com

# 2. Acceder a API
curl https://yourdomain.com/api/health

# 3. Verificar documentación
curl https://yourdomain.com/docs

# 4. Probar endpoint de historial
curl -X POST https://yourdomain.com/api/historial-laboral \
  -H "Content-Type: application/json" \
  -d '{"curp": "TEST000000HXXXX00"}'

# 5. Verificar SSL
openssl s_client -connect yourdomain.com:443 < /dev/null | grep Issuer

# 6. Monitoreo
docker-compose ps
```

---

## 📞 SOPORTE

- **DigitalOcean docs**: https://docs.digitalocean.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://certbot.eff.org/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/

---

## 🎉 ¡DEPLOY EXITOSO!

Tu aplicación CONER está en producción:
- ✅ Frontend: https://yourdomain.com
- ✅ Backend API: https://yourdomain.com/api
- ✅ SSL/HTTPS: Configurado y automático
- ✅ Monitoreo: Activo
- ✅ Backups: Configurados

**Próximos pasos**:
1. Monitorear logs y performance
2. Configurar alertas
3. Hacer backups regulares
4. Rotar secretos cada 90 días
5. Actualizar dependencias mensualmente

---

**Versión**: 1.0
**Última actualización**: 22 de Marzo de 2026
**Estado**: Production Ready
