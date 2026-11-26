"""Ortak Pydantic şemaları: modellerin okuma (çıktı) biçimleri.

Ortak dosyadır. Özellik sahipleri kendi girdi şemalarını (ör. NoteCreate)
buraya değil, kendi dosyalarına yazar: app/schemas/<özellik>.py
"""

from datetime import UTC, datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict

NoteType = Literal["text", "checklist"]


def as_utc(value: datetime) -> datetime:
    """Tarihi UTC saat dilimiyle işaretler.

    SQLite saat dilimini saklamaz; veritabanından okunan tarihler UTC'dir ama
    saat dilimi bilgisi yoktur. İşaretlenmezse JSON'da "+00:00"/"Z" olmadan
    gider ve tarayıcı onu yerel saat sanar.
    """
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


# API yanıtlarındaki tüm tarih alanları bu tipi kullanır (ör. "2026-11-27T09:00:00Z").
UtcDatetime = Annotated[datetime, AfterValidator(as_utc)]


class ORMModel(BaseModel):
    """SQLAlchemy nesnelerinden doğrudan okunabilen şemaların temeli."""

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: Literal["ok"]


class UserRead(ORMModel):
    id: int
    email: str
    created_at: UtcDatetime


class TagRead(ORMModel):
    id: int
    name: str


class ChecklistItemRead(ORMModel):
    id: int
    text: str
    is_done: bool
    position: int


class NoteRead(ORMModel):
    id: int
    title: str
    content: str
    note_type: NoteType
    color: str
    is_pinned: bool
    is_archived: bool
    is_trashed: bool
    trashed_at: UtcDatetime | None
    reminder_at: UtcDatetime | None
    created_at: UtcDatetime
    updated_at: UtcDatetime
    tags: list[TagRead] = []
    checklist_items: list[ChecklistItemRead] = []
