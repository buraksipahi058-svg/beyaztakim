import { motion } from 'framer-motion';
import ArchiveTrashActions from './note-card/ArchiveTrashActions.jsx';
import ChecklistItems from './note-card/ChecklistItems.jsx';
import NoteTags from './note-card/NoteTags.jsx';
import PinColorActions from './note-card/PinColorActions.jsx';
import ReminderChip from './note-card/ReminderChip.jsx';
import { noteColor } from './noteColors.js';
import './NoteCard.css';

export const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
};

// Sahibi: 2. kişi (Not İşlemleri)
//
// Tek bir notu kart olarak gösterir. `note` backend'deki NoteRead şemasıyla
// aynı alanlara sahiptir.
//
// Kartın içinde diğer kişilere ayrılmış yerler var (components/note-card/).
// Bu yerleri silme ya da kaldırma; içlerini sahipleri doldurur. Her yer şunları alır:
//   note               : gösterilen not
//   onNoteChange(note) : not değişince (ör. renk, sabitleme) güncel notla çağrılır
//   onNoteRemove(id)   : not bu listeden çıkınca (ör. arşivlendi) çağrılır
export default function NoteCard({ note, onNoteChange, onNoteRemove }) {
  const slotProps = { note, onNoteChange, onNoteRemove };
  const isChecklist = note.note_type === 'checklist';

  return (
    <motion.article
      className="note-card"
      style={{ '--note-bg': noteColor(note.color) }}
      variants={cardVariants}
      exit="exit"
      layout
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {note.title && <h3 className="note-card__title">{note.title}</h3>}

      {isChecklist ? (
        <ChecklistItems {...slotProps} />
      ) : (
        note.content && <p className="note-card__content">{note.content}</p>
      )}

      <ReminderChip {...slotProps} />
      <NoteTags {...slotProps} />

      <div className="note-card__actions">
        <PinColorActions {...slotProps} />
        <ArchiveTrashActions {...slotProps} />
      </div>
    </motion.article>
  );
}
