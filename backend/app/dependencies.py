"""Router'larda kullanılan ortak FastAPI bağımlılıkları.

Kullanım:

    from app.dependencies import CurrentUser, DbSession

    @router.get("")
    def list_notes(db: DbSession, current_user: CurrentUser): ...

Giriş yapan kullanıcı HER ZAMAN get_current_user üzerinden alınır.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(db: DbSession) -> User:
    """Giriş yapmış kullanıcıyı döndürür.

    Şimdilik gerçek bir giriş sistemi yok: seed betiğindeki örnek kullanıcı
    döndürülür. Kimlik doğrulama eklendiğinde yalnızca bu fonksiyonun içi
    değişecek; onu kullanan router'lar aynı kalacak.
    """
    email = get_settings().seed_user_email
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Giriş yapmış kullanıcı bulunamadı. Önce `python -m app.seed` çalıştırın.",
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
