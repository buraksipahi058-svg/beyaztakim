"""Not sabitleme ve renk seçme: iş mantığı.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""
from sqlalchemy.orm import Session
from app.models import Note, User
from app.services.errors import NoteNotFoundError

def update_note_pin(db: Session, note_id: int, user: User, is_pinned: bool) -> Note:
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise NoteNotFoundError()
    note.is_pinned = is_pinned
    db.commit()
    db.refresh(note)
    return note

def update_note_color(db: Session, note_id: int, user: User, color: str) -> Note:
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise NoteNotFoundError()
    note.color = color
    db.commit()
    db.refresh(note)
    return note
