"""Liste maddesi ekleme, işaretleme ve silme: uç noktalar (HTTP katmanı).

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
İş mantığı: app/services/checklist.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "5. Liste Notları, Hatırlatıcı, Sabitleme, Renk" bölümüne ekle.
"""

from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas import ChecklistItemRead
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate
from app.services import checklist as checklist_service

router = APIRouter(prefix="/checklist", tags=["liste maddeleri"])


@router.post(
    "/{note_id}/items", response_model=ChecklistItemRead, status_code=status.HTTP_201_CREATED
)
def add_item(note_id: int, data: ChecklistItemCreate, db: DbSession, current_user: CurrentUser):
    """Liste notuna yeni bir onay kutulu madde ekler."""
    return checklist_service.add_checklist_item(db, current_user, note_id, data)


@router.patch("/items/{item_id}", response_model=ChecklistItemRead)
def update_item(item_id: int, data: ChecklistItemUpdate, db: DbSession, current_user: CurrentUser):
    """Maddenin metnini veya işaretini (is_done) günceller."""
    return checklist_service.update_checklist_item(db, current_user, item_id, data)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: DbSession, current_user: CurrentUser) -> None:
    """Maddeyi siler."""
    checklist_service.delete_checklist_item(db, current_user, item_id)
