"""Çöpe taşıma, geri alma ve kalıcı silme: uç noktalar (HTTP katmanı).

Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
İş mantığı: app/services/trash.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "4. Arşiv ve Çöp Kutusu" bölümüne ekle.
"""

from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas import NoteRead
from app.services import trash as trash_service

router = APIRouter(prefix="/trash", tags=["çöp kutusu"])


@router.get("", response_model=list[NoteRead])
def list_trashed_notes(db: DbSession, current_user: CurrentUser):
    """Çöp kutusundaki notları listeler."""
    return trash_service.list_trashed_notes(db, current_user)


@router.post("/{note_id}", response_model=NoteRead)
def move_note_to_trash(note_id: int, db: DbSession, current_user: CurrentUser):
    """Notu çöp kutusuna taşır; güncel notu döndürür."""
    return trash_service.move_note_to_trash(db, current_user, note_id)


@router.post("/{note_id}/restore", response_model=NoteRead)
def restore_note(note_id: int, db: DbSession, current_user: CurrentUser):
    """Notu çöp kutusundan geri yükler; güncel notu döndürür."""
    return trash_service.restore_note(db, current_user, note_id)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note_permanently(note_id: int, db: DbSession, current_user: CurrentUser) -> None:
    """Çöp kutusundaki notu kalıcı olarak siler."""
    trash_service.delete_note_permanently(db, current_user, note_id)
