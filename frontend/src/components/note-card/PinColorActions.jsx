import { useCallback, useRef, useState } from 'react';
import { setNoteColor, setNotePinned } from '../../api/pinColor.js';
import { setReminder } from '../../api/reminders.js';
import { useDismiss } from '../../hooks/useDismiss.js';
import Icon from '../Icon.jsx';
import { NOTE_COLORS } from '../noteColors.js';
import ReminderPicker from './ReminderPicker.jsx';
import './PinColorActions.css';

const COLOR_LABELS = {
  default: 'Varsayılan',
  red: 'Kırmızı',
  orange: 'Turuncu',
  yellow: 'Sarı',
  green: 'Yeşil',
  teal: 'Turkuaz',
  blue: 'Mavi',
  purple: 'Mor',
  pink: 'Pembe',
  brown: 'Kahverengi',
  gray: 'Gri',
};

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
//
// Not kartının alt çubuğundaki 5. kişi düğmeleri:
//   Hatırlatıcı (zil) : hatırlatıcı seçme kutusunu açar
//   Renk (palet)      : renk paletini açar
//   Sabitle (raptiye) : notu sabitler / sabitlemeyi kaldırır (arşivdeki notta yok)
// Çöpteki notlarda hiçbiri gösterilmez. Değişiklik sonrası onNoteChange(güncelNot).
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function PinColorActions({ note, onNoteChange }) {
  const [openPanel, setOpenPanel] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const wrapperRef = useRef(null);
  const closePanel = useCallback(() => setOpenPanel(null), []);
  useDismiss(wrapperRef, closePanel, openPanel !== null);

  if (note.is_trashed) return null;

  async function runAction(action) {
    closePanel();
    setIsBusy(true);
    setError('');
    try {
      onNoteChange?.(await action());
    } catch (actionError) {
      setError(actionError.message || 'İşlem başarısız oldu.');
    } finally {
      setIsBusy(false);
    }
  }

  function togglePanel(panel) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  const pinLabel = note.is_pinned ? 'Sabitlemeyi kaldır' : 'Sabitle';

  return (
    <div className="pin-color-actions" ref={wrapperRef}>
      <button
        type="button"
        className="icon-button note-action"
        onClick={() => togglePanel('reminder')}
        aria-expanded={openPanel === 'reminder'}
        aria-label="Hatırlatıcı ekle"
        title="Hatırlatıcı ekle"
        disabled={isBusy}
      >
        <Icon name="bell" size={18} />
      </button>

      <button
        type="button"
        className="icon-button note-action"
        onClick={() => togglePanel('color')}
        aria-expanded={openPanel === 'color'}
        aria-label="Renk seç"
        title="Renk seç"
        disabled={isBusy}
      >
        <Icon name="palette" size={18} />
      </button>

      {!note.is_archived && (
        <button
          type="button"
          className={`icon-button note-action${note.is_pinned ? ' is-active' : ''}`}
          onClick={() => runAction(() => setNotePinned(note.id, !note.is_pinned))}
          aria-pressed={note.is_pinned}
          aria-label={pinLabel}
          title={pinLabel}
          disabled={isBusy}
        >
          <Icon name="pin" size={18} />
        </button>
      )}

      {openPanel === 'color' && (
        <div className="color-palette" role="group" aria-label="Renk">
          {Object.entries(NOTE_COLORS).map(([name, hex]) => (
            <button
              key={name}
              type="button"
              className={`color-palette__swatch${note.color === name ? ' is-selected' : ''}`}
              style={{ background: hex }}
              onClick={() => runAction(() => setNoteColor(note.id, name))}
              aria-label={COLOR_LABELS[name]}
              aria-pressed={note.color === name}
              title={COLOR_LABELS[name]}
            />
          ))}
        </div>
      )}

      {openPanel === 'reminder' && (
        <ReminderPicker note={note} onSave={(date) => runAction(() => setReminder(note.id, date))} />
      )}

      {error && (
        <span className="note-action-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
