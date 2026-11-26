// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfa. Notlar src/api/notes.js üzerinden gerçek API'den gelir; arşivdeki
// ve çöp kutusundaki notlar API zaten döndürmez. Notlar iki ızgarada
// gösterilir: "Sabitlenenler" ve "Diğerleri".

import { useEffect, useState } from 'react';
import { listNotes } from '../api/notes.js';
import EmptyState from '../components/EmptyState.jsx';
import NoteForm from '../components/NoteForm.jsx';
import NoteGrid from '../components/NoteGrid.jsx';

// Sahibi: 2. kişi (Not İşlemleri)
export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    let isActive = true;
    listNotes()
      .then((loadedNotes) => {
        if (isActive) setNotes(loadedNotes);
      })
      .catch((listError) => {
        if (isActive) setLoadError(listError.message || 'Notlar yüklenemedi.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  // Formdan kaydedilen not: listede yoksa en üste eklenir, varsa güncellenir.
  function handleNoteSaved(savedNote) {
    setNotes((current) =>
      current.some((note) => note.id === savedNote.id)
        ? current.map((note) => (note.id === savedNote.id ? savedNote : note))
        : [savedNote, ...current],
    );
    setEditingNote(null);
  }

  function handleNoteChange(updatedNote) {
    setNotes((current) => current.map((note) => (note.id === updatedNote.id ? updatedNote : note)));
  }

  function handleNoteRemove(noteId) {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

  function handleCancelEdit() {
    setEditingNote(null);
  }

  const pinned = notes.filter((note) => note.is_pinned);
  const others = notes.filter((note) => !note.is_pinned);
  const gridProps = {
    onNoteChange: handleNoteChange,
    onNoteRemove: handleNoteRemove,
    onEdit: setEditingNote,
  };

  return (
    <>
      <NoteForm editingNote={editingNote} onNoteSaved={handleNoteSaved} onCancelEdit={handleCancelEdit} />

      {isLoading && <p className="page-hint">Notlar yükleniyor...</p>}
      {loadError && <p className="page-hint">{loadError}</p>}

      {!isLoading && !loadError && notes.length === 0 && (
        <EmptyState icon="lightbulb" message="Eklediğiniz notlar burada görünür" />
      )}

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
