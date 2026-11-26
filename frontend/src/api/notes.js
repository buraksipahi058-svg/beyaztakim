// Sahibi: 2. kişi (Not İşlemleri)
// Backend uç noktaları: /notes (backend/app/routers/notes.py)

import { apiRequest } from './client.js';

// Arşivde ve çöp kutusunda olmayan notları getirir; sabitlenenler üste gelir.
export function listNotes() {
  return apiRequest('/notes');
}

// Tek bir notu getirir.
export function getNote(noteId) {
  return apiRequest(`/notes/${noteId}`);
}

// Yeni not oluşturur; gövde backend'deki NoteCreate şemasıyla aynıdır.
export function createNote(noteData) {
  return apiRequest('/notes', { method: 'POST', body: noteData });
}

// Notu kısmen günceller; gövde backend'deki NoteUpdate şemasıyla aynıdır.
export function updateNote(noteId, noteData) {
  return apiRequest(`/notes/${noteId}`, { method: 'PATCH', body: noteData });
}

// Notun ana sayfa tuvalindeki konumunu (piksel) kaydeder; güncel notu döndürür.
export function updateNotePosition(noteId, positionX, positionY) {
  return apiRequest(`/notes/${noteId}/position`, {
    method: 'PATCH',
    body: { position_x: positionX, position_y: positionY },
  });
}
