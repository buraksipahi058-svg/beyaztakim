from sqlalchemy import func, select

from app.models import Note, Tag, User
from app.seed import SAMPLE_NOTES, hash_seed_password, seed_database


def count(db_session, model) -> int:
    return db_session.scalar(select(func.count()).select_from(model))


def test_seed_creates_user_and_sample_notes(db_session):
    user = seed_database(db_session)

    assert count(db_session, User) == 1
    assert len(user.notes) == len(SAMPLE_NOTES)


def test_seed_can_run_twice_without_duplicates(db_session):
    seed_database(db_session)
    seed_database(db_session)

    assert count(db_session, User) == 1
    assert count(db_session, Note) == len(SAMPLE_NOTES)
    assert count(db_session, Tag) == 2


def test_seed_checklist_items_keep_order(db_session):
    seed_database(db_session)

    note = db_session.scalar(select(Note).where(Note.note_type == "checklist"))

    assert [item.position for item in note.checklist_items] == [0, 1, 2]


def test_hash_seed_password_uses_random_salt():
    first = hash_seed_password("parola")
    second = hash_seed_password("parola")

    assert first.startswith("pbkdf2_sha256$")
    assert first != second
