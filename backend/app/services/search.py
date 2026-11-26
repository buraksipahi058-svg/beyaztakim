"""Başlık/içerikte arama ve etikete göre filtreleme: iş mantığı.

Sahibi: 3. kişi (Etiket ve Arama)
Fonksiyonlar ilk parametre olarak `db: Session`, kullanıcıya ait işlemlerde
ikinci parametre olarak `user: User` alır. Hatalar app/services/errors.py'deki
sınıflarla bildirilir.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Note, Tag, User
from app.services.errors import NotFoundError, ValidationError


def normalize_text(text: str) -> str:
    """Metni büyük/küçük harf ve Türkçe i/ı farkı gözetmeden karşılaştırılabilir hale getirir.

    Örnek: "IŞIK", "ışık" ve "Işık" aynı sonucu verir; "İstanbul" ile "istanbul" de.
    """
    return text.casefold().replace("̇", "").replace("ı", "i")


def _note_matches(note: Note, normalized_query: str) -> bool:
    """Notun başlığında, içeriğinde ya da liste maddelerinde sözcük geçiyor mu?"""
    texts = [note.title, note.content, *(item.text for item in note.checklist_items)]
    return any(normalized_query in normalize_text(text) for text in texts)


def search_notes(
    db: Session, user: User, query: str | None = None, tag_id: int | None = None
) -> list[Note]:
    """Kullanıcının çöpte olmayan notlarında arama yapar (arşivdekiler dahil).

    - query: başlık, içerik ya da liste maddelerinde geçmesi gereken sözcük
    - tag_id: yalnızca bu etiketi taşıyan notlar
    İkisi birlikte verilirse ikisine de uyan notlar döner. Sıralama: sabitlenenler
    üste, sonra en son güncellenenler.
    """
    query = (query or "").strip()
    if not query and tag_id is None:
        raise ValidationError("Arama sözcüğü ya da etiket gerekli.")

    statement = select(Note).where(Note.user_id == user.id, Note.is_trashed.is_(False))
    if tag_id is not None:
        tag = db.scalar(select(Tag).where(Tag.id == tag_id, Tag.user_id == user.id))
        if tag is None:
            raise NotFoundError("Etiket bulunamadı.")
        statement = statement.where(Note.tags.contains(tag))
    statement = statement.order_by(Note.is_pinned.desc(), Note.updated_at.desc(), Note.id.desc())

    notes = list(db.scalars(statement))
    if not query:
        return notes
    normalized_query = normalize_text(query)
    return [note for note in notes if _note_matches(note, normalized_query)]
