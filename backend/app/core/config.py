from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str | None = None
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = Field(
        default="evm_db",
        validation_alias=AliasChoices("DB_NAME", "POSTGRES_DB"),
    )
    db_user: str = Field(
        default="evm_user",
        validation_alias=AliasChoices("DB_USER", "POSTGRES_USER"),
    )
    db_password: str = Field(
        default="evm_password",
        validation_alias=AliasChoices("DB_PASSWORD", "POSTGRES_PASSWORD"),
    )

    @model_validator(mode="after")
    def build_database_url(self) -> "Settings":
        if not self.database_url:
            self.database_url = (
                f"postgresql://{self.db_user}:{self.db_password}"
                f"@{self.db_host}:{self.db_port}/{self.db_name}"
            )
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
