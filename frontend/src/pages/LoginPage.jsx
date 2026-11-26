// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
// Giriş sayfası: e-posta + parola ile giriş yapar, başarıda ana sayfaya gider.
// layout: false olduğu için sol menü olmadan ve giriş kontrolü yapılmadan açılır.

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { loginUser } from '../api/auth.js';
import { getStoredToken } from '../api/authSession.js';
import '../components/AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zaten giriş yapılmışsa doğrudan ana sayfaya git.
  if (getStoredToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginUser(email, password);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Giriş yapılamadı.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="standalone-page auth-page">
      <h1>Giriş yap</h1>
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
          Parola
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş yap'}
        </button>
      </form>
      <p className="auth-page__hint">
        Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
      </p>
    </main>
  );
}

LoginPage.route = { path: '/login', layout: false };
