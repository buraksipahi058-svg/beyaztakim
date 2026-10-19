// src/pages altındaki her sayfa otomatik olarak yönlendirmeye (ve istenirse
// sol menüye) eklenir. Ortak dosyadır; yeni sayfa için buraya dokunmayın.
//
// Yeni sayfa eklemek için src/pages/OrnekPage.jsx dosyası açın, bileşeni
// default export edin ve üzerine `route` bilgisini yazın:
//
//   export default function OrnekPage() { ... }
//   OrnekPage.route = { path: '/ornek', title: 'Örnek', icon: 'tag', order: 3 };
//
// route alanları:
//   path   : adres (zorunlu)
//   title  : menüde görünen ad
//   icon   : components/Icon.jsx içindeki ikon adı
//   order  : menüdeki sıra (küçük olan üstte)
//   inMenu : false ise sayfa menüde gösterilmez
//   layout : false ise sayfa sol menü ve üst çubuk olmadan, giriş kontrolü
//            yapılmadan açılır (giriş ve kayıt sayfaları için)

const pageModules = import.meta.glob('./pages/*.jsx', { eager: true });

export const routes = Object.values(pageModules)
  .map((module) => module.default)
  .filter((Page) => Page?.route?.path)
  .map((Page) => ({ ...Page.route, Component: Page }))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

// Sol menülü düzen içinde, giriş yapmış kullanıcıya açılan sayfalar
export const layoutRoutes = routes.filter((route) => route.layout !== false);

// Düzen dışında, herkese açık sayfalar (ör. /login, /register)
export const standaloneRoutes = routes.filter((route) => route.layout === false);

export const menuRoutes = layoutRoutes.filter((route) => route.inMenu !== false);
