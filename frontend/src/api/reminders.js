// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
// Backend uç noktaları: /reminders (backend/app/routers/reminders.py)

import { apiRequest } from './client.js';

// Zamanı gelmemiş hatırlatıcısı olan notları en yakın zaman üstte olacak şekilde getirir.
export function listUpcomingReminders() {
  return apiRequest('/reminders');
}

// Nota hatırlatıcı atar; date bir Date nesnesidir (UTC olarak gönderilir). Güncel notu döndürür.
export function setReminder(noteId, date) {
  return apiRequest(`/reminders/${noteId}`, {
    method: 'PUT',
    body: { reminder_at: date.toISOString() },
  });
}

// Notun hatırlatıcısını kaldırır; güncel notu döndürür.
export function clearReminder(noteId) {
  return apiRequest(`/reminders/${noteId}`, { method: 'DELETE' });
}
