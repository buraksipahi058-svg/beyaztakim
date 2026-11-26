import { useEffect, useRef, useState } from 'react';
import {
  addTagToNote,
  createTag,
  listTags,
  onTagsChanged,
  removeTagFromNote,
} from '../../api/tags.js';
import Icon from '../Icon.jsx';
import './NoteTags.css';

function sortByName(tags) {
  return [...tags].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

// Sahibi: 3. kişi (Etiket ve Arama)
//
// Not kartındaki etiket rozetleri. Rozetteki çarpı etiketi nottan çıkarır;
// "Etiket" düğmesi etiket seçme/oluşturma kutusunu açar. Çöpteki notlarda
// etiketler yalnızca gösterilir. Değişiklik sonrası onNoteChange(güncelNot).
// Girdi: { note, onNoteChange, onNoteRemove } (bkz. NoteCard.jsx)
export default function NoteTags({ note, onNoteChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [error, setError] = useState('');
  const isReadOnly = note.is_trashed;

  // Bir etiket "Etiketleri düzenle" penceresinden silinirse rozeti karttan da kaldır.
  useEffect(
    () =>
      onTagsChanged(({ deletedTagId }) => {
        if (deletedTagId && note.tags.some((tag) => tag.id === deletedTagId)) {
          onNoteChange?.({ ...note, tags: note.tags.filter((tag) => tag.id !== deletedTagId) });
        }
      }),
    [note, onNoteChange],
  );

  if (isReadOnly && note.tags.length === 0) return null;

  async function updateNoteTags(tag, shouldAdd) {
    setError('');
    try {
      if (shouldAdd) {
        await addTagToNote(note.id, tag.id);
        onNoteChange?.({ ...note, tags: sortByName([...note.tags, tag]) });
      } else {
        await removeTagFromNote(note.id, tag.id);
        onNoteChange?.({ ...note, tags: note.tags.filter((noteTag) => noteTag.id !== tag.id) });
      }
    } catch (tagError) {
      setError(tagError.message || 'Etiket güncellenemedi.');
    }
  }

  return (
    <div className="note-card__tags">
      {note.tags.map((tag) => (
        <span key={tag.id} className="note-card__tag">
          {tag.name}
          {!isReadOnly && (
            <button
              type="button"
              className="note-tags__remove"
              onClick={() => updateNoteTags(tag, false)}
              aria-label={`"${tag.name}" etiketini nottan çıkar`}
              title="Etiketi çıkar"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </span>
      ))}

      {!isReadOnly && (
        <button
          type="button"
          className="note-tags__add"
          onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
          aria-expanded={isPickerOpen}
          title="Etiket ekle"
        >
          <Icon name="tag" size={14} />
          <span>Etiket</span>
        </button>
      )}

      {isPickerOpen && (
        <TagPicker
          note={note}
          onToggle={updateNoteTags}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

      {error && (
        <span className="note-action-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

// Etiket seçme kutusu: arama, işaretle/kaldır ve yazılan adla yeni etiket oluşturma.
// Kutunun dışına tıklanınca ya da Esc'ye basılınca kapanır.
function TagPicker({ note, onToggle, onClose }) {
  const [allTags, setAllTags] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const pickerRef = useRef(null);

  useEffect(() => {
    listTags()
      .then(setAllTags)
      .catch((loadError) => setError(loadError.message || 'Etiketler yüklenemedi.'));
  }, []);

  useEffect(() => {
    // Etiket satırının içi (ör. kutuyu açıp kapatan "Etiket" düğmesi) dışarısı sayılmaz.
    function handlePointerDown(event) {
      if (!pickerRef.current?.parentElement.contains(event.target)) onClose();
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const trimmedFilter = filter.trim();
  const lowerFilter = trimmedFilter.toLocaleLowerCase('tr');
  const visibleTags = allTags.filter((tag) => tag.name.toLocaleLowerCase('tr').includes(lowerFilter));
  const canCreate =
    trimmedFilter && !allTags.some((tag) => tag.name.toLocaleLowerCase('tr') === lowerFilter);

  async function handleCreate() {
    setError('');
    try {
      const tag = await createTag(trimmedFilter);
      setAllTags((current) => sortByName([...current, tag]));
      setFilter('');
      await onToggle(tag, true);
    } catch (createError) {
      setError(createError.message || 'Etiket oluşturulamadı.');
    }
  }

  return (
    <div className="tag-picker" ref={pickerRef}>
      <p className="tag-picker__title">Notu etiketle</p>
      <input
        className="tag-picker__input"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && canCreate) handleCreate();
        }}
        placeholder="Etiket adını girin"
        aria-label="Etiket ara ya da oluştur"
        maxLength={100}
        autoFocus
      />
      <ul className="tag-picker__list">
        {visibleTags.map((tag) => {
          const isChecked = note.tags.some((noteTag) => noteTag.id === tag.id);
          return (
            <li key={tag.id}>
              <label className="tag-picker__option">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(tag, !isChecked)}
                />
                <span>{tag.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {canCreate && (
        <button type="button" className="tag-picker__create" onClick={handleCreate}>
          <Icon name="plus" size={16} />
          <span>"{trimmedFilter}" etiketini oluştur</span>
        </button>
      )}
      {error && (
        <p className="note-action-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
