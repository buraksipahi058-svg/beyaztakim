import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls, useMotionValue } from 'framer-motion';
import { updateNotePosition } from '../api/notes.js';
import { CANVAS_CARD_WIDTH, CANVAS_GAP, placeUnpositionedNotes } from './canvasLayout.js';
import Icon from './Icon.jsx';
import NoteCard from './NoteCard.jsx';
import './NoteCanvas.css';

// Kartın bu öğelerinden birine basılınca sürükleme başlamaz (düğmeler, alanlar, açılır kutular).
const NO_DRAG_SELECTOR =
  'button, input, textarea, select, label, a, .tag-picker, .color-palette, .reminder-picker';
// Tuvalin altında bırakılan boşluk: kart sona taşınabilsin, açılır kutular kesilmesin.
const BOTTOM_SPACE = 300;
const MIN_HEIGHT = 400;
// Sabitlenen kartlar her zaman sabitlenmemişlerin üstünde çizilir.
const PINNED_LAYER = 1000;

// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfa tuvali: notlar serbestçe sürüklenip bırakıldıkları yerde kalır.
// - Konum sunucuya kaydedilir (PATCH /notes/{id}/position); kayıt başarısız
//   olursa kart eski yerine döner.
// - Konumu olmayan notlar (yeni ya da eski) ilk boş yere yerleşir ve o konum
//   hemen kaydedilir.
// - Son taşınan kart öne gelir; sabitlenen kartlar her zaman üst katmandadır.
// Girdi: { notes, onNoteChange, onNoteRemove, onEdit } (bkz. NoteGrid)
export default function NoteCanvas({ notes, onNoteChange, onNoteRemove, onEdit }) {
  const canvasRef = useRef(null);
  const areaRef = useRef(null);
  const savingIdsRef = useRef(new Set());
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [contentBottom, setContentBottom] = useState(0);
  const [raisedIds, setRaisedIds] = useState([]);
  const [moveError, setMoveError] = useState('');

  // Tuval genişliğini izle (otomatik yerleşimdeki sütun sayısı buna bağlı).
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    setCanvasWidth(canvas.clientWidth);
    const observer = new ResizeObserver(() => setCanvasWidth(canvas.clientWidth));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Konumu olmayan notların ekranda nereye düşeceği.
  const placements = useMemo(
    () => (canvasWidth > 0 ? placeUnpositionedNotes(notes, canvasWidth) : {}),
    [notes, canvasWidth],
  );

  const positionedNotes = notes.map((note) =>
    placements[note.id]
      ? { ...note, position_x: placements[note.id].x, position_y: placements[note.id].y }
      : note,
  );

  // Otomatik bulunan konumları kaydet; böylece not sonraki açılışta da aynı yerde durur.
  // Her not için bir kez denenir (sunucu kapalıyken istek yağmuru olmasın).
  useEffect(() => {
    for (const note of notes) {
      const placement = placements[note.id];
      if (!placement || savingIdsRef.current.has(note.id)) continue;
      savingIdsRef.current.add(note.id);
      onNoteChange?.({ ...note, position_x: placement.x, position_y: placement.y });
      updateNotePosition(note.id, placement.x, placement.y).catch((error) =>
        setMoveError(error.message || 'Notun konumu kaydedilemedi.'),
      );
    }
  }, [notes, placements, onNoteChange]);

  // Kartların gerçek yüksekliğine göre tuvalin ne kadar uzayacağını ölç.
  useLayoutEffect(() => {
    const cards = areaRef.current?.querySelectorAll('.canvas-note') ?? [];
    let bottom = 0;
    cards.forEach((card) => {
      const note = positionedNotes.find((item) => String(item.id) === card.dataset.noteId);
      if (note) bottom = Math.max(bottom, (note.position_y ?? 0) + card.offsetHeight);
    });
    setContentBottom(bottom);
  });

  function raiseNote(noteId) {
    setRaisedIds((current) => [...current.filter((id) => id !== noteId), noteId]);
  }

  async function handleMove(note, x, y) {
    if (x === note.position_x && y === note.position_y) return;
    setMoveError('');
    onNoteChange?.({ ...note, position_x: x, position_y: y });
    try {
      await updateNotePosition(note.id, x, y);
    } catch (error) {
      onNoteChange?.(note);
      setMoveError(error.message || 'Not taşınamadı.');
    }
  }

  const rightmost = Math.max(
    0,
    ...positionedNotes.map((note) => (note.position_x ?? 0) + CANVAS_CARD_WIDTH + CANVAS_GAP),
  );
  const areaHeight = Math.max(contentBottom + BOTTOM_SPACE, MIN_HEIGHT);

  return (
    <>
      {moveError && (
        <p className="page-hint note-canvas__error" role="alert">
          {moveError}
        </p>
      )}
      <div className="note-canvas" ref={canvasRef}>
        <div
          className="note-canvas__area"
          ref={areaRef}
          style={{ width: Math.max(canvasWidth, rightmost), height: areaHeight }}
        >
          <AnimatePresence>
            {positionedNotes.map((note) => (
              <CanvasNote
                key={note.id}
                note={note}
                zIndex={(note.is_pinned ? PINNED_LAYER : 0) + raisedIds.indexOf(note.id) + 2}
                onDragStart={raiseNote}
                onMove={handleMove}
                onNoteChange={onNoteChange}
                onNoteRemove={onNoteRemove}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// Tuvaldeki tek bir sürüklenebilir kart. Konumu Framer Motion'ın x/y değerleriyle verilir.
function CanvasNote({ note, zIndex, onDragStart, onMove, onNoteChange, onNoteRemove, onEdit }) {
  const dragControls = useDragControls();
  const x = useMotionValue(note.position_x ?? 0);
  const y = useMotionValue(note.position_y ?? 0);

  // Konum dışarıdan değişirse (otomatik yerleşim, kayıt hatasında geri alma) kartı oraya taşı.
  useEffect(() => {
    x.set(note.position_x ?? 0);
    y.set(note.position_y ?? 0);
  }, [note.position_x, note.position_y, x, y]);

  // Sürükleme yalnızca kartın boş bir yerinden başlar; düğmeler ve alanlar normal çalışır.
  function handlePointerDown(event) {
    if (event.button !== 0 || event.target.closest(NO_DRAG_SELECTOR)) return;
    dragControls.start(event);
  }

  function handleDragEnd() {
    onMove(note, Math.max(0, Math.round(x.get())), Math.max(0, Math.round(y.get())));
  }

  return (
    <motion.div
      className={`canvas-note${note.is_pinned ? ' canvas-note--pinned' : ''}`}
      data-note-id={note.id}
      style={{ x, y, zIndex }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, top: 0 }}
      onPointerDown={handlePointerDown}
      onDragStart={() => onDragStart(note.id)}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      whileDrag={{ scale: 1.03 }}
    >
      {note.is_pinned && (
        <span className="canvas-note__pin" title="Sabitlenmiş not">
          <Icon name="pin" size={14} />
        </span>
      )}
      <NoteCard
        note={note}
        onNoteChange={onNoteChange}
        onNoteRemove={onNoteRemove}
        onEdit={onEdit}
        layoutAnimation={false}
      />
    </motion.div>
  );
}
