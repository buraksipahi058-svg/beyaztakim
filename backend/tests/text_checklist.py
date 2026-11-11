import pytest
from fastapi.testclient import TestClient

def test_add_checklist_item(client: TestClient):
    """Nota yeni bir liste maddesi ekleme testi."""
    # 1. Test için geçici bir not oluştur
    create_note_res = client.post("/notes/", json={"title": "Alışveriş", "content": "Liste"})
    assert create_note_res.status_code == 201
    note_id = create_note_res.json()["id"]

    # 2. Liste maddesi ekle
    response = client.post(
        f"/checklist/{note_id}/items",
        json={"text": "Süt al"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["text"] == "Süt al"
    assert data["is_completed"] is False
    assert data["note_id"] == note_id

def test_update_checklist_item(client: TestClient):
    """Liste maddesini güncelleme/işaretleme testi."""
    # 1. Not ve madde oluştur
    create_note_res = client.post("/notes/", json={"title": "Yapılacaklar"})
    note_id = create_note_res.json()["id"]
    
    item_res = client.post(f"/checklist/{note_id}/items", json={"text": "Ekmek al"})
    item_id = item_res.json()["id"]

    # 2. Maddeyi tamamlandı olarak işaretle (is_completed: True)
    update_res = client.patch(
        f"/checklist/items/{item_id}",
        json={"is_completed": True}
    )
    assert update_res.status_code == 200
    assert update_res.json()["is_completed"] is True

def test_delete_checklist_item(client: TestClient):
    """Liste maddesini silme testi."""
    # 1. Not ve madde oluştur
    create_note_res = client.post("/notes/", json={"title": "Silinecek Liste"})
    note_id = create_note_res.json()["id"]
    
    item_res = client.post(f"/checklist/{note_id}/items", json={"text": "Yumurta al"})
    item_id = item_res.json()["id"]

    # 2. Maddeyi sil
    del_res = client.delete(f"/checklist/items/{item_id}")
    assert del_res.status_code == 204

    # 3. Silinen maddeyi tekrar güncellemeye çalış (404 Not Found dönmeli)
    again_res = client.patch(f"/checklist/items/{item_id}", json={"text": "Test"})
    assert again_res.status_code == 404