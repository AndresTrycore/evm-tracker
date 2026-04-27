from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_serializer

API_DECIMAL_PLACES = 2


class EVMIndicators(BaseModel):
    planned_value: float = Field(validation_alias="pv")
    earned_value: float = Field(validation_alias="ev")
    cost_variance: float = Field(validation_alias="cv")
    schedule_variance: float = Field(validation_alias="sv")
    cost_performance_index: float | None = Field(default=None, validation_alias="cpi")
    schedule_performance_index: float | None = Field(
        default=None, validation_alias="spi"
    )
    estimate_at_completion: float | None = Field(default=None, validation_alias="eac")
    variance_at_completion: float | None = Field(default=None, validation_alias="vac")

    model_config = ConfigDict(from_attributes=True)

    @model_serializer
    def _round_for_api(self) -> dict[str, Any]:
        """Round all numeric fields to 2 decimals for API response.

        The EVM motor keeps 4-decimal precision internally; the API layer
        presents 2 decimals for clean dashboard consumption.
        """
        return {
            "planned_value": round(self.planned_value, API_DECIMAL_PLACES),
            "earned_value": round(self.earned_value, API_DECIMAL_PLACES),
            "cost_variance": round(self.cost_variance, API_DECIMAL_PLACES),
            "schedule_variance": round(self.schedule_variance, API_DECIMAL_PLACES),
            "cost_performance_index": (
                round(self.cost_performance_index, API_DECIMAL_PLACES)
                if self.cost_performance_index is not None
                else None
            ),
            "schedule_performance_index": (
                round(self.schedule_performance_index, API_DECIMAL_PLACES)
                if self.schedule_performance_index is not None
                else None
            ),
            "estimate_at_completion": (
                round(self.estimate_at_completion, API_DECIMAL_PLACES)
                if self.estimate_at_completion is not None
                else None
            ),
            "variance_at_completion": (
                round(self.variance_at_completion, API_DECIMAL_PLACES)
                if self.variance_at_completion is not None
                else None
            ),
        }


class EVMSummary(EVMIndicators):
    cost_status: str
    schedule_status: str
    overall_status: str

    @model_serializer
    def _round_for_api(self) -> dict[str, Any]:
        """Extend parent serializer with status fields."""
        base = EVMIndicators._round_for_api(self)
        base["cost_status"] = self.cost_status
        base["schedule_status"] = self.schedule_status
        base["overall_status"] = self.overall_status
        return base
