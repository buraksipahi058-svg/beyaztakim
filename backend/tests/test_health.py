"""Örnek test: yeni testler bu dosyadaki düzeni izleyebilir."""


def test_health_returns_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_docs_page_is_available(client):
    response = client.get("/docs")

    assert response.status_code == 200
