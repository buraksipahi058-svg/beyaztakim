import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { updateNotePosition } from '../api/notes.js';
import {
  CANVAS_CARD_WIDTH,
  CANVAS_EXTRA_SPACE,
  CANVAS_PADDING,
  CANVAS_POSITION_MAX,
  clamp,
  documentTop,
  edgeScrollStep,
  overflowBeyond,
  placeUnpositionedNotes,
} from './canvasLayout.js';
import Icon from './Icon.jsx';
import NoteCard from './NoteCard.jsx';
import './NoteCanvas.css';

// Kartın bu öğelerinden birine basılınca sürükleme başlamaz (düğmeler, alanlar, açılır kutular).
const NO_DRAG_SELECTOR =
  'button, input, textarea, select, label, a, .tag-picker, .color-palette, .reminder-picker';
// Kartlardaki açılır kutular: açılınca tuval onları gösterecek kadar kayar.
const POPUP_SELECTOR = '.tag-picker, .color-palette, .reminder-picker';
// İmleç bu kadar piksel kaymadan sürükleme başlamaz (tıklama titremesi kartı oynatmasın).
const DRAG_THRESHOLD = 4;
// Tuvalin en az yüksekliği ve altında bırakılan boşluk (.content alt boşluğuyla aynı).
const MIN_VIEWPORT_HEIGHT = 420;
const PAGE_BOTTOM_SPACE = 48;
// Sabitlenen kartlar her zaman sabitlenmemişlerin üstünde çizilir.
const PINNED_LAYER = 1000;

// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfa tuvali: ekrana sığan, çerçeveli ve kendi içinde kaydırılan bir alan.
// - Notlar sürüklenip bırakıldıkları yerde kalır; konum sunucuya kaydedilir
//   (PATCH /notes/{id}/position). Kayıt başarısız olursa kart eski yerine döner.
// - Sürüklenen kart tuvalin görünen kısmından çıkmaz; kenara dayanınca tuval o
//   yöne kendiliğinden kayar (gerekirse büyür).
// - Tuvalin boş bir yerinden tutup sürükleyince tuval kayar (sağa/sola/yukarı/aşağı).
// - Konumu olmayan notlar (yeni ya da eski) ilk boş yere yerleşir ve o konum
//   hemen kaydedilir.
// - Son taşınan kart öne gelir; sabitlenen kartlar her zaman üst katmandadır.
// Girdi: { notes, onNoteChange, onNoteRemove, onEdit } (bkz. NoteGrid)
export default function NoteCanvas({ notes, onNoteChange, onNoteRemove, onEdit }) {
  const viewportRef = useRef(null);
  const areaRef = useRef(null);
  const savingIdsRef = useRef(new Set());
  const stopGestureRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(MIN_VIEWPORT_HEIGHT);
  const [contentBottom, setContentBottom] = useState(0);
  // Sürüklerken kenardan kaydırılarak ulaşılan en büyük alan; tuval bundan küçülmez.
  const [reachedSize, setReachedSize] = useState({ width: 0, height: 0 });
  const [raisedIds, setRaisedIds] = useState([]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [moveError, setMoveError] = useState('');

  // Tuvalin görünen genişliğini izle (otomatik yerleşimdeki sütun sayısı buna bağlı).
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    setViewportWidth(viewport.clientWidth);
    const observer = new ResizeObserver(() => setViewportWidth(viewport.clientWidth));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // Tuval, pencerenin geri kalanını dolduracak kadar uzun olsun.
  useLayoutEffect(() => {
    function measureViewportHeight() {
      const top = documentTop(viewportRef.current);
      const available = Math.floor(window.innerHeight - top - PAGE_BOTTOM_SPACE);
      setViewportHeight(Math.max(MIN_VIEWPORT_HEIGHT, available));
    }
    measureViewportHeight();
    window.addEventListener('resize', measureViewportHeight);
    return () => window.removeEventListener('resize', measureViewportHeight);
  }, [moveError]);

  // Bir kartta etiket/renk/hatırlatıcı kutusu açılınca, kesilmesin diye tuvali kaydır.
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element && node.matches(POPUP_SELECTOR)) {
            node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          }
        }
      }
    });
    observer.observe(areaRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Sayfadan çıkılırsa yarım kalan sürükleme dinleyicilerini kaldır.
  useEffect(() => () => stopGestureRef.current?.(), []);

  // Konumu olmayan notların ekranda nereye düşeceği.
  const placements = useMemo(
    () =>
      viewportWidth > 0 ? placeUnpositionedNotes(notes, viewportWidth - 2 * CANVAS_PADDING) : {},
    [notes, viewportWidth],
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

  // İmleç bırakılana kadar pencere genelinde hareketi izler (imleç tuvalden çıksa da).
  function trackPointer(onPointerMove, onPointerEnd) {
    function handleEnd(event) {
      stop();
      onPointerEnd(event);
    }
    function stop() {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
      stopGestureRef.current = null;
    }
    stopGestureRef.current?.();
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    stopGestureRef.current = stop;
  }

  // Tuvalin boş yerinden tutup sürükleyince tuvali kaydırır.
  function handleAreaPointerDown(event) {
    if (event.button !== 0 || event.target !== areaRef.current) return;
    const viewport = viewportRef.current;
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
    };
    setIsGrabbing(true);
    trackPointer(
      (moveEvent) => {
        viewport.scrollLeft = start.left - (moveEvent.clientX - start.pointerX);
        viewport.scrollTop = start.top - (moveEvent.clientY - start.pointerY);
      },
      () => setIsGrabbing(false),
    );
  }

  // Tuvali kenardan kaydırırken alan yetmezse büyüt (en fazla CANVAS_POSITION_MAX'a kadar).
  function growArea(neededWidth, neededHeight) {
    const area = areaRef.current;
    const limit = CANVAS_POSITION_MAX + CANVAS_EXTRA_SPACE;
    if (neededWidth <= area.offsetWidth && neededHeight <= area.offsetHeight) return;
    setReachedSize((current) => ({
      width: Math.min(limit, Math.max(current.width, neededWidth + CANVAS_EXTRA_SPACE)),
      height: Math.min(limit, Math.max(current.height, neededHeight + CANVAS_EXTRA_SPACE)),
    }));
  }

  // Bir kartı sürükler. Kart tuvalin görünen kısmında kalır; kenara dayandıkça
  // tuval o yöne kayar. Bırakınca yeni konum handleMove ile kaydedilir.
  function startNoteDrag(event, { note, x, y, setIsDragging }) {
    const viewport = viewportRef.current;
    const cardHeight = event.currentTarget.offsetHeight;
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      x: x.get(),
      y: y.get(),
    };
    let pointer = { x: event.clientX, y: event.clientY };
    let isDragging = false;
    let frame = 0;

    // Kartı imlecin gösterdiği yere koyar (görünen alana sığdırarak); ne kadar
    // taştığını döndürür.
    function placeCard() {
      const rawX = start.x + pointer.x - start.pointerX + viewport.scrollLeft - start.left;
      const rawY = start.y + pointer.y - start.pointerY + viewport.scrollTop - start.top;
      const minX = viewport.scrollLeft;
      const minY = viewport.scrollTop;
      const maxX = Math.max(minX, minX + viewport.clientWidth - CANVAS_CARD_WIDTH - 2 * CANVAS_PADDING);
      const maxY = Math.max(minY, minY + viewport.clientHeight - cardHeight - 2 * CANVAS_PADDING);
      x.set(clamp(rawX, minX, Math.min(maxX, CANVAS_POSITION_MAX)));
      y.set(clamp(rawY, minY, Math.min(maxY, CANVAS_POSITION_MAX)));
      return { overflowX: overflowBeyond(rawX, minX, maxX), overflowY: overflowBeyond(rawY, minY, maxY) };
    }

    // Her karede: kart kenara dayanıyorsa tuvali o yöne kaydır, kartı imlece yetiştir.
    function autoScroll() {
      const { overflowX, overflowY } = placeCard();
      const stepX = edgeScrollStep(overflowX);
      const stepY = edgeScrollStep(overflowY);
      if (stepX || stepY) {
        growArea(
          viewport.scrollLeft + viewport.clientWidth + Math.max(0, stepX),
          viewport.scrollTop + viewport.clientHeight + Math.max(0, stepY),
        );
        viewport.scrollLeft += stepX;
        viewport.scrollTop += stepY;
        placeCard();
      }
      frame = requestAnimationFrame(autoScroll);
    }

    trackPointer(
      (moveEvent) => {
        pointer = { x: moveEvent.clientX, y: moveEvent.clientY };
        if (!isDragging) {
          const distance = Math.hypot(pointer.x - start.pointerX, pointer.y - start.pointerY);
          if (distance < DRAG_THRESHOLD) return;
          isDragging = true;
          raiseNote(note.id);
          setIsDragging(true);
          setIsGrabbing(true);
          frame = requestAnimationFrame(autoScroll);
        }
        placeCard();
      },
      (endEvent) => {
        cancelAnimationFrame(frame);
        if (!isDragging) return;
        setIsDragging(false);
        setIsGrabbing(false);
        if (endEvent.type === 'pointercancel') {
          x.set(start.x);
          y.set(start.y);
          return;
        }
        handleMove(note, Math.round(x.get()), Math.round(y.get()));
      },
    );
  }

  const contentRight = Math.max(
    0,
    ...positionedNotes.map((note) => (note.position_x ?? 0) + CANVAS_CARD_WIDTH),
  );
  const areaWidth = Math.max(viewportWidth, contentRight + CANVAS_EXTRA_SPACE, reachedSize.width);
  const areaHeight = Math.max(viewportHeight, contentBottom + CANVAS_EXTRA_SPACE, reachedSize.height);

  return (
    <>
      {moveError && (
        <p className="page-hint note-canvas__error" role="alert">
          {moveError}
        </p>
      )}
      <div
        className={`note-canvas${isGrabbing ? ' note-canvas--grabbing' : ''}`}
        ref={viewportRef}
        style={{ height: viewportHeight }}
      >
        <div
          className="note-canvas__area"
          ref={areaRef}
          style={{ width: areaWidth, height: areaHeight }}
          onPointerDown={handleAreaPointerDown}
        >
          <AnimatePresence>
            {positionedNotes.map((note) => (
              <CanvasNote
                key={note.id}
                note={note}
                zIndex={(note.is_pinned ? PINNED_LAYER : 0) + raisedIds.indexOf(note.id) + 2}
                onStartDrag={startNoteDrag}
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

// Tuvaldeki tek bir sürüklenebilir kart. Konumu Framer Motion'ın x/y değerleriyle verilir;
// sürüklemeyi NoteCanvas yönetir (onStartDrag).
function CanvasNote({ note, zIndex, onStartDrag, onNoteChange, onNoteRemove, onEdit }) {
  const x = useMotionValue(note.position_x ?? 0);
  const y = useMotionValue(note.position_y ?? 0);
  const [isDragging, setIsDragging] = useState(false);

  // Konum dışarıdan değişirse (otomatik yerleşim, kayıt hatasında geri alma) kartı oraya taşı.
  useEffect(() => {
    x.set(note.position_x ?? 0);
    y.set(note.position_y ?? 0);
  }, [note.position_x, note.position_y, x, y]);

  // Sürükleme yalnızca kartın boş bir yerinden başlar; düğmeler ve alanlar normal çalışır.
  function handlePointerDown(event) {
    if (event.button !== 0 || event.target.closest(NO_DRAG_SELECTOR)) return;
    onStartDrag(event, { note, x, y, setIsDragging });
  }

  return (
    <motion.div
      className={`canvas-note${note.is_pinned ? ' canvas-note--pinned' : ''}${
        isDragging ? ' canvas-note--dragging' : ''
      }`}
      data-note-id={note.id}
      style={{ x, y, zIndex, top: CANVAS_PADDING, left: CANVAS_PADDING }}
      onPointerDown={handlePointerDown}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: isDragging ? 1.03 : 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
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
