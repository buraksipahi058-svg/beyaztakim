"""Not sabitleme ve renk seçme: girdi/çıktı şemaları.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""

from pydantic import BaseModel, Field


class NotePinUpdate(BaseModel):
    """Sabitleme isteği gövdesi (PATCH /pin-color/{note_id}/pin)."""

    is_pinned: bool


class NoteColorUpdate(BaseModel):
    """Renk isteği gövdesi (PATCH /pin-color/{note_id}/color).

    Renk adları docs/veri-modeli.md'deki listeden olmalıdır.
    """

    color: str = Field(max_length=20)
