"""Arşivleme, arşivden çıkarma ve arşivdeki notlar: uç noktalar (HTTP katmanı).

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
İş mantığı: app/services/archive.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "4. Arşiv ve Çöp Kutusu" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/archive", tags=["arşiv"])
