"""Liste maddesi ekleme, işaretleme ve silme: iş mantığı.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import NOTE_TYPE_CHECKLIST, ChecklistItem, Note, User
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate
from app.services import notes as notes_service
from app.services.errors import NotFoundError, ValidationError


def _get_item(db: Session, user: User, item_id: int) -> ChecklistItem:
    """Kullanıcının notlarından birine ait maddeyi döndürür."""
    item = db.scalar(
        select(ChecklistItem)
        .join(Note)
        .where(ChecklistItem.id == item_id, Note.user_id == user.id)
    )
    if item is None:
        raise NotFoundError("Liste maddesi bulunamadı.")
    return item


def add_checklist_item(
    db: Session, user: User, note_id: int, data: ChecklistItemCreate
) -> ChecklistItem:
    """Liste notunun sonuna yeni bir madde ekler (position: son sıra + 1)."""
    note = notes_service.get_note(db, user, note_id)
    if note.note_type != NOTE_TYPE_CHECKLIST:
        raise ValidationError("Yalnızca liste notlarına madde eklenebilir.")

    last_position = db.scalar(
        select(func.max(ChecklistItem.position)).where(ChecklistItem.note_id == note.id)
    )
    item = ChecklistItem(
        note_id=note.id,
        text=data.text,
        position=0 if last_position is None else last_position + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_checklist_item(
    db: Session, user: User, item_id: int, data: ChecklistItemUpdate
) -> ChecklistItem:
    """Maddenin metnini ve/veya işaretini günceller; gönderilmeyen alanlar korunur."""
    item = _get_item(db, user, item_id)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def delete_checklist_item(db: Session, user: User, item_id: int) -> None:
    """Maddeyi siler."""
    item = _get_item(db, user, item_id)
    db.delete(item)
    db.commit()
