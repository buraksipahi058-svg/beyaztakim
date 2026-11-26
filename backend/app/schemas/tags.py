"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: girdi/çıktı şemaları.

Sahibi: 3. kişi (Etiket ve Arama)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.schemas.notes import NOTE_POSITION_MAX


class TagCreate(BaseModel):
    """Yeni etiket oluşturma isteği.

    Baştaki ve sondaki boşluklar silinir; yalnızca boşluktan oluşan ad kabul edilmez.
    """
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class TagRead(BaseModel):
    """Etiket bilgilerini döndürür.

    position_x / position_y: ana sayfa tuvalinde etiketin destesinin konumu;
    henüz yerleştirilmemişse None.
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    position_x: int | None = None
    position_y: int | None = None


class TagPositionUpdate(BaseModel):
    """Etiket destesinin tuvaldeki yeni konumu (PATCH /tags/{id}/position).

    Değerler piksel cinsindendir; notların konumuyla aynı sınırlar geçerlidir
    (0 ile NOTE_POSITION_MAX arası).
    """

    position_x: int = Field(ge=0, le=NOTE_POSITION_MAX)
    position_y: int = Field(ge=0, le=NOTE_POSITION_MAX)
