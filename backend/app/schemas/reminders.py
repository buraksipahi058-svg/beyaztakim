"""Hatırlatıcı atama ve yaklaşan hatırlatıcılar: girdi/çıktı şemaları.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Ortak okuma şemaları (NoteRead vb.): app/schemas/common.py
"""

from pydantic import AwareDatetime, BaseModel


class ReminderUpdate(BaseModel):
    """Hatırlatıcı isteği gövdesi (PUT /reminders/{note_id}).

    Tarih saat dilimiyle gönderilmelidir, ör. "2026-12-01T09:00:00Z" ya da
    "2026-12-01T12:00:00+03:00". Saat dilimi olmayan tarih 422 alır.
    """

    reminder_at: AwareDatetime
