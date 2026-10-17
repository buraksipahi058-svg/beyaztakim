"""Servis katmanının ortak hata sınıfları.

Servisler bu istisnaları fırlatır; main.py bunları otomatik olarak
uygun HTTP durum koduna çevirir. Böylece servisler FastAPI'ye bağımlı olmaz.

    from app.services.errors import NotFoundError

    raise NotFoundError("Not bulunamadı.")
"""


class ServiceError(Exception):
    """Tüm servis hatalarının temeli."""

    status_code = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class ValidationError(ServiceError):
    """Girdi iş kurallarına uymuyor (400)."""

    status_code = 400


class PermissionDeniedError(ServiceError):
    """Kullanıcının bu kayıt üzerinde yetkisi yok (403)."""

    status_code = 403


class NotFoundError(ServiceError):
    """Kayıt bulunamadı ya da kullanıcıya ait değil (404)."""

    status_code = 404


class ConflictError(ServiceError):
    """Kayıt mevcut durumla çakışıyor, ör. aynı isimde etiket (409)."""

    status_code = 409
