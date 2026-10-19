import EmptyState from '../components/EmptyState.jsx';

// Sahibi: 3. kişi (Etiket ve Arama)
// Yer tutucu sayfa: arama sonuçları ve etikete göre filtrelenmiş notlar burada
// gösterilecek. Menüde görünmez; arama çubuğundan ve etiket menüsünden açılır.
export default function SearchPage() {
  return <EmptyState icon="search" message="Arama sonuçları burada görünür" />;
}

SearchPage.route = { path: '/search', inMenu: false };
