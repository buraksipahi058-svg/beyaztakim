// Sahibi: 2. kişi (Not İşlemleri)
// Ana sayfa tuvalinin ölçüleri ve konumu olmayan notların otomatik yerleşimi.

export const CANVAS_CARD_WIDTH = 240;
export const CANVAS_CELL_HEIGHT = 220;
export const CANVAS_GAP = 16;

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

// Konumu olmayan notlara, listedeki sırayla, sol üstten başlayarak ilk boş
// ızgara hücresini verir. Konumu olan notların kapladığı yerler atlanır.
// Döndürür: { [noteId]: { x, y } }
export function placeUnpositionedNotes(notes, canvasWidth) {
  const columns = canvasColumnCount(canvasWidth);
  const cellAt = (slot) => ({
    x: (slot % columns) * (CANVAS_CARD_WIDTH + CANVAS_GAP),
    y: Math.floor(slot / columns) * (CANVAS_CELL_HEIGHT + CANVAS_GAP),
    width: CANVAS_CARD_WIDTH,
    height: CANVAS_CELL_HEIGHT,
  });
  const occupied = notes.filter(isPlaced).map((note) => ({
    x: note.position_x,
    y: note.position_y,
    width: CANVAS_CARD_WIDTH,
    height: CANVAS_CELL_HEIGHT,
  }));

  const placements = {};
  let slot = 0;
  for (const note of notes) {
    if (isPlaced(note)) continue;
    let cell = cellAt(slot);
    while (occupied.some((rect) => overlaps(cell, rect))) {
      slot += 1;
      cell = cellAt(slot);
    }
    placements[note.id] = { x: cell.x, y: cell.y };
    occupied.push(cell);
    slot += 1;
  }
  return placements;
}
