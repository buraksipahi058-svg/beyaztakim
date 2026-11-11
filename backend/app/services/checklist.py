"""Liste maddesi ekleme, işaretleme ve silme: iş mantığı.

Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""


from sqlalchemy.orm import Session
from app.models import ChecklistItem, Note
from app.schemas.checklist import ChecklistItemCreate, ChecklistItemUpdate

class NoteNotFoundError(Exception):
    def __init__(self, note_id: int):
        self.note_id = note_id
        super().__init__(f"Note with ID {note_id} not found.")

# Özel bir hata sınıfı: Liste maddesi bulunamazsa fırlatılacak
class ChecklistItemNotFoundError(Exception):
    def __init__(self, item_id: int):
        self.item_id = item_id
        super().__init__(f"Checklist item with ID {item_id} not found.")

def add_checklist_item(db: Session, note_id: int, user_id: int, item_in: ChecklistItemCreate) -> ChecklistItem:
    """Belirtilen nota yeni bir liste maddesi ekler."""
    # 1. Notun var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol et
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not note:
        raise NoteNotFoundError(note_id)

    # 2. Yeni maddeyi oluştur ve veritabanına ekle
    new_item = ChecklistItem(note_id=note_id, text=item_in.text)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

def update_checklist_item(db: Session, item_id: int, user_id: int, item_in: ChecklistItemUpdate) -> ChecklistItem:
    """Var olan bir liste maddesinin metnini veya tamamlanma durumunu günceller."""
    # 1. Maddeyi bul (ve kullanıcının erişim izni olduğunu doğrulamak için Note tablosuyla birleştir)
    item = db.query(ChecklistItem).join(Note).filter(
        ChecklistItem.id == item_id, 
        Note.user_id == user_id
    ).first()
    
    if not item:
        raise ChecklistItemNotFoundError(item_id)

    # 2. Gönderilen verileri güncelle (None olmayanları)
    if item_in.text is not None:
        item.text = item_in.text
    if item_in.is_completed is not None:
        item.is_completed = item_in.is_completed

    db.commit()
    db.refresh(item)
    return item

def delete_checklist_item(db: Session, item_id: int, user_id: int) -> None:
    """Belirtilen liste maddesini siler."""
    # 1. Maddeyi bul
    item = db.query(ChecklistItem).join(Note).filter(
        ChecklistItem.id == item_id, 
        Note.user_id == user_id
    ).first()
    
    if not item:
        raise ChecklistItemNotFoundError(item_id)

    # 2. Maddeyi sil
    db.delete(item)
    db.commit()