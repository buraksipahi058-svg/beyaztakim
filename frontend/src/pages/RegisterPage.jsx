// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
// Kayıt sayfası: yeni hesap oluşturur; başarıda otomatik giriş yapıp ana sayfaya gider.
// layout: false olduğu için sol menü olmadan ve giriş kontrolü yapılmadan açılır.

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { loginUser, registerUser } from '../api/auth.js';
import { getStoredToken } from '../api/authSession.js';
import '../components/AuthPages.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zaten giriş yapılmışsa doğrudan ana sayfaya git.// 
  if (getStoredToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== passwordRepeat) {
      setError('Parolalar birbiriyle uyuşmuyor.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await registerUser(email, password);
      await loginUser(email, password); // kayıt sonrası otomatik giriş
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Kayıt yapılamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="standalone-page auth-page">
      <h1>Kayıt ol</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-form__field">
          E-posta
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="auth-form__field">
          Parola (en az 8 karakter)
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className="auth-form__field">
          Parolayı tekrar gir
          <input
            type="password"
            value={passwordRepeat}
            onChange={(event) => setPasswordRepeat(event.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kayıt yapılıyor...' : 'Kayıt ol'}
        </button>
      </form>
      <p className="auth-page__hint">
        Hesabın var mı? <Link to="/login">Giriş yap</Link>
      </p>
    </main>
  );
}

RegisterPage.route = { path: '/register', layout: false };
