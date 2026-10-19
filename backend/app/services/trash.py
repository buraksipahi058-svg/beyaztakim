"""Çöpe taşıma, geri alma ve kalıcı silme: iş mantığı.

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""
