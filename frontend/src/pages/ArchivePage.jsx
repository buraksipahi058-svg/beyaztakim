import EmptyState from '../components/EmptyState.jsx';

// Yer tutucu sayfa: arşiv özelliğinin sahibi bu dosyayı dolduracak.
export default function ArchivePage() {
  return <EmptyState icon="archive" message="Arşivlenen notlarınız burada görünür" />;
}

ArchivePage.route = { path: '/archive', title: 'Arşiv', icon: 'archive', order: 8 };
