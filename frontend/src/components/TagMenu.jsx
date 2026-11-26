import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { listTags, onTagsChanged } from '../api/tags.js';
import Icon from './Icon.jsx';
import TagEditDialog from './TagEditDialog.jsx';
import './TagMenu.css';

// Sahibi: 3. kişi (Etiket ve Arama)
//
// Sol menüde, "Hatırlatıcılar" ile "Arşiv" arasındaki etiket listesi. Bir
// etikete tıklanınca o etiketin notları /search?tag=... sayfasında açılır.
// "Etiketleri düzenle" etiket oluşturma/silme penceresini açar.
// Menü daraltılınca Layout.css etiket adlarını gizler, yalnızca ikonlar kalır.
export default function TagMenu() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tags, setTags] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const activeTagId = location.pathname === '/search' ? searchParams.get('tag') : null;

  const loadTags = useCallback(() => {
    listTags()
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  // Etiketleri yükle; başka bir yerde etiket oluşturulup silinince yenile.
  useEffect(() => {
    loadTags();
    return onTagsChanged(loadTags);
  }, [loadTags]);

  return (
    <>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          to={`/search?tag=${tag.id}`}
          className={`nav-item${String(tag.id) === activeTagId ? ' nav-item--active' : ''}`}
          title={tag.name}
        >
          <Icon name="tag" />
          <span className="nav-item__label">{tag.name}</span>
        </Link>
      ))}

      <button
        type="button"
        className="nav-item tag-menu__edit"
        onClick={() => setIsEditing(true)}
        title="Etiketleri düzenle"
      >
        <Icon name="edit" />
        <span className="nav-item__label">Etiketleri düzenle</span>
      </button>

      {isEditing && <TagEditDialog tags={tags} onClose={() => setIsEditing(false)} />}
    </>
  );
}
