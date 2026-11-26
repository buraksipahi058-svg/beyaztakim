"""Hatırlatıcı atama ve yaklaşan hatırlatıcılar: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/reminders.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""

from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas import NoteRead
from app.schemas.reminders import ReminderUpdate
from app.services import reminders as reminders_service

router = APIRouter(prefix="/reminders", tags=["hatırlatıcılar"])


@router.get("", response_model=list[NoteRead])
def list_upcoming_reminders(db: DbSession, current_user: CurrentUser):
    """Yaklaşan hatırlatıcısı olan notları en yakın zaman üstte olacak şekilde listeler."""
    return reminders_service.list_upcoming_reminders(db, current_user)


@router.put("/{note_id}", response_model=NoteRead)
def set_reminder(note_id: int, data: ReminderUpdate, db: DbSession, current_user: CurrentUser):
    """Nota hatırlatıcı atar ya da zamanını değiştirir; güncel notu döndürür."""
    return reminders_service.set_reminder(db, current_user, note_id, data.reminder_at)


@router.delete("/{note_id}", response_model=NoteRead)
def clear_reminder(note_id: int, db: DbSession, current_user: CurrentUser):
    """Notun hatırlatıcısını kaldırır; güncel notu döndürür."""
    return reminders_service.clear_reminder(db, current_user, note_id)
