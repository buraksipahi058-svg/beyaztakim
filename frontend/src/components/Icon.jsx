// Basit satır içi SVG ikonları. Ortak dosyadır; özelliklerin ihtiyaç
// duyacağı ikonlar şimdiden eklendi. Kullanım: <Icon name="archive" />
const paths = {
  // genel
  menu: 'M3 6h18M3 12h18M3 18h18',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  // 1. kişi: kullanıcı
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  // 2. kişi: notlar
  lightbulb:
    'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  // 3. kişi: etiketler
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  // 4. kişi: arşiv ve çöp kutusu
  archive: 'M3 4h18v4H3zM5 8v12h14V8M10 12h4',
  unarchive: 'M3 4h18v4H3zM5 8v12h14V8M12 17v-6M9.5 13.5 12 11l2.5 2.5',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  restore: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4',
  'delete-forever': 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11l4 6M14 11l-4 6',
  // 5. kişi: liste, hatırlatıcı, sabitleme, renk
  'check-square': 'M4 4h16v16H4zM8 12l3 3 5-6',
  bell: 'M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4zM10 20h4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  pin: 'M9 4h6l-1 6 3 3H7l3-3zM12 13v7',
  palette:
    'M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-.8-.6-1.2-.6-2s.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-5-4-9-9-9zM7.5 11h.01M10 7.5h.01M14 7.5h.01M16.5 11h.01',
};

export default function Icon({ name, size = 22, className }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
