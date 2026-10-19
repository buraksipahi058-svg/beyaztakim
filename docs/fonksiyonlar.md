# Fonksiyonlar

Projede yazılan **her fonksiyon** bu dosyada kayıtlıdır: backend'deki servis,
uç nokta ve yardımcı fonksiyonlar; frontend'deki API fonksiyonları ve React
bileşenleri. Kod buradaki isimlere ve girdi/çıktılara uyar.

## Kurallar

1. Fonksiyonu eklediğin, adını/girdisini/çıktısını değiştirdiğin ya da
   sildiğin **aynı PR'da** bu dosyayı da güncelle. Belgeyle kodun uyuşmadığı
   PR onaylanmaz.
2. Kaydı **kendi bölümüne** yaz (1-5). Başkasının bölümünü değiştirme.
3. Her kayıtta şunlar olmalı: sorumlu kişi, dosya, ne yaptığı, **girdi**
   (parametre adı ve tipi; bileşenlerde props), **çıktı** (dönüş tipi; uç
   noktada HTTP yöntemi, yolu ve yanıtı; bileşende ekranda ne gösterdiği) ve
   **hata durumları** (hata sınıfı ve HTTP kodu).
4. Servis fonksiyonları ve uç noktalar için **ayrıntılı şablonu**, küçük
   yardımcı fonksiyonlar ve bileşenler için **tablo satırını** kullan.
5. Test dosyalarındaki test fonksiyonları ve fikstürler yazılmaz.

Hatırlatma: servisler ilk parametre olarak `db: Session`, kullanıcıya ait
işlemlerde ikinci parametre olarak `user: User` alır. Hatalar
`app/services/errors.py`'deki sınıflarla bildirilir: `ValidationError` 400,
`PermissionDeniedError` 403, `NotFoundError` 404, `ConflictError` 409. Girdi
şemaya uymazsa FastAPI otomatik 422 döner.

---

## Şablonlar

### Ayrıntılı şablon

