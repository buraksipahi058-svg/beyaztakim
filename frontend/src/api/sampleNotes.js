// GEÇİCİ örnek veri: notları listeleyen API yazılana kadar ana sayfada
// kartların görünümünü göstermek için kullanılır. Alan adları backend'deki
// NoteRead şemasıyla aynıdır. Notlar API'si hazır olunca bu dosya silinmeli.

export const sampleNotes = [
  {
    id: 1,
    title: "Beyaz Takım'a hoş geldin",
    content: 'Bu, arayüzü göstermek için eklenmiş örnek bir nottur.',
    note_type: 'text',
    color: 'yellow',
    is_pinned: true,
    tags: [{ id: 1, name: 'proje' }],
    checklist_items: [],
  },
  {
    id: 2,
    title: 'Alışveriş listesi',
    content: '',
    note_type: 'checklist',
    color: 'green',
    is_pinned: false,
    tags: [{ id: 2, name: 'kişisel' }],
    checklist_items: [
      { id: 1, text: 'Süt', is_done: true, position: 0 },
      { id: 2, text: 'Ekmek', is_done: false, position: 1 },
      { id: 3, text: 'Yumurta', is_done: false, position: 2 },
    ],
  },
  {
    id: 3,
    title: 'Toplantı notları',
    content: 'Görev dağılımı docs/fonksiyonlar.md dosyasında.',
    note_type: 'text',
    color: 'blue',
    is_pinned: false,
    tags: [{ id: 1, name: 'proje' }],
    checklist_items: [],
  },
  {
    id: 4,
    title: '',
    content: 'Başlıksız kısa bir not da böyle görünür.',
    note_type: 'text',
    color: 'default',
    is_pinned: false,
    tags: [],
    checklist_items: [],
  },
  {
    id: 5,
    title: 'Fikirler',
    content: 'Etiketler, hatırlatıcılar, arşiv ve çöp kutusu ekip üyeleri tarafından eklenecek.',
    note_type: 'text',
    color: 'purple',
    is_pinned: false,
    tags: [],
    checklist_items: [],
  },
];
