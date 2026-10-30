"""Not oluşturma, listeleme, görüntüleme ve düzenleme: uç noktalar (HTTP katmanı).

Sahibi: 2. kişi (Not İşlemleri)
İş mantığı: app/services/notes.py
Bu dosyadaki her uç nokta docs/fonksiyonlar.md'deki "2. Not İşlemleri"
bölümünde kayıtlıdır.
"""

from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas import NoteRead
from app.schemas.notes import NoteCreate, NoteUpdate
from app.services import notes as notes_service

router = APIRouter(prefix="/notes", tags=["notlar"])


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(data: NoteCreate, db: DbSession, current_user: CurrentUser):
    """Yeni not oluşturur; metin ya da liste türünde olabilir."""
    return notes_service.create_note(db, current_user, data)


@router.get("", response_model=list[NoteRead])
def list_notes(db: DbSession, current_user: CurrentUser):
    """Arşivde ve çöp kutusunda olmayan notları listeler; sabitlenenler üste gelir."""
    return notes_service.list_notes(db, current_user)


@router.get("/{note_id}", response_model=NoteRead)
def read_note(note_id: int, db: DbSession, current_user: CurrentUser):
    """Tek bir notu döndürür."""
    return notes_service.get_note(db, current_user, note_id)


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(note_id: int, data: NoteUpdate, db: DbSession, current_user: CurrentUser):
    """Notu kısmen günceller; yalnızca gönderilen alanlar değişir."""
    return notes_service.update_note(db, current_user, note_id, data)
