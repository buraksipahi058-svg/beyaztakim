import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import Icon from './Icon.jsx';
import './SearchBar.css';

const SEARCH_DELAY_MS = 300;

// Sahibi: 3. kişi (Etiket ve Arama)
//
// Üst çubuğun ortasındaki arama kutusu. Yazmayı bırakınca (ya da Enter'a
// basınca) /search?q=... sayfasını açar; arama sayfasındayken seçili etiket
// (?tag=...) korunur. Çarpı düğmesi aramayı kapatıp ana sayfaya döner.
export default function SearchBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnSearchPage = location.pathname === '/search';
  const urlQuery = isOnSearchPage ? (searchParams.get('q') ?? '') : '';
  const [value, setValue] = useState(urlQuery);
  // Bu bileşenin adrese yazdığı son sözcük; adres ondan değiştiyse kutuya geri yazılmaz.
  const lastSubmittedRef = useRef(urlQuery);

  // Adres başka bir yerden değişince (etikete tıklama, geri tuşu) kutuyu güncelle.
  useEffect(() => {
    if (urlQuery !== lastSubmittedRef.current) {
      lastSubmittedRef.current = urlQuery;
      setValue(urlQuery);
    }
  }, [urlQuery]);

  function submitSearch(text) {
    const params = new URLSearchParams(isOnSearchPage ? searchParams : undefined);
    const query = text.trim();
    if (query) params.set('q', query);
    else params.delete('q');
    lastSubmittedRef.current = query;
    const search = params.toString();
    navigate(`/search${search ? `?${search}` : ''}`, { replace: isOnSearchPage });
  }

  // Yazmayı bırakınca ara. Sayfa değişirse (ör. çarpıyla ana sayfaya dönüldü)
  // bekleyen arama iptal edilir.
  useEffect(() => {
    if (value.trim() === urlQuery.trim()) return undefined;
    if (!value.trim() && !isOnSearchPage) return undefined;
    const timer = setTimeout(() => submitSearch(value), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // submitSearch her render'da yenilenir; tetikleyici yazılan değer ve adrestir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, urlQuery, isOnSearchPage]);

  function handleSubmit(event) {
    event.preventDefault();
    submitSearch(value);
  }

  function handleClear() {
    setValue('');
    lastSubmittedRef.current = '';
    navigate('/');
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <Icon name="search" size={20} className="search-bar__icon" />
      <input
        className="search-bar__input"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ara"
        aria-label="Notlarda ara"
        maxLength={100}
      />
      {(value || isOnSearchPage) && (
        <button
          type="button"
          className="icon-button search-bar__clear"
          onClick={handleClear}
          aria-label="Aramayı kapat"
          title="Aramayı kapat"
        >
          <Icon name="close" size={18} />
        </button>
      )}
    </form>
  );
}
