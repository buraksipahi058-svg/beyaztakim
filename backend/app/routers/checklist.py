"""Liste maddesi ekleme, işaretleme ve silme: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/checklist.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemResponse
from app.services import checklist as checklist_service


router = APIRouter(prefix="/checklist", tags=["liste notları"])

@router.post("/{note_id}/items", response_model=ChecklistItemResponse, status_code=status.HTTP_201_CREATED)
def add_item(note_id: int, item_in: ChecklistItemCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Belirtilen nota yeni bir onay kutulu liste maddesi ekler."""
    try:
        return checklist_service.add_checklist_item(db=db, note_id=note_id, user_id=current_user.id, item_in=item_in)
    except checklist_service.NoteNotFoundError:
        raise HTTPException(status_code=404, detail="Not bulunamadı")

@router.patch("/items/{item_id}", response_model=ChecklistItemResponse)
def update_item(item_id: int, item_in: ChecklistItemUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Var olan bir liste maddesinin metnini veya tamamlanma durumunu (işaretini) günceller."""
    try:
        return checklist_service.update_checklist_item(db=db, item_id=item_id, user_id=current_user.id, item_in=item_in)
    except checklist_service.ChecklistItemNotFoundError:
        raise HTTPException(status_code=404, detail="Liste maddesi bulunamadı")

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Belirtilen liste maddesini siler."""
    try:
        checklist_service.delete_checklist_item(db=db, item_id=item_id, user_id=current_user.id)
    except checklist_service.ChecklistItemNotFoundError:
        raise HTTPException(status_code=404, detail="Liste maddesi bulunamadı")