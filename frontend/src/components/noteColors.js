// Note.color alanında saklanan renk adları ve ekrandaki karşılıkları.
// Liste docs/veri-modeli.md ile aynı tutulmalıdır.
export const NOTE_COLORS = {
  default: '#ffffff',
  red: '#faafa8',
  orange: '#f39f76',
  yellow: '#fff8b8',
  green: '#e2f6d3',
  teal: '#b4ddd3',
  blue: '#d4e4ed',
  purple: '#d3bfdb',
  pink: '#f6e2dd',
  brown: '#e9e3d4',
  gray: '#efeff1',
};

export function noteColor(name) {
  return NOTE_COLORS[name] ?? NOTE_COLORS.default;
}
