// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
// Backend uç noktaları: /pin-color (backend/app/routers/pin_color.py)

import { apiRequest } from './client.js';

// Notu sabitler (true) ya da sabitlemeyi kaldırır (false); güncel notu döndürür.
export function setNotePinned(noteId, isPinned) {
  return apiRequest(`/pin-color/${noteId}/pin`, { method: 'PATCH', body: { is_pinned: isPinned } });
}

// Notun rengini değiştirir (renk adları: components/noteColors.js); güncel notu döndürür.
export function setNoteColor(noteId, color) {
  return apiRequest(`/pin-color/${noteId}/color`, { method: 'PATCH', body: { color } });
}
