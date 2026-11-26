"""app/services/tags.py ve app/routers/tags.py testleri.

Sahibi: 3. kişi (Etiket ve Arama)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.dependencies import get_current_user
from app.main import app
from app.models import Note, Tag, User
from app.schemas.tags import TagCreate
from app.services import tags as tag_service
from app.services.errors import ConflictError, NotFoundError


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


def make_note(db_session, user: User) -> Note:
    note = Note(user_id=user.id, title="Deneme")
    db_session.add(note)
    db_session.commit()
    return note


def make_tag(db_session, user: User, name: str) -> Tag:
    return tag_service.create_tag(db_session, user, TagCreate(name=name))


# --- Şema --------------------------------------------------------------------


def test_tag_create_strips_whitespace():
    assert TagCreate(name="  okul  ").name == "okul"


def test_tag_create_rejects_blank_name():
    with pytest.raises(PydanticValidationError):
        TagCreate(name="   ")


# --- Servis: etiket oluşturma, listeleme, silme ------------------------------


def test_create_tag_saves_tag_for_user(db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    assert tag.id is not None
    assert tag.user_id == seed_user.id
    assert tag.name == "okul"


def test_create_tag_with_existing_name_raises_conflict(db_session, seed_user):
    make_tag(db_session, seed_user, "okul")

    with pytest.raises(ConflictError):
        make_tag(db_session, seed_user, "okul")


def test_same_tag_name_is_allowed_for_different_users(db_session, seed_user):
    make_tag(db_session, seed_user, "okul")

    other_tag = make_tag(db_session, make_user(db_session), "okul")

    assert other_tag.id is not None


def test_list_tags_returns_only_own_tags_sorted_by_name(db_session):
    user = make_user(db_session, "ayse@example.com")
    make_tag(db_session, user, "spor")
    make_tag(db_session, user, "iş")
    make_tag(db_session, make_user(db_session), "gizli")

    names = [tag.name for tag in tag_service.list_tags(db_session, user)]

    assert names == ["iş", "spor"]


def test_delete_tag_removes_tag(db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    tag_service.delete_tag(db_session, seed_user, tag.id)

    assert db_session.get(Tag, tag.id) is None


def test_delete_other_users_tag_raises_not_found(db_session, seed_user):
    tag = make_tag(db_session, make_user(db_session), "okul")

    with pytest.raises(NotFoundError):
        tag_service.delete_tag(db_session, seed_user, tag.id)


# --- Servis: nota etiket ekleme ve çıkarma ----------------------------------


def test_add_tag_to_note_links_tag_once(db_session, seed_user):
    note = make_note(db_session, seed_user)
    tag = make_tag(db_session, seed_user, "okul")

    tag_service.add_tag_to_note(db_session, seed_user, note.id, tag.id)
    tag_service.add_tag_to_note(db_session, seed_user, note.id, tag.id)

    assert [t.id for t in note.tags] == [tag.id]


def test_remove_tag_from_note_unlinks_tag(db_session, seed_user):
    note = make_note(db_session, seed_user)
    tag = make_tag(db_session, seed_user, "okul")
    tag_service.add_tag_to_note(db_session, seed_user, note.id, tag.id)

    tag_service.remove_tag_from_note(db_session, seed_user, note.id, tag.id)

    assert note.tags == []
    assert db_session.get(Tag, tag.id) is not None


def test_add_tag_to_other_users_note_raises_not_found(db_session, seed_user):
    note = make_note(db_session, make_user(db_session))
    tag = make_tag(db_session, seed_user, "okul")

    with pytest.raises(NotFoundError):
        tag_service.add_tag_to_note(db_session, seed_user, note.id, tag.id)


def test_add_other_users_tag_to_note_raises_not_found(db_session, seed_user):
    note = make_note(db_session, seed_user)
    tag = make_tag(db_session, make_user(db_session), "okul")

    with pytest.raises(NotFoundError):
        tag_service.add_tag_to_note(db_session, seed_user, note.id, tag.id)


def test_remove_tag_with_missing_note_raises_not_found(db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    with pytest.raises(NotFoundError):
        tag_service.remove_tag_from_note(db_session, seed_user, 9999, tag.id)


# --- Tuvaldeki deste konumu --------------------------------------------------


def test_new_tag_has_no_position(db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    assert (tag.position_x, tag.position_y) == (None, None)


def test_update_tag_position_saves_position(db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    updated = tag_service.update_tag_position(db_session, seed_user, tag.id, 320, 48)

    db_session.expire_all()
    saved = db_session.get(Tag, tag.id)
    assert (updated.position_x, updated.position_y) == (320, 48)
    assert (saved.position_x, saved.position_y) == (320, 48)


def test_update_other_users_tag_position_raises_not_found(db_session, seed_user):
    other_tag = make_tag(db_session, make_user(db_session), "okul")

    with pytest.raises(NotFoundError):
        tag_service.update_tag_position(db_session, seed_user, other_tag.id, 10, 10)

    db_session.expire_all()
    assert db_session.get(Tag, other_tag.id).position_x is None


def test_update_missing_tag_position_raises_not_found(db_session, seed_user):
    with pytest.raises(NotFoundError):
        tag_service.update_tag_position(db_session, seed_user, 9999, 10, 10)


# --- Uç noktalar -------------------------------------------------------------


def test_post_tags_endpoint_returns_201(authed_client):
    response = authed_client.post("/tags", json={"name": "okul"})

    assert response.status_code == 201
    assert response.json()["name"] == "okul"


def test_post_tags_endpoint_duplicate_returns_409(authed_client):
    authed_client.post("/tags", json={"name": "okul"})

    response = authed_client.post("/tags", json={"name": "okul"})

    assert response.status_code == 409


def test_post_tags_endpoint_blank_name_returns_422(authed_client):
    response = authed_client.post("/tags", json={"name": "  "})

    assert response.status_code == 422


def test_get_tags_endpoint_lists_tags(authed_client, db_session, seed_user):
    make_tag(db_session, seed_user, "okul")

    response = authed_client.get("/tags")

    # seed kullanıcısının seed'den gelen "kişisel" ve "proje" etiketleri de var.
    assert response.status_code == 200
    assert [tag["name"] for tag in response.json()] == ["kişisel", "okul", "proje"]


def test_delete_tag_endpoint_returns_204_then_404(authed_client, db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    first = authed_client.delete(f"/tags/{tag.id}")
    second = authed_client.delete(f"/tags/{tag.id}")

    assert first.status_code == 204
    assert second.status_code == 404


def test_note_tag_endpoints_add_and_remove(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)
    tag = make_tag(db_session, seed_user, "okul")

    added = authed_client.post(f"/tags/notes/{note.id}/tags/{tag.id}")
    removed = authed_client.delete(f"/tags/notes/{note.id}/tags/{tag.id}")

    assert added.status_code == 204
    assert removed.status_code == 204


def test_get_tags_without_login_returns_401(client):
    response = client.get("/tags")

    assert response.status_code == 401


def test_patch_tag_position_endpoint_returns_tag_with_position(authed_client, db_session, seed_user):
    tag = make_tag(db_session, seed_user, "okul")

    response = authed_client.patch(
        f"/tags/{tag.id}/position", json={"position_x": 512, "position_y": 236}
    )
    listed = authed_client.get("/tags").json()

    assert response.status_code == 200
    assert response.json() == {"id": tag.id, "name": "okul", "position_x": 512, "position_y": 236}
    assert {"id": tag.id, "name": "okul", "position_x": 512, "position_y": 236} in listed


@pytest.mark.parametrize(
    "body",
    [
        {"position_x": -1, "position_y": 0},
        {"position_x": 0, "position_y": 20001},
        {"position_x": 10},
    ],
)
def test_patch_tag_position_endpoint_rejects_invalid_position(
    authed_client, db_session, seed_user, body
):
    tag = make_tag(db_session, seed_user, "okul")

    response = authed_client.patch(f"/tags/{tag.id}/position", json=body)

    assert response.status_code == 422


def test_patch_missing_tag_position_endpoint_returns_404(authed_client):
    response = authed_client.patch("/tags/9999/position", json={"position_x": 0, "position_y": 0})

    assert response.status_code == 404


def test_patch_tag_position_without_login_returns_401(client):
    response = client.patch("/tags/1/position", json={"position_x": 0, "position_y": 0})

    assert response.status_code == 401
