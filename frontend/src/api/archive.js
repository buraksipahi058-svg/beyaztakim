// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
// Backend uç noktaları: /archive (backend/app/routers/archive.py)

import { apiRequest } from './client.js';

// Arşivdeki notları getirir; en son güncellenen üstte.
export function listArchivedNotes() {
  return apiRequest('/archive');
}

// Notu arşive taşır (sabitlemesi kalkar); güncel notu döndürür.
export function archiveNote(noteId) {
  return apiRequest(`/archive/${noteId}`, { method: 'POST' });
}

// Notu arşivden çıkarır; güncel notu döndürür.
export function unarchiveNote(noteId) {
  return apiRequest(`/archive/${noteId}`, { method: 'DELETE' });
}
