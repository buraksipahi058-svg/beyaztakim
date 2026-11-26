// Sahibi: 3. kişi (Etiket ve Arama)
// Backend uç noktaları: /tags (backend/app/routers/tags.py)

import { apiRequest } from './client.js';

const TAGS_CHANGED_EVENT = 'beyaztakim:tags-changed';

// Kullanıcının etiketlerini alfabetik sırayla getirir.
export function listTags() {
  return apiRequest('/tags');
}

// Yeni etiket oluşturur; aynı adda etiket varsa ApiError (409) fırlatır.
export async function createTag(name) {
  const tag = await apiRequest('/tags', { method: 'POST', body: { name } });
  notifyTagsChanged();
  return tag;
}

// Etiketi siler; notlardaki bağları da kalkar.
export async function deleteTag(tagId) {
  await apiRequest(`/tags/${tagId}`, { method: 'DELETE' });
  notifyTagsChanged({ deletedTagId: tagId });
}

// Etiket destesinin ana sayfa tuvalindeki konumunu kaydeder; güncel etiketi döndürür.
export function updateTagPosition(tagId, positionX, positionY) {
  return apiRequest(`/tags/${tagId}/position`, {
    method: 'PATCH',
    body: { position_x: positionX, position_y: positionY },
  });
}

// Nota etiket ekler (etiket zaten varsa bir şey değişmez).
export function addTagToNote(noteId, tagId) {
  return apiRequest(`/tags/notes/${noteId}/tags/${tagId}`, { method: 'POST' });
}

// Etiketi nottan çıkarır.
export function removeTagFromNote(noteId, tagId) {
  return apiRequest(`/tags/notes/${noteId}/tags/${tagId}`, { method: 'DELETE' });
}

// Etiket listesi değiştiğinde (oluşturma/silme) diğer bileşenlere haber verir.
// detail: { deletedTagId } (silmede) ya da boş.
export function notifyTagsChanged(detail = {}) {
  window.dispatchEvent(new CustomEvent(TAGS_CHANGED_EVENT, { detail }));
}

// Etiket listesi değişince callback(detail) çağrılır; kaydı silen fonksiyonu döndürür.
export function onTagsChanged(callback) {
  const listener = (event) => callback(event.detail ?? {});
  window.addEventListener(TAGS_CHANGED_EVENT, listener);
  return () => window.removeEventListener(TAGS_CHANGED_EVENT, listener);
}
