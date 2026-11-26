import { listTrashedNotes } from '../api/trash.js';
import EmptyState from '../components/EmptyState.jsx';
import NoteGrid from '../components/NoteGrid.jsx';
import { useNoteList } from '../hooks/useNoteList.js';

// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
// Çöp kutusundaki notları gösterir. Notlar buradan geri yüklenebilir ya da
// kalıcı olarak silinebilir; her iki durumda da listeden kaybolur.
export default function TrashPage() {
  const { notes, isLoading, loadError, handleNoteChange, handleNoteRemove } =
    useNoteList(listTrashedNotes);

  return (
    <>
      {isLoading && <p className="page-hint">Çöp kutusu yükleniyor...</p>}
      {loadError && <p className="page-hint">{loadError}</p>}

      {!isLoading && !loadError && notes.length === 0 && (
        <EmptyState icon="trash" message="Çöp kutusunda not yok" />
      )}

      {notes.length > 0 && (
        <>
          <p className="page-hint">
            Çöp kutusundaki notlar düzenlenemez. Geri yükleyebilir ya da kalıcı olarak silebilirsiniz.
          </p>
          <NoteGrid notes={notes} onNoteChange={handleNoteChange} onNoteRemove={handleNoteRemove} />
        </>
      )}
    </>
  );
}

TrashPage.route = { path: '/trash', title: 'Çöp Kutusu', icon: 'trash', order: 9 };
