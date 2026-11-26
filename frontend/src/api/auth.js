// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
// Backend uç noktaları: /auth (backend/app/routers/auth.py)

import { apiRequest } from './client.js';
import { clearStoredToken, setStoredToken } from './authSession.js';

// Yeni kullanıcı kaydeder; dönen değer UserRead { id, email, created_at }.
export function registerUser(email, password) {
  return apiRequest('/auth/register', { method: 'POST', body: { email, password } });
}

// Giriş yapar; dönen jetonu authSession ile saklar ve TokenResponse döndürür.
export async function loginUser(email, password) {
  const tokenResponse = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setStoredToken(tokenResponse.access_token);
  return tokenResponse;
}

// Çıkış bildirimi gönderir ve saklanan jetonu siler (istek hata verirse bile).
export async function logoutUser() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}

// Giriş yapmış kullanıcının bilgilerini döndürür (UserRead).
export function getCurrentUser() {
  return apiRequest('/auth/me');
}
