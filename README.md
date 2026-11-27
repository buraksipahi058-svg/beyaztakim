# Beyaz Takım Notlar

[![CI](https://github.com/buraksipahi058-svg/beyaztakim/actions/workflows/ci.yml/badge.svg)](https://github.com/buraksipahi058-svg/beyaztakim/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=buraksipahi058-svg_beyaztakim&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=buraksipahi058-svg_beyaztakim)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=buraksipahi058-svg_beyaztakim&metric=coverage)](https://sonarcloud.io/summary/new_code?id=buraksipahi058-svg_beyaztakim)

Google Keep benzeri bir not alma uygulaması. Kullanıcılar hesap açıp giriş
yapar; metin ve yapılacaklar listesi türünde notlar oluşturur, notları
renklendirip sabitler, etiketler, arar, hatırlatıcı kurar, arşivler ve çöp
kutusuna taşır.

## Özellik durumu

Bütün özellikler tamamlandı; ayrıntıları aşağıdaki [Özellikler](#özellikler)
bölümünde, her fonksiyonun girdi/çıktısı [docs/fonksiyonlar.md](docs/fonksiyonlar.md)'de.

| Özellik | Sahibi | Durum |
|---|---|---|
| Kayıt, giriş, çıkış; parolanın özetlenerek saklanması | 1. kişi | Tamamlandı |
| Not oluşturma, listeleme, düzenleme; not kartı ve ekleme formu | 2. kişi | Tamamlandı |
| Etiketler, etikete göre filtreleme ve arama | 3. kişi | Tamamlandı |
| Altyapı, arşiv ve çöp kutusu | 4. kişi | Tamamlandı |
| Liste notları, hatırlatıcılar, sabitleme ve renk | 5. kişi | Tamamlandı |
| SonarCloud ve otomatik test (CI) bağlantısı | 4. kişi | Tamamlandı |

Uygulamayı açınca önce giriş ekranı gelir. Hesabınız yoksa **Kayıt ol**
bağlantısından hesap açın; kayıttan sonra otomatik olarak giriş yapılır.

## Teknolojiler

| Katman | Teknolojiler |
|---|---|
| Backend | Python 3.11+, FastAPI 0.143, SQLAlchemy 2.1, SQLite, Pydantic 2, pytest |
| Frontend | React 19, Vite 8, React Router 8, Framer Motion 14 |

Paket sürümleri sabittir (`backend/requirements.txt`, `frontend/package.json`).
Yeni paket eklemeden önce ekibe sorun. `requirements.txt` değişirse
`backend/requirements.lock` da yeniden üretilmelidir (komut dosyanın başında yazar).

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

`SECRET_KEY`'i rastgele bir değerle değiştirin (nasıl üretileceği dosyadaki
açıklamada yazıyor). Giriş jetonları bu anahtarla imzalanır; boş bırakılırsa
backend her yeniden başladığında herkesin oturumu kapanır.

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
güvenlidir, aynı kayıtları ikinci kez eklemez.

Uygulamaya girmenin en kolay yolu `/register` sayfasından kendi hesabınızı
açmaktır. Örnek kullanıcıyla girmek isterseniz seed'i çalıştırmadan önce
`.env`'deki `SEED_USER_PASSWORD`'ü doldurun (en az 8 karakter). Parola boşsa
rastgele üretilir ve bu kullanıcıyla giriş yapılamaz. Kullanıcı zaten varsa
parolası değişmez; o durumda `backend/beyaztakim.db`'yi silip seed'i yeniden
çalıştırın.

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
  (`backend/app/dependencies.py`). Fonksiyon isteğin
  `Authorization: Bearer <jeton>` başlığındaki jetonu doğrular; jeton yoksa ya
  da geçersizse 401 döner. Frontend'de jeton girişte saklanır ve
  `api/authSession.js` üzerinden her isteğe eklenir; menülü sayfalar
  `RequireAuth` ile korunur, giriş yapılmamışsa `/login`'e yönlendirir.
- **Tarihler** UTC saklanır ve API'de `Z` işaretiyle gönderilir; ekranda yerel
  saatle gösterilir (bkz. [docs/veri-modeli.md](docs/veri-modeli.md#tarih-ve-saatler)).
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
  | Giriş yapılmamış, jeton geçersiz ya da süresi dolmuş | 401 |
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
- **Otomatik kontroller geçmeden PR birleştirilemez.** Backend testleri,
  frontend derlemesi ve SonarCloud kalite kontrolü her PR'da kendiliğinden
  çalışır (bkz. [Otomatik kontroller (CI) ve SonarCloud](#otomatik-kontroller-ci-ve-sonarcloud)).
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

- **Kayıt:** `/register` sayfasında e-posta ve parola (en az 8 karakter, iki
  kez) girilir. Aynı e-postayla ikinci hesap açılamaz. Kayıttan sonra otomatik
  giriş yapılır.
- **Giriş ve çıkış:** `/login` sayfasında giriş yapılır; üst çubuğun sağında
  e-posta ve **Çıkış yap** düğmesi görünür. Giriş yapılmadan menülü sayfalar
  açılmaz, giriş ekranına yönlendirilir.
- **Güvenlik:** Parolalar düz metin olarak saklanmaz; PBKDF2-SHA256 (600.000
  tur, rastgele tuz) ile özetlenir. Girişte imzalı bir oturum jetonu verilir
  (7 gün geçerli); her istekte `Authorization: Bearer` başlığıyla gönderilir.
  Her kullanıcı yalnızca kendi notlarını, etiketlerini ve maddelerini görür.

Uç noktalar: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
`GET /auth/me`.

### 2. Not İşlemleri

- **Not ekleme:** Ana sayfanın üstündeki **Not alın...** alanı açılınca
  başlık, tür (**Metin** ya da **Liste**), içerik ya da madde satırları ve
  renk seçilip **Not al** ile kaydedilir. Seçilen renk form üzerinde hemen
  görünür. Başlıkta Enter içeriğe ya da ilk maddeye geçer; maddede Enter yeni
  madde açar, boş maddede Backspace onu siler.
- **Tuval (sürükle-bırak):** Ana sayfa bir tahta gibidir: pencereye sığan,
  sayfadan koyu, noktalı bir alan. Kartın boş bir yerinden tutup sürükleyince
  not bırakıldığı yerde kalır ve konum kaydedilir; sayfa yenilense de aynı
  yerde durur. Kart tuvalin dışına çıkmaz; kenara dayanınca tuval o yöne
  kendiliğinden kayar. Tuvalin boş bir yerinden tutup sürükleyerek (ya da
  fare tekerleği / kaydırma çubuklarıyla) tuval sağa, sola, yukarı, aşağı
  kaydırılır. Yeni notlar ilk boş yere yerleşir. Sabitlenen notlar raptiye
  rozeti taşır ve her zaman diğerlerinin üstünde çizilir. Kart üzerindeki
  düğmeler (renk, etiket, arşiv vb.) sürükleme başlatmaz.
- **Etikete göre grupla (desteler):** Tuvalin üstündeki **Etikete göre
  grupla** düğmesi açıkken aynı etiketi taşıyan notlar bir destede üst üste
  durur; destenin üstünde etiket adı ve not sayısı yazar. Birden çok etiketi
  olan not her etiketinin destesinde görünür; etiketsiz notlar serbest kalır.
  Deste sürüklenip istenen yere bırakılır, yeri kaydedilir. Desteye basınca
  arka plan kararır ve kartlar ekranın ortasında açılır; açık kartlar normal
  kullanılır (düzenle, renk, etiket, arşiv). Boş bir yere basınca, çarpıya
  basınca ya da Esc ile kartlar desteye geri dönerek kapanır. Düğme kapanınca
  notlar kendi yerlerine döner; tercih tarayıcıda hatırlanır.
- **Dar ekran:** 720 pikselden dar ekranlarda (telefon) tuval kapanır;
  sabitlenen notlar "Sabitlenenler" başlığı altında üstte, diğerleri altında
  sıralanır. Tuvaldeki konumlar korunur.
- **Düzenleme:** Kartın sağ altındaki kalem düğmesi notu forma geri yükler;
  başlık, içerik ve renk değiştirilip **Kaydet**'e basılır. Liste maddeleri
  kartın üzerinden düzenlenir (5. kişi).

Uç noktalar: `POST /notes`, `GET /notes`, `GET /notes/{id}`, `PATCH /notes/{id}`,
`PATCH /notes/{id}/position` (tuvaldeki konum).

### 3. Etiket ve Arama

- **Etiketler:** Sol menüdeki **Etiketleri düzenle** penceresinden etiket
  oluşturulur ve silinir (silinen etiket notlardan da kalkar, notlar silinmez).
  Bir kartın üzerine gelince görünen **Etiket** düğmesi etiket seçme kutusunu
  açar; buradan var olan etiketler işaretlenir ya da yazılan adla yeni etiket
  oluşturulur. Rozetteki çarpı etiketi nottan çıkarır. Aynı adda iki etiket
  oluşturulamaz.
- **Etikete göre filtreleme:** Sol menüde bir etikete tıklayınca o etiketi
  taşıyan notlar listelenir.
- **Arama:** Üst çubuktaki kutuya yazmayı bırakınca sonuçlar gelir. Arama
  başlıkta, içerikte ve liste maddelerinde yapılır; büyük/küçük harf ve Türkçe
  i/ı farkı gözetilmez ("ışık" yazınca "IŞIK" bulunur). Çöpteki notlar
  aranmaz, arşivdekiler aranır. Etiket seçiliyken yazılan sözcük ikisine de
  uyan notları getirir.

Uç noktalar: `GET/POST /tags`, `DELETE /tags/{id}`,
`PATCH /tags/{id}/position` (ana sayfa tuvalindeki destenin yeri),
`POST/DELETE /tags/notes/{note_id}/tags/{tag_id}`, `GET /search?q=&tag_id=`.
Ayrıntılar: [docs/fonksiyonlar.md](docs/fonksiyonlar.md#3-etiket-ve-arama).

### 4. Arşiv ve Çöp Kutusu

Notlar silinmeden önce iki yere kaldırılabilir:

- **Arşiv:** Not kartındaki arşiv düğmesi notu ana sayfadan kaldırıp sol
  menüdeki **Arşiv** sayfasına taşır (sabitlemesi kalkar). Arşiv sayfasındaki
  "Arşivden çıkar" düğmesi notu ana sayfaya geri getirir.
- **Çöp kutusu:** Çöp düğmesi notu **Çöp Kutusu** sayfasına taşır. Çöpteki
  notlar düzenlenemez; "Geri yükle" notu eski yerine (ana sayfa ya da arşiv)
  döndürür, "Kalıcı olarak sil" onay sorup notu, maddeleri ve etiket bağlarıyla
  birlikte siler. Yalnızca çöpteki not kalıcı silinebilir.

Uç noktalar: `GET /archive`, `POST /archive/{id}` (arşivle),
`DELETE /archive/{id}` (arşivden çıkar), `GET /trash`, `POST /trash/{id}`
(çöpe taşı), `POST /trash/{id}/restore`, `DELETE /trash/{id}` (kalıcı sil).
Ayrıntılar: [docs/fonksiyonlar.md](docs/fonksiyonlar.md#4-arşiv-ve-çöp-kutusu).

### 5. Liste Notları, Hatırlatıcı, Sabitleme, Renk

- **Liste notları:** Liste türündeki kartlarda kutuya tıklayınca madde
  işaretlenir (üstü çizilir); maddenin üzerine gelince görünen çarpı onu siler;
  alttaki "Liste öğesi" alanına yazıp Enter'a basınca madde listenin sonuna
  eklenir.
- **Hatırlatıcı:** Kartın alt çubuğundaki zil düğmesi hazır seçenekleri
  (bugün akşam, yarın 09:00, gelecek hafta) ve tarih-saat seçimini açar. Kartta
  "27 Kas 09:00" gibi bir rozet görünür; zamanı geçince üstü çizilir, rozetteki
  çarpı hatırlatıcıyı kaldırır. Sol menüdeki **Hatırlatıcılar** sayfası zamanı
  gelmemiş hatırlatıcıları en yakını üstte olacak şekilde listeler. Zamanlar
  UTC olarak saklanır, ekranda yerel saatle gösterilir.
- **Sabitleme:** Raptiye düğmesi notu ana sayfada "Sabitlenenler"e taşır;
  tekrar basınca sabitleme kalkar.
- **Renk:** Palet düğmesi 11 renklik paleti açar; seçilen renk kartın
  arka planı olur.

Çöpteki notlarda bu düğmelerin hiçbiri görünmez.

Uç noktalar: `POST /checklist/{note_id}/items`, `PATCH/DELETE /checklist/items/{id}`,
`GET /reminders`, `PUT/DELETE /reminders/{note_id}`,
`PATCH /pin-color/{note_id}/pin`, `PATCH /pin-color/{note_id}/color`.
Ayrıntılar: [docs/fonksiyonlar.md](docs/fonksiyonlar.md#5-liste-notları-hatırlatıcı-sabitleme-renk).

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

### Otomatik kontroller (CI) ve SonarCloud

Her PR'da (açılınca ve her yeni commit'te) ve main'e her birleştirmede GitHub
Actions şunları kendiliğinden çalıştırır ([.github/workflows/ci.yml](.github/workflows/ci.yml)):

| İş | Ne yapar |
|---|---|
| **Backend testleri ve SonarCloud** | Python 3.11 ile `pytest`'i kapsama raporuyla çalıştırır, sonra kodu [SonarCloud](https://sonarcloud.io/summary/new_code?id=buraksipahi058-svg_beyaztakim)'da analiz eder (hatalar, güvenlik sorunları, kod kokuları, kapsama). |
| **Frontend derlemesi** | `npm ci` ve `npm run build` ile frontend'in hatasız derlendiğini kontrol eder. |

- Sonuçlar PR sayfasının altında görünür: yeşil tik geçti, kırmızı çarpı
  bir şey bozuk demektir. Kırmızıysa **Details** bağlantısından hangi adımın
  hata verdiğine bakın, düzeltip aynı branch'e yeniden push edin; kontroller
  kendiliğinden yeniden çalışır.
- Üç kontrol (iki iş ve SonarCloud'un Quality Gate sonucu) main için
  zorunludur: biri geçmeden PR birleştirilemez.
- SonarCloud, PR'a "Quality Gate" sonucunu ve bulduğu sorunları yorum olarak
  ekler. Kapsama yalnızca backend için ölçülür (frontend'in otomatik testi
  yok); frontend kodu yine de analiz edilir.
- Ayarlar `sonar-project.properties` dosyasındadır. Analiz için repoda
  `SONAR_TOKEN` adlı secret gerekir; SonarCloud'daki "Automatic Analysis"
  kapalı olmalıdır (ikisi de kurulu).
- CI paketleri güvenli kurar: backend paketleri `backend/requirements.lock`'tan
  sürüm ve hash kontrolüyle, frontend paketleri kurulum betikleri çalıştırılmadan
  (`npm ci --ignore-scripts`) kurulur; SonarCloud eylemi commit SHA'sıyla
  sabitlenmiştir. `requirements.txt` değişip `requirements.lock` yeniden
  üretilmezse CI eski paket listesini kurar (yeni eklenen paket CI'da olmaz).

## Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|---|---|
| PowerShell'de `Activate.ps1` "running scripts is disabled" hatası veriyor | Aynı terminalde bir kez `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` çalıştırın, sonra tekrar etkinleştirin. Ya da cmd'de `activate.bat` kullanın. |
| Sağ üstte **API bağlantısı yok** yazıyor | Backend çalışmıyor ya da `.env`'deki `VITE_API_URL` yanlış. `.env`'i değiştirdikten sonra `npm run dev`'i yeniden başlatın. |
| Sürekli giriş ekranına atılıyorum | Oturum jetonu geçersiz ya da süresi dolmuş (7 gün); tekrar giriş yapın. `.env`'de `SECRET_KEY` boşsa backend her yeniden başladığında oturumlar kapanır, doldurun. |
| Seed'deki örnek kullanıcıyla giriş yapamıyorum | Parolası rastgele üretilmiş. Bkz. [Kurulum > Örnek veri](#3-backend) ya da `/register`'dan hesap açın. |
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
