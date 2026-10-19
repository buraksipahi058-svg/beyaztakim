import { useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import NoteForm from '../components/NoteForm.jsx';
import NoteGrid from '../components/NoteGrid.jsx';
import { sampleNotes } from '../api/sampleNotes.js';

// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfa. Notlar API'si yazılana kadar sampleNotes ile çalışır; böylece
// 3, 4 ve 5. kişi kart üzerindeki düğmelerini API'yi beklemeden deneyebilir.
// API hazır olunca sampleNotes yerine src/api/notes.js'teki fonksiyon kullanılacak.
export default function HomePage() {
  const [notes, setNotes] = useState(sampleNotes);

  function handleNoteChange(updatedNote) {
    setNotes((current) => current.map((note) => (note.id === updatedNote.id ? updatedNote : note)));
  }

  function handleNoteRemove(noteId) {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

  const pinned = notes.filter((note) => note.is_pinned);
  const others = notes.filter((note) => !note.is_pinned);
  const gridProps = { onNoteChange: handleNoteChange, onNoteRemove: handleNoteRemove };

  return (
    <>
      <NoteForm />
      <p className="page-hint">Bu sayfadaki notlar örnek veridir.</p>

      {notes.length === 0 && <EmptyState icon="lightbulb" message="Eklediğiniz notlar burada görünür" />}

      {pinned.length > 0 && (
        <section className="note-section">
          <h2 className="section-title">Sabitlenenler</h2>
          <NoteGrid notes={pinned} {...gridProps} />
        </section>
      )}

      {others.length > 0 && (
        <section className="note-section">
          {pinned.length > 0 && <h2 className="section-title">Diğerleri</h2>}
          <NoteGrid notes={others} {...gridProps} />
        </section>
      )}
    </>
  );
}

HomePage.route = { path: '/', title: 'Notlar', icon: 'lightbulb', order: 1 };
