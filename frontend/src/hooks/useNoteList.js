import { useCallback, useEffect, useState } from 'react';

// Ortak dosya. Not listesi gösteren sayfalar (arşiv, çöp kutusu, arama,
// hatırlatıcılar) için: listeyi API'den yükler, yükleme/hata durumunu tutar ve
// not kartlarından gelen değişiklikleri listeye uygular.
//
//   const { notes, isLoading, loadError, handleNoteChange, handleNoteRemove } =
//     useNoteList(listArchivedNotes);
//
// loadNotes : () => Promise<Note[]>
// deps      : değiştiğinde liste yeniden yüklenir (ör. [aramaSözcüğü])
export function useNoteList(loadNotes, deps = []) {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setLoadError('');
    loadNotes()
      .then((loadedNotes) => {
        if (isActive) setNotes(loadedNotes);
      })
      .catch((error) => {
        if (isActive) setLoadError(error.message || 'Notlar yüklenemedi.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
    // loadNotes her render'da yeni olabilir; yeniden yüklemeyi deps belirler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Kart notu değiştirince (ör. renk) listedeki notu günceller.
  const handleNoteChange = useCallback((updatedNote) => {
    setNotes((current) => current.map((note) => (note.id === updatedNote.id ? updatedNote : note)));
  }, []);

  // Not bu listeden çıkınca (ör. arşivlendi, geri yüklendi) listeden kaldırır.
  const handleNoteRemove = useCallback((noteId) => {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }, []);

  return { notes, isLoading, loadError, handleNoteChange, handleNoteRemove };
}
