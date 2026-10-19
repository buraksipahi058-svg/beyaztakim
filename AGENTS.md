# Yapay Zeka ve Ekip Kuralları (AGENTS.md)

Bu dosya, projede kod yazan yapay zeka araçları (Claude, Copilot, Cursor, Codex
vb.) ve ekip üyeleri için kuralları içerir. Yapay zekaya iş verirken önce bu
dosyayı okumasını isteyin.

## Kurallar

1. **Önce dokümanları oku.** Kod yazmadan önce `docs/fonksiyonlar.md` ve
   `docs/veri-modeli.md` dosyalarını oku. Fonksiyon, alan ve tablo isimlerine,
   girdi/çıktı biçimlerine aynen uy.

2. **Yazdığın her fonksiyonu `docs/fonksiyonlar.md`'ye ekle.** Bu kural zorunludur:
   - **Kapsam:** Hangi klasörde olursa olsun yazılan her fonksiyon. Backend'de
     servis fonksiyonları, router uç noktaları, yardımcı fonksiyonlar; frontend'de
     `api/` fonksiyonları, React bileşenleri, bileşen içindeki yardımcı
     fonksiyonlar. Tek istisna: test dosyalarındaki test fonksiyonları ve fikstürler.
   - **Her kayıtta olması gerekenler:**
     - sorumlu kişi ve dosya,
     - ne yaptığı,
     - **girdi:** her parametrenin adı ve tipi (bileşenlerde props),
     - **çıktı:** dönüş tipi; uç noktaysa HTTP yöntemi, yolu ve yanıtı;
       bileşense ekranda ne gösterdiği,
     - **hata durumları:** hangi durumda hangi hata sınıfı ve HTTP kodu.
   - **Ne zaman:** Fonksiyonu eklediğin, adını/girdisini/çıktısını
     değiştirdiğin ya da sildiğin **aynı PR'da** belgeyi de güncelle.
     Belgeyle kodun uyuşmadığı PR onaylanmaz.
   - **Nereye:** Kendi bölümüne (1-5 arası). Ayrıntılı kayıt için dosyadaki
     şablonu, küçük yardımcı fonksiyonlar ve bileşenler için tablo satırını kullan.

