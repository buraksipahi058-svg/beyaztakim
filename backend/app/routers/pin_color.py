"""Not sabitleme ve renk seçme: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/pin_color.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/pin-color", tags=["sabitleme ve renk"])
