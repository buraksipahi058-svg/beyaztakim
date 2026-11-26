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

- **Sorumlu kişi:** 2. kişi
- **Uç nokta öneki:** `/notes`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır olanlar

Altyapıyla gelen, 2. kişiye ait bileşenler. Not kartındaki diğer kişilere
ayrılmış yerler (`components/note-card/`) korunmuştur. Aşağıdaki bileşenlerin
içleri gerçek API ile çalışacak şekilde dolduruldu (durum: Tamamlandı).
`sampleNotes.js` örnek veri dosyası API hazır olunca silindi.

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `HomePage` | frontend/src/pages/HomePage.jsx | Ana sayfa (`/`). Notları API'den yükler; "Sabitlenenler" ve "Diğerleri" olarak iki ızgarada gösterir. Yükleme/hata durumu ve boş durum yazısı gösterir. | — | Not formu, iki not ızgarası; hata/yükleme/boş durum yazıları | Notlar yüklenemezse ekranda hata mesajı |
| `handleNoteSaved` | frontend/src/pages/HomePage.jsx (HomePage içinde) | Formdan gelen kaydı listeye ekler (yoksa) ya da günceller (varsa). | `savedNote: Note` | — (listeyi günceller) | — |
| `handleNoteChange` | frontend/src/pages/HomePage.jsx (HomePage içinde) | Listedeki notu güncel haliyle değiştirir. | `updatedNote: Note` | — (listeyi günceller) | — |
| `handleNoteRemove` | frontend/src/pages/HomePage.jsx (HomePage içinde) | Notu listeden çıkarır. | `noteId: number` | — (listeyi günceller) | — |
| `NoteGrid` | frontend/src/components/NoteGrid.jsx | Not kartlarını sırayla belirerek ızgarada gösterir; çıkan kart küçülerek kaybolur. | `{ notes: Note[], onNoteChange, onNoteRemove, onEdit }` | Kart ızgarası | — |
| `NoteCard` | frontend/src/components/NoteCard.jsx | Tek notu renkli kart olarak gösterir; başlık, içerik ve diğer kişilere ayrılmış yerleri içerir. Sağ altta düzenleme düğmesi vardır (`onEdit` verilmişse). | `{ note: Note, onNoteChange, onNoteRemove, onEdit? }` | Not kartı | — |
| `NoteForm` | frontend/src/components/NoteForm.jsx | "Not alın..." alanı: metin/liste türü seçimi, başlık, içerik ya da madde satırları, renk seçimi. Yeni notu `createNote`, düzenlemeyi `updateNote` ile kaydeder. Düzenleme modunda liste maddeleri salt okunurdur (5. kişinin `/checklist` özelliği). | `{ editingNote?: Note \| null, onNoteSaved?(note), onCancelEdit?() }` | Ekleme/düzenleme formu; kayıtta `onNoteSaved` çağrılır | Kayıt başarısızsa formda hata mesajı (400 / 422) |

### Fonksiyonlar

#### `_validate_color`

- **Sorumlu kişi:** 2. kişi
- **Dosya:** backend/app/services/notes.py
- **Durum:** Tamamlandı

**Ne yapar?** Renk adının bilinen listede (`default` ... `gray`, bkz. docs/veri-modeli.md) olduğunu kontrol eder.

**Girdi:** `color: str`

**Çıktı:** `str` (geçerli renk adı)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Bilinmeyen renk adı | `ValidationError` | 400 |

#### `create_note`

- **Sorumlu kişi:** 2. kişi
- **Dosya:** backend/app/services/notes.py
- **Uç nokta:** POST /notes → 201 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcı için yeni not oluşturur. Liste notuysa maddeleri `position: 0, 1, 2, ...` sırasıyla ekler.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | FastAPI `get_db` ile verir |
| `user` | `User` | Evet | Notun sahibi (`get_current_user` verir) |
| `data` | `NoteCreate` (title, content, note_type, color, checklist_items) | Evet | İstek gövdesi |

**Çıktı:** `Note`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Bilinmeyen renk | `ValidationError` | 400 |
| Metin notuna madde verilmesi | `ValidationError` | 400 |
| Gövde şemaya uymuyor (ör. bilinmeyen note_type) | (Pydantic) | 422 |

#### `list_notes`

- **Sorumlu kişi:** 2. kişi
- **Dosya:** backend/app/services/notes.py
- **Uç nokta:** GET /notes → 200 `list[NoteRead]`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının arşivde ve çöp kutusunda olmayan notlarını döndürür; sıralama sabitlenenler üste, sonra en son güncellenenlerdir.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notların sahibi |

