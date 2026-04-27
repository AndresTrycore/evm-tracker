# Tareas de Implementación

- `[x]` Crear la base declarativa en `backend/app/db/base.py`.
- `[x]` Implementar modelo `Project` en `backend/app/models/project.py` con `lazy="selectin"` y cascade.
- `[x]` Implementar modelo `Activity` en `backend/app/models/activity.py` con CheckConstraints, NUMERIC y relaciones.
- `[x]` Implementar `evm_service.py` con cálculo estricto, propagación de nulos y tolerancia de ±0.001.
- `[x]` Escribir tests unitarios (`backend/tests/unit/test_evm_service.py`) validando casos borde (e.g., AC=0).
- `[x]` Inicializar Alembic en `backend/alembic` y crear la primera migración.
- `[x]` Ejecutar validación de calidad: pytest, ruff y mypy.
