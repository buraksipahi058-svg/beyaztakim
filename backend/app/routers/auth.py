"""Kayıt olma, giriş ve çıkış: uç noktalar (HTTP katmanı).

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
İş mantığı: app/services/auth.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "1. Kullanıcı ve Güvenlik" bölümüne ekle.
"""

"""Kayıt olma, giriş ve çıkış: uç noktalar (HTTP katmanı).

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
İş mantığı: app/services/auth.py
Bu dosyadaki her uç nokta docs/fonksiyonlar.md'deki "1. Kullanıcı ve Güvenlik"
bölümünde kayıtlıdır.
"""

from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas import UserRead
from app.schemas.auth import TokenResponse, UserCreate, UserLogin
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["kullanıcı"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: DbSession):
    """Yeni kullanıcı kaydeder; parola düz metin saklanmaz, özeti saklanır."""
    return auth_service.register_user(db, data)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: DbSession):
    """E-posta ve parolayı doğrular; sonraki isteklerde kullanılacak jetonu döndürür."""
    return auth_service.login_user(db, data)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: CurrentUser):
    """Çıkışı bildirir.

    Jeton durumsuz (imzalı) olduğu için sunucu tarafında geçersiz kılınmaz;
    istemci sakladığı jetonu siler.
    """
    return None


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: CurrentUser):
    """Giriş yapmış kullanıcının bilgilerini döndürür."""
    return current_user
