"""SQLite veritabanı bağlantısı ve oturum yönetimi."""

from collections.abc import Iterator

from sqlalchemy import Engine, create_engine, event, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import get_settings

IN_MEMORY_URLS = {"sqlite://", "sqlite:///:memory:"}


class Base(DeclarativeBase):
    """Tüm modellerin türediği temel sınıf."""


def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
    # SQLite varsayılan olarak yabancı anahtar kısıtlarını uygulamaz.
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def build_engine(database_url: str) -> Engine:
    """Verilen adres için SQLAlchemy engine oluşturur.

    Bellek içi SQLite adreslerinde tüm bağlantılar aynı veritabanını
    görsün diye StaticPool kullanılır (testler bunu kullanır).
    """
    is_sqlite = database_url.startswith("sqlite")
    engine_kwargs: dict = {}
    if is_sqlite:
        # FastAPI istekleri farklı thread'lerde çalışabilir.
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    if database_url in IN_MEMORY_URLS:
        engine_kwargs["poolclass"] = StaticPool

    engine = create_engine(database_url, **engine_kwargs)
    if is_sqlite:
        event.listen(engine, "connect", _enable_sqlite_foreign_keys)
    return engine


engine = build_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def create_tables(bind: Engine | None = None) -> None:
    """Modellerdeki tüm tabloları (yoksa) oluşturur, var olanlara eksik sütunları ekler."""
    # Modellerin Base.metadata'ya kaydolması için içe aktarılması gerekir.
    from app import models  # noqa: F401

    bind = bind or engine
    Base.metadata.create_all(bind=bind)
    add_missing_columns(bind)


def add_missing_columns(bind: Engine) -> list[str]:
    """Var olan tablolara, modelde olup veritabanında olmayan sütunları ekler.

    create_all yeni tablo oluşturur ama var olan tabloya sütun eklemez. Bu
    yüzden modele sütun eklenince ekip üyelerinin mevcut veritabanı bozulurdu.
    Yalnızca boş olabilen (nullable) sütunlar `ALTER TABLE ... ADD COLUMN` ile
    eklenir; var olan satırlarda yeni sütun boş kalır. Eklenen sütunları
    "tablo.sütun" olarak döndürür.
    """
    inspector = inspect(bind)
    existing_tables = set(inspector.get_table_names())
    added: list[str] = []
    with bind.begin() as connection:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue
            existing_columns = {column["name"] for column in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing_columns:
                    continue
                if not column.nullable:
                    raise RuntimeError(
                        f"{table.name}.{column.name} boş olamayan bir sütun, otomatik "
                        "eklenemez. Veritabanı dosyasını silip uygulamayı yeniden başlatın."
                    )
                column_type = column.type.compile(dialect=bind.dialect)
                connection.execute(
                    text(f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {column_type}')
                )
                added.append(f"{table.name}.{column.name}")
    return added


def get_db() -> Iterator[Session]:
    """İstek başına bir veritabanı oturumu açar ve sonunda kapatır."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