**Çıktı:** `list[Note]`

**Hata durumları:** —

#### `get_note`

- **Sorumlu kişi:** 2. kişi
- **Dosya:** backend/app/services/notes.py
- **Uç nokta:** GET /notes/{note_id} → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının tek bir notunu döndürür; sorguda her zaman `user_id` koşulu vardır.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notun sahibi |
| `note_id` | `int` | Evet | Yoldan gelen not kimliği |

**Çıktı:** `Note`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |

#### `update_note`

- **Sorumlu kişi:** 2. kişi
- **Dosya:** backend/app/services/notes.py
- **Uç nokta:** PATCH /notes/{note_id} → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notun başlık, içerik, renk ve sabitleme alanlarını günceller; yalnızca gönderilen alanlar değişir. Liste maddelerinin düzenlenmesi 5. kişinin `/checklist` uç noktasının işidir.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notun sahibi |
| `note_id` | `int` | Evet | Not kimliği |
| `data` | `NoteUpdate` (title, content, color, is_pinned — tümü opsiyonel) | Evet | İstek gövdesi |

**Çıktı:** `Note`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Bilinmeyen renk | `ValidationError` | 400 |
| Gövde şemaya uymuyor | (Pydantic) | 422 |

### Uç noktalar (router)

| Fonksiyon | Dosya | Uç nokta | Ne yapar | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `create_note` | backend/app/routers/notes.py | POST /notes | Yeni not oluşturur. | 201 `NoteRead` | 400 / 404 / 422 |
| `list_notes` | backend/app/routers/notes.py | GET /notes | Aktif notları listeler. | 200 `list[NoteRead]` | 401 jeton yoksa |
| `read_note` | backend/app/routers/notes.py | GET /notes/{note_id} | Tek not döndürür. | 200 `NoteRead` | 404 / 401 |
| `update_note` | backend/app/routers/notes.py | PATCH /notes/{note_id} | Notu kısmen günceller. | 200 `NoteRead` | 400 / 404 / 401 / 422 |

### Frontend API

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `listNotes` | frontend/src/api/notes.js | GET /notes çağırır. | — | `Promise<Note[]>` | 401 → `ApiError` (jeton silinir) |
| `getNote` | frontend/src/api/notes.js | GET /notes/{id} çağırır. | `noteId: number` | `Promise<Note>` | 404 / 401 → `ApiError` |
| `createNote` | frontend/src/api/notes.js | POST /notes çağırır. | `noteData: NoteCreate` | `Promise<Note>` | 400 / 422 / 401 → `ApiError` |
| `updateNote` | frontend/src/api/notes.js | PATCH /notes/{id} çağırır. | `noteId: number`, `noteData: NoteUpdate` | `Promise<Note>` | 400 / 404 / 401 / 422 → `ApiError` |

---

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

#### `create_tag`

- **Sorumlu kişi:** 3. kişi
- **Dosya:** backend/app/services/tags.py
- **Uç nokta:** POST /tags → 201 `TagRead`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcı için yeni bir etiket oluşturur. Adın başındaki ve
sonundaki boşluklar silinir; aynı kullanıcının aynı adda iki etiketi olamaz
(farklı kullanıcılar aynı adı kullanabilir).

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Etiketin sahibi (`get_current_user` verir) |
| `data` | `TagCreate` (name: 1-100 karakter) | Evet | İstek gövdesi |

**Çıktı:** `Tag`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Kullanıcının aynı adda etiketi var | `ConflictError` | 409 |
| Ad boş, yalnızca boşluk ya da 100 karakterden uzun | (Pydantic) | 422 |

#### `list_tags`

- **Sorumlu kişi:** 3. kişi
- **Dosya:** backend/app/services/tags.py
- **Uç nokta:** GET /tags → 200 `list[TagRead]`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının etiketlerini ada göre alfabetik sırayla döndürür.

**Girdi:** `db: Session`, `user: User`

**Çıktı:** `list[Tag]`

**Hata durumları:** —

#### `delete_tag`

- **Sorumlu kişi:** 3. kişi
- **Dosya:** backend/app/services/tags.py
- **Uç nokta:** DELETE /tags/{tag_id} → 204
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının etiketini siler; etiketin notlarla bağları da
kalkar (notlar silinmez).

**Girdi:** `db: Session`, `user: User`, `tag_id: int`

