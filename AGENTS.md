# Yapay Zeka Kuralları (AGENTS.md)

Bu dosya, projede kod yazan yapay zeka araçları (Claude, Copilot, Cursor, Codex
vb.) ve ekip üyeleri için kuralları içerir. Yapay zekaya iş verirken bu dosyayı
okumasını isteyin.

## Kurallar

1. **Önce dokümanları oku.** Kod yazmadan önce `docs/fonksiyonlar.md` ve
   `docs/veri-modeli.md` dosyalarını oku. Fonksiyon, alan ve tablo isimlerine,
   girdi/çıktı biçimlerine aynen uy. Belgede olmayan bir fonksiyon yazılacaksa
   önce belgeye eklenmelidir.
2. **Sadece istenen dosyayı değiştir.** Ortak dosyalara gerekmedikçe dokunma:
   - `backend/app/main.py`
   - `backend/app/models.py`
   - `backend/app/dependencies.py`
   - `frontend/src/App.jsx`
   - `frontend/src/components/Layout.jsx` (ve `Layout.css`)

   Bunlara dokunmak gerekiyorsa değişikliği önce açıkla ve neden gerektiğini yaz.
3. **Kullanıcıyı her zaman `get_current_user`'dan al.** Kullanıcı kimliğini
   istek gövdesinden, URL'den veya sabit bir değerden alma.
4. **Katmanları ayır.** İş mantığı `backend/app/services/` içinde, HTTP katmanı
   `backend/app/routers/` içinde olur. Router; girdiyi alır, servisi çağırır,
   sonucu döndürür. Veritabanı sorguları ve kurallar servistedir.
5. **Her yeni fonksiyon için pytest ile birim testi yaz.** Testler
   `backend/tests/test_<özellik>.py` dosyasına yazılır ve `conftest.py`'deki
   fikstürleri kullanır. `pytest` hatasız geçmeden iş bitmiş sayılmaz.
6. **Gizli bilgileri koda yazma.** Anahtar, parola, token gibi değerler `.env`
   dosyasından `app/config.py` üzerinden okunur. Yeni bir ayar gerekiyorsa
   `.env.example` dosyasına da (gerçek değer olmadan) eklenir.
7. **Sormadan yeni paket ekleme.** `requirements.txt` veya `package.json`'a
   paket eklemeden önce ekibe sor. Eklenen paketin sürümü sabit yazılır
   (`paket==1.2.3`, npm'de `^` olmadan).
8. **Hataları anlamlı HTTP kodlarıyla döndür.** Servislerde
   `app/services/errors.py`'deki sınıfları kullan:

   | Durum | Sınıf | Kod |
   |---|---|---|
   | Girdi iş kuralına uymuyor | `ValidationError` | 400 |
   | Giriş yapılmamış | (`get_current_user` verir) | 401 |
   | Yetki yok | `PermissionDeniedError` | 403 |
   | Kayıt yok / başka kullanıcının | `NotFoundError` | 404 |
   | Çakışma (ör. aynı isimde etiket) | `ConflictError` | 409 |
   | Şemaya uymayan istek | (FastAPI otomatik verir) | 422 |

   Her şeyi 200 veya 500 ile döndürme.

## Dil

- Kod tanımlayıcıları (değişken, fonksiyon, sınıf, dosya adları) **İngilizce**.
- Yorumlar, docstring'ler, dokümanlar ve kullanıcıya gösterilen metinler **Türkçe**.

## Proje haritası

```
backend/app/
  main.py          FastAPI uygulaması, CORS, /health (ortak)
  config.py        .env'den okunan ayarlar
  database.py      SQLite bağlantısı, Base, get_db
  models.py        Tablolar (ortak) — bkz. docs/veri-modeli.md
  schemas.py       Pydantic şemaları
  dependencies.py  get_current_user, DbSession, CurrentUser (ortak)
  seed.py          Örnek veri betiği
  routers/         HTTP katmanı — her özellik bir dosya
  services/        İş mantığı — her özellik bir dosya; errors.py ortak hatalar
backend/tests/     pytest testleri; conftest.py bellek içi SQLite kurar
frontend/src/
  api/             client.js (backend adresi tek yerde) + özellik başına bir dosya
  components/      Ortak bileşenler (Layout, NoteCard, NoteGrid, ...)
  pages/           Sayfalar — her sayfa bir dosya, menüye otomatik eklenir
  routes.js        pages/ klasöründeki sayfaları otomatik bulur
docs/              fonksiyonlar.md, veri-modeli.md
```

## Nasıl yapılır?

### Backend'e yeni özellik eklemek

1. `docs/fonksiyonlar.md`'ye fonksiyonun sözleşmesini yaz.
2. Gerekirse `app/schemas.py`'ye girdi/çıktı şemalarını ekle (ör. `NoteCreate`).
3. `app/services/<özellik>.py` içinde iş mantığını yaz:

   ```python
   from sqlalchemy import select
   from sqlalchemy.orm import Session

   from app.models import Note, User
   from app.services.errors import NotFoundError


   def get_note(db: Session, user: User, note_id: int) -> Note:
       note = db.scalar(select(Note).where(Note.id == note_id, Note.user_id == user.id))
       if note is None:
           raise NotFoundError("Not bulunamadı.")
       return note
   ```

4. `app/routers/<özellik>.py` içinde uç noktayı yaz. Dosyada `router` adlı bir
   `APIRouter` olması yeterli; `main.py` onu otomatik ekler:

   ```python
   from fastapi import APIRouter

   from app.dependencies import CurrentUser, DbSession
   from app.schemas import NoteRead
   from app.services import notes as notes_service

   router = APIRouter(prefix="/notes", tags=["notlar"])


   @router.get("/{note_id}", response_model=NoteRead)
   def read_note(note_id: int, db: DbSession, current_user: CurrentUser):
       return notes_service.get_note(db, current_user, note_id)
   ```

5. `tests/test_<özellik>.py` içinde servis fonksiyonunu `db_session` ve
   `seed_user` fikstürleriyle, uç noktayı `client` fikstürüyle test et.

### Frontend'e yeni sayfa eklemek

1. `src/pages/<Ad>Page.jsx` dosyası aç, bileşeni `default export` et ve
   `route` bilgisini ekle. Sayfa menüye ve yönlendirmeye otomatik eklenir;
   `App.jsx` ve `Layout.jsx`'e dokunma:

   ```jsx
   export default function RemindersPage() {
     return <p>...</p>;
   }

   RemindersPage.route = { path: '/reminders', title: 'Hatırlatıcılar', icon: 'bell', order: 2 };
   ```

2. Backend çağrılarını `src/api/<özellik>.js` dosyasında `apiRequest` ile yaz.
   Backend adresini başka yerde yazma; `fetch` adresini elle oluşturma.
