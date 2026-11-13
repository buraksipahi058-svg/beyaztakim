"""Etiket oluşturma, listeleme, silme; nota etiket ekleme ve çıkarma: uç noktalar (HTTP katmanı).

Sahibi: 3. kişi (Etiket ve Arama)
İş mantığı: app/services/tags.py
Yazdığın her fonksiyonu docs/fonksiyonlar.md'deki "3. Etiket ve Arama" bölümüne ekle.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.tags import TagCreate, TagRead
from app.services import tags as tag_service

router = APIRouter(prefix="/tags", tags=["etiketler"])


@router.post("/", response_model=TagRead, status_code=status.HTTP_201_CREATED)
def create_tag(
    data: TagCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Yeni bir etiket oluşturur."""
    return tag_service.create_tag(db, user, data)


@router.get("/", response_model=list[TagRead])
def list_tags(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Kullanıcının etiketlerini listeler."""
    return tag_service.list_tags(db, user)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Kullanıcının etiketini siler."""
    tag_service.delete_tag(db, user, tag_id)

@router.post("/notes/{note_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_tag_to_note(
    note_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Kullanıcının notuna etiket ekler."""
    tag_service.add_tag_to_note(db, user, note_id, tag_id)

@router.delete("/notes/{note_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_note(
    note_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Kullanıcının notundan etiketi kaldırır."""
    tag_service.remove_tag_from_note(db, user, note_id, tag_id)    
