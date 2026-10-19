"""Hatırlatıcı atama ve yaklaşan hatırlatıcılar: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/reminders.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/reminders", tags=["hatırlatıcılar"])
