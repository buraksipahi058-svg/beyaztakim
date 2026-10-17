// src/pages altındaki her sayfa otomatik olarak yönlendirmeye ve sol menüye eklenir.
//
// Yeni sayfa eklemek için src/pages/OrnekPage.jsx dosyası açın, bileşeni
// default export edin ve üzerine `route` bilgisini yazın:
//
//   export default function RemindersPage() { ... }
//   RemindersPage.route = { path: '/reminders', title: 'Hatırlatıcılar', icon: 'bell', order: 2 };
//
// route alanları:
//   path   : adres (zorunlu)
//   title  : menüde görünen ad
//   icon   : components/Icon.jsx içindeki ikon adı
//   order  : menüdeki sıra (küçük olan üstte)
//   inMenu : false ise sayfa menüde gösterilmez

const pageModules = import.meta.glob('./pages/*.jsx', { eager: true });

export const routes = Object.values(pageModules)
  .map((module) => module.default)
  .filter((Page) => Page?.route?.path)
  .map((Page) => ({ ...Page.route, Component: Page }))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export const menuRoutes = routes.filter((route) => route.inMenu !== false);
