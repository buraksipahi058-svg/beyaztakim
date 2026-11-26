import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import { updateNotePosition } from '../api/notes.js';
import { listTags, onTagsChanged, updateTagPosition } from '../api/tags.js';
import {
  CANVAS_CARD_WIDTH,
  CANVAS_EXTRA_SPACE,
  CANVAS_PADDING,
  CANVAS_POSITION_MAX,
  buildTagStacks,
  documentTop,
  noteKey,
  placeUnpositionedItems,
  tagKey,
} from './canvasLayout.js';
import Icon from './Icon.jsx';
import NoteCard from './NoteCard.jsx';
import StackOverlay from './StackOverlay.jsx';
import TagStack from './TagStack.jsx';
import { useCanvasGestures } from './useCanvasGestures.js';
import { useRevealPopups } from './useRevealPopups.js';
import './NoteCanvas.css';

// Kartın bu öğelerinden birine basılınca sürükleme başlamaz (düğmeler, alanlar, açılır kutular).
const NO_DRAG_SELECTOR =
  'button, input, textarea, select, label, a, .tag-picker, .color-palette, .reminder-picker';
// Tuvalin en az yüksekliği ve altında bırakılan boşluk (.content alt boşluğuyla aynı).
const MIN_VIEWPORT_HEIGHT = 420;
const PAGE_BOTTOM_SPACE = 48;
// Sabitlenen kartlar her zaman sabitlenmemişlerin üstünde çizilir.
const PINNED_LAYER = 1000;
// "Etikete göre grupla" tercihinin tarayıcıda saklandığı anahtar.
const GROUPED_STORAGE_KEY = 'beyaztakim_canvas_grouped';

