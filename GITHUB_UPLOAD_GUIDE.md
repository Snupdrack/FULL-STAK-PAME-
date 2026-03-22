# 🚀 GUÍA: SUBIR CONER A GITHUB

## PASO 1: Preparar en Local

### 1.1 Inicializar Git (si no está ya inicializado)

```bash
cd "/c/Users/snupd/OneDrive/Desktop/APP CONER/INTERFAS-CONER--main/INTERFAS-CONER--main"

# Verificar si ya existe git
git status

# Si no existe o da error, inicializar:
git init
```

### 1.2 Configurar Git (primera vez en esta máquina)

```bash
# Configura tu nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@example.com"

# Verificar
git config --list | grep user
```

### 1.3 Agregar todos los archivos

```bash
# Ver archivos que serán agregados
git status

# Agregar todo
git add .

# Verificar
git status
```

### 1.4 Hacer el primer commit

```bash
git commit -m "Initial commit: CONER v1.0 - Production Ready

- Backend FastAPI optimizado
- Frontend React optimizado
- Docker Compose configurado
- Nginx + SSL ready
- Documentación completa
- Tests automatizados (9/9 passing)
- Cloud deployment guides included
- Security best practices implemented"
```

---

## PASO 2: Crear Repositorio en GitHub

### 2.1 Ir a GitHub

1. Ve a https://github.com/new
2. Ingresa credenciales (crea cuenta si no tienes)

### 2.2 Configurar Nuevo Repositorio

```
Repository name:     coner
Description:         CONER - Consultores Especializados en Retiros
Visibility:          Public (o Private si prefieres)
README:              NO (ya tienes README.md)
.gitignore:          NO (ya tienes .gitignore)
License:             MIT (recomendado)
```

### 2.3 Crear Repositorio

Haz click en "Create repository"

Verás una pantalla con opciones. **COPIA LA URL HTTPS** que aparece.

Será algo como:
```
https://github.com/tu-usuario/coner.git
```

---

## PASO 3: Agregar Remote y Push

### 3.1 Agregar remote origin

```bash
# Reemplaza URL_DEL_REPO con tu URL
git remote add origin https://github.com/tu-usuario/coner.git

# Verificar
git remote -v
```

### 3.2 Renombrar rama principal (si es necesario)

```bash
# GitHub usa 'main' por defecto, pero git usa 'master'
git branch -M main
```

### 3.3 Push (subir) a GitHub

```bash
# Primer push (con credenciales)
git push -u origin main

# Te pedirá credenciales:
# Usuario: tu-usuario-github
# Contraseña: Tu Personal Access Token (ver abajo)
```

---

## PASO 4: Configurar Autenticación con Token

GitHub ya no acepta contraseñas directas. Necesitas un **Personal Access Token**.

### 4.1 Generar Token en GitHub

1. Ve a: https://github.com/settings/tokens/new
2. Dale un nombre: "CONER Deploy Token"
3. Permisos necesarios: Marca `repo` (acceso completo a repositorios)
4. Expiration: "90 days" (recomendado rotar cada 3 meses)
5. Haz click en "Generate Token"
6. **COPIA EL TOKEN** (solo aparece una vez)

### 4.2 Usar el Token

Cuando Git te pida contraseña:
```
Username: tu-usuario-github
Password: [Pega aquí el token que copiaste]
```

---

## PASO 5: Verificar que está en GitHub

```bash
# Ver remotes
git remote -v

# Ver logs
git log --oneline
```

Luego ve a: https://github.com/tu-usuario/coner

¡Verás tu proyecto!

---

## OPCIONAL: Configurar Credenciales Locales (Para No Pedir cada vez)

### Opción A: Guardar Credenciales (Simple)

```bash
# Guardar credenciales en el sistema
git config --global credential.helper store

# O para Windows:
git config --global credential.helper wincred

# Próximo push te pedirá credenciales y las guardará
```

### Opción B: SSH (Más Seguro, Más Complejo)

```bash
# Generar SSH key
ssh-keygen -t ed25519 -C "tu.email@example.com"

# Presiona Enter 3 veces (sin passphrase)

# Copia la clave pública
cat ~/.ssh/id_ed25519.pub

# Ve a https://github.com/settings/keys
# Haz click en "New SSH key"
# Pega la clave pública
# Guarda

# Usa SSH en remote en lugar de HTTPS:
# git remote set-url origin git@github.com:tu-usuario/coner.git
```

---

## RESUMEN RÁPIDO (Si ya sabes git)

```bash
cd "/ruta/proyecto"

# Verificar git está inicializado
git status

# Si no está inicializado:
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Initial commit: CONER v1.0 Production Ready"

# Agregar remote
git remote add origin https://github.com/tu-usuario/coner.git

# Cambiar rama a main
git branch -M main

# Push
git push -u origin main
```

---

## ✅ VERIFICACIÓN

Después de todo, verás:
```
✓ https://github.com/tu-usuario/coner (tu repositorio)
✓ Todos tus archivos y carpetas
✓ Commits con historial
✓ README.md visible
✓ .gitignore activo (archivos .env no se ven)
```

---

## 🎉 ¡LISTO!

Tu proyecto está en GitHub y listo para:
- Compartir con otros
- Colaboración
- CI/CD automation
- Deployment desde GitHub
- Gestión de versiones

---

## PRÓXIMOS PASOS EN GITHUB

1. **README**: Actualiza si es necesario
2. **Badges**: Agrega estado de deployment
3. **Issues**: Documenta tareas futuras
4. **Releases**: Crea tags para versiones
5. **Actions**: Configura CI/CD (Tests automáticos)

---

¿Necesitas ayuda con algún paso específico?
