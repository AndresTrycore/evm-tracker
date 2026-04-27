from typing import Any, cast
from uuid import UUID

from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.services.evm_service import calculate_activity_evm
from fastapi import HTTPException
from sqlalchemy.orm import Session


class ActivityService:
    @staticmethod
    def get_activities(db: Session, project_id: UUID) -> list[Activity]:
        activities = db.query(Activity).filter(Activity.project_id == project_id).all()
        return [ActivityService._attach_evm(a) for a in activities]

    @staticmethod
    def create_activity(
        db: Session, project_id: UUID, activity_in: ActivityCreate
    ) -> Activity:
        db_activity = Activity(**activity_in.model_dump(), project_id=project_id)
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return ActivityService._attach_evm(db_activity)

    @staticmethod
    def update_activity(
        db: Session, activity_id: UUID, activity_in: ActivityUpdate
    ) -> Activity:
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if not db_activity:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")

        update_data = activity_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_activity, key, value)

        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        return ActivityService._attach_evm(db_activity)

    @staticmethod
    def delete_activity(db: Session, activity_id: UUID) -> bool:
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if not db_activity:
            raise HTTPException(status_code=404, detail="Actividad no encontrada")
        db.delete(db_activity)
        db.commit()
        return True

    @staticmethod
    def _attach_evm(activity: Activity) -> Activity:
        # Conversión explicita de Decimal a float para el motor EVM
        evm_indicators = calculate_activity_evm(
            budget_at_completion=float(activity.budget_at_completion),
            planned_progress=float(activity.planned_progress),
            actual_progress=float(activity.actual_progress),
            actual_cost=float(activity.actual_cost),
        )
        # Seteamos el atributo dinámico evm para el schema ActivityResponse
        cast(Any, activity).evm = evm_indicators
        return activity