function readGroupedPreference() {
  try {
    return window.localStorage.getItem(GROUPED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function saveGroupedPreference(isGrouped) {
  try {
    window.localStorage.setItem(GROUPED_STORAGE_KEY, isGrouped ? '1' : '0');
  } catch {
    // Tarayıcı saklamaya izin vermiyorsa tercih yalnızca bu oturumda geçerli olur.
  }
}

// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfa tuvali: ekrana sığan, çerçeveli ve kendi içinde kaydırılan bir alan.
// - Notlar sürüklenip bırakıldıkları yerde kalır; konum sunucuya kaydedilir
//   (PATCH /notes/{id}/position). Kayıt başarısız olursa kart eski yerine döner.
// - "Etikete göre grupla" açıkken aynı etiketi taşıyan notlar bir destede
//   (TagStack) üst üste durur; birden çok etiketi olan not her destesinde
//   görünür. Deste sürüklenip bırakılabilir (PATCH /tags/{id}/position);
//   desteye basınca kartlar ekranın ortasında açılır (StackOverlay).
// - Sürüklenen öğe tuvalin görünen kısmından çıkmaz; kenara dayanınca tuval o
//   yöne kendiliğinden kayar (gerekirse büyür).
// - Tuvalin boş bir yerinden tutup sürükleyince tuval kayar.
// - Konumu olmayan notlar ve desteler ilk boş yere yerleşir ve o konum hemen kaydedilir.
// - Son taşınan öğe öne gelir; sabitlenen kartlar her zaman üst katmandadır.
// Girdi: { notes, onNoteChange, onNoteRemove, onEdit } (bkz. NoteGrid)
export default function NoteCanvas({ notes, onNoteChange, onNoteRemove, onEdit }) {
  const viewportRef = useRef(null);
  const areaRef = useRef(null);
  const savingNoteIdsRef = useRef(new Set());
  const savingTagIdsRef = useRef(new Set());
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(MIN_VIEWPORT_HEIGHT);
  const [contentBottom, setContentBottom] = useState(0);
  // Sürüklerken kenardan kaydırılarak ulaşılan en büyük alan; tuval bundan küçülmez.
  const [reachedSize, setReachedSize] = useState({ width: 0, height: 0 });
  const [raisedKeys, setRaisedKeys] = useState([]);
  const [canvasError, setCanvasError] = useState('');
  const [isGrouped, setIsGrouped] = useState(readGroupedPreference);
  const [tags, setTags] = useState([]);
  // Açık deste: { tagId, origin: { x, y }, element } ya da null.
  const [openStack, setOpenStack] = useState(null);

  const { isGrabbing, startPan, startDrag } = useCanvasGestures(viewportRef, growArea);
  useRevealPopups(areaRef);

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
  }, [canvasError]);

  // Gruplama açıkken etiketleri (deste konumlarıyla) yükle; etiket eklenip silinince yenile.
  useEffect(() => {
    if (!isGrouped) return undefined;
    let isActive = true;
    function loadTags() {
      listTags()
        .then((loadedTags) => {
          if (isActive) setTags(loadedTags);
        })
        .catch((error) => {
          if (isActive) setCanvasError(error.message || 'Etiketler yüklenemedi.');
        });
    }
    loadTags();
    const unsubscribe = onTagsChanged(loadTags);
    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [isGrouped]);

  // Tuvalde ne var: gruplama açıksa desteler + etiketsiz notlar, kapalıysa tüm notlar.
  const { stacks, freeNotes } = useMemo(
    () => (isGrouped ? buildTagStacks(notes, tags) : { stacks: [], freeNotes: notes }),
    [isGrouped, notes, tags],
  );

  const items = useMemo(
    () => [
      ...stacks.map(({ tag }) => ({ id: tagKey(tag.id), position_x: tag.position_x, position_y: tag.position_y })),
      ...freeNotes.map((note) => ({ id: noteKey(note.id), position_x: note.position_x, position_y: note.position_y })),
    ],
    [stacks, freeNotes],
  );

  // Konumu olmayan öğelerin ekranda nereye düşeceği.
  const placements = useMemo(
    () =>
      viewportWidth > 0 ? placeUnpositionedItems(items, viewportWidth - 2 * CANVAS_PADDING) : {},
    [items, viewportWidth],
  );

  // Her öğenin çizileceği yer: kayıtlı konumu ya da otomatik bulunan yer.
  const positions = {};
  for (const item of items) {
    positions[item.id] = placements[item.id] ?? { x: item.position_x ?? 0, y: item.position_y ?? 0 };
  }

  // Otomatik bulunan konumları kaydet; böylece öğe sonraki açılışta da aynı yerde durur.
  // Her öğe için bir kez denenir (sunucu kapalıyken istek yağmuru olmasın).
  useEffect(() => {
    for (const note of freeNotes) {
      const placement = placements[noteKey(note.id)];
      if (!placement || savingNoteIdsRef.current.has(note.id)) continue;
      savingNoteIdsRef.current.add(note.id);
      onNoteChange?.({ ...note, position_x: placement.x, position_y: placement.y });
      updateNotePosition(note.id, placement.x, placement.y).catch((error) =>
        setCanvasError(error.message || 'Notun konumu kaydedilemedi.'),
      );
    }
    for (const { tag } of stacks) {
      const placement = placements[tagKey(tag.id)];
      if (!placement || savingTagIdsRef.current.has(tag.id)) continue;
      savingTagIdsRef.current.add(tag.id);
      setTagPosition(tag.id, placement.x, placement.y);
      updateTagPosition(tag.id, placement.x, placement.y).catch((error) =>
        setCanvasError(error.message || 'Destenin konumu kaydedilemedi.'),
      );
    }
  }, [freeNotes, stacks, placements, onNoteChange]);

  // Öğelerin gerçek yüksekliğine göre tuvalin ne kadar uzayacağını ölç.
  useLayoutEffect(() => {
    const elements = areaRef.current?.querySelectorAll('[data-canvas-key]') ?? [];
    let bottom = 0;
    elements.forEach((element) => {
      const position = positions[element.dataset.canvasKey];
      if (position) bottom = Math.max(bottom, position.y + element.offsetHeight);
    });
    setContentBottom(bottom);
  });

  // Açık destenin kartları kalmadıysa ya da gruplama kapandıysa desteyi kapat.
  const openedStack = openStack ? stacks.find((stack) => stack.tag.id === openStack.tagId) : null;
  useEffect(() => {
    if (openStack && !openedStack) setOpenStack(null);
  }, [openStack, openedStack]);

  function setTagPosition(tagId, x, y) {
    setTags((current) =>
      current.map((tag) => (tag.id === tagId ? { ...tag, position_x: x, position_y: y } : tag)),
    );
  }

  function raiseItem(key) {
    setRaisedKeys((current) => [...current.filter((item) => item !== key), key]);
  }

  async function handleNoteMove(note, x, y) {
    if (x === note.position_x && y === note.position_y) return;
    setCanvasError('');
    onNoteChange?.({ ...note, position_x: x, position_y: y });
    try {
      await updateNotePosition(note.id, x, y);
    } catch (error) {
      onNoteChange?.(note);
      setCanvasError(error.message || 'Not taşınamadı.');
    }
  }

  async function handleStackMove(tag, x, y) {
    if (x === tag.position_x && y === tag.position_y) return;
    setCanvasError('');
    setTagPosition(tag.id, x, y);
    try {
      await updateTagPosition(tag.id, x, y);
    } catch (error) {
      setTagPosition(tag.id, tag.position_x, tag.position_y);
      setCanvasError(error.message || 'Deste taşınamadı.');
    }
  }

  // Desteyi açar; kartlar destenin ekrandaki orta noktasından çıkar.
  function openStackAt(tagId, element) {
    const rect = element.getBoundingClientRect();
    setOpenStack({
      tagId,
      element,
      origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    });
  }

  // Desteyi kapatır ve klavye odağını desteye geri verir.
  function closeStack() {
    openStack?.element?.focus({ preventScroll: true });
    setOpenStack(null);
  }

  // Açık destedeki bir notu düzenlemek için: önce deste kapanır, form sayfanın üstündedir.
  function handleEditFromStack(note) {
    closeStack();
    onEdit?.(note);
  }

  function toggleGrouped() {
    const next = !isGrouped;
    setIsGrouped(next);
    saveGroupedPreference(next);
    setOpenStack(null);
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

  // Tuvalin boş yerine basılınca tuvali kaydır (öğelere ve kaydırma çubuklarına basmak sayılmaz).
  function handleAreaPointerDown(event) {
    if (event.button !== 0 || event.target !== areaRef.current) return;
    startPan(event);
  }

  function zIndexOf(key, isPinned) {
    return (isPinned ? PINNED_LAYER : 0) + raisedKeys.indexOf(key) + 2;
  }

  const contentRight = Math.max(
    0,
    ...Object.values(positions).map((position) => position.x + CANVAS_CARD_WIDTH),
  );
  const areaWidth = Math.max(viewportWidth, contentRight + CANVAS_EXTRA_SPACE, reachedSize.width);
  const areaHeight = Math.max(viewportHeight, contentBottom + CANVAS_EXTRA_SPACE, reachedSize.height);

  return (
    <>
      <div className="note-canvas__toolbar">
        <p className="note-canvas__hint">
          {isGrouped
            ? 'Aynı etiketli notlar destede durur; desteye basınca açılır. Desteleri ve notları sürükleyip istediğiniz yere bırakın.'
            : 'Notları sürükleyip istediğiniz yere bırakın. Tuvalin boş bir yerinden tutup sürükleyerek tuvali kaydırabilirsiniz.'}
        </p>
        <button
          type="button"
          className={`note-canvas__group-toggle${isGrouped ? ' note-canvas__group-toggle--on' : ''}`}
          aria-pressed={isGrouped}
          onClick={toggleGrouped}
        >
          <Icon name="tag" size={16} />
          Etikete göre grupla
        </button>
      </div>
      {canvasError && (
        <p className="page-hint note-canvas__error" role="alert">
          {canvasError}
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
            {stacks.map((stack) => {
              const key = tagKey(stack.tag.id);
              return (
                <TagStack
                  key={key}
                  stack={stack}
                  position={positions[key]}
                  zIndex={zIndexOf(key, false)}
                  isOpen={openStack?.tagId === stack.tag.id}
                  startDrag={startDrag}
                  onRaise={() => raiseItem(key)}
                  onMove={handleStackMove}
                  onOpen={openStackAt}
                />
              );
            })}
            {freeNotes.map((note) => {
              const key = noteKey(note.id);
              return (
                <CanvasNote
                  key={key}
                  note={note}
                  position={positions[key]}
                  zIndex={zIndexOf(key, note.is_pinned)}
                  startDrag={startDrag}
                  onRaise={() => raiseItem(key)}
                  onMove={handleNoteMove}
                  onNoteChange={onNoteChange}
                  onNoteRemove={onNoteRemove}
                  onEdit={onEdit}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {openedStack && (
          <StackOverlay
            key={openedStack.tag.id}
            stack={openedStack}
            origin={openStack.origin}
            onClose={closeStack}
            onNoteChange={onNoteChange}
            onNoteRemove={onNoteRemove}
            onEdit={handleEditFromStack}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Tuvaldeki tek bir sürüklenebilir kart. Konumu Framer Motion'ın x/y değerleriyle verilir;
// sürüklemeyi useCanvasGestures'ın startDrag'i yönetir.
function CanvasNote({
  note,
  position,
  zIndex,
  startDrag,
  onRaise,
  onMove,
  onNoteChange,
  onNoteRemove,
  onEdit,
}) {
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const [isDragging, setIsDragging] = useState(false);

  // Konum dışarıdan değişirse (otomatik yerleşim, kayıt hatasında geri alma) kartı oraya taşı.
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  // Sürükleme yalnızca kartın boş bir yerinden başlar; düğmeler ve alanlar normal çalışır.
  function handlePointerDown(event) {
    if (event.button !== 0 || event.target.closest(NO_DRAG_SELECTOR)) return;
    startDrag(event, {
      x,
      y,
      onStart: () => {
        setIsDragging(true);
        onRaise();
      },
      onEnd: () => setIsDragging(false),
      onDrop: (newX, newY) => onMove(note, newX, newY),
    });
  }

  return (
    <motion.div
      className={`canvas-note${note.is_pinned ? ' canvas-note--pinned' : ''}${
        isDragging ? ' canvas-note--dragging' : ''
      }`}
      data-canvas-key={noteKey(note.id)}
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
