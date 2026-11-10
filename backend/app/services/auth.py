"""Kayıt olma, giriş ve çıkış: iş mantığı.

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""
"""Kayıt olma, giriş ve çıkış: iş mantığı.

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.

Güvenlik notları (hepsi standart kütüphaneyle, yeni paket olmadan):
- Parolalar PBKDF2-SHA256 ile özetlenir; biçim app/seed.py ile aynıdır
  (`pbkdf2_sha256$<tur>$<tuz>$<özet>`), dolayısıyla seed kullanıcısı da giriş yapabilir.
- Oturum jetonu HMAC-SHA256 ile imzalanır; imzalama anahtarı `.env`'deki
  SECRET_KEY'den okunur (bkz. `_signing_key`). Jeton durumsuzdur: sunucuda
  saklanmaz, çıkışta istemci kendi kopyasını siler.
"""

import base64
import binascii
import hashlib
import hmac
import json
import secrets
import time
import warnings
from functools import lru_cache

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import User
from app.schemas.auth import TokenResponse, UserCreate, UserLogin
from app.services.errors import ConflictError, ServiceError

# Parola özeti biçimi: pbkdf2_sha256$<iterasyon>$<tuz>$<özet>
PBKDF2_ALGORITHM = "sha256"
PBKDF2_ITERATIONS = 600_000

# Oturum jetonu süresi (saniye): 7 gün.
TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60


class UnauthorizedError(ServiceError):
    """Giriş yapılmamış ya da oturum geçersiz (401).

    errors.py ortak dosyada olduğu için bu alt sınıf burada tanımlanır;
    main.py tüm ServiceError alt sınıflarını otomatik olarak HTTP koduna çevirir.
    """

    status_code = 401


def hash_password(password: str) -> str:
    """Parolanın özetini üretir; parolanın kendisi asla saklanmaz."""
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM, password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS
    )
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    """Verilen parolanın özetini saklanan özetle sabit zamanlı karşılaştırır."""
    try:
        algorithm, iterations_text, salt, digest_hex = password_hash.split("$")
    except ValueError:
        return False
    if algorithm != f"pbkdf2_{PBKDF2_ALGORITHM}":
        return False
    try:
        iterations = int(iterations_text)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM, password.encode("utf-8"), salt.encode("utf-8"), iterations
    )
    return hmac.compare_digest(digest.hex(), digest_hex)


@lru_cache
def _signing_key() -> bytes:
    """Jeton imzalama anahtarını döndürür.

    SECRET_KEY `.env`de tanımlıysa onu kullanır; tanımlı değilse süreç başına
    rastgele bir anahtar üretir (bu durumda sunucu her yeniden başladığında
    açık oturumlar geçersiz olur). Dağıtımda SECRET_KEY mutlaka doldurulmalı.
    """
    secret = get_settings().secret_key
    if secret:
        return secret.encode("utf-8")
    warnings.warn(
        "SECRET_KEY tanımlı değil; geçici rastgele anahtar kullanılıyor. "
        "Depo kökündeki .env dosyasına rastgele bir SECRET_KEY yazın.",
        stacklevel=2,
    )
    return secrets.token_bytes(32)


def create_access_token(user_id: int) -> str:
    """Kullanıcı için imzalı oturum jetonu üretir."""
    payload = {"sub": user_id, "exp": int(time.time()) + TOKEN_LIFETIME_SECONDS}
    body = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).rstrip(b"=")
    signature = hmac.new(_signing_key(), body, hashlib.sha256).hexdigest()
    return f"{body.decode('ascii')}.{signature}"


def _decode_access_token(token: str) -> int | None:
    """Jetonu doğrular; geçerliyse kullanıcı kimliğini, değilse None döndürür."""
    body, separator, signature = token.partition(".")
    if not separator or not body or not signature:
        return None
    try:
        expected_signature = hmac.new(
            _signing_key(), body.encode("ascii"), hashlib.sha256
        ).hexdigest()
    except UnicodeEncodeError:
        return None
    if not hmac.compare_digest(signature, expected_signature):
        return None
    try:
        padding = b"=" * (-len(body) % 4)
        payload = json.loads(base64.urlsafe_b64decode(body.encode("ascii") + padding))
        user_id, expires_at = payload["sub"], payload["exp"]
    except (binascii.Error, KeyError, TypeError, ValueError, UnicodeEncodeError):
        return None
    if not isinstance(user_id, int) or not isinstance(expires_at, int):
        return None
    if expires_at < time.time():
        return None
    return user_id


def register_user(db: Session, data: UserCreate) -> User:
    """Yeni kullanıcı kaydeder; e-posta zaten kayıtlıysa hata verir.

    E-posta kayıttan önce küçük harfe normalize edilir; parola düz metin
    saklanmaz, yalnızca özeti saklanır.
    """
    email = data.email.strip().lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise ConflictError("Bu e-posta ile kayıtlı bir kullanıcı zaten var.")
    user = User(email=email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, data: UserLogin) -> TokenResponse:
    """E-posta ve parolayı doğrular; başarılıysa oturum jetonu döndürür.

    E-posta ya da parola hatalıysa hangisinin yanlış olduğu açıklanmaz.
    """
    email = data.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("E-posta veya parola hatalı.")
    return TokenResponse(access_token=create_access_token(user.id))


def get_user_by_token(db: Session, token: str | None) -> User:
    """Oturum jetonunu doğrulayıp kullanıcısını döndürür; geçersizse 401 hatası verir."""
    if not token:
        raise UnauthorizedError("Giriş yapmış kullanıcı bulunamadı. Lütfen giriş yapın.")
    user_id = _decode_access_token(token)
    if user_id is None:
        raise UnauthorizedError("Oturum süresi doldu ya da geçersiz. Lütfen yeniden giriş yapın.")
    user = db.get(User, user_id)
    if user is None:
        raise UnauthorizedError("Giriş yapmış kullanıcı bulunamadı. Lütfen yeniden giriş yapın.")
    return user
