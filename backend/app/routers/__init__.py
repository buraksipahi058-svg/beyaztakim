"""HTTP katmanı (router'lar).

Yeni bir özellik eklemek için bu klasöre bir dosya açın (ör. notes.py) ve
içinde `router` adında bir APIRouter tanımlayın:

    from fastapi import APIRouter

    router = APIRouter(prefix="/notes", tags=["notlar"])

main.py bu klasördeki tüm `router` nesnelerini otomatik olarak ekler;
main.py'ye dokunmanız gerekmez. Router'lar yalnızca HTTP işini yapar
(girdi doğrulama, durum kodu); iş mantığı app/services altında olur.
"""

import importlib
import pkgutil
import sys
from types import ModuleType

from fastapi import APIRouter


def discover_routers(package: ModuleType | None = None) -> list[APIRouter]:
    """Paketteki modüllerde tanımlı `router` nesnelerini isim sırasıyla döndürür.

    `_` ile başlayan modüller atlanır.
    """
    package = package or sys.modules[__name__]
    routers: list[APIRouter] = []
    module_names = sorted(info.name for info in pkgutil.iter_modules(package.__path__))
    for name in module_names:
        if name.startswith("_"):
            continue
        module = importlib.import_module(f"{package.__name__}.{name}")
        router = getattr(module, "router", None)
        if isinstance(router, APIRouter):
            routers.append(router)
    return routers
