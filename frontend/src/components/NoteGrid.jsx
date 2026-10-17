import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from './NoteCard.jsx';
import './NoteCard.css';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

// Not kartlarını ızgara halinde, sırayla belirerek gösterir.
export default function NoteGrid({ notes }) {
  return (
    <motion.div className="note-grid" variants={gridVariants} initial="hidden" animate="visible">
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
