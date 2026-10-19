import EmptyState from '../components/EmptyState.jsx';

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
// Yer tutucu sayfa: yaklaşan hatırlatıcıları olan notlar burada gösterilecek.
export default function RemindersPage() {
  return <EmptyState icon="bell" message="Yaklaşan hatırlatıcılarınız burada görünür" />;
}

RemindersPage.route = { path: '/reminders', title: 'Hatırlatıcılar', icon: 'bell', order: 2 };
