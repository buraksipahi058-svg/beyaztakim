"""Router'larda kullanılan ortak FastAPI bağımlılıkları.

Kullanım:

    from app.dependencies import CurrentUser, DbSession

    @router.get("")
    def list_notes(db: DbSession, current_user: CurrentUser): ...

Giriş yapan kullanıcı HER ZAMAN get_current_user üzerinden alınır.

Ortak dosyadır. Tek istisna: get_current_user'ın içini gerçek giriş sistemiyle
1. kişi (Kullanıcı ve Güvenlik) değiştirir; fonksiyonun adı ve dönüş tipi
(User) aynı kalmalıdır.
"""

from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services import auth as auth_service
from app.services.errors import ServiceError

DbSession = Annotated[Session, Depends(get_db)]

# Swagger'daki "Authorize" düğmesini de açan Bearer şeması.
# auto_error=False: başlık yoksa kendi 403'ünü atmasın, 401'i biz döndürelim.
_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)] = None,
) -> User:
    """Giriş yapmış kullanıcıyı döndürür.

    İsteğin `Authorization: Bearer <jeton>` başlığındaki oturum jetonunu
    app/services/auth.py'deki get_user_by_token ile doğrular; jeton yoksa,
    imzası bozuksa veya süresi dolduysa 401 döndürür.
    (İçi 1. kişi tarafından gerçek giriş sistemiyle değiştirildi; adı ve
    dönüş tipi altyapıyla aynı kaldı.)
    """
    token = credentials.credentials if credentials is not None else None
    try:
        return auth_service.get_user_by_token(db, token)
    except ServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


CurrentUser = Annotated[User, Depends(get_current_user)]

