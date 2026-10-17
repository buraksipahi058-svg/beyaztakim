"""Örnek veri betiği.

1 örnek kullanıcı ve birkaç örnek not ekler. Tekrar tekrar çalıştırılabilir:
var olan kullanıcı, etiket ve notları yeniden eklemez.

Çalıştırma (backend/ klasöründen): python -m app.seed
"""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal, create_tables
from app.models import NOTE_TYPE_CHECKLIST, NOTE_TYPE_TEXT, ChecklistItem, Note, Tag, User

SAMPLE_NOTES = [
    {
        "title": "Beyaz Takım'a hoş geldin",
        "content": "Bu, seed betiğinin eklediği örnek bir nottur.",
        "color": "yellow",
        "is_pinned": True,
        "tags": ["proje"],
    },
    {
        "title": "Alışveriş listesi",
        "note_type": NOTE_TYPE_CHECKLIST,
        "color": "green",
        "tags": ["kişisel"],
        "items": [("Süt", True), ("Ekmek", False), ("Yumurta", False)],
    },
    {
        "title": "Toplantı notları",
        "content": "Görev dağılımı docs/fonksiyonlar.md dosyasında.",
        "color": "blue",
        "tags": ["proje"],
        "reminder_in_days": 1,
    },
    {
        "title": "Eski fikir",
        "content": "Arşivlenmiş örnek not.",
        "is_archived": True,
    },
]


def hash_seed_password(password: str) -> str:
    """Örnek kullanıcı için parola özeti üretir (yalnızca standart kütüphane).

    Gerçek giriş sistemi eklendiğinde, o servisteki hash fonksiyonu
    kullanılmalı ve bu fonksiyon onunla değiştirilmelidir.
    """
    iterations = 600_000
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${digest.hex()}"


def _get_or_create_user(db: Session) -> User:
    settings = get_settings()
    user = db.scalar(select(User).where(User.email == settings.seed_user_email))
    if user is None:
        # Parola .env'de verilmemişse rastgele üretilir (giriş sistemi henüz yok).
        password = settings.seed_user_password or secrets.token_urlsafe(16)
        user = User(email=settings.seed_user_email, password_hash=hash_seed_password(password))
        db.add(user)
        db.flush()
    return user


def _get_or_create_tag(db: Session, user: User, name: str) -> Tag:
    tag = db.scalar(select(Tag).where(Tag.user_id == user.id, Tag.name == name))
    if tag is None:
        tag = Tag(user_id=user.id, name=name)
        db.add(tag)
        db.flush()
    return tag


def seed_database(db: Session) -> User:
    """Örnek kullanıcıyı ve notlarını ekler; eksik olanları tamamlar.

    Notlar başlığa göre eşleştirilir: aynı başlıklı not varsa atlanır.
    Örnek kullanıcıyı döndürür.
    """
    user = _get_or_create_user(db)
    existing_titles = set(db.scalars(select(Note.title).where(Note.user_id == user.id)))

    for sample in SAMPLE_NOTES:
        if sample["title"] in existing_titles:
            continue
        reminder_in_days = sample.get("reminder_in_days")
        note = Note(
            user_id=user.id,
            title=sample["title"],
            content=sample.get("content", ""),
            note_type=sample.get("note_type", NOTE_TYPE_TEXT),
            color=sample.get("color", "default"),
            is_pinned=sample.get("is_pinned", False),
            is_archived=sample.get("is_archived", False),
            reminder_at=(
                datetime.now(UTC) + timedelta(days=reminder_in_days) if reminder_in_days else None
            ),
            tags=[_get_or_create_tag(db, user, name) for name in sample.get("tags", [])],
            checklist_items=[
                ChecklistItem(text=text, is_done=is_done, position=position)
                for position, (text, is_done) in enumerate(sample.get("items", []))
            ],
        )
        db.add(note)

    db.commit()
    return user


def main() -> None:
    create_tables()
    with SessionLocal() as db:
        user = seed_database(db)
        note_count = len(user.notes)
    print(f"Seed tamam: {user.email} ({note_count} not)")


if __name__ == "__main__":
    main()
