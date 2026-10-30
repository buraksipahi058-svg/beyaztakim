// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfanın üstündeki "Not alın..." alanı: yeni not ekleme ve not düzenleme
// formu.
// - Yeni not: createNote ile oluşturulur, dönen kayıt onNoteSaved ile
//   üst bileşene bildirilir.
// - Düzenleme: editingNote doluysa form onunla önceden doldurulur; kayıtta
//   updateNote çağrılır. Liste notlarının maddelerini düzenlemek 5. kişinin
//   /checklist özelliğinin işidir; düzenlemede maddeler salt okunur görünür.

import { useEffect, useState } from 'react';
import { createNote, updateNote } from '../api/notes.js';
import Icon from './Icon.jsx';
import { NOTE_COLORS } from './noteColors.js';
import './NoteForm.css';

const EMPTY_ITEMS = [{ text: '', is_done: false }];

export default function NoteForm({ editingNote = null, onNoteSaved, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('text');
  const [color, setColor] = useState('default');
  const [items, setItems] = useState(EMPTY_ITEMS);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Düzenleme moduna geçerken formu notla doldur; çıkarken boşalt ve kapat.
  useEffect(() => {
    if (editingNote) {
      setIsFormOpen(true);
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setNoteType(editingNote.note_type);
      setColor(editingNote.color);
      setItems(editingNote.checklist_items.map(({ text, is_done }) => ({ text, is_done })));
    } else {
      resetForm();
      setIsFormOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingNote]);

  function resetForm() {
    setTitle('');
    setContent('');
    setNoteType('text');
    setColor('default');
    setItems(EMPTY_ITEMS);
    setError('');
  }

  function setItemText(index, text) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, text } : item)),
    );
  }

  function addItemRow() {
    setItems((current) => [...current, { text: '', is_done: false }]);
  }

  function removeItemRow(index) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleCancel() {
    resetForm();
    setIsFormOpen(false);
    onCancelEdit?.();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      const isChecklist = noteType === 'checklist';
      const body = isChecklist
        ? {
            title,
            color,
            checklist_items: items
              .map((item) => ({ ...item, text: item.text.trim() }))
              .filter((item) => item.text),
          }
        : { title, content, color };

      // Düzenlemede liste notunun maddeleri değiştirilemez (5. kişinin işi).
      const savedNote = editingNote
        ? await updateNote(editingNote.id, isChecklist ? { title, color } : body)
        : await createNote(body);

      onNoteSaved?.(savedNote);
      if (!editingNote) {
        resetForm();
        setIsFormOpen(false);
      }
    } catch (submitError) {
      setError(submitError.message || 'Not kaydedilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isFormOpen) {
    return (
      <button type="button" className="note-form__closed" onClick={() => setIsFormOpen(true)}>
        Not alın...
      </button>
    );
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <input
        className="note-form__title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Başlık"
      />

      <div className="note-form__types" role="group" aria-label="Not türü">
        <button
          type="button"
          className={noteType === 'text' ? 'is-active' : ''}
          onClick={() => setNoteType('text')}
          disabled={Boolean(editingNote)}
        >
          Metin
        </button>
        <button
          type="button"
          className={noteType === 'checklist' ? 'is-active' : ''}
          onClick={() => setNoteType('checklist')}
          disabled={Boolean(editingNote)}
        >
          Liste
        </button>
      </div>

      {noteType === 'checklist' ? (
        editingNote ? (
          <ul className="note-form__items note-form__items--readonly">
            {editingNote.checklist_items.map((item) => (
              <li key={item.id} className={item.is_done ? 'is-done' : undefined}>
                <span className="note-form__checkbox" aria-hidden="true" />
                {item.text}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="note-form__items">
            {items.map((item, index) => (
              <li key={index} className="note-form__item">
                <span className="note-form__checkbox" aria-hidden="true" />
                <input
                  value={item.text}
                  onChange={(event) => setItemText(index, event.target.value)}
                  placeholder="Madde ekle"
                />
                <button
                  type="button"
                  className="icon-button note-form__item-remove"
                  onClick={() => removeItemRow(index)}
                  aria-label="Maddeyi kaldır"
                  title="Maddeyi kaldır"
                >
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="note-form__add-item" onClick={addItemRow}>
                <Icon name="plus" size={14} /> Madde ekle
              </button>
            </li>
          </ul>
        )
      ) : (
        <textarea
          className="note-form__content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Notunuzu yazın..."
          rows={3}
        />
      )}

      <div className="note-form__colors" role="group" aria-label="Renk">
        {Object.entries(NOTE_COLORS).map(([name, value]) => (
          <button
            key={name}
            type="button"
            className={`note-form__color${color === name ? ' is-active' : ''}`}
            style={{ background: value }}
            onClick={() => setColor(name)}
            aria-label={`Renk: ${name}`}
            title={name}
          />
        ))}
      </div>

      {error && (
        <p className="note-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="note-form__buttons">
        <button className="note-form__save" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : editingNote ? 'Kaydet' : 'Not al'}
        </button>
        <button className="note-form__cancel" type="button" onClick={handleCancel}>
          Vazgeç
        </button>
      </div>
    </form>
  );
}
