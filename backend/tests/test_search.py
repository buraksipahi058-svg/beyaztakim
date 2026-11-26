"""app/services/search.py ve app/routers/search.py testleri.

Sahibi: 3. kişi (Etiket ve Arama)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

import pytest

from app.dependencies import get_current_user
from app.main import app
from app.models import ChecklistItem, Note, Tag, User
from app.services import search as search_service
from app.services.errors import NotFoundError, ValidationError


@pytest.fixture
def authed_client(client, seed_user):
    """get_current_user'ı seed_user'a sabitleyen HTTP test istemcisi."""
    app.dependency_overrides[get_current_user] = lambda: seed_user
    yield client
    app.dependency_overrides.pop(get_current_user, None)


def make_user(db_session, email: str = "ayse@example.com") -> User:
    user = User(email=email, password_hash="test")
    db_session.add(user)
    db_session.commit()
    return user


def make_note(db_session, user: User, **fields) -> Note:
    note = Note(user_id=user.id, **fields)
    db_session.add(note)
    db_session.commit()
    return note


def titles(notes) -> list[str]:
    return [note.title for note in notes]


# --- normalize_text ---------------------------------------------------------


@pytest.mark.parametrize(
    ("text", "expected"),
    [("IŞIK", "işik"), ("ışık", "işik"), ("İstanbul", "istanbul"), ("Süt", "süt")],
)
def test_normalize_text_ignores_case_and_turkish_i(text, expected):
    assert search_service.normalize_text(text) == expected


# --- Servis: sözcükle arama -------------------------------------------------


def test_search_matches_title_content_and_checklist_items(db_session):
    user = make_user(db_session)
    make_note(db_session, user, title="Alışveriş listesi")
    make_note(db_session, user, title="Toplantı", content="Alışveriş merkezinde")
    make_note(
        db_session,
        user,
        title="Yapılacaklar",
        note_type="checklist",
        checklist_items=[ChecklistItem(text="alışveriş yap", position=0)],
    )
    make_note(db_session, user, title="Başka bir not")

    found = search_service.search_notes(db_session, user, query="ALIŞVERİŞ")

    assert sorted(titles(found)) == ["Alışveriş listesi", "Toplantı", "Yapılacaklar"]


def test_search_includes_archived_but_not_trashed_notes(db_session):
    user = make_user(db_session)
    make_note(db_session, user, title="Kitap arşivde", is_archived=True)
    make_note(db_session, user, title="Kitap çöpte", is_trashed=True)

    found = search_service.search_notes(db_session, user, query="kitap")

    assert titles(found) == ["Kitap arşivde"]


def test_search_never_returns_other_users_notes(db_session):
    user = make_user(db_session)
    make_note(db_session, make_user(db_session, "baska@example.com"), title="Kitap")

    assert search_service.search_notes(db_session, user, query="kitap") == []


def test_search_puts_pinned_notes_first(db_session):
    user = make_user(db_session)
    make_note(db_session, user, title="Kitap 1")
    make_note(db_session, user, title="Kitap 2", is_pinned=True)

    found = search_service.search_notes(db_session, user, query="kitap")

    assert titles(found)[0] == "Kitap 2"


# --- Servis: etiketle filtreleme --------------------------------------------


def test_search_by_tag_returns_only_tagged_notes(db_session):
    user = make_user(db_session)
    tag = Tag(user_id=user.id, name="okul")
    make_note(db_session, user, title="Ödev", tags=[tag])
    make_note(db_session, user, title="Market")

    found = search_service.search_notes(db_session, user, tag_id=tag.id)

    assert titles(found) == ["Ödev"]


def test_search_by_tag_and_query_requires_both(db_session):
    user = make_user(db_session)
    tag = Tag(user_id=user.id, name="okul")
    make_note(db_session, user, title="Matematik ödevi", tags=[tag])
    make_note(db_session, user, title="Fizik ödevi", tags=[tag])
    make_note(db_session, user, title="Matematik kitabı")

    found = search_service.search_notes(db_session, user, query="matematik", tag_id=tag.id)

    assert titles(found) == ["Matematik ödevi"]


def test_search_with_other_users_tag_raises_not_found(db_session):
    user = make_user(db_session)
    other_tag = Tag(user_id=make_user(db_session, "baska@example.com").id, name="okul")
    db_session.add(other_tag)
    db_session.commit()

    with pytest.raises(NotFoundError):
        search_service.search_notes(db_session, user, tag_id=other_tag.id)


def test_search_without_query_or_tag_raises_validation_error(db_session):
    user = make_user(db_session)

    with pytest.raises(ValidationError):
        search_service.search_notes(db_session, user, query="   ")


# --- Uç noktalar -------------------------------------------------------------


def test_search_endpoint_returns_matching_notes(authed_client, db_session, seed_user):
    make_note(db_session, seed_user, title="Kütüphane notu")

    response = authed_client.get("/search", params={"q": "kütüphane"})

    assert response.status_code == 200
    assert [note["title"] for note in response.json()] == ["Kütüphane notu"]


def test_search_endpoint_by_tag(authed_client, db_session, seed_user):
    tag = Tag(user_id=seed_user.id, name="okul")
    make_note(db_session, seed_user, title="Ödev", tags=[tag])

    response = authed_client.get("/search", params={"tag_id": tag.id})

    assert response.status_code == 200
    assert [note["title"] for note in response.json()] == ["Ödev"]


def test_search_endpoint_without_params_returns_400(authed_client):
    response = authed_client.get("/search")

    assert response.status_code == 400


def test_search_endpoint_unknown_tag_returns_404(authed_client):
    response = authed_client.get("/search", params={"tag_id": 9999})

    assert response.status_code == 404


def test_search_endpoint_too_long_query_returns_422(authed_client):
    response = authed_client.get("/search", params={"q": "x" * 101})

    assert response.status_code == 422


def test_search_endpoint_without_login_returns_401(client):
    response = client.get("/search", params={"q": "kitap"})

    assert response.status_code == 401
