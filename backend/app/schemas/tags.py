"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: girdi/çıktı şemaları.

Sahibi: 3. kişi (Etiket ve Arama)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


class TagCreate(BaseModel):
    """Yeni etiket oluşturma isteği.

    Baştaki ve sondaki boşluklar silinir; yalnızca boşluktan oluşan ad kabul edilmez.
    """
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class TagRead(BaseModel):
    """Etiket bilgilerini döndürür."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
