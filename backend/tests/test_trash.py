"""app/services/trash.py ve app/routers/trash.py testleri.

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

from datetime import timedelta

import pytest
from sqlalchemy import func, select

from app.dependencies import get_current_user
from app.main import app
from app.models import ChecklistItem, Note, Tag, User, note_tags, utc_now
from app.services import trash as trash_service
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


# --- Servis: çöpteki notlar --------------------------------------------------


def test_list_trashed_notes_returns_own_trashed_notes_newest_first(db_session):
    user = make_user(db_session, "ayse@example.com")
    older = make_note(db_session, user, is_trashed=True, trashed_at=utc_now() - timedelta(days=2))
    newer = make_note(db_session, user, is_trashed=True, trashed_at=utc_now())
    make_note(db_session, user)
    make_note(db_session, make_user(db_session), is_trashed=True, trashed_at=utc_now())

    notes = trash_service.list_trashed_notes(db_session, user)

    assert [note.id for note in notes] == [newer.id, older.id]


# --- Servis: çöpe taşıma ve geri yükleme ------------------------------------


def test_move_note_to_trash_sets_flag_and_time(db_session, seed_user):
    note = make_note(db_session, seed_user)

    trashed = trash_service.move_note_to_trash(db_session, seed_user, note.id)

    assert trashed.is_trashed is True
    assert trashed.trashed_at is not None


def test_move_trashed_note_again_keeps_first_time(db_session, seed_user):
    note = trash_service.move_note_to_trash(
        db_session, seed_user, make_note(db_session, seed_user).id
    )
    first_time = note.trashed_at

    again = trash_service.move_note_to_trash(db_session, seed_user, note.id)

    assert again.trashed_at == first_time


def test_restore_note_returns_archived_note_to_archive(db_session, seed_user):
    note = make_note(
        db_session, seed_user, is_archived=True, is_trashed=True, trashed_at=utc_now()
    )

    restored = trash_service.restore_note(db_session, seed_user, note.id)

    assert restored.is_trashed is False
    assert restored.trashed_at is None
    assert restored.is_archived is True


def test_restore_note_not_in_trash_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user)

    with pytest.raises(ValidationError):
        trash_service.restore_note(db_session, seed_user, note.id)


def test_move_other_users_note_to_trash_raises_not_found(db_session, seed_user):
    note = make_note(db_session, make_user(db_session))

    with pytest.raises(NotFoundError):
        trash_service.move_note_to_trash(db_session, seed_user, note.id)


# --- Servis: kalıcı silme ----------------------------------------------------


def test_delete_note_permanently_removes_note_items_and_tag_links(db_session, seed_user):
    tag = Tag(user_id=seed_user.id, name="silinecek")
    note = make_note(
        db_session,
        seed_user,
        note_type="checklist",
        is_trashed=True,
        trashed_at=utc_now(),
        tags=[tag],
        checklist_items=[ChecklistItem(text="Süt", position=0)],
    )
    note_id = note.id

    trash_service.delete_note_permanently(db_session, seed_user, note_id)

    assert db_session.get(Note, note_id) is None
    assert db_session.scalar(select(func.count()).select_from(ChecklistItem).where(
        ChecklistItem.note_id == note_id
    )) == 0
    assert db_session.scalar(select(func.count()).select_from(note_tags).where(
        note_tags.c.note_id == note_id
    )) == 0
    assert db_session.get(Tag, tag.id) is not None


def test_delete_note_permanently_requires_note_in_trash(db_session, seed_user):
    note = make_note(db_session, seed_user)

    with pytest.raises(ValidationError):
        trash_service.delete_note_permanently(db_session, seed_user, note.id)

    assert db_session.get(Note, note.id) is not None


# --- Uç noktalar -------------------------------------------------------------


def test_post_trash_endpoint_moves_note_and_hides_it_from_notes(
    authed_client, db_session, seed_user
):
    note = make_note(db_session, seed_user, title="Çöpe gidecek")

    response = authed_client.post(f"/trash/{note.id}")
    titles = [item["title"] for item in authed_client.get("/notes").json()]

    assert response.status_code == 200
    assert response.json()["is_trashed"] is True
    assert "Çöpe gidecek" not in titles


def test_get_trash_endpoint_lists_trashed_notes(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, is_trashed=True, trashed_at=utc_now())

    response = authed_client.get("/trash")

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [note.id]


def test_restore_endpoint_returns_note(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, is_trashed=True, trashed_at=utc_now())

    response = authed_client.post(f"/trash/{note.id}/restore")

    assert response.status_code == 200
    assert response.json()["is_trashed"] is False


def test_restore_endpoint_note_not_in_trash_returns_400(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.post(f"/trash/{note.id}/restore")

    assert response.status_code == 400


def test_delete_endpoint_returns_204_then_404(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, is_trashed=True, trashed_at=utc_now())

    first = authed_client.delete(f"/trash/{note.id}")
    second = authed_client.delete(f"/trash/{note.id}")

    assert first.status_code == 204
    assert second.status_code == 404


def test_delete_endpoint_note_not_in_trash_returns_400(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.delete(f"/trash/{note.id}")

    assert response.status_code == 400


def test_get_trash_without_login_returns_401(client):
    response = client.get("/trash")

    assert response.status_code == 401
