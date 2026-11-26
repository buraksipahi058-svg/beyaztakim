// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
// Backend uç noktaları: /trash (backend/app/routers/trash.py)

import { apiRequest } from './client.js';

// Çöp kutusundaki notları getirir; en son çöpe atılan üstte.
export function listTrashedNotes() {
  return apiRequest('/trash');
}

// Notu çöp kutusuna taşır; güncel notu döndürür.
export function moveNoteToTrash(noteId) {
  return apiRequest(`/trash/${noteId}`, { method: 'POST' });
}

// Notu çöp kutusundan geri yükler; güncel notu döndürür.
export function restoreNote(noteId) {
  return apiRequest(`/trash/${noteId}/restore`, { method: 'POST' });
}

// Çöp kutusundaki notu kalıcı olarak siler (geri alınamaz).
export function deleteNotePermanently(noteId) {
  return apiRequest(`/trash/${noteId}`, { method: 'DELETE' });
}
