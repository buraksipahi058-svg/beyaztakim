"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: uç noktalar (HTTP katmanı).

Sahibi: 3. kişi (Etiket ve Arama)
İş mantığı: app/services/tags.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "3. Etiket ve Arama" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/tags", tags=["etiketler"])
