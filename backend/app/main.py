from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import get_db
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

app = FastAPI(
    title="EVM Tracker API",
    description="""
API para gestión de proyectos con análisis de Valor Ganado (EVM).

Permite a los líderes de proyecto registrar actividades, ingresar datos de
avance y costo, y obtener en tiempo real los indicadores EVM calculados
automáticamente: PV, EV, CV, SV, CPI, SPI, EAC y VAC — tanto por actividad
como consolidados por proyecto.

## Indicadores EVM

| Indicador | Fórmula |
|-----------|---------|
| PV — Planned Value | % planificado × BAC |
| EV — Earned Value | % completado × BAC |
| CV — Cost Variance | EV − AC |
| SV — Schedule Variance | EV − PV |
| CPI — Cost Performance Index | EV / AC |
| SPI — Schedule Performance Index | EV / PV |
| EAC — Estimate at Completion | BAC / CPI |
| VAC — Variance at Completion | BAC − EAC |

Un **CPI > 1** indica eficiencia en costos (bajo presupuesto).
Un **SPI > 1** indica adelanto en cronograma.
    """,
    version="1.0.0",
    contact={
        "name": "EVM Tracker",
    },
    root_path=settings.api_root_path,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    """
    Valida la salud del API y la conexión a la base de datos.
    """
    try:
        # Ejecutar una consulta mínima para validar conectividad
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception:
        return {"status": "error", "db": "disconnected"}

