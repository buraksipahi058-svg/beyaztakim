"""Not oluşturma, listeleme, görüntüleme ve düzenleme: uç noktalar (HTTP katmanı).

Sahibi: 2. kişi (Not İşlemleri)
İş mantığı: app/services/notes.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "2. Not İşlemleri" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/notes", tags=["notlar"])
