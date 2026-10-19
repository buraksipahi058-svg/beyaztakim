# Beyaz Takım Notlar

Google Keep benzeri bir not alma uygulaması. Kullanıcılar metin ve yapılacaklar
listesi türünde notlar oluşturabilecek, notları renklendirip sabitleyebilecek,
etiketleyebilecek, arşivleyip çöp kutusuna taşıyabilecek ve hatırlatıcı
kurabilecek.

> **Durum:** Altyapı hazır, özellikler henüz yazılmadı. Her ekip üyesinin
> kendi boş dosyaları ve ekranda kendine ayrılmış yerleri hazır; herkes kendi
> özelliğini kendi branch'inde yazıp PR ile ekliyor. Kimin neyi yazdığı
> [docs/fonksiyonlar.md](docs/fonksiyonlar.md) dosyasında takip edilir.

## Şu an ne hazır, ne değil?

| Hazır (altyapı) | Henüz yok (ekip yazacak) |
|---|---|
| Veritabanı tabloları: kullanıcı, not, etiket, kontrol listesi maddesi | Not oluşturma, listeleme, düzenleme API'si |
| FastAPI uygulaması, `/health`, Swagger dokümanı (`/docs`) | Etiketler ve arama |
| Örnek veri betiği (seed): 1 kullanıcı, 4 not | Arşiv ve çöp kutusu |
| Geçici "giriş yapmış kullanıcı" (`get_current_user`) | Kayıt ve giriş (gerçek kimlik doğrulama) |
| Test altyapısı ve altyapı testleri | Liste maddeleri, hatırlatıcılar, sabitleme, renk |
| Frontend iskeleti: sol menü, sayfa geçiş animasyonu, animasyonlu not kartları, API bağlantı göstergesi | Frontend'in gerçek verilerle çalışması |
| Her kişinin boş dosyaları; üst çubukta, sol menüde ve not kartında kişilere ayrılmış yerler | SonarCloud ve otomatik test (CI) bağlantısı |
| Korumalı main branch'i ve PR ile çalışma düzeni | |

Uygulamayı açtığınızda göreceğiniz şeyler hakkında:

- **Ana sayfadaki notlar sabit örnek veridir.** `frontend/src/api/sampleNotes.js`
  dosyasından gelir, veritabanından gelmez. Notları getiren API yazılınca bu
  dosya silinecek.
- **Hatırlatıcılar, Arşiv ve Çöp Kutusu sayfaları boştur.** Giriş (`/login`),
  kayıt (`/register`) ve arama (`/search`) sayfaları da yer tutucudur.
