# Proposal: Database and Logic Layer (EVM)

**Objective**: Implementar los modelos de base de datos SQLAlchemy con restricciones estrictas (CheckConstraints) y tipos UUID/NUMERIC, configurar Alembic para migraciones y crear el motor puro de cálculo EVM.

**Context**: Esta propuesta aborda la Fase 2 y Fase 3 parcial del Roadmap, consolidando la estructura de persistencia y el motor central del negocio según las `business_rules.md`.

**Decisions**:
1. **UUID**: Se utilizará `uuid.uuid4()` de Python como `default` en SQLAlchemy para generar los IDs. La columna en PostgreSQL mantendrá el tipo nativo `UUID`. Esto previene problemas de permisos al activar extensiones en PostgreSQL.
2. **Alembic**: La carpeta de configuración de migraciones se alojará en `backend/alembic` para mantener la raíz del repositorio limpia.
3. **EVM Engine**: Se creará en `backend/app/services/evm_service.py`. Será una librería pura de Python, sin acceso a la base de datos ni a FastAPI, recibiendo primitivas (floats). Utilizará `safe_divide` para inyectar `None` silenciosamente en divisiones por cero y una tolerancia de `±0.001` para evaluaciones de estado (e.g. "en presupuesto").
