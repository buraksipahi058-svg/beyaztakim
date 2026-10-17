import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router';
import { menuRoutes } from '../routes.js';
import ApiStatus from './ApiStatus.jsx';
import Icon from './Icon.jsx';
import PageTransition, { FrozenOutlet } from './PageTransition.jsx';
import './Layout.css';

// Ortak dosya: üst çubuk + sol menü + animasyonlu sayfa alanı.
// Menü öğeleri src/pages altındaki sayfalardan otomatik gelir.
export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
        <ApiStatus />
      </header>

      <aside className="sidebar">
        <nav aria-label="Ana menü">
          {menuRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
              title={route.title}
            >
              <Icon name={route.icon} />
              <span className="nav-item__label">{route.title}</span>
            </NavLink>
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