- **Giriş sistemi yoktur.** Backend'e gelen her istek seed'deki örnek kullanıcı
  adına yapılmış sayılır (bkz. [Mimari](#mimari)).

## Teknolojiler

| Katman | Teknolojiler |
|---|---|
| Backend | Python 3.11+, FastAPI 0.143, SQLAlchemy 2.1, SQLite, Pydantic 2, pytest |
| Frontend | React 19, Vite 8, React Router 8, Framer Motion 14 |

Paket sürümleri sabittir (`backend/requirements.txt`, `frontend/package.json`).
Yeni paket eklemeden önce ekibe sorun.

## Ekip

| Ad Soyad | GitHub | Görev |
|---|---|---|
| | | 1. Kullanıcı ve Güvenlik |
| | | 2. Not İşlemleri |
| | | 3. Etiket ve Arama |
| | | 4. Altyapı, Arşiv ve Çöp Kutusu |
| | | 5. Liste Notları, Hatırlatıcı, Sabitleme, Renk |

## Kurulum

Gerekenler: **Python 3.11+**, **Node.js 22.22+** ve npm, Git.
Sürümleri `python --version` ve `node --version` ile kontrol edebilirsiniz.

> Git'i hiç kullanmadıysanız önce [GitHub Kullanım Rehberi](docs/githubkullanım.md)'nin
> "Bir kerelik kurulum" bölümünü okuyun.

### 1. Projeyi indirin

Repo herkese açıktır, herkes indirebilir. Kod gönderebilmek için ise
collaborator olarak eklenmiş olmanız ve daveti kabul etmeniz gerekir.

```bash
git clone https://github.com/buraksipahi058-svg/beyaztakim.git
cd beyaztakim
```

### 2. Ortam değişkenleri

Kök klasördeki `.env.example` dosyasını `.env` adıyla kopyalayın. Hem backend
hem frontend ayarlarını bu tek dosyadan okur. `.env` git'e gönderilmez;
gizli bilgiler yalnızca orada durur.

```bash
cp .env.example .env
```

(Windows PowerShell: `Copy-Item .env.example .env`)

Varsayılan değerlerle çalışır. `SECRET_KEY` şimdilik kullanılmıyor; giriş
sistemi eklenince rastgele bir değerle doldurulmalı (nasıl üretileceği
dosyadaki açıklamada yazıyor).

### 3. Backend

```bash
cd backend
python -m venv .venv
```

Sanal ortamı etkinleştirin:

- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
- Windows (cmd): `.venv\Scripts\activate.bat`
- macOS / Linux: `source .venv/bin/activate`

```bash
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

- API: <http://localhost:8000>
- Swagger dokümanı (tüm uç noktaları tarayıcıdan deneyebilirsiniz): <http://localhost:8000/docs>
- Sağlık kontrolü: <http://localhost:8000/health>

**Örnek veri:** `python -m app.seed`, `demo@beyaztakim.local` adresli örnek
kullanıcıyı, 2 etiketi ve 4 notu veritabanına ekler. Tekrar çalıştırmak
güvenlidir, aynı kayıtları ikinci kez eklemez. Kullanıcının adresi ve parolası
`.env`'deki `SEED_USER_EMAIL` ve `SEED_USER_PASSWORD` ile değiştirilebilir.
Parola boşsa rastgele üretilir; giriş sistemi olmadığı için şimdilik gerekmez.

Veritabanı dosyası `backend/beyaztakim.db`'dir. Tablolar backend açılırken
otomatik oluşturulur.

### 4. Frontend

Backend açıkken yeni bir terminalde:

```bash
cd frontend
npm install
npm run dev
```

Uygulama: <http://localhost:5173>. Sağ üstte **API bağlı** yazıyorsa frontend
backend'e ulaşabiliyor demektir.

## Mimari

Bir isteğin yolu:

```
React sayfası ─► src/api/<özellik>.js ─► HTTP ─► routers/<özellik>.py ─► services/<özellik>.py ─► models.py ─► SQLite
```

- **Router'lar** (`backend/app/routers/`) yalnızca HTTP işini yapar: girdiyi
  alır, servisi çağırır, sonucu döndürür. Her özelliğin kendi uç nokta öneki
  vardır (`/notes`, `/tags`, `/archive` ...).
- **Servisler** (`backend/app/services/`) iş mantığını ve veritabanı
  sorgularını içerir. FastAPI'ye bağımlı değildir, bu yüzden doğrudan test
  edilebilir.
- **Şemalar** (`backend/app/schemas/`): `common.py` herkesin kullandığı okuma
  şemalarıdır (`NoteRead` vb.); her özelliğin girdi şemaları kendi dosyasındadır.
- **Giriş yapmış kullanıcı** her zaman `get_current_user` fonksiyonundan alınır
  (`backend/app/dependencies.py`). Şimdilik seed'deki örnek kullanıcıyı
  döndürür. Giriş sistemi yazıldığında yalnızca bu fonksiyonun içi değişecek,
  onu kullanan kodlar aynı kalacak. Frontend tarafında giriş bilgisi
  `api/authSession.js` üzerinden her isteğe eklenir, menülü sayfalar
  `RequireAuth` ile korunur.
- **Otomatik ekleme:** Ortak dosyaları değiştirmeden özellik eklenebilsin diye:
  - `backend/app/routers/` altındaki her dosyanın `router`'ı uygulamaya
    otomatik eklenir. `main.py`'ye dokunmak gerekmez.
  - `frontend/src/pages/` altındaki ve `route` bilgisi olan her sayfa
    yönlendirmeye ve (istenirse) sol menüye otomatik eklenir. `App.jsx` ve
    `Layout`'a dokunmak gerekmez.
- **Kişilere ayrılmış yerler:** Üst çubuk (arama, kullanıcı menüsü), sol menü
  (etiketler) ve not kartı (etiket rozetleri, liste maddeleri, hatırlatıcı,
  sabitleme/renk ve arşiv/çöp düğmeleri) sahiplerinin dosyalarını çağırır.
  Liste: [AGENTS.md > Kişilere ayrılmış yerler](AGENTS.md#kişilere-ayrılmış-yerler).
- **Hatalar:** Servisler `app/services/errors.py`'deki sınıfları fırlatır,
  bunlar otomatik olarak HTTP koduna çevrilir:

  | Durum | Kod |
  |---|---|
  | Girdi iş kuralına uymuyor (`ValidationError`) | 400 |
  | Giriş yapmış kullanıcı bulunamadı | 401 |
  | Yetki yok (`PermissionDeniedError`) | 403 |
  | Kayıt yok ya da başka kullanıcının (`NotFoundError`) | 404 |
  | Çakışma, ör. aynı isimde etiket (`ConflictError`) | 409 |
  | İstek gövdesi şemaya uymuyor (FastAPI) | 422 |

Tabloların ayrıntısı: [docs/veri-modeli.md](docs/veri-modeli.md).

## Ekip çalışması

### Kurallar

- **main korumalıdır.** Kimse main'e doğrudan kod gönderemez. Her iş kendi
  branch'inde yapılır ve Pull Request (PR) ile birleştirilir.
- **Her PR'ı en az 1 arkadaş onaylar.** Ortak dosyalara dokunan PR'ı ayrıca
  4. kişi onaylar (GitHub bunu otomatik ister).
- **Herkes sadece kendi dosyalarında çalışır.** Kimin hangi dosyası olduğu ve
  ortak dosyaların listesi: [AGENTS.md](AGENTS.md#dosya-sahipliği).
- **Yazılan her fonksiyon** (backend ve frontend) girdisi, çıktısı ve hata
  durumlarıyla birlikte aynı PR'da [docs/fonksiyonlar.md](docs/fonksiyonlar.md)'ye eklenir.
- PR'lar **"Squash and merge"** ile birleştirilir.

Git ve GitHub'ı adım adım (kurulum, branch açma, PR, inceleme, birleştirme,
çakışma çözme) anlatan rehber: **[docs/githubkullanım.md](docs/githubkullanım.md)**

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

Küçük harf, kelimeler arasında tire, Türkçe karakter yok, 2-4 kelime.
Örnekler: `feature/arsiv-servisi`, `feature/giris-ekrani`, `fix/etiket-silme-hatasi`

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
```

PR başlığı da aynı biçimde yazılır; main'e o başlıkla girer.

## Geliştirme akışı

Yeni bir özellik eklerken:

1. main'i güncelleyip kendi branch'ini aç (ör. `feature/arsiv-servisi`).
2. `docs/fonksiyonlar.md`'de kendi bölümüne fonksiyonunu yaz (ne yaptığı,
   girdi, çıktı, hata durumları).
3. Gerekiyorsa girdi/çıktı şemalarını kendi dosyana ekle
   (`backend/app/schemas/<özellik>.py`).
4. İş mantığını `backend/app/services/<özellik>.py` içine yaz.
5. Uç noktayı `backend/app/routers/<özellik>.py` içine yaz.
6. Testini `backend/tests/test_<özellik>.py` içine yaz ve `pytest`'in
   hatasız geçtiğini gör.
7. Frontend'de backend çağrılarını `frontend/src/api/<özellik>.js`, ekranı
   kendi sayfana ya da sana ayrılmış yere yaz; `npm run dev` ile dene.
8. Commit at, branch'ini gönder, PR aç ve bir arkadaşını inceleyici seç.

Kod örnekleri ve tüm kurallar [AGENTS.md](AGENTS.md)'de. Yapay zeka aracı
kullanıyorsanız ondan önce bu dosyayı okumasını isteyin.

## Özellikler

Her kişi kendi özelliğini bitirdiğinde kendi başlığının altını doldurur:
özelliğin ne yaptığı, nasıl kullanıldığı, varsa ekran görüntüsü. Başkasının
başlığını değiştirmeyin.

### 1. Kullanıcı ve Güvenlik

<!-- 1. kişi doldurur. -->

### 2. Not İşlemleri

<!-- 2. kişi doldurur. -->

### 3. Etiket ve Arama

<!-- 3. kişi doldurur. -->

### 4. Arşiv ve Çöp Kutusu

<!-- 4. kişi doldurur. -->

### 5. Liste Notları, Hatırlatıcı, Sabitleme, Renk

<!-- 5. kişi doldurur. -->

## Testler

`backend` klasöründe, sanal ortam etkinken:

```bash
pytest
```

Kapsam (coverage) raporuyla birlikte:

```bash
pytest --cov=app --cov-report=xml --cov-report=term
```

Testler her seferinde bellek içinde boş bir SQLite veritabanı kurar;
`backend/beyaztakim.db` dosyanıza dokunmaz. Hazır fikstürler
(`backend/tests/conftest.py`):

| Fikstür | Ne verir |
|---|---|
| `db_session` | Boş tablolu veritabanı oturumu |
| `seed_user` | Örnek verileri yükler, örnek kullanıcıyı döndürür |
| `client` | Test veritabanına bağlı HTTP istemcisi (`client.get("/health")`) |

SonarCloud bağlantısı henüz kurulmadı. Kurulduğunda bu `coverage.xml` raporunu
kullanacak; ayarlar `sonar-project.properties` dosyasında.

## Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|---|---|
| PowerShell'de `Activate.ps1` "running scripts is disabled" hatası veriyor | Aynı terminalde bir kez `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` çalıştırın, sonra tekrar etkinleştirin. Ya da cmd'de `activate.bat` kullanın. |
| Sağ üstte **API bağlantısı yok** yazıyor | Backend çalışmıyor ya da `.env`'deki `VITE_API_URL` yanlış. `.env`'i değiştirdikten sonra `npm run dev`'i yeniden başlatın. |
| API 401 dönüyor: "Giriş yapmış kullanıcı bulunamadı" | Seed çalıştırılmamış: `python -m app.seed` |
| Tarayıcı konsolunda CORS hatası | Frontend başka bir adreste çalışıyor. Adresi `.env`'deki `CORS_ORIGINS`'e ekleyip backend'i yeniden başlatın. |
| `models.py` değişti, uygulama hata veriyor | Tablolar yalnızca yoksa oluşturulur, var olanlar güncellenmez. `backend/beyaztakim.db` dosyasını silip `python -m app.seed` çalıştırın. |
| `npm install` ya da `npm run dev` hata veriyor | Node sürümünüz 22.22'den eski olabilir: `node --version` |
| Port 8000 ya da 5173 kullanımda | Diğer terminaldeki eski sunucuyu kapatın (`Ctrl+C`). |
| `git push` reddedildi: "protected branch" | main'e doğrudan gönderdiniz. [Rehberdeki çözüm](docs/githubkullanım.md#8-sık-karşılaşılan-sorunlar) |

## Proje yapısı

```
backend/
  app/
    main.py          Uygulama, CORS, /health
    config.py        .env'den okunan ayarlar
    database.py      SQLite bağlantısı
    models.py        Tablolar
    dependencies.py  get_current_user
    seed.py          Örnek veri betiği
    schemas/         common.py (ortak) + her özelliğin şemaları
    routers/         Uç noktalar (her özellik bir dosya)
    services/        İş mantığı (her özellik bir dosya) + errors.py
  tests/             pytest testleri (her özellik bir dosya)
frontend/
  src/
    api/             Backend çağrıları; client.js backend adresini tek yerden okur
    components/      Ortak bileşenler ve kişilere ayrılmış yerler
      note-card/     Not kartındaki kişilere ayrılmış yerler
    pages/           Sayfalar (her sayfa bir dosya, otomatik eklenir)
docs/                Fonksiyonlar, veri modeli, GitHub rehberi
.github/             PR şablonu ve ortak dosyaların sahibi (CODEOWNERS)
AGENTS.md            Ekip ve yapay zeka araçları için kurallar
```

## Dokümanlar

- [Fonksiyonlar](docs/fonksiyonlar.md): her fonksiyonun sorumlusu, girdisi, çıktısı ve hata durumları
- [Veri modeli](docs/veri-modeli.md): tablolar ve ilişkileri
- [GitHub Kullanım Rehberi](docs/githubkullanım.md): branch, commit, PR, inceleme, birleştirme adım adım
- [AGENTS.md](AGENTS.md): kurallar, ortak dosyalar, dosya sahipliği ve kod örnekleri

## Yapay Zeka Kullanımı

<!-- Hangi araçları, hangi işler için ve nasıl kullandığınızı buraya yazın. -->
