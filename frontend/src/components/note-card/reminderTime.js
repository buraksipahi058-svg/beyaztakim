// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
// Hatırlatıcı zamanlarıyla ilgili küçük yardımcılar. Tarihler kullanıcının
// yerel saatinde gösterilir; API'ye UTC olarak gider (api/reminders.js).

const reminderFormat = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

// "27 Kas 09:00" biçiminde yazar.
export function formatReminder(dateValue) {
  return reminderFormat.format(new Date(dateValue));
}

// Hatırlatıcının zamanı geçti mi?
export function isPastReminder(dateValue, now = new Date()) {
  return new Date(dateValue) <= now;
}

// <input type="datetime-local"> için yerel saatle "YYYY-MM-DDTHH:mm".
export function toLocalInputValue(date) {
  const pad = (number) => String(number).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// Hazır seçenekler: bugün 20:00 (henüz geçmediyse), yarın 09:00, gelecek hafta 09:00.
export function quickReminderOptions(now = new Date()) {
  function at(daysAhead, hour) {
    const date = new Date(now);
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);
    return date;
  }

  const options = [];
  const tonight = at(0, 20);
  if (tonight > now) options.push({ label: 'Bugün daha sonra', date: tonight });
  options.push({ label: 'Yarın', date: at(1, 9) });
  options.push({ label: 'Gelecek hafta', date: at(7, 9) });
  return options;
}
