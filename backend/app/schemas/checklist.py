"""Liste maddesi ekleme, işaretleme ve silme: girdi/çıktı şemaları.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""

from pydantic import BaseModel
from typing import Optional

# 1. Yeni bir liste maddesi eklenirken beklenen veri
class ChecklistItemCreate(BaseModel):
    text: str

# 2. Var olan bir madde güncellenirken beklenen veri (metin değişebilir veya kutu işaretlenebilir)
class ChecklistItemUpdate(BaseModel):
    text: Optional[str] = None
    is_completed: Optional[bool] = None

# 3. Veritabanından frontend'e gönderilecek madde verisi
class ChecklistItemResponse(BaseModel):
    id: int
    note_id: int
    text: str
    is_completed: bool

    class Config:
        from_attributes = True