**Çıktı:** `None`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Etiket yok ya da başka kullanıcının | `NotFoundError` | 404 |

#### `add_tag_to_note`

- **Sorumlu kişi:** 3. kişi
- **Dosya:** backend/app/services/tags.py
- **Uç nokta:** POST /tags/notes/{note_id}/tags/{tag_id} → 204
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının etiketini kullanıcının notuna bağlar. Etiket notta
zaten varsa bir şey değişmez.

**Girdi:** `db: Session`, `user: User`, `note_id: int`, `tag_id: int`

**Çıktı:** `None`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Etiket yok ya da başka kullanıcının | `NotFoundError` | 404 |

#### `remove_tag_from_note`

- **Sorumlu kişi:** 3. kişi
- **Dosya:** backend/app/services/tags.py
- **Uç nokta:** DELETE /tags/notes/{note_id}/tags/{tag_id} → 204
- **Durum:** Tamamlandı

**Ne yapar?** Etiketi nottan çıkarır; etiketin kendisi silinmez. Etiket notta
yoksa bir şey değişmez.

**Girdi:** `db: Session`, `user: User`, `note_id: int`, `tag_id: int`

**Çıktı:** `None`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Etiket yok ya da başka kullanıcının | `NotFoundError` | 404 |

### Uç noktalar (router)

| Fonksiyon | Dosya | Uç nokta | Ne yapar | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `create_tag` | backend/app/routers/tags.py | POST /tags | Gövde: `{ "name": str }`. Etiket oluşturur. | 201 `TagRead` | 401 / 409 / 422 |
| `list_tags` | backend/app/routers/tags.py | GET /tags | Etiketleri listeler. | 200 `list[TagRead]` | 401 |
| `delete_tag` | backend/app/routers/tags.py | DELETE /tags/{tag_id} | Etiketi siler. | 204 (boş) | 401 / 404 |
| `add_tag_to_note` | backend/app/routers/tags.py | POST /tags/notes/{note_id}/tags/{tag_id} | Nota etiket ekler. | 204 (boş) | 401 / 404 |
| `remove_tag_from_note` | backend/app/routers/tags.py | DELETE /tags/notes/{note_id}/tags/{tag_id} | Etiketi nottan çıkarır. | 204 (boş) | 401 / 404 |

---

## 4. Arşiv ve Çöp Kutusu

- **Sorumlu kişi:**
- **Uç nokta önekleri:** `/archive`, `/trash`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

Kurallar:

- Arşiv ve çöp kutusu ayrı bayraklardır (`is_archived`, `is_trashed`). Çöpe
  atılan arşiv notu, geri yüklenince arşive döner.
- Çöpteki not arşivlenemez ve arşivden çıkarılamaz; önce geri yüklenmelidir.
- Yalnızca çöpteki not kalıcı olarak silinebilir.
- Arşivlenen notun sabitlemesi kaldırılır.

### Fonksiyonlar

#### `list_archived_notes`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/archive.py
- **Uç nokta:** GET /archive → 200 `list[NoteRead]`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının arşivdeki ve çöpte olmayan notlarını, en son
güncellenen üstte olacak şekilde döndürür.

**Girdi:** `db: Session`, `user: User`

**Çıktı:** `list[Note]`

**Hata durumları:** —

#### `_get_note_outside_trash`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/archive.py
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının notunu döndürür; not çöpteyse arşiv işlemine izin vermez.

**Girdi:** `db: Session`, `user: User`, `note_id: int`

**Çıktı:** `Note`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not çöp kutusunda | `ValidationError` | 400 |

#### `archive_note`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/archive.py
- **Uç nokta:** POST /archive/{note_id} → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notu arşive taşır (`is_archived: true`) ve sabitlemesini kaldırır.
Not zaten arşivdeyse bir şey değişmez.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notun sahibi (`get_current_user` verir) |
| `note_id` | `int` | Evet | Yoldan gelen not kimliği |

**Çıktı:** `Note` (güncel hali)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not çöp kutusunda | `ValidationError` | 400 |

#### `unarchive_note`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/archive.py
- **Uç nokta:** DELETE /archive/{note_id} → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notu arşivden çıkarır (`is_archived: false`); not ana sayfaya döner.

**Girdi:** `db: Session`, `user: User`, `note_id: int`

**Çıktı:** `Note` (güncel hali)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not çöp kutusunda | `ValidationError` | 400 |

#### `list_trashed_notes`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/trash.py
- **Uç nokta:** GET /trash → 200 `list[NoteRead]`
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının çöp kutusundaki notlarını, en son çöpe atılan üstte
olacak şekilde döndürür.

