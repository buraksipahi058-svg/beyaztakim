"""FastAPI uygulamasının giriş noktası.

Çalıştırma (backend/ klasöründen): uvicorn app.main:app --reload
Bu dosya ortak dosyadır; yeni router eklemek için buraya dokunmayın,
app/routers altına dosya açmanız yeterli.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import create_tables
from app.routers import discover_routers
from app.schemas import HealthResponse
from app.services.errors import ServiceError

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    create_tables()
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ServiceError)
async def service_error_handler(_request: Request, exc: ServiceError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/health", response_model=HealthResponse, tags=["sistem"])
def health() -> HealthResponse:
    """Sağlık kontrolü: uygulama ayaktaysa 200 döner."""
    return HealthResponse(status="ok")


for router in discover_routers():
    app.include_router(router)
