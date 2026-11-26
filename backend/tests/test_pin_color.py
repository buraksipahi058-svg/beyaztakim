"""app/services/pin_color.py ve app/routers/pin_color.py testleri.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

import pytest

from app.dependencies import get_current_user
from app.main import app
from app.models import Note, User
from app.services import pin_color as pin_color_service
from app.services.errors import NotFoundError, ValidationError


@pytest.fixture
def authed_client(client, seed_user):
    """get_current_user'ı seed_user'a sabitleyen HTTP test istemcisi."""
    app.dependency_overrides[get_current_user] = lambda: seed_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def make_note(db_session, user: User, **fields) -> Note:
    note = Note(user_id=user.id, title="Deneme", **fields)
    db_session.add(note)
    db_session.commit()
    return note


def make_other_user(db_session) -> User:
    user = User(email="baska@example.com", password_hash="test")
    db_session.add(user)
    db_session.commit()
    return user


# --- Servis: sabitleme -------------------------------------------------------


def test_update_note_pin_pins_and_unpins(db_session, seed_user):
    note = make_note(db_session, seed_user)

    pinned = pin_color_service.update_note_pin(db_session, seed_user, note.id, True)
    assert pinned.is_pinned is True

    unpinned = pin_color_service.update_note_pin(db_session, seed_user, note.id, False)
    assert unpinned.is_pinned is False


def test_update_note_pin_other_users_note_raises_not_found(db_session, seed_user):
    note = make_note(db_session, make_other_user(db_session))

    with pytest.raises(NotFoundError):
        pin_color_service.update_note_pin(db_session, seed_user, note.id, True)


# --- Servis: renk ------------------------------------------------------------


def test_update_note_color_changes_color(db_session, seed_user):
    note = make_note(db_session, seed_user)

    updated = pin_color_service.update_note_color(db_session, seed_user, note.id, "teal")

    assert updated.color == "teal"


def test_update_note_color_unknown_color_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user)

    with pytest.raises(ValidationError):
        pin_color_service.update_note_color(db_session, seed_user, note.id, "turkuaz")

    db_session.refresh(note)
    assert note.color == "default"


def test_update_note_color_missing_note_raises_not_found(db_session, seed_user):
    with pytest.raises(NotFoundError):
        pin_color_service.update_note_color(db_session, seed_user, 9999, "red")


# --- Uç noktalar -------------------------------------------------------------


def test_patch_pin_endpoint_returns_updated_note(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.patch(f"/pin-color/{note.id}/pin", json={"is_pinned": True})

    assert response.status_code == 200
    assert response.json()["is_pinned"] is True


def test_patch_color_endpoint_returns_updated_note(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.patch(f"/pin-color/{note.id}/color", json={"color": "pink"})

    assert response.status_code == 200
    assert response.json()["color"] == "pink"


def test_patch_color_endpoint_unknown_color_returns_400(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.patch(f"/pin-color/{note.id}/color", json={"color": "turkuaz"})

    assert response.status_code == 400


def test_patch_pin_endpoint_missing_note_returns_404(authed_client):
    response = authed_client.patch("/pin-color/9999/pin", json={"is_pinned": True})

    assert response.status_code == 404


def test_patch_pin_endpoint_invalid_body_returns_422(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.patch(f"/pin-color/{note.id}/pin", json={})

    assert response.status_code == 422


def test_patch_pin_endpoint_without_login_returns_401(client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = client.patch(f"/pin-color/{note.id}/pin", json={"is_pinned": True})

    assert response.status_code == 401
