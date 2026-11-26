"""app/services/archive.py ve app/routers/archive.py testleri.

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

import pytest

from app.dependencies import get_current_user
from app.main import app
from app.models import Note, User
from app.services import archive as archive_service
from app.services.errors import NotFoundError, ValidationError


@pytest.fixture
def authed_client(client, seed_user):
    """get_current_user'ı seed_user'a sabitleyen HTTP test istemcisi."""
    app.dependency_overrides[get_current_user] = lambda: seed_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def make_user(db_session, email: str = "baska@example.com") -> User:
    user = User(email=email, password_hash="test")
    db_session.add(user)
    db_session.commit()
    return user


def make_note(db_session, user: User, **fields) -> Note:
    note = Note(user_id=user.id, title=fields.pop("title", "Deneme"), **fields)
    db_session.add(note)
    db_session.commit()
    return note


# --- Servis: arşivdeki notlar ------------------------------------------------


def test_list_archived_notes_returns_only_own_archived_notes(db_session):
    user = make_user(db_session, "ayse@example.com")
    archived = make_note(db_session, user, is_archived=True)
    make_note(db_session, user)
    make_note(db_session, user, is_archived=True, is_trashed=True)
    make_note(db_session, make_user(db_session), is_archived=True)

    notes = archive_service.list_archived_notes(db_session, user)

    assert [note.id for note in notes] == [archived.id]


# --- Servis: arşivleme ve arşivden çıkarma ---------------------------------


def test_archive_note_archives_and_unpins(db_session, seed_user):
    note = make_note(db_session, seed_user, is_pinned=True)

    archived = archive_service.archive_note(db_session, seed_user, note.id)

    assert archived.is_archived is True
    assert archived.is_pinned is False


def test_unarchive_note_returns_note_to_home(db_session, seed_user):
    note = make_note(db_session, seed_user, is_archived=True)

    restored = archive_service.unarchive_note(db_session, seed_user, note.id)

    assert restored.is_archived is False


def test_archive_trashed_note_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user, is_trashed=True)

    with pytest.raises(ValidationError):
        archive_service.archive_note(db_session, seed_user, note.id)


def test_unarchive_trashed_note_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user, is_archived=True, is_trashed=True)

    with pytest.raises(ValidationError):
        archive_service.unarchive_note(db_session, seed_user, note.id)


def test_archive_other_users_note_raises_not_found(db_session, seed_user):
    note = make_note(db_session, make_user(db_session))

    with pytest.raises(NotFoundError):
        archive_service.archive_note(db_session, seed_user, note.id)


# --- Uç noktalar -------------------------------------------------------------


def test_get_archive_endpoint_lists_archived_notes(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, title="Arşivdeki not", is_archived=True)

    response = authed_client.get("/archive")

    # seed'deki "Eski fikir" de arşivde; en son güncellenen en üstte gelir.
    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["Arşivdeki not", "Eski fikir"]
    assert response.json()[0]["id"] == note.id


def test_post_archive_endpoint_archives_note(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.post(f"/archive/{note.id}")

    assert response.status_code == 200
    assert response.json()["is_archived"] is True


def test_archived_note_leaves_notes_list(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, title="Arşivlenecek")

    authed_client.post(f"/archive/{note.id}")
    titles = [item["title"] for item in authed_client.get("/notes").json()]

    assert "Arşivlenecek" not in titles


def test_delete_archive_endpoint_unarchives_note(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, is_archived=True)

    response = authed_client.delete(f"/archive/{note.id}")

    assert response.status_code == 200
    assert response.json()["is_archived"] is False


def test_post_archive_endpoint_trashed_note_returns_400(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, is_trashed=True)

    response = authed_client.post(f"/archive/{note.id}")

    assert response.status_code == 400


def test_post_archive_endpoint_missing_note_returns_404(authed_client):
    response = authed_client.post("/archive/9999")

    assert response.status_code == 404


def test_get_archive_without_login_returns_401(client):
    response = client.get("/archive")

    assert response.status_code == 401
