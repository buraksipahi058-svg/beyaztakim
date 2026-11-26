import { useState } from 'react';
import { formatReminder, quickReminderOptions, toLocalInputValue } from './reminderTime.js';

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
//
// Hatırlatıcı seçme kutusu: hazır seçenekler (bugün akşam, yarın, gelecek hafta)
// ya da tarih-saat seçimi. Seçilen zaman onSave(Date) ile bildirilir.
// Kutuyu açıp kapatma, onu kullanan bileşenin işidir (bkz. PinColorActions).
export default function ReminderPicker({ note, onSave }) {
  const [customValue, setCustomValue] = useState(
    note.reminder_at ? toLocalInputValue(new Date(note.reminder_at)) : '',
  );
  const now = new Date();
  const customDate = customValue ? new Date(customValue) : null;
  const isCustomValid = customDate !== null && customDate > now;

  return (
    <div className="reminder-picker" role="dialog" aria-label="Hatırlatıcı">
      <p className="reminder-picker__title">Hatırlatıcı</p>

      {quickReminderOptions(now).map((option) => (
        <button
          key={option.label}
          type="button"
          className="reminder-picker__option"
          onClick={() => onSave(option.date)}
        >
          <span>{option.label}</span>
          <span className="reminder-picker__time">{formatReminder(option.date)}</span>
        </button>
      ))}

      <label className="reminder-picker__custom">
        <span>Tarih ve saat seç</span>
        <input
          type="datetime-local"
          value={customValue}
          min={toLocalInputValue(now)}
          onChange={(event) => setCustomValue(event.target.value)}
        />
      </label>

      <button
        type="button"
        className="reminder-picker__save"
        disabled={!isCustomValid}
        onClick={() => onSave(customDate)}
      >
        Kaydet
      </button>
    </div>
  );
}
