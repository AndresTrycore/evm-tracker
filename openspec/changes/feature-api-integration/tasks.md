# Tasks: Configurar Middleware de Seguridad y Healthcheck

- [x] **Configuración (Settings)**
    - [x] Agregar `backend_cors_origins` y `api_root_path` en `backend/app/core/config.py`.
- [x] **Middleware de Seguridad**
    - [x] Importar `CORSMiddleware` en `backend/app/main.py`.
    - [x] Configurar el middleware con orígenes, métodos y headers definidos en el diseño.
    - [x] Configurar `root_path` en la instancia de `FastAPI`.
- [x] **Punto de Entrada & Healthcheck**
    - [x] Importar `Depends`, `Session`, `get_db` y `text` en `backend/app/main.py`.
    - [x] Refactorizar el endpoint `/health` para validar la conexión a Postgres.
- [x] **Dockerización**
    - [x] Actualizar el `CMD` en `backend/Dockerfile` para incluir `--reload`.
- [ ] **Verificación**
    - [ ] Reiniciar contenedores: `docker compose up -d --build`.
    - [ ] Validar CORS con `curl -I -X OPTIONS`.
    - [ ] Validar Healthcheck con `curl`.
