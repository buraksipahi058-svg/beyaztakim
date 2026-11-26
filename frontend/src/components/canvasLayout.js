// Sahibi: 2. kişi (Not İşlemleri)
// Ana sayfa tuvalinin ölçüleri, konumu olmayan notların otomatik yerleşimi ve
// sürükleme sırasında kullanılan küçük hesaplar.

export const CANVAS_CARD_WIDTH = 240;
export const CANVAS_CELL_HEIGHT = 220;
export const CANVAS_GAP = 16;
// Kartlar tuvalin kenarına yapışmasın diye konum (0, 0) kenardan bu kadar içeride çizilir.
export const CANVAS_PADDING = 12;
// En sağdaki ve en alttaki kartın ötesinde bırakılan boş alan: tuval o kadar
// kaydırılabilir, açılır kutular da kesilmez.
export const CANVAS_EXTRA_SPACE = 400;
// Backend'deki NOTE_POSITION_MAX ile aynı: bir kart en fazla bu koordinata gidebilir.
export const CANVAS_POSITION_MAX = 20000;
// Kart tuvalin görünen kenarına dayanınca tuval kare başına en fazla bu kadar kayar.
const EDGE_SCROLL_MAX_STEP = 24;

// Değeri [min, max] aralığına çeker.
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Değer aralığın ne kadar dışında: sağda/altta artı, solda/üstte eksi, içindeyse 0.
export function overflowBeyond(value, min, max) {
  if (value > max) return value - max;
  if (value < min) return value - min;
  return 0;
}

// Kart görünen kenarı `overflow` piksel zorlarken tuvalin bu karede kaç piksel
// kayacağı (işaret yönü verir). Ne kadar zorlanırsa o kadar hızlı kayar.
export function edgeScrollStep(overflow) {
  if (overflow === 0) return 0;
  const step = Math.min(EDGE_SCROLL_MAX_STEP, Math.ceil(Math.abs(overflow) / 3) + 2);
  return Math.sign(overflow) * step;
}

// Öğenin sayfanın en üstüne uzaklığı. Dönüşümler (ör. sayfa geçiş animasyonu)
// hesaba katılmaz, böylece ölçüm animasyon sırasında da doğrudur.
export function documentTop(element) {
  let top = 0;
  for (let current = element; current; current = current.offsetParent) top += current.offsetTop;
  return top;
}

function isPlaced(note) {
  return note.position_x != null && note.position_y != null;
}

function overlaps(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

// Tuval genişliğine kaç kart sütunu sığar (en az 1).
export function canvasColumnCount(canvasWidth) {
  return Math.max(1, Math.floor((canvasWidth + CANVAS_GAP) / (CANVAS_CARD_WIDTH + CANVAS_GAP)));
}

// Tuvaldeki öğelerin (not kartı / etiket destesi) anahtarları; numaraları çakışmasın diye türü içerir.
export const noteKey = (noteId) => `note:${noteId}`;
export const tagKey = (tagId) => `tag:${tagId}`;

// Tuvaldeki öğelerden (notlar ya da desteler: { id, position_x, position_y })
// konumu olmayanlara, listedeki sırayla, sol üstten başlayarak ilk boş ızgara
// hücresini verir. Konumu olan öğelerin kapladığı yerler atlanır.
// Döndürür: { [id]: { x, y } }
export function placeUnpositionedItems(items, canvasWidth) {
  const columns = canvasColumnCount(canvasWidth);
  const cellAt = (slot) => ({
    x: (slot % columns) * (CANVAS_CARD_WIDTH + CANVAS_GAP),
    y: Math.floor(slot / columns) * (CANVAS_CELL_HEIGHT + CANVAS_GAP),
    width: CANVAS_CARD_WIDTH,
    height: CANVAS_CELL_HEIGHT,
  });
  const occupied = items.filter(isPlaced).map((item) => ({
    x: item.position_x,
    y: item.position_y,
    width: CANVAS_CARD_WIDTH,
    height: CANVAS_CELL_HEIGHT,
  }));

  const placements = {};
  let slot = 0;
  for (const item of items) {
    if (isPlaced(item)) continue;
    let cell = cellAt(slot);
    while (occupied.some((rect) => overlaps(cell, rect))) {
      slot += 1;
      cell = cellAt(slot);
    }
    placements[item.id] = { x: cell.x, y: cell.y };
    occupied.push(cell);
    slot += 1;
  }
  return placements;
}

// Etikete göre desteler. `tags` listesindeki her etiket için o etiketi taşıyan
// notlardan bir deste kurar; birden çok etiketi olan not her etiketin destesinde
// yer alır. Etiket listesinde olmayan (ör. az önce silinmiş) etiketler sayılmaz.
// Destede sabitlenmiş notlar, sonra en son değişenler üstte durur. Desteler
// `tags` sırasıyla (backend'den ada göre sıralı) gelir.
// Döndürür: { stacks: [{ tag, notes }], freeNotes } (freeNotes: hiçbir destede olmayan notlar)
export function buildTagStacks(notes, tags) {
  const notesByTag = new Map(tags.map((tag) => [tag.id, []]));
  const freeNotes = [];
  for (const note of notes) {
    const stackTagIds = (note.tags ?? []).map((tag) => tag.id).filter((id) => notesByTag.has(id));
    if (stackTagIds.length === 0) freeNotes.push(note);
    for (const tagId of stackTagIds) notesByTag.get(tagId).push(note);
  }

  const pinnedThenNewest = (a, b) =>
    Number(b.is_pinned) - Number(a.is_pinned) || new Date(b.updated_at) - new Date(a.updated_at);
  const stacks = tags
    .filter((tag) => notesByTag.get(tag.id).length > 0)
    .map((tag) => ({ tag, notes: [...notesByTag.get(tag.id)].sort(pinnedThenNewest) }));
  return { stacks, freeNotes };
}
