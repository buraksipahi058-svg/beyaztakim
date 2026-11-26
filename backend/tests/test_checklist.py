"""app/services/checklist.py ve app/routers/checklist.py testleri.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

import pytest

from app.dependencies import get_current_user
from app.main import app
from app.models import ChecklistItem, Note, User
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate
from app.services import checklist as checklist_service
from app.services.errors import NotFoundError, ValidationError


@pytest.fixture
def authed_client(client, seed_user):
    """get_current_user'ı seed_user'a sabitleyen HTTP test istemcisi."""
    app.dependency_overrides[get_current_user] = lambda: seed_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def make_note(db_session, user: User, note_type: str = "checklist") -> Note:
    note = Note(user_id=user.id, title="Alışveriş", note_type=note_type)
    db_session.add(note)
    db_session.commit()
    return note


def make_other_user(db_session) -> User:
    user = User(email="baska@example.com", password_hash="test")
    db_session.add(user)
    db_session.commit()
    return user


def add_item(db_session, user: User, note: Note, text: str) -> ChecklistItem:
    return checklist_service.add_checklist_item(
        db_session, user, note.id, ChecklistItemCreate(text=text)
    )


# --- Servis: ekleme ----------------------------------------------------------


def test_add_checklist_item_appends_with_next_position(db_session, seed_user):
    note = make_note(db_session, seed_user)

    first = add_item(db_session, seed_user, note, "Süt")
    second = add_item(db_session, seed_user, note, "Ekmek")

    assert (first.position, second.position) == (0, 1)
    assert first.is_done is False
    assert first.note_id == note.id


def test_add_checklist_item_to_text_note_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user, note_type="text")

    with pytest.raises(ValidationError):
        add_item(db_session, seed_user, note, "Süt")


def test_add_checklist_item_to_other_users_note_raises_not_found(db_session, seed_user):
    note = make_note(db_session, make_other_user(db_session))

    with pytest.raises(NotFoundError):
        add_item(db_session, seed_user, note, "Süt")


# --- Servis: güncelleme ve silme -------------------------------------------


def test_update_checklist_item_marks_done_and_keeps_text(db_session, seed_user):
    note = make_note(db_session, seed_user)
    item = add_item(db_session, seed_user, note, "Süt")

    updated = checklist_service.update_checklist_item(
        db_session, seed_user, item.id, ChecklistItemUpdate(is_done=True)
    )

    assert updated.is_done is True
    assert updated.text == "Süt"


def test_update_checklist_item_changes_text(db_session, seed_user):
    note = make_note(db_session, seed_user)
    item = add_item(db_session, seed_user, note, "Süt")

    updated = checklist_service.update_checklist_item(
        db_session, seed_user, item.id, ChecklistItemUpdate(text="Laktozsuz süt")
    )

    assert updated.text == "Laktozsuz süt"
    assert updated.is_done is False


def test_update_other_users_item_raises_not_found(db_session, seed_user):
    other_user = make_other_user(db_session)
    item = add_item(db_session, other_user, make_note(db_session, other_user), "Süt")

    with pytest.raises(NotFoundError):
        checklist_service.update_checklist_item(
            db_session, seed_user, item.id, ChecklistItemUpdate(is_done=True)
        )


def test_delete_checklist_item_removes_item(db_session, seed_user):
    note = make_note(db_session, seed_user)
    item = add_item(db_session, seed_user, note, "Süt")

    checklist_service.delete_checklist_item(db_session, seed_user, item.id)

    assert db_session.get(ChecklistItem, item.id) is None


def test_delete_missing_item_raises_not_found(db_session, seed_user):
    with pytest.raises(NotFoundError):
        checklist_service.delete_checklist_item(db_session, seed_user, 9999)


# --- Uç noktalar -------------------------------------------------------------


def test_post_item_endpoint_returns_201(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.post(f"/checklist/{note.id}/items", json={"text": "Süt al"})

    assert response.status_code == 201
    assert response.json()["text"] == "Süt al"
    assert response.json()["is_done"] is False
    assert response.json()["position"] == 0


def test_post_item_to_text_note_returns_400(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, note_type="text")

    response = authed_client.post(f"/checklist/{note.id}/items", json={"text": "Süt al"})

    assert response.status_code == 400


def test_patch_item_endpoint_marks_done(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)
    item = add_item(db_session, seed_user, note, "Ekmek al")

    response = authed_client.patch(f"/checklist/items/{item.id}", json={"is_done": True})

    assert response.status_code == 200
    assert response.json()["is_done"] is True


def test_delete_item_endpoint_returns_204_then_404(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)
    item = add_item(db_session, seed_user, note, "Yumurta al")

    deleted = authed_client.delete(f"/checklist/items/{item.id}")
    again = authed_client.patch(f"/checklist/items/{item.id}", json={"text": "Test"})

    assert deleted.status_code == 204
    assert again.status_code == 404


def test_post_item_with_too_long_text_returns_422(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.post(f"/checklist/{note.id}/items", json={"text": "x" * 501})

    assert response.status_code == 422


def test_post_item_without_login_returns_401(client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = client.post(f"/checklist/{note.id}/items", json={"text": "Süt al"})

    assert response.status_code == 401
