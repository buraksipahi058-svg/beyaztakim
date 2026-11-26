import { useState } from 'react';
import {
  addChecklistItem,
  deleteChecklistItem,
  updateChecklistItem,
} from '../../api/checklist.js';
import Icon from '../Icon.jsx';
import './ChecklistItems.css';

// Sahibi: 5. kişi (Liste Notları, Hatırlatıcı, Sabitleme, Renk)
//
// Liste türündeki (note_type: "checklist") notların maddeleri: kutuyu
// işaretleme/kaldırma, maddeyi silme (üzerine gelince görünen çarpı) ve alttaki
// alandan yeni madde ekleme. Çöpteki notta maddeler yalnızca gösterilir.
// Her değişiklikten sonra onNoteChange(güncelNot) çağrılır.
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function ChecklistItems({ note, onNoteChange }) {
  const [newText, setNewText] = useState('');
  const [error, setError] = useState('');
  const isReadOnly = note.is_trashed;
  const items = note.checklist_items;

  function replaceItems(nextItems) {
    onNoteChange?.({ ...note, checklist_items: nextItems });
  }

  async function runAction(action) {
    setError('');
    try {
      await action();
    } catch (actionError) {
      setError(actionError.message || 'Liste güncellenemedi.');
    }
  }

  function handleToggle(item) {
    runAction(async () => {
      const updated = await updateChecklistItem(item.id, { is_done: !item.is_done });
      replaceItems(items.map((current) => (current.id === item.id ? updated : current)));
    });
  }

  function handleDelete(item) {
    runAction(async () => {
      await deleteChecklistItem(item.id);
      replaceItems(items.filter((current) => current.id !== item.id));
    });
  }

  function handleAdd(event) {
    event.preventDefault();
    const text = newText.trim();
    if (!text) return;
    runAction(async () => {
      const created = await addChecklistItem(note.id, text);
      replaceItems([...items, created]);
      setNewText('');
    });
  }

  return (
    <>
      <ul className="note-card__checklist">
        {items.map((item) => (
          <li key={item.id} className={item.is_done ? 'is-done' : undefined}>
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={item.is_done}
                disabled={isReadOnly}
                onChange={() => handleToggle(item)}
              />
              <span className="checklist-item__text">{item.text}</span>
            </label>
            {!isReadOnly && (
              <button
                type="button"
                className="checklist-item__delete"
                onClick={() => handleDelete(item)}
                aria-label={`"${item.text}" maddesini sil`}
                title="Maddeyi sil"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {!isReadOnly && (
        <form className="checklist-add" onSubmit={handleAdd}>
          <Icon name="plus" size={16} />
          <input
            className="checklist-add__input"
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            placeholder="Liste öğesi"
            aria-label="Yeni liste öğesi"
            maxLength={500}
          />
        </form>
      )}

      {error && (
        <p className="note-action-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
