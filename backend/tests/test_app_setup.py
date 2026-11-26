"""Altyapı fonksiyonlarının testleri (router keşfi, hata dönüşümü, tarih biçimi)."""

import asyncio
import importlib
import json
from datetime import UTC, datetime, timedelta, timezone

from app.main import service_error_handler
from app.routers import discover_routers
from app.schemas import UserRead, as_utc
from app.services.errors import ConflictError, NotFoundError

ROUTER_MODULE = "from fastapi import APIRouter\nrouter = APIRouter(prefix='{prefix}')\n"


def test_discover_routers_returns_routers_sorted_by_module_name(tmp_path, monkeypatch):
    package_dir = tmp_path / "fake_routers"
    package_dir.mkdir()
    (package_dir / "__init__.py").write_text("")
    (package_dir / "b_notes.py").write_text(ROUTER_MODULE.format(prefix="/b"))
    (package_dir / "a_tags.py").write_text(ROUTER_MODULE.format(prefix="/a"))
    (package_dir / "_private.py").write_text(ROUTER_MODULE.format(prefix="/private"))
    (package_dir / "helpers.py").write_text("VALUE = 1\n")
    monkeypatch.syspath_prepend(str(tmp_path))

    routers = discover_routers(importlib.import_module("fake_routers"))

    assert [router.prefix for router in routers] == ["/a", "/b"]


def test_feature_routers_have_unique_prefixes():
    prefixes = [router.prefix for router in discover_routers()]

    assert prefixes, "app/routers altında router bulunamadı"
    assert len(prefixes) == len(set(prefixes)), f"Aynı önek birden çok router'da: {prefixes}"


def test_service_error_handler_uses_error_status_code():
    response = asyncio.run(service_error_handler(None, NotFoundError("Not bulunamadı.")))

    assert response.status_code == 404
    assert json.loads(response.body) == {"detail": "Not bulunamadı."}


def test_conflict_error_maps_to_409():
    response = asyncio.run(service_error_handler(None, ConflictError("Etiket zaten var.")))

    assert response.status_code == 409


def test_as_utc_marks_naive_datetime_as_utc():
    assert as_utc(datetime(2026, 12, 1, 9, 0)) == datetime(2026, 12, 1, 9, 0, tzinfo=UTC)


def test_as_utc_converts_other_timezones_to_utc():
    istanbul_noon = datetime(2026, 12, 1, 12, 0, tzinfo=timezone(timedelta(hours=3)))

    converted = as_utc(istanbul_noon)

    assert converted.utcoffset() == timedelta(0)
    assert converted.hour == 9


def test_read_schemas_send_dates_with_utc_marker():
    user = UserRead(id=1, email="a@example.com", created_at=datetime(2026, 12, 1, 9, 0))

    assert user.model_dump_json().endswith('"created_at":"2026-12-01T09:00:00Z"}')