**Girdi:** `db: Session`, `user: User`

**Çıktı:** `list[Note]`

**Hata durumları:** —

#### `move_note_to_trash`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/trash.py
- **Uç nokta:** POST /trash/{note_id} → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notu çöp kutusuna taşır (`is_trashed: true`) ve zamanını
`trashed_at`'e yazar. Not zaten çöpteyse bir şey değişmez (ilk zaman korunur).

**Girdi:** `db: Session`, `user: User`, `note_id: int`

**Çıktı:** `Note` (güncel hali)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |

#### `_get_trashed_note`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/trash.py
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının çöp kutusundaki notunu döndürür.

**Girdi:** `db: Session`, `user: User`, `note_id: int`

**Çıktı:** `Note`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not çöp kutusunda değil | `ValidationError` | 400 |

#### `restore_note`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/trash.py
- **Uç nokta:** POST /trash/{note_id}/restore → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notu çöp kutusundan geri yükler (`is_trashed: false`,
`trashed_at: null`). Not, çöpe atılmadan önceki yerine (ana sayfa ya da
arşiv) döner.

**Girdi:** `db: Session`, `user: User`, `note_id: int`

**Çıktı:** `Note` (güncel hali)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not çöp kutusunda değil | `ValidationError` | 400 |

#### `delete_note_permanently`

- **Sorumlu kişi:** 4. kişi
- **Dosya:** backend/app/services/trash.py
- **Uç nokta:** DELETE /trash/{note_id} → 204
- **Durum:** Tamamlandı

**Ne yapar?** Çöp kutusundaki notu kalıcı olarak siler. Notun liste
maddeleri ve etiket bağları da silinir; etiketlerin kendisi kalır.

**Girdi:** `db: Session`, `user: User`, `note_id: int`

**Çıktı:** `None`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not çöp kutusunda değil | `ValidationError` | 400 |

### Uç noktalar (router)

| Fonksiyon | Dosya | Uç nokta | Ne yapar | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `list_archived_notes` | backend/app/routers/archive.py | GET /archive | Arşivdeki notları listeler. | 200 `list[NoteRead]` | 401 |
| `archive_note` | backend/app/routers/archive.py | POST /archive/{note_id} | Notu arşivler. | 200 `NoteRead` | 400 / 401 / 404 |
| `unarchive_note` | backend/app/routers/archive.py | DELETE /archive/{note_id} | Notu arşivden çıkarır. | 200 `NoteRead` | 400 / 401 / 404 |
| `list_trashed_notes` | backend/app/routers/trash.py | GET /trash | Çöpteki notları listeler. | 200 `list[NoteRead]` | 401 |
| `move_note_to_trash` | backend/app/routers/trash.py | POST /trash/{note_id} | Notu çöpe taşır. | 200 `NoteRead` | 401 / 404 |
| `restore_note` | backend/app/routers/trash.py | POST /trash/{note_id}/restore | Notu geri yükler. | 200 `NoteRead` | 400 / 401 / 404 |
| `delete_note_permanently` | backend/app/routers/trash.py | DELETE /trash/{note_id} | Çöpteki notu kalıcı siler. | 204 (boş) | 400 / 401 / 404 |

