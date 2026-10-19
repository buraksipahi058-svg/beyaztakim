import EmptyState from '../components/EmptyState.jsx';

// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
// Yer tutucu sayfa: arşivdeki notlar burada gösterilecek.
export default function ArchivePage() {
  return <EmptyState icon="archive" message="Arşivlenen notlarınız burada görünür" />;
}

ArchivePage.route = { path: '/archive', title: 'Arşiv', icon: 'archive', order: 8 };
