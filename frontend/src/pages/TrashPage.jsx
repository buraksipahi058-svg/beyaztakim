import EmptyState from '../components/EmptyState.jsx';

// Yer tutucu sayfa: çöp kutusu özelliğinin sahibi bu dosyayı dolduracak.
export default function TrashPage() {
  return <EmptyState icon="trash" message="Çöp kutusunda not yok" />;
}

TrashPage.route = { path: '/trash', title: 'Çöp Kutusu', icon: 'trash', order: 9 };
