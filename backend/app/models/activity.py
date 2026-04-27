import uuid
from datetime import UTC, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from app.db.base import Base
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from app.models.project import Project


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Activity(Base):
    __tablename__ = "activities"

    __table_args__ = (
        CheckConstraint("length(trim(name)) > 0", name="ck_activity_name_not_empty"),
        CheckConstraint(
            "budget_at_completion >= 0", name="ck_activity_bac_non_negative"
        ),
        CheckConstraint(
            "planned_progress >= 0 AND planned_progress <= 100",
            name="ck_activity_planned_progress_range",
        ),
        CheckConstraint(
            "actual_progress >= 0 AND actual_progress <= 100",
            name="ck_activity_actual_progress_range",
        ),
        CheckConstraint(
            "actual_cost >= 0", name="ck_activity_actual_cost_non_negative"
        ),
        Index("ix_activities_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    budget_at_completion: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2), nullable=False
    )
    planned_progress: Mapped[Decimal] = mapped_column(
        Numeric(precision=5, scale=2), nullable=False
    )
    actual_progress: Mapped[Decimal] = mapped_column(
        Numeric(precision=5, scale=2), nullable=False
    )
    actual_cost: Mapped[Decimal] = mapped_column(
        Numeric(precision=15, scale=2), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow
    )

    project: Mapped["Project"] = relationship("Project", back_populates="activities")
