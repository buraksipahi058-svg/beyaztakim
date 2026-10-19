"""Başlık/içerikte arama ve etikete göre filtreleme: uç noktalar (HTTP katmanı).

Sahibi: 3. kişi (Etiket ve Arama)
İş mantığı: app/services/search.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "3. Etiket ve Arama" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/search", tags=["arama"])
