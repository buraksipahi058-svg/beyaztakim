"""app/services/notes.py ve app/routers/notes.py testleri.

Sahibi: 2. kişi (Not İşlemleri)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri, get_current_user bağımlılığını test kullanıcısına
sabitleyerek (dependency_overrides) gerçek giriş sisteminin (1. kişi, /auth)
durumundan bağımsız çalışır.
"""

import pytest

from app.dependencies import get_current_user
from app.main import app
from app.models import Note, User
from app.schemas.notes import ChecklistItemCreate, NoteCreate, NoteUpdate
from app.services import notes as notes_service
from app.services.errors import NotFoundError, ValidationError


@pytest.fixture
def authed_client(client, seed_user):
    """get_current_user'ı seed_user'a sabitleyen HTTP test istemcisi."""
    app.dependency_overrides[get_current_user] = lambda: seed_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def make_user(db_session, email: str) -> User:
    """Testlerde kullanılmak üzere ek bir kullanıcı oluşturur."""
    user = User(email=email, password_hash="test")
    db_session.add(user)
    db_session.commit()
    return user


# --- Not oluşturma ----------------------------------------------------------


def test_create_text_note(db_session, seed_user):
    note = notes_service.create_note(
        db_session, seed_user, NoteCreate(title="Alışveriş", content="Süt ve ekmek", color="yellow")
    )

    assert note.id is not None
    assert note.user_id == seed_user.id
    assert note.note_type == "text"
    assert note.color == "yellow"
    assert note.is_archived is False
    assert note.is_trashed is False


def test_create_checklist_note_with_items(db_session, seed_user):
    note = notes_service.create_note(
        db_session,
        seed_user,
        NoteCreate(
            title="Alışveriş",
            note_type="checklist",
            checklist_items=[
                ChecklistItemCreate(text="Süt", is_done=True),
                ChecklistItemCreate(text="Ekmek"),
            ],
        ),
    )

    assert [item.position for item in note.checklist_items] == [0, 1]
    assert [item.text for item in note.checklist_items] == ["Süt", "Ekmek"]
    assert note.checklist_items[0].is_done is True


def test_create_note_rejects_unknown_color(db_session, seed_user):
    with pytest.raises(ValidationError):
        notes_service.create_note(db_session, seed_user, NoteCreate(color="mavi"))


def test_create_text_note_rejects_checklist_items(db_session, seed_user):
    with pytest.raises(ValidationError):
        notes_service.create_note(
            db_session,
            seed_user,
            NoteCreate(content="Merhaba", checklist_items=[ChecklistItemCreate(text="Madde")]),
        )


# --- Not listeleme ----------------------------------------------------------


def test_list_notes_hides_archived_and_trashed(db_session):
    user = make_user(db_session, "temiz1@beyaztakim.local")
    notes_service.create_note(db_session, user, NoteCreate(title="Aktif"))
    archived = notes_service.create_note(db_session, user, NoteCreate(title="Arşiv"))
    archived.is_archived = True
    trashed = notes_service.create_note(db_session, user, NoteCreate(title="Çöp"))
    trashed.is_trashed = True
    db_session.commit()

    titles = [note.title for note in notes_service.list_notes(db_session, user)]

    assert titles == ["Aktif"]


def test_list_notes_orders_pinned_first(db_session):
    user = make_user(db_session, "temiz2@beyaztakim.local")
    notes_service.create_note(db_session, user, NoteCreate(title="Normal"))
    pinned = notes_service.create_note(db_session, user, NoteCreate(title="Sabit"))
    pinned.is_pinned = True
    db_session.commit()

    titles = [note.title for note in notes_service.list_notes(db_session, user)]

    assert titles == ["Sabit", "Normal"]  # sabitlenen üste gelir


def test_list_notes_includes_new_note_and_hides_seed_archive(db_session, seed_user):
    notes_service.create_note(db_session, seed_user, NoteCreate(title="Yeni not"))

    titles = [note.title for note in notes_service.list_notes(db_session, seed_user)]

    assert "Yeni not" in titles
    assert "Eski fikir" not in titles  # seed'deki arşivli not listede yok


def test_list_notes_returns_only_own_notes(db_session):
    user = make_user(db_session, "temiz3@beyaztakim.local")
    other = make_user(db_session, "diger1@beyaztakim.local")
    notes_service.create_note(db_session, other, NoteCreate(title="Başkasının"))

    notes_service.create_note(db_session, user, NoteCreate(title="Benim"))

    titles = [note.title for note in notes_service.list_notes(db_session, user)]

    assert titles == ["Benim"]


# --- Tek not görüntüleme ----------------------------------------------------


