"""app/services/reminders.py ve app/routers/reminders.py testleri.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Hazır fikstürler (db_session, seed_user, client): tests/conftest.py

Uç nokta testleri get_current_user'ı test kullanıcısına sabitler
(dependency_overrides); böylece giriş jetonu gerekmez.
"""

from datetime import UTC, datetime, timedelta, timezone

import pytest

from app.dependencies import get_current_user
from app.main import app
from app.models import Note, User, utc_now
from app.services import reminders as reminders_service
from app.services.errors import NotFoundError, ValidationError

ISTANBUL = timezone(timedelta(hours=3))


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
    note = Note(user_id=user.id, title=fields.pop("title", "Deneme"), **fields)
    db_session.add(note)
    db_session.commit()
    return note


def in_future(**delta) -> datetime:
    return utc_now() + timedelta(**delta)


# --- Servis: hatırlatıcı atama ve kaldırma ---------------------------------


def test_set_reminder_saves_time_in_utc(db_session, seed_user):
    note = make_note(db_session, seed_user)
    local_time = (utc_now() + timedelta(days=1)).astimezone(ISTANBUL).replace(microsecond=0)

    updated = reminders_service.set_reminder(db_session, seed_user, note.id, local_time)

    saved = updated.reminder_at.replace(tzinfo=UTC) if updated.reminder_at.tzinfo is None else updated.reminder_at
    assert saved == local_time


def test_set_reminder_in_the_past_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user)

    with pytest.raises(ValidationError):
        reminders_service.set_reminder(db_session, seed_user, note.id, utc_now() - timedelta(minutes=1))


def test_set_reminder_on_trashed_note_raises_validation_error(db_session, seed_user):
    note = make_note(db_session, seed_user, is_trashed=True)

    with pytest.raises(ValidationError):
        reminders_service.set_reminder(db_session, seed_user, note.id, in_future(days=1))


def test_set_reminder_on_other_users_note_raises_not_found(db_session, seed_user):
    note = make_note(db_session, make_user(db_session))

    with pytest.raises(NotFoundError):
        reminders_service.set_reminder(db_session, seed_user, note.id, in_future(days=1))


def test_clear_reminder_removes_time(db_session, seed_user):
    note = make_note(db_session, seed_user, reminder_at=in_future(days=1))

    cleared = reminders_service.clear_reminder(db_session, seed_user, note.id)

    assert cleared.reminder_at is None


# --- Servis: yaklaşan hatırlatıcılar ---------------------------------------


def test_list_upcoming_reminders_returns_future_reminders_soonest_first(db_session):
    user = make_user(db_session)
    later = make_note(db_session, user, title="Sonra", reminder_at=in_future(days=3))
    sooner = make_note(db_session, user, title="Önce", reminder_at=in_future(hours=2))
    make_note(db_session, user, title="Geçmiş", reminder_at=utc_now() - timedelta(hours=1))
    make_note(db_session, user, title="Hatırlatıcısız")
    make_note(db_session, user, title="Çöpte", reminder_at=in_future(days=1), is_trashed=True)
    archived = make_note(
        db_session, user, title="Arşivde", reminder_at=in_future(days=2), is_archived=True
    )
    make_note(db_session, make_user(db_session, "baska@example.com"), reminder_at=in_future(days=1))

    notes = reminders_service.list_upcoming_reminders(db_session, user)

    assert [note.id for note in notes] == [sooner.id, archived.id, later.id]


# --- Uç noktalar -------------------------------------------------------------


def test_put_reminder_endpoint_returns_note_with_utc_time(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)
    local_time = (utc_now() + timedelta(days=1)).astimezone(ISTANBUL).replace(microsecond=0)

    response = authed_client.put(
        f"/reminders/{note.id}", json={"reminder_at": local_time.isoformat()}
    )

    assert response.status_code == 200
    returned = datetime.fromisoformat(response.json()["reminder_at"].replace("Z", "+00:00"))
    assert returned.utcoffset() == timedelta(0)
    assert returned == local_time


def test_put_reminder_without_timezone_returns_422(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.put(f"/reminders/{note.id}", json={"reminder_at": "2099-01-01T09:00:00"})

    assert response.status_code == 422


def test_put_reminder_in_the_past_returns_400(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user)

    response = authed_client.put(
        f"/reminders/{note.id}", json={"reminder_at": "2000-01-01T09:00:00Z"}
    )

    assert response.status_code == 400


def test_put_reminder_missing_note_returns_404(authed_client):
    response = authed_client.put("/reminders/9999", json={"reminder_at": "2099-01-01T09:00:00Z"})

    assert response.status_code == 404


def test_delete_reminder_endpoint_clears_time(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, reminder_at=in_future(days=1))

    response = authed_client.delete(f"/reminders/{note.id}")

    assert response.status_code == 200
    assert response.json()["reminder_at"] is None


def test_get_reminders_endpoint_lists_upcoming(authed_client, db_session, seed_user):
    note = make_note(db_session, seed_user, title="Diş hekimi", reminder_at=in_future(hours=5))

    response = authed_client.get("/reminders")

    # seed'deki "Toplantı notları"nın da 1 gün sonraya hatırlatıcısı var.
    assert response.status_code == 200
    assert response.json()[0]["id"] == note.id
    assert "Toplantı notları" in [item["title"] for item in response.json()]


def test_get_reminders_without_login_returns_401(client):
    response = client.get("/reminders")

    assert response.status_code == 401
