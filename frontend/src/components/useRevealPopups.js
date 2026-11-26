// Sahibi: 2. kişi (Not İşlemleri)

import { useEffect } from 'react';

// Not kartlarındaki açılır kutular (etiket, renk, hatırlatıcı).
export const POPUP_SELECTOR = '.tag-picker, .color-palette, .reminder-picker';

// Kendi içinde kayan bir kapsayıcıda (tuval, açılmış deste) bir kartın açılır
// kutusu açılınca, kutu kesilmesin diye kapsayıcıyı kutuyu gösterecek kadar kaydırır.
//   const containerRef = useRef(null);
//   useRevealPopups(containerRef);
export function useRevealPopups(containerRef) {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element && node.matches(POPUP_SELECTOR)) {
            node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          }
        }
      }
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [containerRef]);
}
