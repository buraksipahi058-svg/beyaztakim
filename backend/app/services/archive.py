"""Arşivleme, arşivden çıkarma ve arşivdeki notlar: iş mantığı.

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note, User
from app.services import notes as notes_service
from app.services.errors import ValidationError


def list_archived_notes(db: Session, user: User) -> list[Note]:
    """Kullanıcının arşivdeki (çöpte olmayan) notlarını, en son güncellenen üstte olacak şekilde döndürür."""
    statement = (
        select(Note)
        .where(Note.user_id == user.id, Note.is_archived.is_(True), Note.is_trashed.is_(False))
        .order_by(Note.updated_at.desc(), Note.id.desc())
    )
    return list(db.scalars(statement))


def _get_note_outside_trash(db: Session, user: User, note_id: int) -> Note:
    """Kullanıcının notunu döndürür; not çöp kutusundaysa arşiv işlemine izin vermez."""
    note = notes_service.get_note(db, user, note_id)
    if note.is_trashed:
        raise ValidationError("Çöp kutusundaki not arşivlenemez; önce geri yükleyin.")
    return note


def archive_note(db: Session, user: User, note_id: int) -> Note:
    """Notu arşive taşır. Arşivlenen notun sabitlemesi kaldırılır."""
    note = _get_note_outside_trash(db, user, note_id)
    note.is_archived = True
    note.is_pinned = False
    db.commit()
    db.refresh(note)
    return note


def unarchive_note(db: Session, user: User, note_id: int) -> Note:
    """Notu arşivden çıkarıp ana sayfaya geri getirir."""
    note = _get_note_outside_trash(db, user, note_id)
    note.is_archived = False
    db.commit()
    db.refresh(note)
    return note
