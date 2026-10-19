"""Pydantic şemaları (API girdi/çıktı biçimleri).

- common.py: herkesin kullandığı okuma şemaları (ortak dosya).
- <özellik>.py: her özelliğin kendi girdi/çıktı şemaları (ör. notes.py).

Ortak şemalar doğrudan paketten de alınabilir:

    from app.schemas import NoteRead
"""

from app.schemas.common import (
    ChecklistItemRead,
    HealthResponse,
    NoteRead,
    NoteType,
    ORMModel,
    TagRead,
    UserRead,
)

__all__ = [
    "ChecklistItemRead",
    "HealthResponse",
    "NoteRead",
    "NoteType",
    "ORMModel",
    "TagRead",
    "UserRead",
]
