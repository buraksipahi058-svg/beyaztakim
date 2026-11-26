// Sahibi: 3. kişi (Etiket ve Arama)
// Backend uç noktaları: /search (backend/app/routers/search.py)

import { apiRequest } from './client.js';

// Notlarda arar: sözcük (başlık, içerik, liste maddeleri) ve/veya etiket.
// Çöpteki notlar dahil edilmez, arşivdekiler edilir.
export function searchNotes({ query = '', tagId = null } = {}) {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (tagId != null) params.set('tag_id', String(tagId));
  return apiRequest(`/search?${params}`);
}
