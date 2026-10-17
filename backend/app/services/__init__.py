"""İş mantığı katmanı (servisler).

Her özellik kendi dosyasında (ör. notes.py, tags.py) düz Python fonksiyonları
olarak yazılır. Servis fonksiyonları:

- İlk parametre olarak SQLAlchemy `Session`, ardından gerekiyorsa `user` alır.
- FastAPI'ye bağımlı değildir (Request, Depends kullanmaz); bu sayede
  pytest ile doğrudan test edilebilir.
- Hata durumunda app/services/errors.py'deki istisnaları fırlatır;
  router bunları anlamlı HTTP kodlarına çevirir.

Fonksiyon isimleri ve girdi/çıktıları docs/fonksiyonlar.md ile aynı olmalıdır.
"""
