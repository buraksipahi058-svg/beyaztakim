// Basit satır içi SVG ikonları. Yeni ikon gerekiyorsa paths nesnesine ekleyin.
const paths = {
  menu: 'M3 6h18M3 12h18M3 18h18',
  lightbulb:
    'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z',
  archive: 'M3 4h18v4H3zM5 8v12h14V8M10 12h4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  bell: 'M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4zM10 20h4',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
  pin: 'M9 4h6l-1 6 3 3H7l3-3zM12 13v7',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
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
