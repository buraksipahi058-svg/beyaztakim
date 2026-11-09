// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
//
// client.js her istekte bu dosyadaki fonksiyonları çağırır. Oturum jetonu
// localStorage'da tutulur ve her isteğin Authorization başlığına eklenir.
// client.js'e dokunmak gerekmez.

const TOKEN_KEY = 'beyaztakim_token';

// Saklanan oturum jetonunu döndürür; giriş yapılmamışsa null döner.
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Giriş/kayıt sonrası jetonu saklar.
export function setStoredToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

// Çıkışta ya da 401 alınca jetonu siler.
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Her isteğe eklenecek fetch seçeneklerini döndürür.
export function getAuthRequestOptions() {
  const token = getStoredToken();
  if (!token) return {};
  return { headers: { Authorization: `Bearer ${token}` } };
}

// Backend 401 (giriş yapılmamış / oturum geçersiz) döndüğünde çağrılır:
// saklanan jetonu siler; RequireAuth bir sonraki sayfa geçişinde /login'e götürür.
export function handleUnauthorized() {
  clearStoredToken();
}
