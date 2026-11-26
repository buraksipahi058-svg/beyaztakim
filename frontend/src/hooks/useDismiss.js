import { useEffect } from 'react';

// Ortak dosya. Açılır kutular (renk paleti, hatırlatıcı seçimi vb.) için:
// `ref` verilen öğenin dışına tıklanınca ya da Esc'ye basılınca onClose çağrılır.
// `isOpen` false iken dinleme yapılmaz. Kutuyu açan düğme de `ref`'in içinde
// olmalıdır; yoksa düğmeye basmak kutuyu kapatıp yeniden açar.
//
//   const wrapperRef = useRef(null);
//   useDismiss(wrapperRef, () => setIsOpen(false), isOpen);
export function useDismiss(ref, onClose, isOpen = true) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onClose();
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
  }, [ref, onClose, isOpen]);
}
