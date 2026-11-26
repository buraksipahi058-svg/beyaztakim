"""Başlık/içerikte arama ve etikete göre filtreleme: uç noktalar (HTTP katmanı).

Sahibi: 3. kişi (Etiket ve Arama)
İş mantığı: app/services/search.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "3. Etiket ve Arama" bölümüne ekle.
"""

from typing import Annotated

from fastapi import APIRouter, Query

from app.dependencies import CurrentUser, DbSession
from app.schemas import NoteRead
from app.services import search as search_service

router = APIRouter(prefix="/search", tags=["arama"])

SEARCH_QUERY_MAX_LENGTH = 100


@router.get("", response_model=list[NoteRead])
def search_notes(
    db: DbSession,
    current_user: CurrentUser,
    q: Annotated[str | None, Query(max_length=SEARCH_QUERY_MAX_LENGTH)] = None,
    tag_id: int | None = None,
):
    """Notlarda arar: ?q=sözcük ve/veya ?tag_id=etiket (çöptekiler hariç)."""
    return search_service.search_notes(db, current_user, query=q, tag_id=tag_id)
