"""Hatırlatıcı atama ve yaklaşan hatırlatıcılar: iş mantığı.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.

Tarihler veritabanına UTC olarak yazılır ve UTC ile karşılaştırılır
(SQLite saat dilimini saklamaz).
"""

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note, User, utc_now
from app.services import notes as notes_service
from app.services.errors import ValidationError


def set_reminder(db: Session, user: User, note_id: int, reminder_at: datetime) -> Note:
    """Nota hatırlatıcı atar ya da var olanın zamanını değiştirir.

    Zaman gelecekte olmalıdır; çöpteki nota hatırlatıcı atanamaz.
    """
    reminder_at = reminder_at.astimezone(UTC)
    if reminder_at <= utc_now():
        raise ValidationError("Hatırlatıcı zamanı gelecekte olmalı.")
    note = notes_service.get_note(db, user, note_id)
    if note.is_trashed:
        raise ValidationError("Çöp kutusundaki nota hatırlatıcı atanamaz.")
    note.reminder_at = reminder_at
    db.commit()
    db.refresh(note)
    return note


def clear_reminder(db: Session, user: User, note_id: int) -> Note:
    """Notun hatırlatıcısını kaldırır. Hatırlatıcı yoksa bir şey değişmez."""
    note = notes_service.get_note(db, user, note_id)
    note.reminder_at = None
    db.commit()
    db.refresh(note)
    return note


def list_upcoming_reminders(db: Session, user: User) -> list[Note]:
    """Zamanı henüz gelmemiş hatırlatıcısı olan notları en yakın zaman üstte olacak
    şekilde döndürür. Çöpteki notlar dahil edilmez, arşivdekiler edilir."""
    statement = (
        select(Note)
        .where(
            Note.user_id == user.id,
            Note.is_trashed.is_(False),
            Note.reminder_at.is_not(None),
            Note.reminder_at > utc_now(),
        )
        .order_by(Note.reminder_at.asc(), Note.id.asc())
    )
    return list(db.scalars(statement))
