import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard.jsx';
import './NoteCard.css';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

// Sahibi: 2. kişi (Not İşlemleri)
//
// Not kartlarını ızgara halinde, sırayla belirerek gösterir. Listeden çıkan
// kart küçülerek kaybolur, kalanlar yerine kayar.
// onNoteChange ve onNoteRemove her karta iletilir (bkz. NoteCard.jsx).
export default function NoteGrid({ notes, onNoteChange, onNoteRemove }) {
  return (
    <motion.div className="note-grid" variants={gridVariants} initial="hidden" animate="visible">
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteChange={onNoteChange}
            onNoteRemove={onNoteRemove}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
