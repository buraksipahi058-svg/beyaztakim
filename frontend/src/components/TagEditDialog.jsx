import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { createTag, deleteTag } from '../api/tags.js';
import Icon from './Icon.jsx';
import './TagEditDialog.css';

// Sahibi: 3. kişi (Etiket ve Arama)
//
// "Etiketleri düzenle" penceresi: yeni etiket oluşturma ve etiket silme.
// Değişiklikler api/tags.js üzerinden diğer bileşenlere (menü, kartlar) bildirilir.
// Esc tuşu, arka plana tıklama ya da "Bitti" pencereyi kapatır.
// Sol menünün içinde değil, sayfanın en üstünde (document.body) açılır; böylece
// üst çubuğun ve kartların arkasında kalmaz.
export default function TagEditDialog({ tags, onClose }) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleCreate(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setIsBusy(true);
    setError('');
    try {
      await createTag(name);
      setNewName('');
    } catch (createError) {
      setError(createError.message || 'Etiket oluşturulamadı.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(tag) {
    if (!window.confirm(`"${tag.name}" etiketi silinecek. Notlarınız silinmez.`)) return;
    setIsBusy(true);
    setError('');
    try {
      await deleteTag(tag.id);
    } catch (deleteError) {
      setError(deleteError.message || 'Etiket silinemedi.');
    } finally {
      setIsBusy(false);
    }
  }

  return createPortal(
    <div className="tag-dialog__backdrop" onMouseDown={onClose}>
      <motion.div
        className="tag-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <h2 id="tag-dialog-title" className="tag-dialog__title">
          Etiketleri düzenle
        </h2>

        <form className="tag-dialog__row" onSubmit={handleCreate}>
          <Icon name="plus" size={18} />
          <input
            className="tag-dialog__input"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Yeni etiket oluştur"
            aria-label="Yeni etiket adı"
            maxLength={100}
            autoFocus
          />
          <button type="submit" className="icon-button note-action" disabled={isBusy || !newName.trim()} aria-label="Etiketi oluştur" title="Etiketi oluştur">
            <Icon name="check-square" size={18} />
          </button>
        </form>

        {error && (
          <p className="note-action-error" role="alert">
            {error}
          </p>
        )}

        <ul className="tag-dialog__list">
          {tags.map((tag) => (
            <li key={tag.id} className="tag-dialog__row">
              <Icon name="tag" size={18} />
              <span className="tag-dialog__name">{tag.name}</span>
              <button
                type="button"
                className="icon-button note-action"
                onClick={() => handleDelete(tag)}
                disabled={isBusy}
                aria-label={`"${tag.name}" etiketini sil`}
                title="Etiketi sil"
              >
                <Icon name="trash" size={18} />
              </button>
            </li>
          ))}
        </ul>

        <div className="tag-dialog__footer">
          <button type="button" className="tag-dialog__done" onClick={onClose}>
            Bitti
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