3. **Sadece kendi dosyalarında çalış.** Kimin hangi dosyada çalıştığı aşağıdaki
   [Dosya sahipliği](#dosya-sahipliği) tablosunda; ayrıca her dosyanın başında
   `Sahibi: N. kişi` yazar. Kendi özelliğin için açtığın yeni dosyalar da
   senindir; başına aynı satırı ekle.

4. **Ortak dosyalara dokunma.** Liste: [Ortak dosyalar](#ortak-dosyalar).
   Gerçekten gerekiyorsa değişikliği ayrı bir PR'da yap ve nedenini PR
   açıklamasına yaz; bu PR'ı 4. kişi (altyapı sorumlusu) onaylamadan GitHub
   birleştirmeye izin vermez.

5. **Kullanıcıyı her zaman `get_current_user`'dan al.** Kullanıcı kimliğini
   istek gövdesinden, URL'den veya sabit bir değerden alma. Router'larda
   `current_user: CurrentUser` parametresini kullan.

6. **Katmanları ayır.** İş mantığı ve veritabanı sorguları
   `backend/app/services/<özellik>.py` içinde, HTTP katmanı
   `backend/app/routers/<özellik>.py` içinde olur. Router; girdiyi alır, servisi
   çağırır, sonucu döndürür. Girdi/çıktı şemaları `backend/app/schemas/<özellik>.py`
   içindedir.

7. **Her yeni fonksiyon için pytest ile birim testi yaz.** Testler
   `backend/tests/test_<özellik>.py` dosyasına yazılır ve `conftest.py`'deki
   fikstürleri kullanır. `pytest` hatasız geçmeden iş bitmiş sayılmaz.

8. **Gizli bilgileri koda yazma.** Anahtar, parola, token gibi değerler `.env`
   dosyasından `app/config.py` üzerinden okunur. Yeni bir ayar gerekiyorsa
   `.env.example`'a da (gerçek değer olmadan) eklenir.

9. **Sormadan yeni paket ekleme.** `requirements.txt` veya `package.json`'a
   paket eklemeden önce ekibe sor. Eklenen paketin sürümü sabit yazılır
   (`paket==1.2.3`, npm'de `^` olmadan).

10. **Hataları anlamlı HTTP kodlarıyla döndür.** Servislerde
    `app/services/errors.py`'deki sınıfları kullan:

    | Durum | Sınıf | Kod |
    |---|---|---|
    | Girdi iş kuralına uymuyor | `ValidationError` | 400 |
    | Giriş yapılmamış | (`get_current_user` verir) | 401 |
    | Yetki yok | `PermissionDeniedError` | 403 |
    | Kayıt yok ya da başka kullanıcının | `NotFoundError` | 404 |
    | Çakışma (ör. aynı isimde etiket) | `ConflictError` | 409 |
    | Şemaya uymayan istek | (FastAPI otomatik verir) | 422 |

    Her şeyi 200 veya 500 ile döndürme.

11. **Git kurallarına uy.** main'e doğrudan kod gönderilmez; her iş kendi
    branch'inde yapılır ve PR ile birleştirilir. Branch adı ve commit mesajı
    aşağıdaki kurallara uyar. Adım adım anlatım:
    [docs/githubkullanım.md](docs/githubkullanım.md).

## Branch ve commit kuralları

### Branch adı

```
<tür>/<kısa-açıklama>
```

| Tür | Ne zaman? |
|---|---|
| `feature` | Yeni özellik |
| `fix` | Hata düzeltme |
| `docs` | Sadece doküman |
| `test` | Sadece test |
| `refactor` | Davranışı değiştirmeden kodu düzenleme |
| `chore` | Altyapı, ayar, paket işleri |

- Küçük harf, kelimeler arasında tire, boşluk yok, 2-4 kelime.
- Türkçe karakter yok (ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c).
- Bir branch = bir iş. Birleşince silinir; yeni iş için yeni branch açılır.

Örnekler: `feature/arsiv-servisi`, `feature/giris-ekrani`,
`fix/etiket-silme-hatasi`, `docs/readme-arsiv-bolumu`

### Commit mesajı ve PR başlığı

```
<tür>(<kapsam>): <ne yapıldı>
```

| Parça | Değerler |
|---|---|
| tür | `feat` (yeni özellik), `fix`, `docs`, `test`, `refactor`, `chore` |
| kapsam | `auth`, `notes`, `tags`, `search`, `archive`, `trash`, `checklist`, `reminders`, `pin-color`, `infra` (ortak dosyalar) |
| ne yapıldı | Türkçe, küçük harfle başlar, sonda nokta yok, en fazla 72 karakter |

Örnekler:

```
feat(archive): notu arşivleme ve arşivden çıkarma eklendi
fix(tags): aynı isimde etiket oluşturulabilmesi düzeltildi
test(notes): not listeleme testleri eklendi
docs(archive): fonksiyonlar.md'ye arşiv fonksiyonları eklendi
chore(infra): pytest-cov sürümü güncellendi
```

PR'lar "Squash and merge" ile birleştirilir; main'e PR başlığı commit mesajı
olarak girer. Bu yüzden **PR başlığı da aynı kurala uyar**.

## Ortak dosyalar

Bu dosyalar herkesi etkiler. Sorumlusu 4. kişidir; değişiklikleri onun
onayı olmadan main'e giremez (`.github/CODEOWNERS`).

**Backend**

- `backend/app/main.py`, `config.py`, `database.py`, `models.py`, `seed.py`
- `backend/app/dependencies.py`: tek istisna, `get_current_user`'ın içini
  1. kişi değiştirir (adı ve dönüş tipi aynı kalır).
- `backend/app/schemas/__init__.py`, `backend/app/schemas/common.py`
- `backend/app/routers/__init__.py`, `backend/app/services/__init__.py`,
  `backend/app/services/errors.py`
- `backend/tests/conftest.py` ve altyapı testleri (`test_app_setup.py`,
  `test_config.py`, `test_dependencies.py`, `test_health.py`, `test_seed.py`)
- `backend/requirements.txt`, `backend/pyproject.toml`

**Frontend**

- `frontend/src/main.jsx`, `App.jsx`, `routes.js`, `index.css`
- `frontend/src/api/client.js`, `frontend/src/api/health.js`
- `frontend/src/components/`: `Layout.jsx`, `Layout.css`, `PageTransition.jsx`,
  `ApiStatus.jsx`, `EmptyState.jsx`, `Icon.jsx`, `noteColors.js`
- `frontend/src/pages/NotFoundPage.jsx`
- `frontend/package.json`, `package-lock.json`, `.npmrc`, `vite.config.js`,
  `index.html`, `public/`

**Kök ve dokümanlar**

- `AGENTS.md`, `.env.example`, `.gitignore`, `sonar-project.properties`, `.github/`
- `docs/veri-modeli.md`, `docs/githubkullanım.md`

`README.md` ve `docs/fonksiyonlar.md` herkes tarafından düzenlenir, ama
herkes yalnızca **kendi bölümünü** değiştirir.

## Dosya sahipliği

Yollar `backend/app/`, `backend/tests/` ve `frontend/src/` altındadır.

| Kişi | Backend | Frontend |
|---|---|---|
| **1. Kullanıcı ve Güvenlik** (`/auth`) | `routers/auth.py`, `services/auth.py`, `schemas/auth.py`, `tests/test_auth.py`, `dependencies.py` içindeki `get_current_user` | `pages/LoginPage.jsx`, `pages/RegisterPage.jsx`, `components/RequireAuth.jsx`, `components/UserMenu.jsx`, `api/auth.js`, `api/authSession.js` |
| **2. Not İşlemleri** (`/notes`) | `routers/notes.py`, `services/notes.py`, `schemas/notes.py`, `tests/test_notes.py` | `pages/HomePage.jsx`, `components/NoteCard.jsx`, `NoteCard.css`, `NoteGrid.jsx`, `NoteForm.jsx`, `api/notes.js`, `api/sampleNotes.js` |
| **3. Etiket ve Arama** (`/tags`, `/search`) | `routers/tags.py`, `services/tags.py`, `schemas/tags.py`, `tests/test_tags.py`, `routers/search.py`, `services/search.py`, `tests/test_search.py` | `pages/SearchPage.jsx`, `components/SearchBar.jsx`, `components/TagMenu.jsx`, `components/note-card/NoteTags.jsx` (+`.css`), `api/tags.js`, `api/search.js` |
| **4. Arşiv ve Çöp Kutusu** (`/archive`, `/trash`) | `routers/archive.py`, `services/archive.py`, `tests/test_archive.py`, `routers/trash.py`, `services/trash.py`, `tests/test_trash.py` | `pages/ArchivePage.jsx`, `pages/TrashPage.jsx`, `components/note-card/ArchiveTrashActions.jsx`, `api/archive.js`, `api/trash.js` |
| **5. Liste Notları, Hatırlatıcı, Sabitleme, Renk** (`/checklist`, `/reminders`, `/pin-color`) | `routers/`, `services/`, `schemas/` altında `checklist.py`, `reminders.py`, `pin_color.py`; `tests/test_checklist.py`, `test_reminders.py`, `test_pin_color.py` | `pages/RemindersPage.jsx`, `components/note-card/ChecklistItems.jsx` (+`.css`), `PinColorActions.jsx`, `ReminderChip.jsx`, `api/checklist.js`, `api/reminders.js`, `api/pinColor.js` |

Parantez içindekiler backend uç nokta önekleridir. Her router kendi önekini
kullanır; başka bir kişinin önekine uç nokta ekleme (`tests/test_app_setup.py`
öneklerin çakışmadığını kontrol eder).

### Kişilere ayrılmış yerler

Ortak dosyalara dokunmadan ekrana bir şey ekleyebilmen için ortak bileşenlerde
senin dosyanı çağıran boş yerler hazır:

| Yer | Dosya | Sahibi |
|---|---|---|
| Üst çubuk, ortadaki arama alanı | `components/SearchBar.jsx` | 3 |
| Üst çubuk, en sağ (kullanıcı / çıkış) | `components/UserMenu.jsx` | 1 |
| Sol menü, Hatırlatıcılar ile Arşiv arası (etiketler) | `components/TagMenu.jsx` | 3 |
| Menülü sayfaları koruyan giriş kontrolü | `components/RequireAuth.jsx` | 1 |
| Her API isteğine giriş bilgisinin eklenmesi | `api/authSession.js` | 1 |
| Ana sayfanın üstü (not ekleme formu) | `components/NoteForm.jsx` | 2 |
| Not kartı: liste maddeleri | `components/note-card/ChecklistItems.jsx` | 5 |
| Not kartı: hatırlatıcı | `components/note-card/ReminderChip.jsx` | 5 |
| Not kartı: etiket rozetleri | `components/note-card/NoteTags.jsx` | 3 |
| Not kartı alt çubuğu: sabitleme ve renk düğmeleri | `components/note-card/PinColorActions.jsx` | 5 |
| Not kartı alt çubuğu: arşiv ve çöp düğmeleri | `components/note-card/ArchiveTrashActions.jsx` | 4 |

Not kartındaki her yer aynı bilgileri alır:

| Prop | Anlamı |
|---|---|
| `note` | Gösterilen not (backend'deki `NoteRead` ile aynı alanlar) |
| `onNoteChange(guncelNot)` | Not değişince (ör. renk, sabitleme) güncel notla çağır; liste güncellenir |
| `onNoteRemove(noteId)` | Not bu listeden çıkınca (ör. arşivlendi, çöpe taşındı) çağır; kart kaybolur |

Ana sayfa, notlar API'si yazılana kadar örnek veriyle çalışır; düğmelerini
API'yi beklemeden bu örnek notlar üzerinde deneyebilirsin.

## Dil

- Kod tanımlayıcıları (değişken, fonksiyon, sınıf, dosya adları) **İngilizce**.
- Yorumlar, docstring'ler, dokümanlar ve kullanıcıya gösterilen metinler **Türkçe**.

## Proje haritası

```
backend/app/
  main.py          FastAPI uygulaması, CORS, /health (ortak)
  config.py        .env'den okunan ayarlar (ortak)
  database.py      SQLite bağlantısı, Base, get_db (ortak)
  models.py        Tablolar (ortak), bkz. docs/veri-modeli.md
  dependencies.py  get_current_user, DbSession, CurrentUser (ortak)
  seed.py          Örnek veri betiği (ortak)
  schemas/         common.py ortak okuma şemaları + her özelliğin kendi dosyası
  routers/         HTTP katmanı, her özellik bir dosya (otomatik yüklenir)
  services/        İş mantığı, her özellik bir dosya; errors.py ortak hatalar
backend/tests/     pytest testleri; conftest.py bellek içi SQLite kurar
frontend/src/
  api/             client.js (ortak) + her özelliğin kendi dosyası
  components/      Ortak bileşenler + kişilere ayrılmış yerler
  components/note-card/  Not kartındaki kişilere ayrılmış yerler
  pages/           Sayfalar, her sayfa bir dosya (otomatik eklenir)
  routes.js        pages/ klasöründeki sayfaları otomatik bulur
docs/              fonksiyonlar.md, veri-modeli.md, githubkullanım.md
```

## Nasıl yapılır?

### Backend'e yeni fonksiyon eklemek

1. `docs/fonksiyonlar.md`'de kendi bölümüne fonksiyonun kaydını yaz.
2. Gerekirse kendi şema dosyana girdi/çıktı şemasını ekle
   (ör. `app/schemas/notes.py` içinde `NoteCreate`).
3. Kendi servis dosyana iş mantığını yaz:

   ```python
   from sqlalchemy import select
   from sqlalchemy.orm import Session

   from app.models import Note, User
   from app.services.errors import NotFoundError


   def get_note(db: Session, user: User, note_id: int) -> Note:
       """Kullanıcının notunu döndürür."""
       note = db.scalar(select(Note).where(Note.id == note_id, Note.user_id == user.id))
       if note is None:
           raise NotFoundError("Not bulunamadı.")
       return note
   ```

4. Kendi router dosyana uç noktayı yaz. `router` zaten tanımlı; `main.py`
   onu otomatik ekler:

   ```python
   from app.dependencies import CurrentUser, DbSession
   from app.schemas import NoteRead
   from app.services import notes as notes_service


   @router.get("/{note_id}", response_model=NoteRead)
   def read_note(note_id: int, db: DbSession, current_user: CurrentUser):
       """Tek bir notu döndürür."""
       return notes_service.get_note(db, current_user, note_id)
   ```

5. Kendi test dosyanda servisi `db_session` ve `seed_user` fikstürleriyle,
   uç noktayı `client` fikstürüyle test et.

### Frontend'e yeni sayfa eklemek

`src/pages/<Ad>Page.jsx` dosyası aç, bileşeni `default export` et ve `route`
bilgisini ekle. Sayfa menüye ve yönlendirmeye otomatik eklenir; `App.jsx` ve
`Layout.jsx`'e dokunma. Alanlar `src/routes.js`'in başında açıklanmıştır.

```jsx
// Sahibi: 3. kişi (Etiket ve Arama)
export default function TagEditPage() {
  return <p>...</p>;
}

TagEditPage.route = { path: '/tags/edit', inMenu: false };
```

### Backend'i çağırmak

Kendi `src/api/<özellik>.js` dosyanda `apiRequest` kullan. Backend adresini
başka yerde yazma, `fetch`'i doğrudan çağırma:

```js
import { apiRequest } from './client.js';

export function archiveNote(noteId) {
  return apiRequest(`/archive/${noteId}`, { method: 'POST' });
}
```
