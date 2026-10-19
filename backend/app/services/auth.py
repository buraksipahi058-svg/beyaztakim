"""Kayıt olma, giriş ve çıkış: iş mantığı.

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""
