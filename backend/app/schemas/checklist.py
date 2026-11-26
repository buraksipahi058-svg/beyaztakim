"""Liste maddesi ekleme, işaretleme ve silme: girdi/çıktı şemaları.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
Yanıtlarda ortak ChecklistItemRead (id, text, is_done, position) kullanılır.
"""

from pydantic import BaseModel, Field

CHECKLIST_ITEM_TEXT_MAX_LENGTH = 500


class ChecklistItemCreate(BaseModel):
    """Yeni liste maddesi isteği gövdesi (POST /checklist/{note_id}/items)."""

    text: str = Field(default="", max_length=CHECKLIST_ITEM_TEXT_MAX_LENGTH)


class ChecklistItemUpdate(BaseModel):
    """Madde güncelleme isteği gövdesi (PATCH /checklist/items/{item_id}).

    Metin değiştirilebilir ya da kutu işaretlenebilir; yalnızca gönderilen
    alanlar güncellenir.
    """

    text: str | None = Field(default=None, max_length=CHECKLIST_ITEM_TEXT_MAX_LENGTH)
    is_done: bool | None = None
