# Fonksiyonlar

Projedeki her fonksiyonun sözleşmesi bu dosyada tutulur. Kod yazmadan önce
fonksiyon buraya eklenir; kod buradaki isimlere ve girdi/çıktılara uyar.

## Nasıl kullanılır?

1. Yeni bir fonksiyon için aşağıdaki **şablonu** kopyalayıp ilgili bölümün altına yapıştırın.
2. Başlığı fonksiyonun koddaki adıyla yazın (ör. `create_note`).
3. Fonksiyonu yazın, pytest ile testini ekleyin, sonra "Durum" satırını güncelleyin.
4. İsim veya girdi/çıktı değişirse önce bu dosyayı güncelleyin, ekibe haber verin.

Kurallar:

- Servis fonksiyonları `backend/app/services/<özellik>.py`, uç noktalar
  `backend/app/routers/<özellik>.py` içindedir.
- Servisler ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
  ikinci parametre olarak `user: User` alır.
- Hatalar `app/services/errors.py`'deki sınıflarla bildirilir
  (`ValidationError` 400, `PermissionDeniedError` 403, `NotFoundError` 404,
  `ConflictError` 409). Girdi şeması uymazsa FastAPI otomatik 422 döner.

---

## Şablon

```markdown
### `fonksiyon_adi`

- **Sorumlu kişi:**
- **Dosya:** backend/app/services/....py
- **Uç nokta:** (varsa) METHOD /yol
- **Durum:** Planlandı / Yazılıyor / Tamamlandı

**Ne yapar?**

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| | | | |

**Çıktı:**

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| | | |
```

---

## Notlar

_Henüz fonksiyon eklenmedi._

## Kontrol listesi maddeleri

_Henüz fonksiyon eklenmedi._

## Etiketler

_Henüz fonksiyon eklenmedi._

## Arşiv ve çöp kutusu

_Henüz fonksiyon eklenmedi._

## Hatırlatıcılar

_Henüz fonksiyon eklenmedi._

## Kullanıcı ve giriş

_Henüz fonksiyon eklenmedi._

---

## Altyapı (hazır)

Altyapıyla gelen, özelliklerin kullanacağı fonksiyonlar. Bunları değiştirmek
ortak bir değişikliktir.

### `get_current_user`

- **Sorumlu kişi:** Altyapı
- **Dosya:** backend/app/dependencies.py
- **Durum:** Tamamlandı

**Ne yapar?** Giriş yapmış kullanıcıyı döndürür. Gerçek giriş sistemi yazılana
kadar seed betiğindeki örnek kullanıcıyı (`SEED_USER_EMAIL`) döndürür.
Router'larda `current_user: CurrentUser` parametresiyle kullanılır.

**Girdi:** `db: Session` (FastAPI tarafından verilir)

**Çıktı:** `User`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Örnek kullanıcı veritabanında yok (seed çalıştırılmamış) | `HTTPException` | 401 |

### `get_db`

- **Sorumlu kişi:** Altyapı
- **Dosya:** backend/app/database.py
- **Durum:** Tamamlandı

**Ne yapar?** Her istek için bir veritabanı oturumu açar, istek bitince kapatır.
Router'larda `db: DbSession` parametresiyle kullanılır.

**Girdi:** —

**Çıktı:** `Session`

**Hata durumları:** —

### `health`

- **Sorumlu kişi:** Altyapı
- **Dosya:** backend/app/main.py
- **Uç nokta:** GET /health
- **Durum:** Tamamlandı

**Ne yapar?** Uygulamanın ayakta olduğunu bildirir.

**Girdi:** —

**Çıktı:** `{"status": "ok"}` (200)

**Hata durumları:** —

### `seed_database`

- **Sorumlu kişi:** Altyapı
- **Dosya:** backend/app/seed.py
- **Durum:** Tamamlandı

**Ne yapar?** Örnek kullanıcıyı, etiketleri ve birkaç örnek notu ekler. Tekrar
çalıştırıldığında var olan kayıtları yeniden eklemez (notlar başlığa göre
eşleştirilir). Komut satırından: `python -m app.seed`

**Girdi:** `db: Session`

**Çıktı:** `User` (örnek kullanıcı)

**Hata durumları:** —

### `discover_routers`

- **Sorumlu kişi:** Altyapı
- **Dosya:** backend/app/routers/\_\_init\_\_.py
- **Durum:** Tamamlandı

**Ne yapar?** `app/routers` altındaki her modülde tanımlı `router` nesnesini bulur;
`main.py` bunları otomatik olarak uygulamaya ekler. `_` ile başlayan modüller atlanır.

**Girdi:** `package` (isteğe bağlı, varsayılan `app.routers`)

**Çıktı:** `list[APIRouter]` (modül adına göre sıralı)

**Hata durumları:** —