### Frontend

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `listArchivedNotes` | frontend/src/api/archive.js | GET /archive çağırır. | — | `Promise<Note[]>` | 401 → `ApiError` |
| `archiveNote` | frontend/src/api/archive.js | POST /archive/{id} çağırır. | `noteId: number` | `Promise<Note>` | 400 / 404 / 401 → `ApiError` |
| `unarchiveNote` | frontend/src/api/archive.js | DELETE /archive/{id} çağırır. | `noteId: number` | `Promise<Note>` | 400 / 404 / 401 → `ApiError` |
| `listTrashedNotes` | frontend/src/api/trash.js | GET /trash çağırır. | — | `Promise<Note[]>` | 401 → `ApiError` |
| `moveNoteToTrash` | frontend/src/api/trash.js | POST /trash/{id} çağırır. | `noteId: number` | `Promise<Note>` | 404 / 401 → `ApiError` |
| `restoreNote` | frontend/src/api/trash.js | POST /trash/{id}/restore çağırır. | `noteId: number` | `Promise<Note>` | 400 / 404 / 401 → `ApiError` |
| `deleteNotePermanently` | frontend/src/api/trash.js | DELETE /trash/{id} çağırır. | `noteId: number` | `Promise<null>` | 400 / 404 / 401 → `ApiError` |
| `ArchiveTrashActions` | frontend/src/components/note-card/ArchiveTrashActions.jsx | Kartın alt çubuğundaki düğmeler. Normal not: Arşivle, Çöp kutusuna taşı. Arşivdeki not: Arşivden çıkar, Çöp kutusuna taşı. Çöpteki not: Geri yükle, Kalıcı olarak sil (onay sorar). Başarılı işlemde not bulunduğu listeden çıkar. | `{ note, onNoteRemove }` | İki ikon düğmesi; hata olursa kısa hata yazısı | API hatası kartta yazı olarak gösterilir |
| `runAction` | ArchiveTrashActions.jsx (içinde) | Düğmeleri kilitleyip işlemi çalıştırır; başarılıysa `onNoteRemove(note.id)` çağırır. | `action: () => Promise` | — | Hata mesajını kartta gösterir |
| `handleDeleteForever` | ArchiveTrashActions.jsx (içinde) | Onay sorar; "Tamam" denirse notu kalıcı siler. | — | — | — |
| `ArchivePage` | frontend/src/pages/ArchivePage.jsx | `/archive` sayfası: arşivdeki notları ızgarada gösterir. | — | Not ızgarası; yükleme/hata/boş durum yazıları | Liste yüklenemezse hata yazısı |
| `TrashPage` | frontend/src/pages/TrashPage.jsx | `/trash` sayfası: çöpteki notları ızgarada gösterir. | — | Açıklama ve not ızgarası; yükleme/hata/boş durum yazıları | Liste yüklenemezse hata yazısı |

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

> Not: Renk ve sabitleme iki yoldan da değiştirilebilir: buradaki
> `/pin-color` uç noktaları ve `PATCH /notes/{note_id}` (2. kişi). İkisi de
> aynı renk listesini kullanır ve geçerlidir.

#### `update_note_pin`

- **Sorumlu kişi:** 5. kişi
- **Dosya:** backend/app/services/pin_color.py
- **Uç nokta:** PATCH /pin-color/{note_id}/pin → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notu sabitler (`is_pinned: true`) ya da sabitlemeyi kaldırır.
Sabitlenen not ana sayfada üstte görünür (sıralamayı `list_notes` yapar).

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notun sahibi (`get_current_user` verir) |
| `note_id` | `int` | Evet | Yoldan gelen not kimliği |
| `is_pinned` | `bool` | Evet | `true` sabitler, `false` kaldırır |

**Çıktı:** `Note` (güncel hali)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Gövdede `is_pinned` yok ya da bool değil | (Pydantic) | 422 |

#### `update_note_color`

- **Sorumlu kişi:** 5. kişi
- **Dosya:** backend/app/services/pin_color.py
- **Uç nokta:** PATCH /pin-color/{note_id}/color → 200 `NoteRead`
- **Durum:** Tamamlandı

**Ne yapar?** Notun rengini değiştirir. Renk adı, not oluştururken kullanılan
listeyle (`notes.ALLOWED_NOTE_COLORS`: `default`, `red`, `orange`, `yellow`,
`green`, `teal`, `blue`, `purple`, `pink`, `brown`, `gray`) aynıdır.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notun sahibi |
| `note_id` | `int` | Evet | Yoldan gelen not kimliği |
| `color` | `str` | Evet | Yeni renk adı |

**Çıktı:** `Note` (güncel hali)

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Bilinmeyen renk adı | `ValidationError` | 400 |
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Gövdede `color` yok ya da 20 karakterden uzun | (Pydantic) | 422 |

#### `_get_item`

- **Sorumlu kişi:** 5. kişi
- **Dosya:** backend/app/services/checklist.py
- **Durum:** Tamamlandı

**Ne yapar?** Kullanıcının notlarından birine ait liste maddesini döndürür
(madde, notuyla birleştirilip `Note.user_id` koşuluyla aranır).

**Girdi:** `db: Session`, `user: User`, `item_id: int`

**Çıktı:** `ChecklistItem`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Madde yok ya da başka kullanıcının notunda | `NotFoundError` | 404 |

#### `add_checklist_item`

- **Sorumlu kişi:** 5. kişi
- **Dosya:** backend/app/services/checklist.py
- **Uç nokta:** POST /checklist/{note_id}/items → 201 `ChecklistItemRead`
- **Durum:** Tamamlandı

