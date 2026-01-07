from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str
    env: str
    database_url: str
    jwt_secret: str
    jwt_algorithm: str
    access_token_expire_minutes: int

    class Config:
        env_file = ".env"

settings = Settings()
