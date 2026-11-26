import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimate, usePresence } from 'framer-motion';
import Icon from './Icon.jsx';
import NoteCard from './NoteCard.jsx';
import { POPUP_SELECTOR, useRevealPopups } from './useRevealPopups.js';
import './StackOverlay.css';

// Kartlar desteden çıkarken / desteye dönerken bu ölçeğe küçülür.
const FOLDED_SCALE = 0.45;
// Kartlar art arda çıksın diye her karta eklenen gecikme (en fazla 12 kart için artar).
const STAGGER_SECONDS = 0.035;

// Sahibi: 2. kişi (Not İşlemleri)
//
// Açılmış etiket destesi. Arka plan kararır, destedeki kartlar destenin
// bulunduğu yerden çıkıp ekranın ortasında bir ızgarada açılır. Kartlar normal
// kullanılır (düzenle, renk, etiket, arşiv...). Boş bir yere basınca, kapatma
// düğmesiyle ya da Esc ile kartlar desteye geri dönerek kapanır.
// AnimatePresence içinde kullanılır; kapanış animasyonu bitince ekrandan kalkar.
// Girdi: { stack: { tag, notes }, origin: { x, y } (destenin ekrandaki orta noktası),
//          onClose(), onNoteChange, onNoteRemove, onEdit }
export default function StackOverlay({ stack, origin, onClose, onNoteChange, onNoteRemove, onEdit }) {
  const { tag, notes } = stack;
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);
  // Basış boş bir yere mi oldu, o sırada bir açılır kutu açık mıydı (tıklama anında bakılır).
  const pressRef = useRef({ onEmpty: false, popupWasOpen: false });

  useRevealPopups(contentRef);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
  }, []);

  // Esc kapatır; ama bir kartın açılır kutusu açıksa önce yalnızca o kapansın.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      if (contentRef.current?.querySelector(POPUP_SELECTOR)) return;
      onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handlePointerDown(event) {
    pressRef.current = {
      onEmpty: !event.target.closest('.stack-overlay__card, .stack-overlay__header'),
      popupWasOpen: Boolean(contentRef.current.querySelector(POPUP_SELECTOR)),
    };
  }

  // Boşa basınca kapan; açık bir kutu varsa bu basış yalnızca onu kapatmış sayılır.
  function handleClick() {
    const { onEmpty, popupWasOpen } = pressRef.current;
    if (onEmpty && !popupWasOpen) onClose();
  }

  return createPortal(
    <div className="stack-overlay" role="dialog" aria-modal="true" aria-label={`${tag.name} etiketli notlar`}>
      <motion.div
        className="stack-overlay__backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.05 } }}
        transition={{ duration: 0.25 }}
      />
      <div
        className="stack-overlay__content"
        ref={contentRef}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <motion.header
          className="stack-overlay__header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
        >
          <Icon name="tag" size={18} />
          <h2 className="stack-overlay__title">{tag.name}</h2>
          <span className="stack-overlay__count">{notes.length} not</span>
          <button
            type="button"
            ref={closeButtonRef}
            className="icon-button stack-overlay__close"
            onClick={onClose}
            title="Desteyi kapat"
            aria-label="Desteyi kapat"
          >
            <Icon name="close" size={18} />
          </button>
        </motion.header>

        <div className="stack-overlay__grid">
          {notes.map((note, index) => (
            <ExpandedCard
              key={note.id}
              note={note}
              index={index}
              count={notes.length}
              origin={origin}
              onNoteChange={onNoteChange}
              onNoteRemove={onNoteRemove}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// Açılmış destedeki tek kart. Açılışta destenin yerinden ızgaradaki yerine,
// kapanışta ızgaradan destenin yerine uçar.
function ExpandedCard({ note, index, count, origin, onNoteChange, onNoteRemove, onEdit }) {
  const [scope, animate] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();

  // Kartın ızgaradaki yerinden destenin orta noktasına olan uzaklık. Kartın o
  // anki dönüşümü (animasyon) hesaba katılmaz.
  function offsetToOrigin() {
    const card = scope.current;
    const grid = card.offsetParent.getBoundingClientRect();
    return {
      x: origin.x - (grid.left + card.offsetLeft + card.offsetWidth / 2),
      y: origin.y - (grid.top + card.offsetTop + card.offsetHeight / 2),
    };
  }

  useLayoutEffect(() => {
    const offset = offsetToOrigin();
    animate(
      scope.current,
      { x: [offset.x, 0], y: [offset.y, 0], scale: [FOLDED_SCALE, 1], opacity: [0, 1] },
      {
        default: { type: 'spring', stiffness: 260, damping: 26 },
        opacity: { duration: 0.18 },
        delay: Math.min(index, 12) * STAGGER_SECONDS,
      },
    );
    // Yalnızca açılışta bir kez çalışır.
  }, []);

  useEffect(() => {
    if (isPresent) return;
    const offset = offsetToOrigin();
    animate(
      scope.current,
      { x: offset.x, y: offset.y, scale: FOLDED_SCALE, opacity: 0 },
      {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        opacity: { duration: 0.2, delay: 0.1 },
        delay: Math.min(count - 1 - index, 12) * 0.015,
      },
    ).then(safeToRemove);
  }, [isPresent]);

  return (
    <div className="stack-overlay__card" ref={scope}>
      <NoteCard
        note={note}
        onNoteChange={onNoteChange}
        onNoteRemove={onNoteRemove}
        onEdit={onEdit}
        layoutAnimation={false}
      />
    </div>
  );
}
