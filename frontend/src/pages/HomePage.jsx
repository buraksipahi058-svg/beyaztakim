import NoteGrid from '../components/NoteGrid.jsx';
import { sampleNotes } from '../api/sampleNotes.js';

// Örnek ana sayfa. Notlar API'si yazıldığında sampleNotes yerine
// src/api/notes.js'teki fonksiyon kullanılacak.
export default function HomePage() {
  const pinned = sampleNotes.filter((note) => note.is_pinned);
  const others = sampleNotes.filter((note) => !note.is_pinned);

  return (
    <>
      <p className="page-hint">Bu sayfadaki notlar örnek veridir.</p>

      {pinned.length > 0 && (
        <section className="note-section">
          <h2 className="section-title">Sabitlenenler</h2>
          <NoteGrid notes={pinned} />
        </section>
      )}

      <section className="note-section">
        {pinned.length > 0 && <h2 className="section-title">Diğerleri</h2>}
        <NoteGrid notes={others} />
      </section>
    </>
  );
}

HomePage.route = { path: '/', title: 'Notlar', icon: 'lightbulb', order: 1 };
