"""Veritabanı modelleri (tablolar).

Tabloların ve ilişkilerin açıklaması için: docs/veri-modeli.md
Bu dosya ortak dosyadır; değişiklik gerekiyorsa önce ekiple konuşun.
"""

from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

NOTE_TYPE_TEXT = "text"
NOTE_TYPE_CHECKLIST = "checklist"
NOTE_TYPES = (NOTE_TYPE_TEXT, NOTE_TYPE_CHECKLIST)

DEFAULT_NOTE_COLOR = "default"


def utc_now() -> datetime:
    return datetime.now(UTC)


# Not <-> Etiket çoka-çok ara tablosu
note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    notes: Mapped[list["Note"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    tags: Mapped[list["Tag"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (
        CheckConstraint(
            f"note_type IN ('{NOTE_TYPE_TEXT}', '{NOTE_TYPE_CHECKLIST}')",
            name="ck_notes_note_type",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    note_type: Mapped[str] = mapped_column(String(20), default=NOTE_TYPE_TEXT)
    color: Mapped[str] = mapped_column(String(20), default=DEFAULT_NOTE_COLOR)
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    is_trashed: Mapped[bool] = mapped_column(Boolean, default=False)
    trashed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reminder_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    user: Mapped[User] = relationship(back_populates="notes")
    tags: Mapped[list["Tag"]] = relationship(secondary=note_tags, back_populates="notes")
    checklist_items: Mapped[list["ChecklistItem"]] = relationship(
        back_populates="note",
        cascade="all, delete-orphan",
        order_by="ChecklistItem.position",
    )


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_tags_user_id_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(100))

    user: Mapped[User] = relationship(back_populates="tags")
    notes: Mapped[list[Note]] = relationship(secondary=note_tags, back_populates="tags")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(String(500), default="")
    is_done: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0)

    note: Mapped[Note] = relationship(back_populates="checklist_items")
