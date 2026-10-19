"""Çöpe taşıma, geri alma ve kalıcı silme: uç noktalar (HTTP katmanı).

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
İş mantığı: app/services/trash.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "4. Arşiv ve Çöp Kutusu" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/trash", tags=["çöp kutusu"])
