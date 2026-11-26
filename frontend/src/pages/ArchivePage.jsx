import { listArchivedNotes } from '../api/archive.js';
import EmptyState from '../components/EmptyState.jsx';
import NoteGrid from '../components/NoteGrid.jsx';
import { useNoteList } from '../hooks/useNoteList.js';

// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
// Arşivdeki notları gösterir. Arşivden çıkarılan ya da çöpe taşınan not
// listeden kaybolur.
export default function ArchivePage() {
  const { notes, isLoading, loadError, handleNoteChange, handleNoteRemove } =
    useNoteList(listArchivedNotes);

  return (
    <>
      {isLoading && <p className="page-hint">Arşiv yükleniyor...</p>}
      {loadError && <p className="page-hint">{loadError}</p>}

      {!isLoading && !loadError && notes.length === 0 && (
        <EmptyState icon="archive" message="Arşivlenen notlarınız burada görünür" />
      )}

      {notes.length > 0 && (
        <NoteGrid notes={notes} onNoteChange={handleNoteChange} onNoteRemove={handleNoteRemove} />
      )}
    </>
  );
}

ArchivePage.route = { path: '/archive', title: 'Arşiv', icon: 'archive', order: 8 };
