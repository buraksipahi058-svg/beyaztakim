import './NoteTags.css';

// Sahibi: 3. kişi (Etiket ve Arama)
//
// Not kartındaki etiket rozetleri. Şu an notun etiketlerini sadece gösterir;
// nota etiket ekleme/çıkarma buraya eklenecek.
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function NoteTags({ note }) {
  if (!note.tags?.length) return null;

  return (
    <div className="note-card__tags">
      {note.tags.map((tag) => (
        <span key={tag.id} className="note-card__tag">
          {tag.name}
        </span>
      ))}
    </div>
  );
}
