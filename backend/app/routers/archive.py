"""Arşivleme, arşivden çıkarma ve arşivdeki notlar: uç noktalar (HTTP katmanı).

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
İş mantığı: app/services/archive.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "4. Arşiv ve Çöp Kutusu" bölümüne ekle.
"""

from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas import NoteRead
from app.services import archive as archive_service

router = APIRouter(prefix="/archive", tags=["arşiv"])


@router.get("", response_model=list[NoteRead])
def list_archived_notes(db: DbSession, current_user: CurrentUser):
    """Arşivdeki notları listeler."""
    return archive_service.list_archived_notes(db, current_user)


@router.post("/{note_id}", response_model=NoteRead)
def archive_note(note_id: int, db: DbSession, current_user: CurrentUser):
    """Notu arşive taşır; güncel notu döndürür."""
    return archive_service.archive_note(db, current_user, note_id)


@router.delete("/{note_id}", response_model=NoteRead)
def unarchive_note(note_id: int, db: DbSession, current_user: CurrentUser):
    """Notu arşivden çıkarır; güncel notu döndürür."""
    return archive_service.unarchive_note(db, current_user, note_id)
