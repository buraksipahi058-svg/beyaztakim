"""Kayıt olma, giriş ve çıkış: girdi/çıktı şemaları.

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""
"""Giriş ve kayıt: API girdi/çıktı şemaları.

Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
Okuma şemaları (UserRead) app/schemas/common.py'dedir (ortak dosya).
"""

from typing import Literal

from pydantic import BaseModel, Field

# email-validator paketi olmadan basit e-posta biçimi kontrolü:
# "@" öncesinde ve sonrasında boşluk olmamalı; sonda nokta içeren bir alan adı kalmalı.
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128


class UserCreate(BaseModel):
    """Kayıt isteği gövdesi (POST /auth/register)."""

    email: str = Field(
        pattern=EMAIL_PATTERN,
        max_length=255,
        examples=["ornek@beyaztakim.local"],
    )
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)


class UserLogin(BaseModel):
    """Giriş isteği gövdesi (POST /auth/login)."""

    email: str = Field(pattern=EMAIL_PATTERN, max_length=255)
    password: str = Field(min_length=1, max_length=PASSWORD_MAX_LENGTH)


class TokenResponse(BaseModel):
    """Giriş yanıtı: sonraki isteklerde `Authorization: Bearer <jeton>` ile gönderilir."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"
