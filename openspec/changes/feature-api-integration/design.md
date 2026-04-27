# Design: Configurar Middleware de Seguridad y Healthcheck

## Architecture Decisions

### AD-01: Implementación de CORS
Utilizaremos `fastapi.middleware.cors.CORSMiddleware`. Es la forma estándar y segura de manejar CORS en FastAPI, permitiendo el filtrado por origen antes de que la petición llegue a los routers.

### AD-02: Validación de Healthcheck
Para validar Postgres sin sobrecargar la base de datos, utilizaremos una sentencia mínima `SELECT 1`. Inyectaremos la sesión de base de datos usando `Depends(get_db)` para asegurar que el pool de conexiones funcione correctamente.

### AD-03: Soporte de Root Path
Configuraremos el `root_path` en la instancia de `FastAPI` leyendo de `Settings`. Esto permite que Swagger UI genere las URLs correctas si el API se despliega detrás de un Path-based Reverse Proxy (ej. `/api/v1/`).

## Technical Details

### Configuration (Settings)
Actualizaremos `app/core/config.py`:
```python
backend_cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
api_root_path: str = ""
```

### Main Application (main.py)
```python
app = FastAPI(..., root_path=settings.api_root_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
```

### Dockerization
El `Dockerfile` se mantendrá liviano, pero el `CMD` se sincronizará con lo solicitado para facilitar el desarrollo en caliente.

## Data Flow
1. **Petición Entrante** -> `CORSMiddleware` (Valida Origin) -> `FastAPI Core`.
2. **GET /health** -> `get_db()` -> `db.execute("SELECT 1")` -> Respuesta JSON.
