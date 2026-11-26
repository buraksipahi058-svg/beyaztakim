// Sahibi: 2. kişi (Not İşlemleri)
//
// Ana sayfanın üstündeki "Not alın..." alanı: yeni not ekleme ve not düzenleme
// formu.
// - Yeni not: createNote ile oluşturulur, dönen kayıt onNoteSaved ile
//   üst bileşene bildirilir.
// - Düzenleme: editingNote doluysa form onunla önceden doldurulur; kayıtta
//   updateNote çağrılır. Liste notlarının maddelerini düzenlemek 5. kişinin
//   /checklist özelliğinin işidir; düzenlemede maddeler salt okunur görünür.
// - Klavye: başlıkta Enter içeriğe/ilk maddeye geçer; maddede Enter altına yeni
//   madde açar, boş maddede Backspace onu siler. Form yalnızca "Not al" ile kaydedilir.
// - Seçilen renk formun arka planına hemen uygulanır.

import { useEffect, useRef, useState } from 'react';
import { createNote, updateNote } from '../api/notes.js';
import Icon from './Icon.jsx';
import { NOTE_COLORS, noteColor } from './noteColors.js';
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
  const contentRef = useRef(null);
  const itemRefs = useRef([]);
  // Madde listesi değişince (satır eklendi/silindi) imlecin gideceği satır.
  const pendingFocusRef = useRef(null);

  useEffect(() => {
    if (pendingFocusRef.current === null) return;
    itemRefs.current[pendingFocusRef.current]?.focus();
    pendingFocusRef.current = null;
  }, [items]);

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

  // Satır eklenip silindikten sonra, React yeni listeyi çizince imleci ilgili maddeye taşır.
  function focusItemAfterRender(index) {
    pendingFocusRef.current = index;
  }

  function addItemRow() {
    setItems((current) => [...current, { text: '', is_done: false }]);
    focusItemAfterRender(items.length);
  }

  function removeItemRow(index) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function changeNoteType(nextType) {
    setNoteType(nextType);
    setError('');
  }

  // Başlıkta Enter formu göndermez; içerik alanına ya da ilk maddeye geçer.
  function handleTitleKeyDown(event) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (noteType === 'checklist' && !editingNote) itemRefs.current[0]?.focus();
    else contentRef.current?.focus();
  }

  // Maddede Enter altına yeni madde açar; boş maddede Backspace onu siler.
  function handleItemKeyDown(event, index) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      setItems((current) => [
        ...current.slice(0, index + 1),
        { text: '', is_done: false },
        ...current.slice(index + 1),
      ]);
      focusItemAfterRender(index + 1);
    } else if (event.key === 'Backspace' && items[index].text === '' && items.length > 1) {
      event.preventDefault();
      removeItemRow(index);
      focusItemAfterRender(Math.max(index - 1, 0));
    }
  }

  // API'ye gidecek gövde: not türü her zaman açıkça gönderilir.
  function buildNoteBody() {
    if (noteType === 'checklist') {
      return {
        title,
        color,
        note_type: 'checklist',
        checklist_items: items
          .map((item) => ({ ...item, text: item.text.trim() }))
          .filter((item) => item.text),
      };
    }
    return { title, content, color, note_type: 'text' };
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

      // Düzenlemede not türü değişmez, liste maddeleri de buradan değiştirilmez
      // (5. kişinin işi); yalnızca başlık, içerik ve renk gönderilir.
      const savedNote = editingNote
        ? await updateNote(
            editingNote.id,
            isChecklist ? { title, color } : { title, content, color },
          )
        : await createNote(buildNoteBody());

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
    <form
      className="note-form"
      onSubmit={handleSubmit}
      style={{ '--note-bg': noteColor(color) }}
    >
      <input
        className="note-form__title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Başlık"
      />

      <div className="note-form__types" role="group" aria-label="Not türü">
        <button
          type="button"
          className={noteType === 'text' ? 'is-active' : ''}
          onClick={() => changeNoteType('text')}
          disabled={Boolean(editingNote)}
        >
          Metin
        </button>
        <button
          type="button"
          className={noteType === 'checklist' ? 'is-active' : ''}
          onClick={() => changeNoteType('checklist')}
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
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  value={item.text}
                  onChange={(event) => setItemText(index, event.target.value)}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
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
          ref={contentRef}
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
