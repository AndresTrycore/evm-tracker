from typing import Any, cast
from uuid import UUID

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.activity_service import ActivityService
from app.services.evm_service import ActivitySummary, calculate_project_evm
from fastapi import HTTPException
from sqlalchemy.orm import Session


class ProjectService:
    @staticmethod
    def get_projects(db: Session) -> list[Project]:
        return list(db.query(Project).all())

    @staticmethod
    def get_project(db: Session, project_id: UUID) -> Project:
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if not db_project:
            raise HTTPException(
                status_code=404, detail=f"Proyecto con id {project_id} no encontrado"
            )

        # Attach EVM to each activity
        for activity in db_project.activities:
            ActivityService._attach_evm(activity)

        # Calculate project-level EVM summary
        activity_summaries = [
            ActivitySummary(
                budget_at_completion=float(a.budget_at_completion),
                planned_value=float(cast(Any, a).evm.pv),
                earned_value=float(cast(Any, a).evm.ev),
                actual_cost=float(a.actual_cost),
            )
            for a in db_project.activities
        ]

        evm_summary = calculate_project_evm(activity_summaries)
        cast(Any, db_project).evm_summary = evm_summary



        return db_project

    @staticmethod
    def create_project(db: Session, project_in: ProjectCreate) -> Project:
        db_project = Project(**project_in.model_dump())
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def update_project(
        db: Session, project_id: UUID, project_in: ProjectUpdate
    ) -> Project:
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if not db_project:
            raise HTTPException(
                status_code=404, detail=f"Proyecto con id {project_id} no encontrado"
            )

        update_data = project_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_project, key, value)

        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def delete_project(db: Session, project_id: UUID) -> bool:
        db_project = db.query(Project).filter(Project.id == project_id).first()
        if not db_project:
            raise HTTPException(
                status_code=404, detail=f"Proyecto con id {project_id} no encontrado"
            )

        db.delete(db_project)
        db.commit()
        return True

