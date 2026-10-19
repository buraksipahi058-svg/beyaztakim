import EmptyState from '../components/EmptyState.jsx';

// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
// Yer tutucu sayfa: çöp kutusundaki notlar burada gösterilecek.
export default function TrashPage() {
  return <EmptyState icon="trash" message="Çöp kutusunda not yok" />;
}

TrashPage.route = { path: '/trash', title: 'Çöp Kutusu', icon: 'trash', order: 9 };