**Ne yapar?** Liste notunun sonuna yeni bir madde ekler. Yeni maddenin sırası
(`position`) notun son maddesinin bir fazlasıdır; not boşsa 0.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Notun sahibi (`get_current_user` verir) |
| `note_id` | `int` | Evet | Yoldan gelen not kimliği |
| `data` | `ChecklistItemCreate` (text, en fazla 500 karakter) | Evet | İstek gövdesi |

**Çıktı:** `ChecklistItem`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Not yok ya da başka kullanıcının | `NotFoundError` | 404 |
| Not liste türünde değil (`note_type` = `"text"`) | `ValidationError` | 400 |
| Metin 500 karakterden uzun | (Pydantic) | 422 |

#### `update_checklist_item`

- **Sorumlu kişi:** 5. kişi
- **Dosya:** backend/app/services/checklist.py
- **Uç nokta:** PATCH /checklist/items/{item_id} → 200 `ChecklistItemRead`
- **Durum:** Tamamlandı

**Ne yapar?** Maddenin metnini ve/veya işaretini (`is_done`) günceller;
gönderilmeyen alanlar olduğu gibi kalır.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `user` | `User` | Evet | Maddenin bulunduğu notun sahibi |
| `item_id` | `int` | Evet | Yoldan gelen madde kimliği |
| `data` | `ChecklistItemUpdate` (text, is_done; ikisi de isteğe bağlı) | Evet | İstek gövdesi |

**Çıktı:** `ChecklistItem`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Madde yok ya da başka kullanıcının notunda | `NotFoundError` | 404 |
| Metin 500 karakterden uzun | (Pydantic) | 422 |

#### `delete_checklist_item`

- **Sorumlu kişi:** 5. kişi
- **Dosya:** backend/app/services/checklist.py
- **Uç nokta:** DELETE /checklist/items/{item_id} → 204
- **Durum:** Tamamlandı

**Ne yapar?** Maddeyi siler.

**Girdi:** `db: Session`, `user: User`, `item_id: int`

**Çıktı:** `None`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Madde yok ya da başka kullanıcının notunda | `NotFoundError` | 404 |

### Uç noktalar (router)

| Fonksiyon | Dosya | Uç nokta | Ne yapar | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `update_note_pin` | backend/app/routers/pin_color.py | PATCH /pin-color/{note_id}/pin | Gövde: `{ "is_pinned": bool }`. Notu sabitler / sabitlemeyi kaldırır. | 200 `NoteRead` | 401 / 404 / 422 |
| `update_note_color` | backend/app/routers/pin_color.py | PATCH /pin-color/{note_id}/color | Gövde: `{ "color": str }`. Notun rengini değiştirir. | 200 `NoteRead` | 400 / 401 / 404 / 422 |
| `add_item` | backend/app/routers/checklist.py | POST /checklist/{note_id}/items | Gövde: `{ "text": str }`. Liste notuna madde ekler. | 201 `ChecklistItemRead` | 400 / 401 / 404 / 422 |
| `update_item` | backend/app/routers/checklist.py | PATCH /checklist/items/{item_id} | Gövde: `{ "text"?: str, "is_done"?: bool }`. Maddeyi günceller. | 200 `ChecklistItemRead` | 401 / 404 / 422 |
| `delete_item` | backend/app/routers/checklist.py | DELETE /checklist/items/{item_id} | Maddeyi siler. | 204 (boş) | 401 / 404 |

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
| `useNoteList` | src/hooks/useNoteList.js | Not listesi gösteren sayfalar için ortak kanca: listeyi yükler, yükleme/hata durumunu tutar, kart olaylarını listeye uygular. | `loadNotes: () => Promise<Note[]>`, `deps: any[] = []` (değişince yeniden yükler) | `{ notes, isLoading, loadError, handleNoteChange, handleNoteRemove }` | Yükleme başarısızsa `loadError`'a mesaj yazar |
| `handleNoteChange` | src/hooks/useNoteList.js (useNoteList içinde) | Listedeki notu güncel haliyle değiştirir. | `updatedNote: Note` | — | — |
| `handleNoteRemove` | src/hooks/useNoteList.js (useNoteList içinde) | Notu listeden çıkarır. | `noteId: number` | — | — |
## 1. Kullanıcı ve Güvenlik

