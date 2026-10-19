import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router';
import { menuRoutes } from '../routes.js';
import ApiStatus from './ApiStatus.jsx';
import Icon from './Icon.jsx';
import PageTransition, { FrozenOutlet } from './PageTransition.jsx';
import SearchBar from './SearchBar.jsx';
import TagMenu from './TagMenu.jsx';
import UserMenu from './UserMenu.jsx';
import './Layout.css';

// Etiket menüsü, sırası (order) bu değerden küçük sayfaların altına yerleşir:
// Notlar (1), Hatırlatıcılar (2) | etiketler | Arşiv (8), Çöp Kutusu (9)
const TAG_MENU_ORDER = 5;

function MenuLink({ route }) {
  return (
    <NavLink
      to={route.path}
      end
      className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
      title={route.title}
    >
      <Icon name={route.icon} />
      <span className="nav-item__label">{route.title}</span>
    </NavLink>
  );
}

// Ortak dosya: üst çubuk + sol menü + animasyonlu sayfa alanı.
// Menü öğeleri src/pages altındaki sayfalardan otomatik gelir. Kişilere
// ayrılmış yerler: SearchBar ve TagMenu (3. kişi), UserMenu (1. kişi).
export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const topRoutes = menuRoutes.filter((route) => (route.order ?? 99) < TAG_MENU_ORDER);
  const bottomRoutes = menuRoutes.filter((route) => (route.order ?? 99) >= TAG_MENU_ORDER);

  return (
    <div className={`layout${collapsed ? ' layout--collapsed' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="icon-button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label="Menüyü daralt veya genişlet"
          aria-expanded={!collapsed}
        >
          <Icon name="menu" />
        </button>
        <div className="brand">
          <img className="brand__logo" src="/favicon.svg" alt="" width="28" height="28" />
          <span className="brand__name">Beyaz Takım Notlar</span>
        </div>
        <div className="topbar__search">
          <SearchBar />
        </div>
        <ApiStatus />
        <UserMenu />
      </header>

      <aside className="sidebar">
        <nav aria-label="Ana menü">
          {topRoutes.map((route) => (
            <MenuLink key={route.path} route={route} />
          ))}
          <TagMenu collapsed={collapsed} />
          {bottomRoutes.map((route) => (
            <MenuLink key={route.path} route={route} />
          ))}
        </nav>
      </aside>

      <main className="content">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <FrozenOutlet />
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}
