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
