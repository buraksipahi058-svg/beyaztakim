"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: iş mantığı.

Sahibi: 3. kişi (Etiket ve Arama)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""