def test_get_note_returns_own_note(db_session, seed_user):
    note = notes_service.create_note(db_session, seed_user, NoteCreate(title="Not"))

    assert notes_service.get_note(db_session, seed_user, note.id).id == note.id


def test_get_note_missing_raises_not_found(db_session, seed_user):
    with pytest.raises(NotFoundError):
        notes_service.get_note(db_session, seed_user, 9999)


def test_get_note_of_another_user_raises_not_found(db_session, seed_user):
    other = make_user(db_session, "diger2@beyaztakim.local")
    foreign_note = notes_service.create_note(db_session, other, NoteCreate(title="Başkasının"))

    with pytest.raises(NotFoundError):
        notes_service.get_note(db_session, seed_user, foreign_note.id)


# --- Not düzenleme ----------------------------------------------------------


def test_update_note_changes_only_sent_fields(db_session, seed_user):
    note = notes_service.create_note(
        db_session, seed_user, NoteCreate(title="Eski", content="içerik", color="blue")
    )

    updated = notes_service.update_note(
        db_session, seed_user, note.id, NoteUpdate(title="Yeni", is_pinned=True)
    )

    assert updated.title == "Yeni"
    assert updated.is_pinned is True
    assert updated.content == "içerik"  # gönderilmeyen alan korundu
    assert updated.color == "blue"


def test_update_note_rejects_unknown_color(db_session, seed_user):
    note = notes_service.create_note(db_session, seed_user, NoteCreate(title="Not"))

    with pytest.raises(ValidationError):
        notes_service.update_note(db_session, seed_user, note.id, NoteUpdate(color="mor"))


def test_update_note_of_another_user_raises_not_found(db_session, seed_user):
    other = make_user(db_session, "diger3@beyaztakim.local")
    foreign_note = notes_service.create_note(db_session, other, NoteCreate(title="Başkasının"))

    with pytest.raises(NotFoundError):
        notes_service.update_note(db_session, seed_user, foreign_note.id, NoteUpdate(title="Hack"))


# --- Uç noktalar ------------------------------------------------------------


def test_create_and_list_notes_endpoint(client, db_session):
    user = make_user(db_session, "notlar@beyaztakim.local")
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        created_response = client.post(
            "/notes",
            json={"title": "Hoş geldin", "content": "Merhaba", "color": "yellow"},
        )

        assert created_response.status_code == 201
        created = created_response.json()
        assert created["title"] == "Hoş geldin"
        assert created["tags"] == []

        listing = client.get("/notes").json()
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert [note["title"] for note in listing] == ["Hoş geldin"]


def test_create_checklist_note_endpoint(authed_client):
    response = authed_client.post(
        "/notes",
        json={
            "title": "Alışveriş",
            "note_type": "checklist",
            "checklist_items": [{"text": "Süt", "is_done": True}, {"text": "Ekmek"}],
        },
    )

    assert response.status_code == 201
    items = response.json()["checklist_items"]
    assert [item["text"] for item in items] == ["Süt", "Ekmek"]
    assert items[0]["is_done"] is True


def test_get_and_patch_note_endpoint(authed_client):
    created = authed_client.post(
        "/notes", json={"title": "Sınav", "content": "Konu tekrarı", "color": "blue"}
    ).json()

    read = authed_client.get(f"/notes/{created['id']}")
    patched = authed_client.patch(
        f"/notes/{created['id']}", json={"title": "Sınav hazırlığı", "is_pinned": True}
    )

    assert read.status_code == 200
    assert read.json()["content"] == "Konu tekrarı"
    assert patched.status_code == 200
    assert patched.json()["title"] == "Sınav hazırlığı"
    assert patched.json()["is_pinned"] is True
    assert patched.json()["color"] == "blue"  # gönderilmeyen alan korundu


def test_get_note_endpoint_hides_other_users_note(client, db_session):
    owner = make_user(db_session, "sahip@beyaztakim.local")
    foreign = make_user(db_session, "diger@beyaztakim.local")
    note_response = None
    app.dependency_overrides[get_current_user] = lambda: owner
    try:
        note_response = client.post("/notes", json={"title": "Gizli"}).json()
    finally:
        app.dependency_overrides[get_current_user] = lambda: foreign

    assert client.get(f"/notes/{note_response['id']}").status_code == 404


def test_get_missing_note_endpoint_returns_404(authed_client):
    assert authed_client.get("/notes/9999").status_code == 404


def test_create_note_endpoint_validates_input(authed_client):
    assert authed_client.post("/notes", json={"color": "mavi"}).status_code == 400
    assert authed_client.post("/notes", json={"note_type": "hucre"}).status_code == 422
