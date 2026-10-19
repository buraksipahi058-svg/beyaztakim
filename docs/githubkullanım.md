# GitHub Kullanım Rehberi

Bu rehber, Git ve GitHub'ı hiç kullanmamış biri için yazıldı. Kodu nasıl
indireceğinizi, kendi işinizi nasıl göndereceğinizi, arkadaşınızın kodunu
nasıl inceleyeceğinizi ve herkesin işinin `main`'de nasıl birleştiğini adım
adım anlatır.

Komutları terminale yazın:

- **Windows:** PowerShell ya da Git Bash
- **macOS:** Terminal
- **Linux:** Terminal

> VS Code kullanıyorsanız soldaki **Source Control** paneli aynı işleri
> düğmelerle yapar. Bu rehber komut satırını anlatır; ne olduğunu anlamak
> için önce komutlarla deneyin.

## İçindekiler

1. [Temel kavramlar](#1-temel-kavramlar)
2. [Ekibin kuralları](#2-ekibin-kuralları)
3. [Bir kerelik kurulum](#3-bir-kerelik-kurulum)
4. [Her iş için adım adım akış](#4-her-iş-için-adım-adım-akış)
5. [Arkadaşının PR'ını incelemek](#5-arkadaşının-prını-incelemek)
6. [Güncel kalmak: başkalarının kodunu almak](#6-güncel-kalmak-başkalarının-kodunu-almak)
7. [Çakışma (conflict) çözmek](#7-çakışma-conflict-çözmek)
8. [Sık karşılaşılan sorunlar](#8-sık-karşılaşılan-sorunlar)
9. [Komut özeti](#9-komut-özeti)

---

## 1. Temel kavramlar

| Kavram | Ne demek? |
|---|---|
| **Repo (depo)** | Projenin tüm dosyalarının ve geçmişinin tutulduğu yer. Bizimki: <https://github.com/buraksipahi058-svg/beyaztakim> |
| **Clone** | Repoyu GitHub'dan kendi bilgisayarına indirmek. Bir kere yapılır. |
| **Branch (dal)** | Projenin bir kopyası üzerinde, başkalarını etkilemeden çalıştığın kendi çalışma alanın. |
| **main** | Ana branch. Herkesin birleşmiş, çalışan kodu buradadır. Kimse doğrudan main'e kod göndermez. |
| **Commit** | Yaptığın değişikliklerin bir "kayıt noktası". Her commit'in kısa bir açıklaması olur. |
| **Push** | Bilgisayarındaki commit'leri GitHub'a göndermek. |
| **Pull** | GitHub'daki yeni değişiklikleri bilgisayarına almak. |
| **Pull Request (PR)** | "Benim branch'imdeki değişiklikleri main'e almak istiyorum" isteği. Arkadaşların burada kodunu inceler. |
| **Review (inceleme)** | Bir arkadaşının PR'daki kodu okuyup onaylaması ya da düzeltme istemesi. |
| **Merge (birleştirme)** | Onaylanan PR'ın main'e eklenmesi. |
| **Conflict (çakışma)** | İki kişi aynı dosyanın aynı satırını farklı değiştirdiğinde Git'in hangisini alacağını bilememesi. |

Bir işin yolculuğu:

```
main'i güncelle → branch aç → kod yaz → commit → push → PR aç → inceleme → merge → main'i güncelle
```

---

## 2. Ekibin kuralları

1. **main korumalıdır.** Kimse main'e doğrudan kod gönderemez; GitHub buna
   izin vermez. Her değişiklik bir PR ile girer.
2. **Her iş kendi branch'inde yapılır.** Bir branch = bir iş. İş bitince
   branch silinir, yeni iş için yeni branch açılır.
3. **Her PR'ı en az 1 arkadaşın onaylaması gerekir.** Kendi PR'ını
   onaylayamazsın.
4. **Ortak dosyalara dokunan PR'ı 4. kişi (altyapı sorumlusu) onaylar.**
   GitHub bunu otomatik ister. Ortak dosyaların listesi: [AGENTS.md](../AGENTS.md#ortak-dosyalar).
5. **PR açmadan önce:**
   - `pytest` hatasız geçmeli,
   - yazdığın her fonksiyon [docs/fonksiyonlar.md](fonksiyonlar.md)'de olmalı,
   - branch adı ve commit mesajı kurallara uymalı.
6. **PR'lar "Squash and merge" ile birleştirilir.** PR'daki tüm commit'ler
   main'de tek bir commit olur; mesajı PR'ın başlığıdır.
7. **Yorumların hepsi çözülmeden PR birleştirilemez.**

> **4. kişi için not:** GitHub, kod sahibinin kendi PR'ını onaylamasına izin
> vermez. Bu yüzden 4. kişinin ortak dosyalara dokunan kendi PR'ları, bir
> arkadaş onayladıktan sonra yönetici olarak **Merge without waiting for
> requirements to be met** kutusu işaretlenerek birleştirilir. Bu kutu
> yalnızca bu durum için kullanılır.

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

- Küçük harf, kelimeler arasında tire (`-`), boşluk yok.
- Türkçe karakter yok: ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c.
- Kısa: 2-4 kelime.

Örnekler: `feature/arsiv-servisi`, `feature/giris-ekrani`,
`fix/etiket-silme-hatasi`, `docs/readme-arsiv-bolumu`

### Commit mesajı

```
<tür>(<kapsam>): <ne yapıldı>
```

- **tür:** `feat` (yeni özellik), `fix`, `docs`, `test`, `refactor`, `chore`
- **kapsam:** özelliğin adı: `auth`, `notes`, `tags`, `search`, `archive`,
  `trash`, `checklist`, `reminders`, `pin-color`, `infra` (ortak dosyalar)
- **ne yapıldı:** Türkçe, küçük harfle başlar, sonda nokta yok, en fazla 72 karakter.

Örnekler:

```
feat(archive): notu arşivleme ve arşivden çıkarma eklendi
fix(tags): aynı isimde etiket oluşturulabilmesi düzeltildi
test(notes): not listeleme testleri eklendi
docs(archive): fonksiyonlar.md'ye arşiv fonksiyonları eklendi
```

**PR başlığı da aynı biçimde yazılır**, çünkü main'e o başlıkla girer.

---

## 3. Bir kerelik kurulum

Bu bölümü yalnızca ilk seferde yaparsın.

### 3.1 Git'i kur

<https://git-scm.com/downloads> adresinden indirip kur. Kurulduğunu kontrol et:

```bash
git --version
```

`git version 2.xx` gibi bir çıktı görmelisin.

### 3.2 Kendini Git'e tanıt

Commit'lerinde adın görünsün diye. E-posta, GitHub hesabındaki e-posta olmalı:

```bash
git config --global user.name "Ad Soyad"
git config --global user.email "github-e-postan@ornek.com"
```

### 3.3 Daveti kabul et

Repo sahibi seni **collaborator** olarak ekledi. GitHub'dan gelen davet
e-postasındaki bağlantıya tıkla ya da şu adrese git ve **Accept invitation**'a bas:
<https://github.com/buraksipahi058-svg/beyaztakim/invitations>

Daveti kabul etmeden kod gönderemezsin.

### 3.4 Projeyi indir (clone)

Projeyi koymak istediğin klasöre geç (örneğin Belgeler) ve indir:

```bash
cd Documents
git clone https://github.com/buraksipahi058-svg/beyaztakim.git
cd beyaztakim
```

Artık `beyaztakim` klasörü senin bilgisayarında. Bundan sonraki tüm komutları
bu klasörün içindeyken yazacaksın.

### 3.5 GitHub'a giriş

GitHub, terminalde şifreyle girişe izin vermez. İlk `git push`'ta:

- **Windows:** Git ile birlikte gelen *Git Credential Manager* bir pencere
  açar. **Sign in with your browser**'a bas, tarayıcıda GitHub'a giriş yap.
  Bir kere yapman yeterli.
- **macOS / Linux:** En kolay yol GitHub CLI. <https://cli.github.com>
  adresinden kur, sonra:

  ```bash
  gh auth login
  ```

  Sorulara şöyle cevap ver: `GitHub.com` → `HTTPS` → `Yes` →
  `Login with a web browser`. Ardından:

  ```bash
  gh auth setup-git
  ```

### 3.6 Projeyi çalıştır

[README.md](../README.md#kurulum)'deki **Kurulum** adımlarını uygula
(`.env`, backend, frontend).

---

## 4. Her iş için adım adım akış

Örnek olarak 4. kişinin "notu arşivleme" işini yaptığını düşünelim.

### Adım 1: main'i güncelle

Yeni bir işe başlamadan önce, arkadaşlarının main'e eklediği son kodu al:

```bash
git switch main
git pull
```

`git switch main` main branch'ine geçer, `git pull` GitHub'daki yenilikleri indirir.

### Adım 2: Yeni branch aç

```bash
git switch -c feature/arsiv-servisi
```

`-c` "yeni oluştur" demek. Artık `feature/arsiv-servisi` branch'indesin;
burada yaptıkların main'i etkilemez. Hangi branch'te olduğunu görmek için:

```bash
git branch
```

Başında `*` olan, şu an bulunduğun branch'tir.

### Adım 3: Kodu yaz ve dene

- Sadece **kendi dosyalarında** çalış ([AGENTS.md](../AGENTS.md)'deki sahiplik tablosu).
- Yazdığın her fonksiyonu [docs/fonksiyonlar.md](fonksiyonlar.md)'ye ekle.
- Testini yaz ve çalıştır (`backend` klasöründe, sanal ortam etkinken):

  ```bash
  pytest
  ```

- Frontend'de değişiklik yaptıysan `npm run dev` ile tarayıcıda dene.

### Adım 4: Neyi değiştirdiğine bak

```bash
git status
```

Kırmızı dosyalar: değişti ama henüz commit'e eklenmedi.
Satır satır ne değiştiğini görmek için:

```bash
git diff
```

`git diff`'ten çıkmak için `q` tuşuna bas.

### Adım 5: Commit at

Önce commit'e girecek dosyaları seç, sonra kaydet:

```bash
git add backend/app/services/archive.py backend/tests/test_archive.py docs/fonksiyonlar.md
git commit -m "feat(archive): notu arşivleme servisi eklendi"
```

- Tüm değişen dosyaları eklemek için `git add .` da yazabilirsin; ama önce
  `git status` ile listede başkasının dosyası ya da istemediğin bir dosya
  olmadığından emin ol.
- Sık ve küçük commit at. "Her şeyi bitirip tek commit" yerine her anlamlı
  adımda bir commit daha iyidir.

### Adım 6: GitHub'a gönder (push)

Branch'i ilk kez gönderirken:

```bash
git push -u origin feature/arsiv-servisi
```

Aynı branch'te sonraki gönderimlerde sadece:

```bash
git push
```

### Adım 7: Pull Request (PR) aç

1. <https://github.com/buraksipahi058-svg/beyaztakim> adresine git.
2. Üstte sarı bir şerit çıkar: **Compare & pull request**'e bas.
   (Çıkmazsa: **Pull requests** sekmesi → **New pull request** →
   `base: main`, `compare: feature/arsiv-servisi` seç.)
3. **Başlık:** commit kuralıyla aynı biçimde yaz:
   `feat(archive): notu arşivleme ve arşivden çıkarma eklendi`
4. **Açıklama:** Şablon otomatik gelir. Ne yaptığını yaz, kontrol listesindeki
   kutuları işaretle (`[ ]` → `[x]`).
5. Sağdaki **Reviewers**'a tıkla, inceleyecek bir arkadaşını seç.
6. **Create pull request**'e bas.

### Adım 8: Düzeltme istenirse

Arkadaşın bir şeyin değişmesini isterse:

1. Aynı branch'te kal (yeni branch açma).
2. Düzeltmeyi yap, commit at, `git push` yap.
3. PR kendiliğinden güncellenir.
4. Yorumlara cevap ver; düzelttiğin yorumlarda **Resolve conversation**'a bas.

### Adım 9: Birleştir (merge)

Onay geldikten sonra PR'ı **sen** birleştirirsin:

1. PR sayfasının altına in.
2. **Squash and merge** → **Confirm squash and merge**.
3. Branch otomatik silinir.

Buton griyse nedeni şunlardan biridir:

- Henüz onay yok.
- Çözülmemiş yorum var.
- Ortak dosyaya dokunmuşsun ve 4. kişinin onayı bekleniyor.
- main ile çakışma var (bkz. [Çakışma çözmek](#7-çakışma-conflict-çözmek)).

### Adım 10: main'e dön ve güncelle

```bash
git switch main
git pull
git branch -d feature/arsiv-servisi
```

Son komut, işi biten branch'i bilgisayarından siler. Yeni iş için
[Adım 1](#adım-1-maini-güncelle)'e dön.

---

## 5. Arkadaşının PR'ını incelemek

1. GitHub'da **Pull requests** sekmesine git, incelemen istenen PR'ı aç.
2. **Files changed** sekmesine geç; değişen satırlar yeşil (eklenen) ve
   kırmızı (silinen) görünür.
3. Bir satıra yorum yazmak için satır numarasının yanındaki **+**'ya bas,
   yorumu yaz, **Start a review**'a bas.
4. Bitince sağ üstteki **Review changes**'a bas ve birini seç:
   - **Approve:** Her şey tamam, birleştirilebilir.
   - **Request changes:** Düzeltilmesi gereken bir şey var.
   - **Comment:** Sadece soru ya da öneri.
5. **Submit review**'a bas.

Neye bakmalı?

- PR sadece sahibinin dosyalarını mı değiştiriyor? Ortak dosyaya dokunduysa nedeni yazılmış mı?
- Yeni fonksiyonlar `docs/fonksiyonlar.md`'de var mı? Girdi/çıktı kodla aynı mı?
- Her yeni fonksiyonun testi var mı?
- Koda gizli bilgi (şifre, anahtar) yazılmış mı?
- Branch adı ve PR başlığı kurala uyuyor mu?

İstersen kodu kendi bilgisayarında da deneyebilirsin:

```bash
git fetch
git switch feature/arsiv-servisi
```

Bitince `git switch main` ile kendi işine dön.

---

## 6. Güncel kalmak: başkalarının kodunu almak

Arkadaşların PR'ları birleştikçe main ilerler. Senin branch'in eski main'den
açıldığı için arada fark oluşur. Bunu küçük tutmak için **her gün ve PR
açmadan önce** main'i kendi branch'ine al:

```bash
git switch main
git pull
git switch feature/arsiv-servisi
git merge main
```

- Çakışma yoksa Git otomatik birleştirir; bir mesaj ekranı açılırsa
  kaydedip kapat (Vim açıldıysa `:wq` yazıp Enter).
- Sonra `git push` ile branch'ini güncelle.
- Çakışma çıkarsa bir sonraki bölüme bak.

---

## 7. Çakışma (conflict) çözmek

Sen ve bir arkadaşın aynı dosyanın aynı satırlarını değiştirdiyseniz
`git merge main` şöyle bir hata verir:

```
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

Dosyayı açınca çakışan yer şöyle görünür:

```
<<<<<<< HEAD
senin branch'indeki satır
=======
main'deki satır
>>>>>>> main
```

Çözmek için:

1. Hangi satırın (ya da ikisinin birden) kalacağına karar ver. Emin
   değilsen o satırı yazan arkadaşına sor.
2. `<<<<<<<`, `=======`, `>>>>>>>` işaretli satırları sil; dosya son haliyle kalsın.
   (VS Code bu bölgenin üstünde **Accept Current / Accept Incoming / Accept Both**
   düğmeleri gösterir.)
3. Kaydet ve devam et:

   ```bash
   git add README.md
   git commit --no-edit
   git push
   ```

Vazgeçip birleştirmeden önceki hale dönmek istersen:

```bash
git merge --abort
```

Çakışmayı azaltmanın en iyi yolu: kendi dosyalarında çalışmak ve main'i
sık sık kendi branch'ine almak.

---

## 8. Sık karşılaşılan sorunlar

### "protected branch" ya da "Changes must be made through a pull request"

main'e doğrudan göndermeye çalıştın. Commit'lerini kaybetmeden düzelt:

```bash
git switch -c feature/dogru-branch-adi
git push -u origin feature/dogru-branch-adi
```

Sonra bu branch'ten PR aç. Bilgisayarındaki main'i GitHub'daki haline geri
getirmek için:

```bash
git switch main
git reset --hard origin/main
```

> ⚠️ `git reset --hard` commit'lenmemiş değişiklikleri siler. Sadece
> commit'lerin yeni branch'te güvendeyken çalıştır.

### "rejected ... (fetch first)" ya da "non-fast-forward"

GitHub'da senin bilgisayarında olmayan yeni commit'ler var. Önce al, sonra gönder:

```bash
git pull
git push
```

### "Your local changes would be overwritten"

Branch değiştirmeye ya da `pull` yapmaya çalışırken commit'lenmemiş
değişikliklerin var. Ya önce commit at ya da değişiklikleri geçici olarak kenara koy:

```bash
git stash
git pull
git stash pop
```

### Yanlış branch'te kod yazdım (henüz commit atmadım)

Commit'lenmemiş değişiklikler branch değiştirirken seninle gelir. Doğru
branch'i aç, değişiklikler oraya taşınır:

```bash
git switch -c feature/dogru-branch-adi
```

### Commit mesajını yanlış yazdım

Henüz `push` etmediysen:

```bash
git commit --amend -m "feat(archive): doğru mesaj"
```

`push` ettiysen bırak; PR başlığını doğru yazman yeterli (main'e o girer).

### "Permission denied" ya da "403"

Daveti kabul etmemişsin ya da farklı bir GitHub hesabıyla giriş yapmışsın.
[3.3](#33-daveti-kabul-et) ve [3.5](#35-githuba-giriş)'e bak.

### `.env`, `.venv`, `node_modules` git'te görünmüyor

Normal. Bunlar `.gitignore`'da; asla GitHub'a gönderilmez. `.env`'e
yazdığın şifreler bu sayede gizli kalır.

---

## 9. Komut özeti

| Ne yapmak istiyorum? | Komut |
|---|---|
| Projeyi indir (bir kere) | `git clone https://github.com/buraksipahi058-svg/beyaztakim.git` |
| main'e geç | `git switch main` |
| GitHub'daki yenilikleri al | `git pull` |
| Yeni branch aç | `git switch -c feature/kisa-ad` |
| Hangi branch'teyim? | `git branch` |
| Ne değişti? | `git status` / `git diff` |
| Dosyayı commit'e ekle | `git add dosya-yolu` |
| Commit at | `git commit -m "feat(kapsam): ne yapıldı"` |
| Branch'i ilk kez gönder | `git push -u origin feature/kisa-ad` |
| Sonraki gönderimler | `git push` |
| main'i kendi branch'ime al | `git merge main` |
| Birleştirmekten vazgeç | `git merge --abort` |
| Değişiklikleri geçici sakla / geri getir | `git stash` / `git stash pop` |
| İşi biten branch'i sil | `git branch -d feature/kisa-ad` |
| Geçmişi gör | `git log --oneline` |
