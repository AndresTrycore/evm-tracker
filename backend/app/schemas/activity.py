from datetime import datetime
from uuid import UUID

from app.schemas.evm import EVMIndicators
from pydantic import BaseModel, ConfigDict, Field


class ActivityBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    budget_at_completion: float = Field(ge=0.0)
    planned_progress: float = Field(ge=0.0, le=100.0)
    actual_progress: float = Field(ge=0.0, le=100.0)
    actual_cost: float = Field(ge=0.0)


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    budget_at_completion: float | None = Field(None, ge=0.0)
    planned_progress: float | None = Field(None, ge=0.0, le=100.0)
    actual_progress: float | None = Field(None, ge=0.0, le=100.0)
    actual_cost: float | None = Field(None, ge=0.0)


class ActivityResponse(ActivityBase):
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    evm: EVMIndicators | None = None

    model_config = ConfigDict(from_attributes=True)
