"""Ortak test fikstürleri.

Her test kendi bellek içi SQLite veritabanıyla çalışır; gerçek
veritabanı dosyasına hiç dokunulmaz.
"""

import os

# Uygulama modülleri içe aktarılmadan ÖNCE ayarlanmalı.
os.environ["DATABASE_URL"] = "sqlite://"

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from app.database import build_engine, create_tables, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import User  # noqa: E402
from app.seed import seed_database  # noqa: E402


@pytest.fixture
def db_session() -> Iterator[Session]:
    """Boş tablolarla, teste özel bellek içi veritabanı oturumu."""
    engine = build_engine("sqlite://")
    create_tables(engine)
    testing_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    session = testing_session()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    """get_db'si test veritabanına bağlanmış HTTP test istemcisi."""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seed_user(db_session: Session) -> User:
    """Örnek verileri yükler ve örnek (giriş yapmış) kullanıcıyı döndürür."""
    return seed_database(db_session)
