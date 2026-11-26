"""Çöpe taşıma, geri alma ve kalıcı silme: iş mantığı.

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note, User, utc_now
from app.services import notes as notes_service
from app.services.errors import ValidationError


def list_trashed_notes(db: Session, user: User) -> list[Note]:
    """Kullanıcının çöp kutusundaki notlarını, en son çöpe atılan üstte olacak şekilde döndürür."""
    statement = (
        select(Note)
        .where(Note.user_id == user.id, Note.is_trashed.is_(True))
        .order_by(Note.trashed_at.desc(), Note.id.desc())
    )
    return list(db.scalars(statement))


def move_note_to_trash(db: Session, user: User, note_id: int) -> Note:
    """Notu çöp kutusuna taşır ve zamanını kaydeder. Not zaten çöpteyse değişmez."""
    note = notes_service.get_note(db, user, note_id)
    if not note.is_trashed:
        note.is_trashed = True
        note.trashed_at = utc_now()
        db.commit()
        db.refresh(note)
    return note


def _get_trashed_note(db: Session, user: User, note_id: int) -> Note:
    """Kullanıcının çöp kutusundaki notunu döndürür."""
    note = notes_service.get_note(db, user, note_id)
    if not note.is_trashed:
        raise ValidationError("Not çöp kutusunda değil.")
    return note


def restore_note(db: Session, user: User, note_id: int) -> Note:
    """Notu çöp kutusundan geri yükler; not çöpe atılmadan önceki yerine
    (ana sayfa ya da arşiv) döner."""
    note = _get_trashed_note(db, user, note_id)
    note.is_trashed = False
    note.trashed_at = None
    db.commit()
    db.refresh(note)
    return note


def delete_note_permanently(db: Session, user: User, note_id: int) -> None:
    """Çöp kutusundaki notu; maddeleri ve etiket bağlarıyla birlikte kalıcı olarak siler."""
    note = _get_trashed_note(db, user, note_id)
    db.delete(note)
    db.commit()
