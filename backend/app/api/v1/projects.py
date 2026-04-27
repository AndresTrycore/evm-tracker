from typing import Any
from uuid import UUID

from app.api.deps import SessionDep
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
    ProjectWithEVM,
)
from app.services.project_service import ProjectService
from fastapi import APIRouter, status

router = APIRouter()


@router.get(
    "/", response_model=list[ProjectResponse], summary="Listar todos los proyectos"
)
def list_projects(db: SessionDep) -> Any:
    return ProjectService.get_projects(db)


@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un proyecto",
)
def create_project(db: SessionDep, project_in: ProjectCreate) -> Any:
    return ProjectService.create_project(db, project_in)


@router.get(
    "/{project_id}",
    response_model=ProjectWithEVM,
    summary="Obtener proyecto con indicadores EVM",
)
def get_project(db: SessionDep, project_id: UUID) -> Any:
    return ProjectService.get_project(db, project_id)


@router.put(
    "/{project_id}", response_model=ProjectResponse, summary="Actualizar un proyecto"
)
def update_project(
    db: SessionDep, project_id: UUID, project_in: ProjectUpdate
) -> Any:
    return ProjectService.update_project(db, project_id, project_in)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un proyecto",
)
def delete_project(db: SessionDep, project_id: UUID) -> None:
    ProjectService.delete_project(db, project_id)


