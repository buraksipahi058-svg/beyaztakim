// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
//
// Üst çubuğun en sağındaki yer: giriş yapan kullanıcının e-postası ve
// "Çıkış yap" düğmesi. Kullanıcı bilgisi /auth/me'den alınır; çıkışta jeton
// silinir ve /login sayfasına gidilir.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, logoutUser } from '../api/auth.js';
import Icon from './Icon.jsx';
import './UserMenu.css';

export default function UserMenu() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let isActive = true;
    getCurrentUser()
      .then((user) => {
        if (isActive) setEmail(user.email);
      })
      .catch(() => {
        // 401 vb. durumlarda jeton authSession tarafından zaten silinir;
        // e-posta boş kalır, RequireAuth bir sonraki geçişte yönlendirir.
      });
    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    if (isBusy) return;
    setIsBusy(true);
    await logoutUser();
    navigate('/login', { replace: true });
  }

  return (
    <div className="user-menu">
      {email && (
        <span className="user-menu__email" title={email}>
          <Icon name="user" size={18} />
          {email}
        </span>
      )}
      <button
        type="button"
        className="icon-button user-menu__logout"
        onClick={handleLogout}
        title="Çıkış yap"
        aria-label="Çıkış yap"
        disabled={isBusy}
      >
        <Icon name="logout" />
      </button>
    </div>
  );
}
