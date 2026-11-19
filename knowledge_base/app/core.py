from functools import lru_cache
from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    supabase_url: str
    supabase_service_role_key: SecretStr
    openai_api_key: SecretStr
    openai_base_url: str = "https://api.openai.com/v1"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    kb_api_token: SecretStr
    kb_allowed_origins: str = "https://cscskb.online,https://www.cscskb.online"
    tavily_api_key: SecretStr | None = None
    max_upload_bytes: int = 15_000_000

    @field_validator("embedding_dimensions")
    @classmethod
    def validate_dimensions(cls, value: int) -> int:
        if value != 1536:
            raise ValueError("Database vector schema currently requires 1536 dimensions")
        return value

    @property
    def allowed_origins(self) -> set[str]:
        return {item.strip() for item in self.kb_allowed_origins.split(",") if item.strip()}


@lru_cache
def get_settings() -> Settings:
    return Settings()
