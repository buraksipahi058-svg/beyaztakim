import { listUpcomingReminders } from '../api/reminders.js';
import EmptyState from '../components/EmptyState.jsx';
import NoteGrid from '../components/NoteGrid.jsx';
import { useNoteList } from '../hooks/useNoteList.js';

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
//
// /reminders sayfası: zamanı gelmemiş hatırlatıcısı olan notlar, en yakın
// zaman üstte. Hatırlatıcısı kaldırılan ya da çöpe atılan not listeden çıkar.
export default function RemindersPage() {
  const { notes, isLoading, loadError, handleNoteChange, handleNoteRemove } =
    useNoteList(listUpcomingReminders);

  // Hatırlatıcısı kalmayan not bu sayfadan çıkar; diğer değişiklikler yerinde güncellenir.
  function handleReminderNoteChange(updatedNote) {
    if (updatedNote.reminder_at) handleNoteChange(updatedNote);
    else handleNoteRemove(updatedNote.id);
  }

  return (
    <>
      {isLoading && <p className="page-hint">Hatırlatıcılar yükleniyor...</p>}
      {loadError && <p className="page-hint">{loadError}</p>}

      {!isLoading && !loadError && notes.length === 0 && (
        <EmptyState icon="bell" message="Yaklaşan hatırlatıcılarınız burada görünür" />
      )}

      {notes.length > 0 && (
        <NoteGrid
          notes={notes}
          onNoteChange={handleReminderNoteChange}
          onNoteRemove={handleNoteRemove}
        />
      )}
    </>
  );
}

RemindersPage.route = { path: '/reminders', title: 'Hatırlatıcılar', icon: 'bell', order: 2 };
