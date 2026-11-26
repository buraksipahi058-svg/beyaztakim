import { useState } from 'react';
import { archiveNote, unarchiveNote } from '../../api/archive.js';
import { deleteNotePermanently, moveNoteToTrash, restoreNote } from '../../api/trash.js';
import Icon from '../Icon.jsx';

// Sahibi: 4. kişi (Arşiv ve Çöp Kutusu)
//
// Not kartının alt çubuğundaki arşiv ve çöp düğmeleri. Notun durumuna göre:
//   normal not     : Arşivle, Çöp kutusuna taşı
//   arşivdeki not  : Arşivden çıkar, Çöp kutusuna taşı
//   çöpteki not    : Geri yükle, Kalıcı olarak sil
// İşlem başarılı olunca not bulunduğu listeden çıkar: onNoteRemove(note.id).
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function ArchiveTrashActions({ note, onNoteRemove }) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  async function runAction(action) {
    setIsBusy(true);
    setError('');
    try {
      await action();
      onNoteRemove?.(note.id);
    } catch (actionError) {
      setError(actionError.message || 'İşlem başarısız oldu.');
    } finally {
      setIsBusy(false);
    }
  }

  function handleDeleteForever() {
    if (window.confirm('Not kalıcı olarak silinecek. Bu işlem geri alınamaz.')) {
      runAction(() => deleteNotePermanently(note.id));
    }
  }

  const actions = note.is_trashed
    ? [
        { icon: 'restore', label: 'Geri yükle', onClick: () => runAction(() => restoreNote(note.id)) },
        { icon: 'delete-forever', label: 'Kalıcı olarak sil', onClick: handleDeleteForever },
      ]
    : [
        note.is_archived
          ? { icon: 'unarchive', label: 'Arşivden çıkar', onClick: () => runAction(() => unarchiveNote(note.id)) }
          : { icon: 'archive', label: 'Arşivle', onClick: () => runAction(() => archiveNote(note.id)) },
        { icon: 'trash', label: 'Çöp kutusuna taşı', onClick: () => runAction(() => moveNoteToTrash(note.id)) },
      ];

  return (
    <>
      {actions.map((action) => (
        <button
          key={action.icon}
          type="button"
          className="icon-button note-action"
          title={action.label}
          aria-label={action.label}
          disabled={isBusy}
          onClick={action.onClick}
        >
          <Icon name={action.icon} size={18} />
        </button>
      ))}
      {error && (
        <span className="note-action-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
