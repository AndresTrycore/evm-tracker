# Specification: Configurar Middleware de Seguridad y Healthcheck

## Requirements

### REQ-SEC-01: Política de CORS
El API debe permitir peticiones desde orígenes específicos utilizados en el desarrollo del frontend.
- **Orígenes permitidos**: `http://localhost:3000`, `http://localhost:5173`.
- **Métodos permitidos**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.
- **Headers permitidos**: `Content-Type`, `Authorization`.
- **Credenciales**: No se requieren para esta fase.

### REQ-INF-01: Endpoint de Salud (Healthcheck)
El API debe exponer un endpoint que valide la integridad de sus dependencias críticas.
- **Path**: `/health`.
- **Método**: `GET`.
- **Respuesta Exitosa**: `{"status": "ok", "db": "connected"}` con status code `200`.
- **Respuesta Fallida (DB)**: Status code `503` (o `200` con `db: "disconnected"`, pero se prefiere validación real).
- **Lógica**: Ejecutar un ping (`SELECT 1`) a la base de datos Postgres.

### REQ-INF-02: Configuración de Punto de Entrada
El API debe ser flexible para operar tras un proxy inverso.
- **Root Path**: Debe ser configurable mediante la variable de entorno `API_ROOT_PATH`.
- **Docker Command**: Debe usar `uvicorn` con el flag `--reload` habilitado por defecto en este entorno.

## Acceptance Scenarios

### Scenario 1: Validación de CORS
**Given** el API está corriendo.
**When** se realiza una petición `OPTIONS` con `Origin: http://localhost:5173`.
**Then** la respuesta debe incluir el header `Access-Control-Allow-Origin: http://localhost:5173`.

### Scenario 2: Validación de Salud con DB Activa
**Given** la base de datos Postgres está disponible.
**When** se consulta `/health`.
**Then** la respuesta debe ser `{"status": "ok", "db": "connected"}`.

### Scenario 3: Validación de Salud con DB Inactiva
**Given** la base de datos Postgres está caída.
**When** se consulta `/health`.
**Then** la respuesta debe indicar el error de conexión.
