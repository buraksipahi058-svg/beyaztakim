"""app/services/auth.py ve app/routers/auth.py testleri.

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py
"""

import pytest

from app.schemas.auth import UserCreate, UserLogin
from app.seed import hash_seed_password
from app.services import auth as auth_service
from app.services.auth import UnauthorizedError
from app.services.errors import ConflictError


def _user_create(email: str, password: str) -> UserCreate:
    return UserCreate(email=email, password=password)


def _register(db_session, email: str, password: str):
    return auth_service.register_user(db_session, _user_create(email, password))


def _login(db_session, email: str, password: str) -> object:
    return auth_service.login_user(db_session, UserLogin(email=email, password=password))


def _login_token(client, email: str, password: str) -> str:
    response = client.post("/auth/login", json={"email": email, "password": password})
    return response.json()["access_token"]


# --- Parola özeti -----------------------------------------------------------


def test_hash_password_uses_pbkdf2_format_and_random_salt():
    first = auth_service.hash_password("gizli-parola")
    second = auth_service.hash_password("gizli-parola")

    assert first.startswith("pbkdf2_sha256$")
    assert first != second  # her özet farklı tuzla üretilir


def test_verify_password_accepts_correct_and_rejects_wrong():
    password_hash = auth_service.hash_password("gizli-parola")

    assert auth_service.verify_password("gizli-parola", password_hash)
    assert not auth_service.verify_password("yanlis", password_hash)
    assert not auth_service.verify_password("gizli-parola", "bozuk-hash")


def test_verify_password_accepts_seed_hash_format():
    """Seed'in ürettiği özet biçimi ile servis uyumlu olmalı."""
    password_hash = hash_seed_password("parola")

    assert auth_service.verify_password("parola", password_hash)


# --- Kayıt ------------------------------------------------------------------


def test_register_user_creates_user_with_hashed_password(db_session):
    user = _register(db_session, "Ayse@Example.com", "parola123")

    assert user.email == "ayse@example.com"  # e-posta küçük harfe normalize edilir
    assert user.password_hash != "parola123"
    assert auth_service.verify_password("parola123", user.password_hash)


def test_register_user_rejects_duplicate_email(db_session):
    _register(db_session, "ayse@example.com", "parola123")

    with pytest.raises(ConflictError):
        _register(db_session, "ayse@example.com", "baska-parola")


# --- Giriş ------------------------------------------------------------------


def test_login_user_returns_token(db_session):
    _register(db_session, "ayse@example.com", "parola123")

    token_response = _login(db_session, "ayse@example.com", "parola123")

    assert token_response.token_type == "bearer"
    assert token_response.access_token


def test_login_user_rejects_wrong_password(db_session):
    _register(db_session, "ayse@example.com", "parola123")

    with pytest.raises(UnauthorizedError):
        _login(db_session, "ayse@example.com", "yanlis-parola")


def test_login_user_rejects_unknown_email(db_session):
    with pytest.raises(UnauthorizedError):
        _login(db_session, "yok@example.com", "parola123")


# --- Jetondan kullanıcı -----------------------------------------------------


def test_get_user_by_token_returns_user(db_session):
    user = _register(db_session, "ayse@example.com", "parola123")
    token = auth_service.create_access_token(user.id)

    assert auth_service.get_user_by_token(db_session, token).id == user.id


def test_get_user_by_token_rejects_missing_and_invalid_token(db_session):
    _register(db_session, "ayse@example.com", "parola123")
    valid_token = auth_service.create_access_token(1)

    with pytest.raises(UnauthorizedError):
        auth_service.get_user_by_token(db_session, None)
    with pytest.raises(UnauthorizedError):
        auth_service.get_user_by_token(db_session, "bozuk-jeton")
    with pytest.raises(UnauthorizedError):
        auth_service.get_user_by_token(db_session, valid_token + "x")  # imza bozuldu


# --- Uç noktalar ------------------------------------------------------------


def test_register_endpoint_returns_201_and_created_user(client):
    response = client.post("/auth/register", json={"email": "ayse@example.com", "password": "parola123"})

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "ayse@example.com"
    assert "password" not in body
    assert "password_hash" not in body


def test_register_endpoint_rejects_duplicate_email_with_409(client):
    payload = {"email": "ayse@example.com", "password": "parola123"}
    client.post("/auth/register", json=payload)

    assert client.post("/auth/register", json=payload).status_code == 409


def test_register_endpoint_rejects_invalid_request_with_422(client):
    assert client.post("/auth/register", json={"email": "gecersiz", "password": "parola123"}).status_code == 422
    assert client.post("/auth/register", json={"email": "ayse@example.com", "password": "kisa"}).status_code == 422


def test_login_endpoint_returns_token(client):
    client.post("/auth/register", json={"email": "ayse@example.com", "password": "parola123"})

    response = client.post("/auth/login", json={"email": "ayse@example.com", "password": "parola123"})

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_endpoint_rejects_wrong_password_with_401(client):
    client.post("/auth/register", json={"email": "ayse@example.com", "password": "parola123"})

    response = client.post("/auth/login", json={"email": "ayse@example.com", "password": "yanlis-parola"})

    assert response.status_code == 401


def test_me_endpoint_returns_logged_in_user(client):
    client.post("/auth/register", json={"email": "ayse@example.com", "password": "parola123"})
    token = _login_token(client, "ayse@example.com", "parola123")

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "ayse@example.com"


def test_me_endpoint_without_token_returns_401(client):
    assert client.get("/auth/me").status_code == 401


def test_logout_endpoint_returns_204_with_token(client):
    client.post("/auth/register", json={"email": "ayse@example.com", "password": "parola123"})
    token = _login_token(client, "ayse@example.com", "parola123")

    response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 204


def test_register_login_me_flow_end_to_end(client):
    register = client.post("/auth/register", json={"email": "ayse@example.com", "password": "parola123"})
    login = client.post("/auth/login", json={"email": "ayse@example.com", "password": "parola123"})
    token = login.json()["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert register.status_code == 201
    assert login.status_code == 200
    assert me.status_code == 200
    assert me.json()["id"] == register.json()["id"]
