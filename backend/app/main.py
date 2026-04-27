from app.api.v1.router import api_router
from fastapi import FastAPI

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
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}

