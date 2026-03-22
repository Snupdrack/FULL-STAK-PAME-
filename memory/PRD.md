# CONER - Consultores Especializados en Retiros

## Problema Original
Crear una página para CONER con:
- Campo CURP para consultar historial laboral del IMSS
- Exportación a PDF
- Panel administrativo para configurar API
- Diseño moderno con identidad visual corporativa (negro + dorado)
- Manejo de errores claro

## Arquitectura

### Backend (FastAPI + MongoDB)
- `/api/historial-laboral` - Consulta proxy a API externa de synkdata
- `/api/admin/login` - Autenticación JWT
- `/api/admin/setup` - Creación de usuario admin inicial
- `/api/admin/config` - GET/PUT configuración de API
- `/api/admin/stats` - Estadísticas de consultas

### Frontend (React + TailwindCSS)
- Página principal con formulario CURP
- Panel Admin con configuración y estadísticas
- Exportación PDF con @react-pdf/renderer
- Animaciones con Framer Motion

## API Externa
- URL: http://synkdata.online/v1/imss/historial-laboral
- Header: x-api-key: test-api-key-12345
- Params: curp, nss (opcional)

## Implementado
- [x] Formulario de consulta CURP con validación
- [x] Visualización de resultados (info personal + historial)
- [x] Exportación a PDF profesional
- [x] Panel admin con autenticación JWT
- [x] Configuración de API (URL, Key, Timeout)
- [x] Estadísticas de consultas
- [x] Diseño luxury dark (Negro #050505 + Dorado #D4AF37)
- [x] Logo CONER integrado
- [x] Tipografía Playfair Display + Lato
- [x] Manejo de errores con toasts

## Backlog (P1/P2)
- [ ] Historial de consultas del usuario
- [ ] Descarga directa de PDFs base64 de la API
- [ ] Rate limiting propio
- [ ] Cache de consultas recientes
- [ ] Multi-idioma

## Credenciales de Prueba
- Admin: Se crea en primer acceso a /admin
- API Key: Configurable en panel admin (default: test-api-key-12345)

## Fecha: Enero 2026
