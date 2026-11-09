"""Not oluşturma, listeleme, görüntüleme ve düzenleme: iş mantığı.

Sahibi: 2. kişi (Not İşlemleri)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import NOTE_TYPE_CHECKLIST, ChecklistItem, Note, User
from app.schemas.notes import NoteCreate, NoteUpdate
from app.services.errors import NotFoundError, ValidationError

# Renk adları docs/veri-modeli.md ve frontend/src/components/noteColors.js ile aynıdır.
ALLOWED_NOTE_COLORS = (
    "default",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "purple",
    "pink",
    "brown",
    "gray",
)


def _validate_color(color: str) -> str:
    """Renk adının bilinen listede olduğunu kontrol eder."""
    if color not in ALLOWED_NOTE_COLORS:
        raise ValidationError(f"Bilinmeyen renk: {color}")
    return color


def create_note(db: Session, user: User, data: NoteCreate) -> Note:
    """Kullanıcı için yeni not oluşturur.

    Liste notuysa maddeler sırayla (position: 0, 1, 2, ...) eklenir.
    """
    _validate_color(data.color)
    if data.note_type != NOTE_TYPE_CHECKLIST and data.checklist_items:
        raise ValidationError("Yalnızca liste notları madde alabilir.")

    note = Note(
        user_id=user.id,
        title=data.title,
        content=data.content,
        note_type=data.note_type,
        color=data.color,
        checklist_items=[
            ChecklistItem(text=item.text, is_done=item.is_done, position=position)
            for position, item in enumerate(data.checklist_items)
        ],
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def list_notes(db: Session, user: User) -> list[Note]:
    """Kullanıcının arşivde ve çöp kutusunda olmayan notlarını döndürür.

    Sıralama: sabitlenenler üste, sonra en son güncellenenler.
    Arşivdeki ve çöpteki notları listelemek 4. kişinin `/archive` ve `/trash`
    uç noktalarının işidir.
    """
    statement = (
        select(Note)
        .where(Note.user_id == user.id, Note.is_archived.is_(False), Note.is_trashed.is_(False))
        .order_by(Note.is_pinned.desc(), Note.updated_at.desc(), Note.id.desc())
    )
    return list(db.scalars(statement))


def get_note(db: Session, user: User, note_id: int) -> Note:
    """Kullanıcının notunu döndürür."""
    note = db.scalar(select(Note).where(Note.id == note_id, Note.user_id == user.id))
    if note is None:
        raise NotFoundError("Not bulunamadı.")
    return note


def update_note(db: Session, user: User, note_id: int, data: NoteUpdate) -> Note:
    """Notun başlık, içerik, renk ve sabitleme alanlarını günceller.

    Yalnızca istek gövdesinde gönderilen alanlar değişir; diğerleri korunur.
    """
    note = get_note(db, user, note_id)
    changes = data.model_dump(exclude_unset=True)

    if changes.get("color") is not None:
        _validate_color(changes["color"])

    for field, value in changes.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note
