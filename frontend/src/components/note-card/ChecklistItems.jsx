import './ChecklistItems.css';

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
//
// Liste türündeki (note_type: "checklist") notların maddeleri. Şu an maddeleri
// sadece gösterir; madde ekleme, işaretleme ve silme buraya eklenecek.
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function ChecklistItems({ note }) {
  return (
    <ul className="note-card__checklist">
      {note.checklist_items.map((item) => (
        <li key={item.id} className={item.is_done ? 'is-done' : undefined}>
          <span className="note-card__checkbox" aria-hidden="true" />
          {item.text}
        </li>
      ))}
    </ul>
  );
}
