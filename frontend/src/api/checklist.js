// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
// Backend uç noktaları: /checklist (backend/app/routers/checklist.py)

import { apiRequest } from './client.js';

// Liste notunun sonuna madde ekler; eklenen maddeyi döndürür.
export function addChecklistItem(noteId, text) {
  return apiRequest(`/checklist/${noteId}/items`, { method: 'POST', body: { text } });
}

// Maddenin metnini ve/veya işaretini günceller: changes = { text?, is_done? }.
export function updateChecklistItem(itemId, changes) {
  return apiRequest(`/checklist/items/${itemId}`, { method: 'PATCH', body: changes });
}

// Maddeyi siler.
export function deleteChecklistItem(itemId) {
  return apiRequest(`/checklist/items/${itemId}`, { method: 'DELETE' });
}
