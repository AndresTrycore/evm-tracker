from fastapi import FastAPI

app = FastAPI(
    title="EVM Tracker API",
    description="API para gestión de proyectos con análisis de Valor Ganado (EVM).",
    version="1.0.0",
)


@app.get("/health")
def read_root() -> dict[str, str]:
    return {"status": "ok"}
