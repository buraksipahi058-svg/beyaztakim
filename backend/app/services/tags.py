"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: iş mantığı.

Sahibi: 3. kişi (Etiket ve Arama)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""


from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note, Tag, User
from app.schemas.tags import TagCreate
from app.services.errors import NotFoundError


def create_tag(db: Session, user: User, data: TagCreate) -> Tag:
    """Kullanıcı için yeni bir etiket oluşturur."""
    tag = Tag(
        user_id=user.id,
        name=data.name,
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def list_tags(db: Session, user: User) -> list[Tag]:
    """Kullanıcıya ait etiketleri listeler."""
    stmt = (
        select(Tag)
        .where(Tag.user_id == user.id)
        .order_by(Tag.name)
    )
    return list(db.scalars(stmt).all())


def delete_tag(db: Session, user: User, tag_id: int) -> None:
    """Kullanıcıya ait etiketi siler."""
    stmt = select(Tag).where(
        Tag.id == tag_id,
        Tag.user_id == user.id,
    )
    tag = db.scalar(stmt)

    if tag is None:
        raise NotFoundError("Etiket bulunamadı.")

    db.delete(tag)
    db.commit()


def add_tag_to_note(
    db: Session, user: User, note_id: int, tag_id: int
) -> None:
    """Kullanıcının notuna etiket ekler."""
    note = db.scalar(
        select(Note).where(Note.id == note_id, Note.user_id == user.id)
    )
    if note is None:
        raise NotFoundError("Not bulunamadı.")

    tag = db.scalar(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user.id)
    )
    if tag is None:
        raise NotFoundError("Etiket bulunamadı.")

    if tag not in note.tags:
        note.tags.append(tag)
        db.commit()


def remove_tag_from_note(
    db: Session, user: User, note_id: int, tag_id: int
) -> None:
    """Kullanıcının notundan etiketi çıkarır."""
    note = db.scalar(
        select(Note).where(Note.id == note_id, Note.user_id == user.id)
    )
    if note is None:
        raise NotFoundError("Not bulunamadı.")

    tag = db.scalar(
        select(Tag).where(Tag.id == tag_id, Tag.user_id == user.id)
    )
    if tag is None:
        raise NotFoundError("Etiket bulunamadı.")

    if tag in note.tags:
        note.tags.remove(tag)
        db.commit()