# Beyaz Takım Notlar

Google Keep benzeri bir not alma uygulaması. Kullanıcılar metin ve yapılacaklar
listesi türünde notlar oluşturabilecek, notları renklendirip sabitleyebilecek,
etiketleyebilecek, arşivleyip çöp kutusuna taşıyabilecek ve hatırlatıcı
kurabilecek.

> **Durum:** Altyapı hazır. Özellikler ekip üyeleri tarafından ekleniyor
> (bkz. [docs/fonksiyonlar.md](docs/fonksiyonlar.md)).

| Katman | Teknolojiler |
|---|---|
| Backend | Python 3.11+, FastAPI, SQLAlchemy, SQLite, Pydantic, pytest |
| Frontend | React (Vite), React Router, Framer Motion |

## Ekip

| Ad Soyad | GitHub | Rol | Sorumlu olduğu özellikler |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

## Kurulum

Gerekenler: **Python 3.11+**, **Node.js 22.22+** ve npm, Git.

### 1. Projeyi indirin

```bash
git clone https://github.com/buraksipahi058-svg/beyaztakim.git
cd beyaztakim
```

### 2. Ortam değişkenleri

Kök klasördeki `.env.example` dosyasını `.env` adıyla kopyalayın ve değerleri
doldurun. `.env` dosyası git'e gönderilmez.

```bash
cp .env.example .env
```

(Windows PowerShell: `Copy-Item .env.example .env`)

### 3. Backend

```bash
cd backend
python -m venv .venv
```

Sanal ortamı etkinleştirin:

- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
- macOS / Linux: `source .venv/bin/activate`

```bash
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

- API: <http://localhost:8000>
- Swagger dokümanı: <http://localhost:8000/docs>
- Sağlık kontrolü: <http://localhost:8000/health>

`python -m app.seed` örnek kullanıcıyı ve birkaç örnek notu ekler; tekrar
çalıştırmak güvenlidir.

### 4. Frontend

Yeni bir terminalde:

```bash
cd frontend
npm install
npm run dev
```

Uygulama: <http://localhost:5173>. Sağ üstteki gösterge backend'e bağlanıp
bağlanamadığını gösterir. Backend adresi `.env` dosyasındaki `VITE_API_URL`
ile değiştirilir.

## Testler

`backend` klasöründe, sanal ortam etkinken:

```bash
pytest
```

Kapsam (coverage) raporuyla birlikte (SonarCloud `coverage.xml` dosyasını okur):

```bash
pytest --cov=app --cov-report=xml --cov-report=term
```

Testler bellek içi SQLite kullanır; geliştirme veritabanınıza dokunmaz.

## Proje yapısı

```
backend/
  app/          FastAPI uygulaması (routers/, services/, models.py, ...)
  tests/        pytest testleri
frontend/
  src/          pages/, components/, api/
docs/           Fonksiyon sözleşmeleri ve veri modeli
AGENTS.md       Yapay zeka araçları ve ekip için kodlama kuralları
```

## Dokümanlar

- [Fonksiyonlar](docs/fonksiyonlar.md) — her fonksiyonun sorumlusu, girdisi, çıktısı ve hata durumları
- [Veri modeli](docs/veri-modeli.md) — tablolar ve ilişkileri
- [AGENTS.md](AGENTS.md) — kodlama kuralları

## Yapay Zeka Kullanımı

<!-- Hangi araçları, hangi işler için ve nasıl kullandığınızı buraya yazın. -->
