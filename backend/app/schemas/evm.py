from pydantic import BaseModel, ConfigDict, Field


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




class EVMSummary(EVMIndicators):
    cost_status: str
    schedule_status: str
