"""Not oluşturma ve düzenleme: API girdi şemaları.

Sahibi: 2. kişi (Not İşlemleri)
Okuma şemaları (NoteRead vb.) app/schemas/common.py'dedir (ortak dosya).
"""

from pydantic import BaseModel, Field

from app.schemas.common import NoteType

NOTE_TITLE_MAX_LENGTH = 255
NOTE_COLOR_MAX_LENGTH = 20


class ChecklistItemCreate(BaseModel):
    """Yeni liste notu maddesi (yalnızca note_type="checklist" için)."""

    text: str = Field(default="", max_length=500)
    is_done: bool = False


class NoteCreate(BaseModel):
    """Yeni not isteği gövdesi (POST /notes)."""

    title: str = Field(default="", max_length=NOTE_TITLE_MAX_LENGTH)
    content: str = ""
    note_type: NoteType = "text"
    color: str = Field(default="default", max_length=NOTE_COLOR_MAX_LENGTH)
    checklist_items: list[ChecklistItemCreate] = []


class NoteUpdate(BaseModel):
    """Not düzenleme isteği gövdesi (PATCH /notes/{note_id}).

    Yalnızca gönderilen alanlar güncellenir. Liste maddelerinin düzenlenmesi
    5. kişinin `/checklist` uç noktasının işidir; burada yer almaz.
    """

    title: str | None = Field(default=None, max_length=NOTE_TITLE_MAX_LENGTH)
    content: str | None = None
    color: str | None = Field(default=None, max_length=NOTE_COLOR_MAX_LENGTH)
    is_pinned: bool | None = None
