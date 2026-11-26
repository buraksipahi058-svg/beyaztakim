import { useEffect, useState } from 'react';

// Ortak dosya. Bir CSS medya sorgusunun şu an geçerli olup olmadığını döndürür ve
// ekran boyutu değişince güncellenir.
//
//   const isNarrow = useMediaQuery('(max-width: 720px)');
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
