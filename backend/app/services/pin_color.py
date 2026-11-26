"""Not sabitleme ve renk seçme: iş mantığı.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""

from sqlalchemy.orm import Session

from app.models import Note, User
from app.services import notes as notes_service
from app.services.errors import ValidationError


def update_note_pin(db: Session, user: User, note_id: int, is_pinned: bool) -> Note:
    """Kullanıcının notunu sabitler ya da sabitlemeyi kaldırır."""
    note = notes_service.get_note(db, user, note_id)
    note.is_pinned = is_pinned
    db.commit()
    db.refresh(note)
    return note


def update_note_color(db: Session, user: User, note_id: int, color: str) -> Note:
    """Kullanıcının notunun rengini değiştirir.

    Renk adı, not oluşturmada kullanılan listeyle (notes.ALLOWED_NOTE_COLORS) aynıdır.
    """
    if color not in notes_service.ALLOWED_NOTE_COLORS:
        raise ValidationError(f"Bilinmeyen renk: {color}")
    note = notes_service.get_note(db, user, note_id)
    note.color = color
    db.commit()
    db.refresh(note)
    return note
