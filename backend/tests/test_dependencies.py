import pytest
from fastapi import HTTPException

from app.config import get_settings
from app.dependencies import get_current_user


def test_get_current_user_returns_seed_user(db_session, seed_user):
    user = get_current_user(db_session)

    assert user.id == seed_user.id
    assert user.email == get_settings().seed_user_email


def test_get_current_user_without_seed_raises_401(db_session):
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(db_session)

    assert exc_info.value.status_code == 401


"""get_current_user bağımlılığının testleri.

Ortak dosyadır. get_current_user'ın içi 1. kişi tarafından gerçek giriş
sistemiyle değiştirildi: artık `Authorization: Bearer <jeton>` başlığı
beklenir (bkz. app/services/auth.py).
"""

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.dependencies import get_current_user
from app.schemas.auth import UserCreate
from app.services import auth as auth_service


def make_credentials(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def register_user(db_session):
    return auth_service.register_user(
        db_session, UserCreate(email="ayse@example.com", password="parola123")
    )


def test_get_current_user_with_valid_token_returns_user(db_session):
    user = register_user(db_session)
    credentials = make_credentials(auth_service.create_access_token(user.id))

    assert get_current_user(db_session, credentials).id == user.id


def test_get_current_user_without_token_raises_401(db_session):
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(db_session)

    assert exc_info.value.status_code == 401


def test_get_current_user_with_invalid_token_raises_401(db_session):
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(db_session, make_credentials("bozuk.jeton"))

    assert exc_info.value.status_code == 401
