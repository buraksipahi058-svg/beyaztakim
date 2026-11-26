import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { CANVAS_PADDING, tagKey } from './canvasLayout.js';
import Icon from './Icon.jsx';
import { noteColor } from './noteColors.js';
import './TagStack.css';

// Destede üst üste görünen en fazla kart sayısı ve her kartın eğimi / kayması.
const PREVIEW_COUNT = 3;
const PILE_TILTS = ['0deg', '-3deg', '2.5deg'];
const PILE_SHIFTS = ['0px', '5px', '9px'];

// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfa tuvalinde aynı etiketi taşıyan notların destesi. En üstteki birkaç
// not üst üste, hafif eğik görünür; üstte etiket adı ve not sayısı yazar.
// - Tıklayınca (ya da odaktayken Enter/Boşluk) deste açılır: onOpen(tagId, öğe).
// - Sürükleyince deste taşınır; bırakınca onMove(tag, x, y) çağrılır.
// Girdi: { stack: { tag, notes }, position: { x, y }, zIndex, isOpen,
//          startDrag (useCanvasGestures), onRaise(), onMove(tag, x, y), onOpen(tagId, element) }
export default function TagStack({ stack, position, zIndex, isOpen, startDrag, onRaise, onMove, onOpen }) {
  const { tag, notes } = stack;
  const elementRef = useRef(null);
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const [isDragging, setIsDragging] = useState(false);

  // Konum dışarıdan değişirse (otomatik yerleşim, kayıt hatasında geri alma) desteyi oraya taşı.
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  function open() {
    onOpen(tag.id, elementRef.current);
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    startDrag(event, {
      x,
      y,
      onStart: () => {
        setIsDragging(true);
        onRaise();
      },
      onEnd: () => setIsDragging(false),
      onDrop: (newX, newY) => onMove(tag, newX, newY),
      onClick: open,
    });
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  }

  return (
    <motion.div
      ref={elementRef}
      className={`tag-stack${isOpen ? ' tag-stack--open' : ''}${isDragging ? ' tag-stack--dragging' : ''}`}
      data-canvas-key={tagKey(tag.id)}
      role="button"
      tabIndex={0}
      aria-label={`${tag.name} etiketi, ${notes.length} not. Açmak için basın.`}
      style={{ x, y, zIndex, top: CANVAS_PADDING, left: CANVAS_PADDING }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isDragging ? 1.03 : 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
    >
      <div className="tag-stack__label">
        <Icon name="tag" size={15} />
        <span className="tag-stack__name">{tag.name}</span>
        <span className="tag-stack__count">{notes.length}</span>
      </div>
      <div className="tag-stack__pile" aria-hidden="true">
        {notes.slice(0, PREVIEW_COUNT).map((note, index) => (
          <StackPreviewCard key={note.id} note={note} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

// Destedeki notun küçük önizlemesi: başlık ve ilk birkaç satır (liste notunda maddeler).
// index 0 en üstteki karttır; diğerleri arkasında eğik durur.
function StackPreviewCard({ note, index }) {
  const isChecklist = note.note_type === 'checklist';
  const text = isChecklist
    ? (note.checklist_items ?? [])
        .slice(0, 4)
        .map((item) => `${item.is_done ? '☑' : '☐'} ${item.text}`)
        .join('\n')
    : note.content;

  return (
    <div
      className={`tag-stack__card${index > 0 ? ' tag-stack__card--behind' : ''}`}
      style={{
        '--note-bg': noteColor(note.color),
        '--tilt': PILE_TILTS[index],
        '--shift': PILE_SHIFTS[index],
        zIndex: PREVIEW_COUNT - index,
      }}
    >
      {index === 0 && (
        <>
          {note.title && <p className="tag-stack__title">{note.title}</p>}
          {text && <p className="tag-stack__text">{text}</p>}
        </>
      )}
    </div>
  );
}
