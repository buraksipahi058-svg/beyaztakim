import { useState } from 'react';
import { clearReminder } from '../../api/reminders.js';
import Icon from '../Icon.jsx';
import { formatReminder, isPastReminder } from './reminderTime.js';
import './ReminderChip.css';

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
//
// Notun hatırlatıcısı varsa zamanını rozet olarak gösterir ("27 Kas 09:00");
// zamanı geçmişse üstü çizili görünür. Rozetteki çarpı hatırlatıcıyı kaldırır
// (çöpteki notta yok). Hatırlatıcı atamak için kartın alt çubuğundaki zil
// düğmesi kullanılır (PinColorActions).
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function ReminderChip({ note, onNoteChange }) {
  const [error, setError] = useState('');

  if (!note.reminder_at) return null;

  const isPast = isPastReminder(note.reminder_at);

  async function handleClear() {
    setError('');
    try {
      onNoteChange?.(await clearReminder(note.id));
    } catch (clearError) {
      setError(clearError.message || 'Hatırlatıcı kaldırılamadı.');
    }
  }

  return (
    <div className="reminder-chip-row">
      <span
        className={`reminder-chip${isPast ? ' is-past' : ''}`}
        title={isPast ? 'Hatırlatıcının zamanı geçti' : 'Hatırlatıcı'}
      >
        <Icon name="clock" size={14} />
        <span className="reminder-chip__time">{formatReminder(note.reminder_at)}</span>
        {!note.is_trashed && (
          <button
            type="button"
            className="reminder-chip__clear"
            onClick={handleClear}
            aria-label="Hatırlatıcıyı kaldır"
            title="Hatırlatıcıyı kaldır"
          >
            <Icon name="close" size={12} />
          </button>
        )}
      </span>
      {error && (
        <span className="note-action-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
