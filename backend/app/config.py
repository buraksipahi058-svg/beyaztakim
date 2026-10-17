"""Uygulama ayarları.

Tüm ayarlar ortam değişkenlerinden veya depo kökündeki `.env` dosyasından okunur.
Gizli bilgiler (SECRET_KEY vb.) asla koda yazılmaz; `.env.example` dosyasını
`.env` olarak kopyalayıp değerleri orada doldurun.
"""

from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ klasörü ve depo kökü
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_DIR / 'beyaztakim.db').as_posix()}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ROOT_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Beyaz Takım Notlar API"

    # Kimlik doğrulama eklendiğinde (JWT vb.) zorunlu hale getirilmelidir.
    secret_key: str | None = None

    database_url: str = DEFAULT_DATABASE_URL

    # Virgülle ayrılmış izinli frontend adresleri
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Örnek (seed) kullanıcı. Gerçek giriş sistemi gelene kadar
    # get_current_user bu kullanıcıyı döndürür.
    seed_user_email: str = "demo@beyaztakim.local"
    seed_user_password: str | None = None

    @field_validator("database_url")
    @classmethod
    def resolve_relative_sqlite_path(cls, value: str) -> str:
        """Göreli SQLite yollarını backend/ klasörüne göre mutlak yola çevirir.

        Böylece komut hangi klasörden çalıştırılırsa çalıştırılsın
        aynı veritabanı dosyası kullanılır.
        """
        prefix = "sqlite:///"
        if not value.startswith(prefix):
            return value
        path = value.removeprefix(prefix)
        if not path or path == ":memory:" or Path(path).is_absolute():
            return value
        return prefix + (BACKEND_DIR / path).resolve().as_posix()

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
