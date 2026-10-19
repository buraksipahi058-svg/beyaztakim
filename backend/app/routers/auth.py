"""Kayıt olma, giriş ve çıkış: uç noktalar (HTTP katmanı).

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
İş mantığı: app/services/auth.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "1. Kullanıcı ve Güvenlik" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["kullanıcı"])
