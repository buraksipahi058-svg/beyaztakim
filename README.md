# Beyaz Takım Notlar

Google Keep benzeri bir not alma uygulaması. Kullanıcılar metin ve yapılacaklar
listesi türünde notlar oluşturabilecek, notları renklendirip sabitleyebilecek,
etiketleyebilecek, arşivleyip çöp kutusuna taşıyabilecek ve hatırlatıcı
kurabilecek.

> **Durum:** Altyapı hazır, özellikler henüz yazılmadı. Her ekip üyesi kendi
> özelliğini ayrı dosyalarda ekliyor. Kimin neyi yazdığı
> [docs/fonksiyonlar.md](docs/fonksiyonlar.md) dosyasında takip edilir.

## Şu an ne hazır, ne değil?

| Hazır (altyapı) | Henüz yok (ekip yazacak) |
|---|---|
| Veritabanı tabloları: kullanıcı, not, etiket, kontrol listesi maddesi | Not oluşturma, listeleme, düzenleme, silme API'si |
| FastAPI uygulaması, `/health`, Swagger dokümanı (`/docs`) | Etiketler, kontrol listesi, renk, sabitleme |
| Örnek veri betiği (seed): 1 kullanıcı, 4 not | Arşiv, çöp kutusu, hatırlatıcılar |
| Geçici "giriş yapmış kullanıcı" (`get_current_user`) | Kayıt ve giriş (gerçek kimlik doğrulama) |
| Test altyapısı ve altyapı testleri | SonarCloud ve otomatik test (CI) bağlantısı |
| Frontend iskeleti: sol menü, sayfa geçiş animasyonu, animasyonlu not kartları, API bağlantı göstergesi | Frontend'in gerçek verilerle çalışması |

Uygulamayı açtığınızda göreceğiniz şeyler hakkında:

- **Ana sayfadaki notlar sabit örnek veridir.** `frontend/src/api/sampleNotes.js`
  dosyasından gelir, veritabanından gelmez. Notları getiren API yazılınca bu
  dosya silinecek.
- **Arşiv ve Çöp Kutusu sayfaları boştur.** Bu özelliklerin sahipleri
  dolduracak.
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

| Ad Soyad | GitHub | Rol | Sorumlu olduğu özellikler |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

## Kurulum

Gerekenler: **Python 3.11+**, **Node.js 22.22+** ve npm, Git.
Sürümleri `python --version` ve `node --version` ile kontrol edebilirsiniz.

### 1. Projeyi indirin

Repo private'tır. Klonlayabilmek için repo sahibinin sizi GitHub'da
**Settings → Collaborators** bölümünden eklemesi ve sizin daveti kabul etmeniz
gerekir.

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
  alır, servisi çağırır, sonucu döndürür.
- **Servisler** (`backend/app/services/`) iş mantığını ve veritabanı
  sorgularını içerir. FastAPI'ye bağımlı değildir, bu yüzden doğrudan test
  edilebilir.
- **Giriş yapmış kullanıcı** her zaman `get_current_user` fonksiyonundan alınır
  (`backend/app/dependencies.py`). Şimdilik seed'deki örnek kullanıcıyı
  döndürür. Giriş sistemi yazıldığında yalnızca bu fonksiyonun içi değişecek,
  onu kullanan kodlar aynı kalacak.
- **Otomatik ekleme:** Ortak dosyaları değiştirmeden özellik eklenebilsin diye:
  - `backend/app/routers/` altına eklenen ve içinde `router` tanımlı her dosya
    uygulamaya otomatik eklenir. `main.py`'ye dokunmak gerekmez.
  - `frontend/src/pages/` altına eklenen ve `route` bilgisi olan her sayfa sol
    menüye ve yönlendirmeye otomatik eklenir. `App.jsx` ve `Layout`'a dokunmak
    gerekmez.
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

## Geliştirme akışı

Yeni bir özellik eklerken:

1. `docs/fonksiyonlar.md`'de ilgili bölüme fonksiyonunuzu şablona göre yazın
   (sorumlu kişi, ne yaptığı, girdi, çıktı, hata durumları).
2. Gerekiyorsa `backend/app/schemas.py`'ye girdi/çıktı şemalarını ekleyin.
3. İş mantığını `backend/app/services/<özellik>.py` içine yazın.
4. Uç noktayı `backend/app/routers/<özellik>.py` içine yazın.
5. Testini `backend/tests/test_<özellik>.py` içine yazın ve `pytest`'in
   hatasız geçtiğini görün.
6. Frontend tarafında backend çağrılarını `frontend/src/api/<özellik>.js`,
   sayfayı `frontend/src/pages/<Ad>Page.jsx` içine yazın.

Ortak dosyalara (`main.py`, `models.py`, `dependencies.py`, `App.jsx`,
`Layout`) dokunmanız gerekiyorsa önce ekibe haber verin.

Kod örnekleri ve tüm kurallar [AGENTS.md](AGENTS.md)'de. Yapay zeka aracı
kullanıyorsanız ondan önce bu dosyayı okumasını isteyin.

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

## Proje yapısı

```
backend/
  app/
    main.py          Uygulama, CORS, /health
    config.py        .env'den okunan ayarlar
    database.py      SQLite bağlantısı
    models.py        Tablolar
    schemas.py       API girdi/çıktı şemaları
    dependencies.py  get_current_user
    seed.py          Örnek veri betiği
    routers/         Uç noktalar (her özellik bir dosya)
    services/        İş mantığı (her özellik bir dosya) + errors.py
  tests/             pytest testleri
frontend/
  src/
    api/             Backend çağrıları; client.js backend adresini tek yerden okur
    components/      Ortak bileşenler (Layout, NoteCard, NoteGrid, ...)
    pages/           Sayfalar (her sayfa bir dosya, menüye otomatik eklenir)
docs/                Fonksiyon sözleşmeleri ve veri modeli
AGENTS.md            Ekip ve yapay zeka araçları için kodlama kuralları
```

## Dokümanlar

- [Fonksiyonlar](docs/fonksiyonlar.md): her fonksiyonun sorumlusu, girdisi, çıktısı ve hata durumları
- [Veri modeli](docs/veri-modeli.md): tablolar ve ilişkileri
- [AGENTS.md](AGENTS.md): kodlama kuralları ve kod örnekleri

## Yapay Zeka Kullanımı

<!-- Hangi araçları, hangi işler için ve nasıl kullandığınızı buraya yazın. -->
