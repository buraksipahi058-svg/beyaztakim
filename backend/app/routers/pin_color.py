"""Not sabitleme ve renk seçme: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/pin_color.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/pin-color", tags=["sabitleme ve renk"])
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.pin_color import NotePinUpdate, NoteColorUpdate
@router.patch("/{note_id}/pin")
def update_note_pin(note_id: int, pin_in: NotePinUpdate, db: Session = Depends(get_db)):
    # Buraya notu bulup is_pinned değerini güncelleyen mantığı yazacağız
    return {"message": "Sabitleme durumu güncellendi", "is_pinned": pin_in.is_pinned}

@router.patch("/{note_id}/color")
def update_note_color(note_id: int, color_in: NoteColorUpdate, db: Session = Depends(get_db)):
    # Buraya notun rengini güncelleyen mantığı yazacağız
    return {"message": "Renk güncellendi", "color": color_in.color}