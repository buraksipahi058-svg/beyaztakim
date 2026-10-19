"""Ortak Pydantic şemaları: modellerin okuma (çıktı) biçimleri.

Ortak dosyadır. Özellik sahipleri kendi girdi şemalarını (ör. NoteCreate)
buraya değil, kendi dosyalarına yazar: app/schemas/<özellik>.py
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

NoteType = Literal["text", "checklist"]


class ORMModel(BaseModel):
    """SQLAlchemy nesnelerinden doğrudan okunabilen şemaların temeli."""

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: Literal["ok"]


class UserRead(ORMModel):
    id: int
    email: str
    created_at: datetime


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
    trashed_at: datetime | None
    reminder_at: datetime | None
    created_at: datetime
    updated_at: datetime
    tags: list[TagRead] = []
    checklist_items: list[ChecklistItemRead] = []
