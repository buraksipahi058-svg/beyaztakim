"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: girdi/çıktı şemaları.

Sahibi: 3. kişi (Etiket ve Arama)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""
from pydantic import BaseModel, Field, ConfigDict


class TagCreate(BaseModel):
    """Yeni etiket oluşturma isteği."""
    name: str = Field(min_length=1, max_length=100)


class TagRead(BaseModel):
    """Etiket bilgilerini döndürür."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
