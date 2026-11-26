// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
//
// Sol menülü tüm sayfaları sarar (bkz. App.jsx). Saklanan oturum jetonu yoksa
// kullanıcıyı /login sayfasına yönlendirir; varsa sayfayı gösterir.
// Jeton geçersizse API 401 döndürür ve authSession.handleUnauthorized jetonu
// siler; kullanıcı bir sonraki sayfa geçişinde giriş ekranına döner.

import { Navigate } from 'react-router';
import { getStoredToken } from '../api/authSession.js';

export default function RequireAuth({ children }) {
  const isLoggedIn = Boolean(getStoredToken());

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
