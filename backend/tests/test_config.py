from pathlib import Path

from app.config import BACKEND_DIR, Settings


def make_settings(**values) -> Settings:
    return Settings(_env_file=None, **values)


def test_relative_sqlite_path_resolves_to_backend_dir():
    settings = make_settings(database_url="sqlite:///./notes.db")

    assert settings.database_url == f"sqlite:///{(BACKEND_DIR / 'notes.db').as_posix()}"


def test_absolute_and_in_memory_database_urls_are_unchanged():
    absolute = f"sqlite:///{(Path.cwd() / 'notes.db').resolve().as_posix()}"

    assert make_settings(database_url=absolute).database_url == absolute
    assert make_settings(database_url="sqlite://").database_url == "sqlite://"
    assert make_settings(database_url="sqlite:///:memory:").database_url == "sqlite:///:memory:"


def test_cors_origin_list_splits_and_trims():
    settings = make_settings(cors_origins="http://a.test, http://b.test ,")

    assert settings.cors_origin_list == ["http://a.test", "http://b.test"]