- **Sorumlu kişi:** 1. kişi
- **Uç nokta öneki:** `/auth`
- **Dosyalar:** bkz. [AGENTS.md > Dosya sahipliği](../AGENTS.md#dosya-sahipliği)

### Hazır yer tutucular

İçleri gerçek giriş sistemiyle dolduruldu (durum: Tamamlandı).

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `getAuthRequestOptions` | frontend/src/api/authSession.js | localStorage'daki jetonu okuyup isteğe `Authorization: Bearer ...` başlığı ekler; jeton yoksa boş döner. | — | `object` (fetch seçenekleri) | — |
| `handleUnauthorized` | frontend/src/api/authSession.js | Backend 401 döndüğünde `apiRequest` tarafından çağrılır; saklanan jetonu siler. RequireAuth bir sonraki sayfa geçişinde `/login`'e yönlendirir. | — | — | — |
| `getStoredToken` / `setStoredToken` / `clearStoredToken` | frontend/src/api/authSession.js | Oturum jetonunu localStorage'da okur / saklar / siler. | `token: string` (yalnız set) | `string \| null` / — | — |
| `RequireAuth` | frontend/src/components/RequireAuth.jsx | Menülü sayfaları korur: saklanan jeton yoksa `/login`'e yönlendirir, varsa sayfayı gösterir. | `{ children }` | `children` ya da `<Navigate to="/login">` | — |
| `UserMenu` | frontend/src/components/UserMenu.jsx | Üst çubuğun en sağı: kullanıcı e-postası ve çıkış düğmesi. Çıkışta jeton silinir, `/login`'e gidilir. | — | E-posta (`/auth/me`'den) ve çıkış düğmesi | Jeton geçersizse e-posta boş kalır (silinir) |
| `LoginPage` | frontend/src/pages/LoginPage.jsx | `/login` sayfası (menüsüz): e-posta + parola formu; başarıda `/`'ye gider. | — | Giriş formu; hata mesajı gösterir | Hatalı bilgi → "E-posta veya parola hatalı." |
| `RegisterPage` | frontend/src/pages/RegisterPage.jsx | `/register` sayfası (menüsüz): kayıt formu; başarıda otomatik giriş yapıp `/`'ye gider. | — | Kayıt formu; hata mesajı gösterir | Parolalar uyuşmuyorsa ekranda uyarı |

### Fonksiyonlar

#### `UnauthorizedError`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Durum:** Tamamlandı

**Ne yapar?** Hatalı giriş ve geçersiz oturum için 401 döndüren servis hatası sınıfı. `errors.py` ortak dosya olduğu için bu alt sınıf auth servis dosyasında tanımlıdır; `main.py` tüm `ServiceError` alt sınıflarını otomatik HTTP koduna çevirir.

**Girdi:** `message: str`

**Çıktı:** İstisna (`status_code` = 401)

**Hata durumları:** —

#### `hash_password`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Durum:** Tamamlandı

**Ne yapar?** Parolanın PBKDF2-SHA256 özetini üretir (rastgele tuz, 600.000 tur). Biçim `app/seed.py` ile aynıdır: `pbkdf2_sha256$<tur>$<tuz>$<özet>`. Parola düz metin asla saklanmaz.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `password` | `str` | Evet | Düz metin parola |

**Çıktı:** `str` (özet)

**Hata durumları:** —

#### `verify_password`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Durum:** Tamamlandı

**Ne yapar?** Düz metin parolayı saklanan özetle sabit zamanlı (`hmac.compare_digest`) karşılaştırır.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `password` | `str` | Evet | Denenecek parola |
| `password_hash` | `str` | Evet | Saklanan özet |

**Çıktı:** `bool` (parola doğruysa `True`; biçim bozuksa da `False`)

**Hata durumları:** —

#### `register_user`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Uç nokta:** POST /auth/register → 201 `UserRead`
- **Durum:** Tamamlandı

**Ne yapar?** Yeni kullanıcı kaydeder. E-postayı küçük harfe normalize eder; parolanın yalnızca özetini saklar.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | FastAPI `get_db` ile verir |
| `data` | `UserCreate` (email, password) | Evet | İstek gövdesi; şemaya uymazsa 422 |

**Çıktı:** `User`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| E-posta zaten kayıtlı | `ConflictError` | 409 |
| E-posta biçimi / parola uzunluğu şemaya uymuyor | (Pydantic) | 422 |

#### `login_user`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Uç nokta:** POST /auth/login → 200 `TokenResponse` (`{"access_token": "...", "token_type": "bearer"}`)
- **Durum:** Tamamlandı

**Ne yapar?** E-posta ve parolayı doğrular; 7 gün geçerli, HMAC-SHA256 ile imzalı oturum jetonu üretir. Hangi bilginin hatalı olduğu açıklanmaz.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | FastAPI `get_db` ile verir |
| `data` | `UserLogin` (email, password) | Evet | İstek gövdesi |

