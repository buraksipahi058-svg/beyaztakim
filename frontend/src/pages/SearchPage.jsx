import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { searchNotes } from '../api/search.js';
import { listTags } from '../api/tags.js';
import EmptyState from '../components/EmptyState.jsx';
import NoteGrid from '../components/NoteGrid.jsx';
import { useNoteList } from '../hooks/useNoteList.js';

function parseTagId(value) {
  return value && /^\d+$/.test(value) ? Number(value) : null;
}

// Sahibi: 3. kişi (Etiket ve Arama)
//
// /search sayfası (menüde görünmez). Adresteki ?q= (arama sözcüğü) ve/veya
// ?tag= (etiket) değerlerine göre notları gösterir. Arama kutusu ve sol menüdeki
// etiketler bu sayfayı açar.
export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const tagId = parseTagId(searchParams.get('tag'));
  const hasCriteria = Boolean(query) || tagId !== null;
  const [tagName, setTagName] = useState('');

  const { notes, isLoading, loadError, handleNoteChange, handleNoteRemove } = useNoteList(
    () => (hasCriteria ? searchNotes({ query, tagId }) : Promise.resolve([])),
    [query, tagId],
  );

  // Başlıkta gösterilecek etiket adı.
  useEffect(() => {
    if (tagId === null) {
      setTagName('');
      return;
    }
    listTags()
      .then((tags) => setTagName(tags.find((tag) => tag.id === tagId)?.name ?? ''))
      .catch(() => setTagName(''));
  }, [tagId]);

  if (!hasCriteria) {
    return (
      <EmptyState
        icon="search"
        message="Aramak için yukarıdaki kutuya yazın ya da soldan bir etiket seçin"
      />
    );
  }

  return (
    <>
      <h2 className="section-title">
        {tagId !== null && `Etiket: ${tagName}`}
        {tagId !== null && query && ' · '}
        {query && `"${query}" için sonuçlar`}
      </h2>

      {isLoading && notes.length === 0 && <p className="page-hint">Aranıyor...</p>}
      {loadError && <p className="page-hint">{loadError}</p>}

      {!isLoading && !loadError && notes.length === 0 && (
        <EmptyState icon="search" message="Eşleşen not bulunamadı" />
      )}

      {notes.length > 0 && (
        <NoteGrid notes={notes} onNoteChange={handleNoteChange} onNoteRemove={handleNoteRemove} />
      )}
    </>
  );
}

SearchPage.route = { path: '/search', inMenu: false };