```markdown
#### `fonksiyon_adi`

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

### Tablo satırı

```markdown
| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `fonksiyonAdi` | src/... | ... | `param: tip` | `tip` | — |
```

---

## 1. Kullanıcı ve Güvenlik

- **Sorumlu kişi:**
- **Uç nokta öneki:** `/auth`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır yer tutucular

İçleri boş ya da geçici; sahibi dolduracak. İçini değiştirince bu satırları da güncelle.

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `get_current_user` | backend/app/dependencies.py | Giriş yapmış kullanıcıyı döndürür. Şimdilik seed'deki örnek kullanıcıyı döndürür; gerçek girişle değiştirilecek. Ayrıntı: [Altyapı](#get_current_user) | `db: Session` (FastAPI verir) | `User` | Kullanıcı bulunamadı → `HTTPException` 401 |
| `getAuthRequestOptions` | frontend/src/api/authSession.js | Her API isteğine eklenecek giriş bilgisini verir. Şimdilik boş. | — | `object` (fetch seçenekleri, ör. `{ headers }` ya da `{ credentials }`) | — |
| `handleUnauthorized` | frontend/src/api/authSession.js | Backend 401 döndüğünde `apiRequest` tarafından çağrılır. Şimdilik bir şey yapmaz. | — | — | — |
| `RequireAuth` | frontend/src/components/RequireAuth.jsx | Menülü sayfaları korur. Şimdilik herkesi içeri alır. | `{ children }` | `children` (ileride giriş yoksa `/login`'e yönlendirme) | — |
| `UserMenu` | frontend/src/components/UserMenu.jsx | Üst çubuktaki kullanıcı / çıkış yeri. Şimdilik boş. | — | `null` | — |
| `LoginPage` | frontend/src/pages/LoginPage.jsx | `/login` sayfası (menüsüz). Şimdilik yer tutucu yazı. | — | Başlık ve "yapım aşamasında" yazısı | — |
| `RegisterPage` | frontend/src/pages/RegisterPage.jsx | `/register` sayfası (menüsüz). Şimdilik yer tutucu yazı. | — | Başlık ve "yapım aşamasında" yazısı | — |

### Fonksiyonlar

_Henüz eklenmedi._

---

## 2. Not İşlemleri

- **Sorumlu kişi:**
- **Uç nokta öneki:** `/notes`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır olanlar

Altyapıyla gelen, artık 2. kişiye ait bileşenler. Not kartındaki diğer
kişilere ayrılmış yerler (`components/note-card/`) silinmemelidir.

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `HomePage` | frontend/src/pages/HomePage.jsx | Ana sayfa (`/`). Notları "Sabitlenenler" ve "Diğerleri" olarak iki ızgarada gösterir. Şimdilik `sampleNotes` örnek verisiyle çalışır. | — | Not formu yeri, iki not ızgarası; not yoksa boş durum yazısı | — |
| `handleNoteChange` | frontend/src/pages/HomePage.jsx (HomePage içinde) | Listedeki notu güncel haliyle değiştirir. | `updatedNote: Note` | — (listeyi günceller) | — |
| `handleNoteRemove` | frontend/src/pages/HomePage.jsx (HomePage içinde) | Notu listeden çıkarır. | `noteId: number` | — (listeyi günceller) | — |
| `NoteGrid` | frontend/src/components/NoteGrid.jsx | Not kartlarını sırayla belirerek ızgarada gösterir; çıkan kart küçülerek kaybolur. | `{ notes: Note[], onNoteChange, onNoteRemove }` | Kart ızgarası | — |
| `NoteCard` | frontend/src/components/NoteCard.jsx | Tek notu renkli kart olarak gösterir; başlık, içerik ve diğer kişilere ayrılmış yerleri içerir. | `{ note: Note, onNoteChange, onNoteRemove }` | Not kartı | — |
| `NoteForm` | frontend/src/components/NoteForm.jsx | Not ekleme/düzenleme formunun yeri. Şimdilik boş. | — | `null` | — |
| `sampleNotes` (veri) | frontend/src/api/sampleNotes.js | Notlar API'si yazılana kadar kullanılan örnek notlar. API hazır olunca silinecek. | — | `Note[]` | — |

### Fonksiyonlar

_Henüz eklenmedi._

---

## 3. Etiket ve Arama

- **Sorumlu kişi:**
- **Uç nokta önekleri:** `/tags`, `/search`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır yer tutucular

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `NoteTags` | frontend/src/components/note-card/NoteTags.jsx | Not kartındaki etiket rozetleri. Şimdilik etiketleri sadece gösterir. | `{ note, onNoteChange, onNoteRemove }` | Etiket rozetleri; etiket yoksa `null` | — |
| `SearchBar` | frontend/src/components/SearchBar.jsx | Üst çubuktaki arama kutusunun yeri. Şimdilik boş. | — | `null` | — |
| `TagMenu` | frontend/src/components/TagMenu.jsx | Sol menüdeki etiket listesinin yeri. Şimdilik boş. | `{ collapsed: boolean }` | `null` | — |
| `SearchPage` | frontend/src/pages/SearchPage.jsx | `/search` sayfası (menüde görünmez). Şimdilik boş durum yazısı. | — | "Arama sonuçları burada görünür" | — |

### Fonksiyonlar

_Henüz eklenmedi._

---

## 4. Arşiv ve Çöp Kutusu

- **Sorumlu kişi:**
- **Uç nokta önekleri:** `/archive`, `/trash`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır yer tutucular

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `ArchiveTrashActions` | frontend/src/components/note-card/ArchiveTrashActions.jsx | Not kartındaki arşiv ve çöp düğmelerinin yeri. Şimdilik boş. | `{ note, onNoteChange, onNoteRemove }` | `null` | — |
| `ArchivePage` | frontend/src/pages/ArchivePage.jsx | `/archive` sayfası. Şimdilik boş durum yazısı. | — | "Arşivlenen notlarınız burada görünür" | — |
| `TrashPage` | frontend/src/pages/TrashPage.jsx | `/trash` sayfası. Şimdilik boş durum yazısı. | — | "Çöp kutusunda not yok" | — |

### Fonksiyonlar

_Henüz eklenmedi._

---

## 5. Liste Notları, Hatırlatıcı, Sabitleme, Renk

- **Sorumlu kişi:**
- **Uç nokta önekleri:** `/checklist`, `/reminders`, `/pin-color`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır yer tutucular

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `ChecklistItems` | frontend/src/components/note-card/ChecklistItems.jsx | Liste notunun maddeleri. Şimdilik maddeleri sadece gösterir (işaretliler üstü çizili). | `{ note, onNoteChange, onNoteRemove }` | Madde listesi | — |
| `PinColorActions` | frontend/src/components/note-card/PinColorActions.jsx | Not kartındaki sabitleme ve renk düğmelerinin yeri. Şimdilik boş. | `{ note, onNoteChange, onNoteRemove }` | `null` | — |
| `ReminderChip` | frontend/src/components/note-card/ReminderChip.jsx | Not kartındaki hatırlatıcının yeri. Şimdilik boş. | `{ note, onNoteChange, onNoteRemove }` | `null` | — |
| `RemindersPage` | frontend/src/pages/RemindersPage.jsx | `/reminders` sayfası (menüde "Hatırlatıcılar"). Şimdilik boş durum yazısı. | — | "Yaklaşan hatırlatıcılarınız burada görünür" | — |

### Fonksiyonlar

_Henüz eklenmedi._

---

## Altyapı (ortak)

Altyapıyla gelen fonksiyonlar. Sorumlusu 4. kişidir; bunları değiştirmek
ortak bir değişikliktir (bkz. [AGENTS.md > Ortak dosyalar](../AGENTS.md#ortak-dosyalar)).

### `get_current_user`

- **Sorumlu kişi:** Altyapı (içini 1. kişi değiştirecek)
- **Dosya:** backend/app/dependencies.py
- **Durum:** Geçici

**Ne yapar?** Giriş yapmış kullanıcıyı döndürür. Gerçek giriş sistemi
yazılana kadar seed betiğindeki örnek kullanıcıyı (`SEED_USER_EMAIL`)
döndürür. Router'larda `current_user: CurrentUser` parametresiyle kullanılır.
Giriş sistemi gelince yalnızca içi değişir; adı ve dönüş tipi aynı kalır.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | FastAPI `get_db` ile verir |

**Çıktı:** `User`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Örnek kullanıcı veritabanında yok (seed çalıştırılmamış) | `HTTPException` | 401 |

### Backend

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `health` | app/main.py | **GET /health.** Uygulamanın ayakta olduğunu bildirir. | — | `HealthResponse` → 200 `{"status": "ok"}` | — |
| `lifespan` | app/main.py | Uygulama açılırken tabloları oluşturur. | `_app: FastAPI` | `AsyncIterator[None]` | — |
| `service_error_handler` | app/main.py | Servislerden gelen `ServiceError`'ı HTTP yanıtına çevirir. | `_request: Request`, `exc: ServiceError` | `JSONResponse` (kod: `exc.status_code`, gövde: `{"detail": mesaj}`) | — |
| `get_settings` | app/config.py | `.env` ve ortam değişkenlerinden ayarları okur (bir kez okunur, sonra önbellekten). | — | `Settings` | Ayar tipi uymazsa `pydantic.ValidationError` (uygulama açılmaz) |
| `Settings.resolve_relative_sqlite_path` | app/config.py | Göreli SQLite yolunu `backend/` klasörüne göre mutlak yola çevirir. | `value: str` | `str` | — |
| `Settings.cors_origin_list` | app/config.py | Virgülle ayrılmış `CORS_ORIGINS` değerini listeye çevirir (özellik). | — | `list[str]` | — |
| `build_engine` | app/database.py | Verilen adres için veritabanı bağlantısı (engine) kurar; SQLite'ta yabancı anahtarları açar. | `database_url: str` | `Engine` | — |
| `_enable_sqlite_foreign_keys` | app/database.py | Her SQLite bağlantısında `PRAGMA foreign_keys=ON` çalıştırır. | `dbapi_connection`, `_connection_record` | `None` | — |
| `create_tables` | app/database.py | Modellerdeki tabloları (yoksa) oluşturur. | `bind: Engine \| None = None` | `None` | — |
| `get_db` | app/database.py | İstek başına veritabanı oturumu açar, istek bitince kapatır. Router'larda `db: DbSession` ile kullanılır. | — | `Iterator[Session]` | — |
| `utc_now` | app/models.py | Şu anki zamanı UTC olarak verir (tarih alanlarının varsayılanı). | — | `datetime` | — |
| `discover_routers` | app/routers/\_\_init\_\_.py | `app/routers` altındaki her modülün `router` nesnesini bulur; `_` ile başlayanları atlar. | `package: ModuleType \| None = None` | `list[APIRouter]` (modül adına göre sıralı) | — |
| `ServiceError` ve alt sınıfları | app/services/errors.py | Servis hataları: `ValidationError`, `PermissionDeniedError`, `NotFoundError`, `ConflictError`. | `message: str` | İstisna (`status_code`: 400 / 403 / 404 / 409) | — |
| `seed_database` | app/seed.py | Örnek kullanıcıyı, etiketleri ve 4 örnek notu ekler. Tekrar çalıştırılınca var olanları yeniden eklemez (notlar başlığa göre eşleşir). | `db: Session` | `User` (örnek kullanıcı) | — |
| `hash_seed_password` | app/seed.py | Örnek kullanıcının parolasını PBKDF2 ile özetler. 1. kişinin hash fonksiyonu gelince onunla değiştirilecek. | `password: str` | `str` (`pbkdf2_sha256$...`) | — |
| `_get_or_create_user` | app/seed.py | Örnek kullanıcıyı bulur, yoksa oluşturur. | `db: Session` | `User` | — |
| `_get_or_create_tag` | app/seed.py | Kullanıcının etiketini adına göre bulur, yoksa oluşturur. | `db: Session`, `user: User`, `name: str` | `Tag` | — |
| `main` | app/seed.py | `python -m app.seed` komutunun giriş noktası: tabloları oluşturur, seed'i çalıştırır, sonucu yazar. | — | `None` | — |

### Frontend

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `apiRequest` | src/api/client.js | Backend'e istek atar; adresi `VITE_API_URL`'den alır, giriş bilgisini `authSession.js`'ten ekler, gövdeyi JSON yapar. | `path: string`, `{ method = 'GET', body, headers, ...fetchSeçenekleri }` | `Promise<any>` (yanıt gövdesi; 204'te `null`) | Yanıt başarısızsa `ApiError` fırlatır; 401'de önce `handleUnauthorized()` çağrılır |
| `ApiError` (sınıf) | src/api/client.js | Başarısız API yanıtını taşıyan hata. | `status: number`, `message: string`, `body: any` | `Error` | — |
| `readBody` | src/api/client.js | Yanıt gövdesini okur; JSON ise çözer. | `response: Response` | `Promise<any \| null>` | — |
| `getHealth` | src/api/health.js | **GET /health** çağırır. | — | `Promise<{ status: "ok" }>` | Backend kapalıysa hata fırlatır |
| `routes`, `layoutRoutes`, `standaloneRoutes`, `menuRoutes` (değerler) | src/routes.js | `pages/` altındaki sayfaları bulup `route` bilgisine göre ayırır. | — | Sayfa listeleri | — |
| `App` | src/App.jsx | Yönlendirme: menüsüz sayfalar doğrudan, diğerleri `RequireAuth` ve `Layout` içinde. | — | Sayfa ağacı | — |
| `Layout` | src/components/Layout.jsx | Üst çubuk, sol menü ve animasyonlu sayfa alanı; kişilere ayrılmış yerleri içerir. | — | Uygulama iskeleti | — |
| `MenuLink` | src/components/Layout.jsx | Sol menüdeki tek bir sayfa bağlantısı. | `{ route }` | Menü öğesi | — |
| `PageTransition` | src/components/PageTransition.jsx | Sayfa geçişinde içeriği kaydırarak belirtir/kaybettirir. | `{ children }` | Animasyonlu kutu | — |
| `FrozenOutlet` | src/components/PageTransition.jsx | Çıkış animasyonu sürerken eski sayfayı ekranda tutar. | — | O anki sayfa | — |
| `ApiStatus` | src/components/ApiStatus.jsx | `/health`'i yoklayıp backend bağlantı durumunu gösterir. | — | "API bağlı" / "API bağlantısı yok" göstergesi | — |
| `EmptyState` | src/components/EmptyState.jsx | Gösterilecek kayıt yokken büyük ikon ve mesaj gösterir. | `{ icon: string, message: string }` | Boş durum görünümü | — |
| `Icon` | src/components/Icon.jsx | Adı verilen SVG ikonu çizer. | `{ name: string, size = 22, className }` | `<svg>`; ad bilinmiyorsa `null` | — |
| `noteColor` | src/components/noteColors.js | Renk adını (`yellow` vb.) ekrandaki renk koduna çevirir. | `name: string` | `string` (ör. `#fff8b8`; bilinmeyen ad → beyaz) | — |
| `NotFoundPage` | src/pages/NotFoundPage.jsx | Bilinmeyen adresler için 404 sayfası. | — | "Aradığınız sayfa bulunamadı" ve ana sayfa bağlantısı | — |
