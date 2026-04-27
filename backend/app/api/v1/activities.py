from typing import Any
from uuid import UUID

from app.api.deps import SessionDep
from app.schemas.activity import ActivityCreate, ActivityResponse, ActivityUpdate
from app.services.activity_service import ActivityService
from fastapi import APIRouter, status

router = APIRouter()


@router.get(
    "/",
    response_model=list[ActivityResponse],
    summary="Listar actividades de un proyecto",
)
def list_activities(db: SessionDep, project_id: UUID) -> Any:
    return ActivityService.get_activities(db, project_id)


@router.post(
    "/",
    response_model=ActivityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una actividad",
)
def create_activity(
    db: SessionDep, project_id: UUID, activity_in: ActivityCreate
) -> Any:
    return ActivityService.create_activity(db, project_id, activity_in)


@router.put(
    "/{activity_id}",
    response_model=ActivityResponse,
    summary="Actualizar una actividad",
)
def update_activity(
    db: SessionDep, activity_id: UUID, activity_in: ActivityUpdate, project_id: UUID
) -> Any:
    # project_id is in the path but currently not used for validation in the service
    # (assuming activity_id is globally unique as it is a UUID)
    return ActivityService.update_activity(db, activity_id, activity_in)


@router.delete(
    "/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar una actividad",
)
def delete_activity(db: SessionDep, activity_id: UUID, project_id: UUID) -> None:
    ActivityService.delete_activity(db, activity_id)


