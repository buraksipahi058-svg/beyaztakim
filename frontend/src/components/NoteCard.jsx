import { motion } from 'framer-motion';
import { noteColor } from './noteColors.js';
import './NoteCard.css';

export const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// Tek bir notu kart olarak gösterir. `note` nesnesi backend'deki
// NoteRead şemasıyla aynı alanlara sahiptir. Yalnızca gösterim yapar.
export default function NoteCard({ note }) {
  const isChecklist = note.note_type === 'checklist';

  return (
    <motion.article
      className="note-card"
      style={{ '--note-bg': noteColor(note.color) }}
      variants={cardVariants}
      layout
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {note.title && <h3 className="note-card__title">{note.title}</h3>}

      {isChecklist ? (
        <ul className="note-card__checklist">
          {note.checklist_items.map((item) => (
            <li key={item.id} className={item.is_done ? 'is-done' : undefined}>
              <span className="note-card__checkbox" aria-hidden="true" />
              {item.text}
            </li>
          ))}
        </ul>
      ) : (
        note.content && <p className="note-card__content">{note.content}</p>
      )}

      {note.tags?.length > 0 && (
        <div className="note-card__tags">
          {note.tags.map((tag) => (
            <span key={tag.id} className="note-card__tag">
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