**Çıktı:** `TokenResponse`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| E-posta ya da parola hatalı | `UnauthorizedError` | 401 |

#### `create_access_token`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Durum:** Tamamlandı

**Ne yapar?** `{"sub": user_id, "exp": unix_zaman}` yükünü base64url ile kodlayıp SECRET_KEY ile HMAC-SHA256 imzası ekler. İmzalama anahtarı `.env`'deki SECRET_KEY'dir; tanımlı değilse süreç başına rastgele kullanılır (uyarı verilir).

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `user_id` | `int` | Evet | Jetonun ait olduğu kullanıcı |

**Çıktı:** `str` (`gövde.imza` biçiminde jeton)

**Hata durumları:** —

#### `get_user_by_token`

- **Sorumlu kişi:** 1. kişi
- **Dosya:** backend/app/services/auth.py
- **Durum:** Tamamlandı

**Ne yapar?** Jetonun imzasını ve süresini doğrular, kullanıcısını veritabanından getirir. `get_current_user` bunu kullanır.

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | Veritabanı oturumu |
| `token` | `str \| None` | Evet | `Authorization` başlığındaki jeton |

**Çıktı:** `User`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Jeton yok / imza bozuk / süresi dolmuş / kullanıcı silinmiş | `UnauthorizedError` | 401 |

### Uç noktalar (router)

| Fonksiyon | Dosya | Uç nokta | Ne yapar | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `register` | backend/app/routers/auth.py | POST /auth/register | Kullanıcı kaydeder. | 201 `UserRead` | 409 e-posta kayıtlı, 422 şema |
| `login` | backend/app/routers/auth.py | POST /auth/login | Oturum jetonu verir. | 200 `TokenResponse` | 401 hatalı bilgi, 422 şema |
| `logout` | backend/app/routers/auth.py | POST /auth/logout | Çıkışı bildirir; jeton durumsuz olduğu için istemci kendi kopyasını siler. | 204 (boş) | 401 jeton yoksa/geçersizse |
| `read_current_user` | backend/app/routers/auth.py | GET /auth/me | Giriş yapmış kullanıcının bilgisi. | 200 `UserRead` | 401 jeton yoksa/geçersizse |

### Frontend API

| Fonksiyon | Dosya | Ne yapar | Girdi | Çıktı | Hata durumları |
|---|---|---|---|---|---|
| `registerUser` | frontend/src/api/auth.js | POST /auth/register çağırır. | `email: string`, `password: string` | `Promise<UserRead>` | 409 / 422 → `ApiError` |
| `loginUser` | frontend/src/api/auth.js | POST /auth/login çağırır; dönen jetonu `authSession` ile saklar. | `email: string`, `password: string` | `Promise<TokenResponse>` | 401 → `ApiError` |
| `logoutUser` | frontend/src/api/auth.js | POST /auth/logout çağırır; istek hata verirse bile jetonu siler. | — | `Promise<null>` | — |
| `getCurrentUser` | frontend/src/api/auth.js | GET /auth/me çağırır. | — | `Promise<UserRead>` | 401 → `ApiError` (jeton silinir) |

---

### `get_current_user`

- **Sorumlu kişi:** İçi 1. kişi tarafından gerçek giriş sistemiyle yazıldı; adı ve dönüş tipi altyapıyla aynı
- **Dosya:** backend/app/dependencies.py
- **Durum:** Tamamlandı

**Ne yapar?** İsteğin `Authorization: Bearer <jeton>` başlığındaki oturum jetonunu
`app/services/auth.py`'deki `get_user_by_token` ile doğrur ve kullanıcıyı döndürür.
Router'larda `current_user: CurrentUser` parametresiyle kullanılır. (Eskiden
seed'deki örnek kullanıcıyı döndürüyordu; herkesin router'ları değişmeden gerçek
girişe geçti.)

**Girdi:**

| Parametre | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `db` | `Session` | Evet | FastAPI `get_db` ile verir |
| `credentials` | `HTTPAuthorizationCredentials \| None` | Hayır | FastAPI `HTTPBearer` ile verir |

**Çıktı:** `User`

**Hata durumları:**

| Durum | Hata sınıfı | HTTP kodu |
|---|---|---|
| Jeton yok, imzasız, süresi dolmuş ya da kullanıcı silinmiş | `HTTPException` (içteki `UnauthorizedError`) | 401 |

