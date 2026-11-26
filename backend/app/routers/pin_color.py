"""Not sabitleme ve renk seçme: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/pin_color.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""

from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas import NoteRead
from app.schemas.pin_color import NoteColorUpdate, NotePinUpdate
from app.services import pin_color as pin_color_service

router = APIRouter(prefix="/pin-color", tags=["sabitleme ve renk"])


@router.patch("/{note_id}/pin", response_model=NoteRead)
def update_note_pin(note_id: int, data: NotePinUpdate, db: DbSession, current_user: CurrentUser):
    """Notu sabitler ya da sabitlemeyi kaldırır; güncel notu döndürür."""
    return pin_color_service.update_note_pin(db, current_user, note_id, data.is_pinned)


@router.patch("/{note_id}/color", response_model=NoteRead)
def update_note_color(
    note_id: int, data: NoteColorUpdate, db: DbSession, current_user: CurrentUser
):
    """Notun rengini değiştirir; güncel notu döndürür."""
    return pin_color_service.update_note_color(db, current_user, note_id, data.color)
