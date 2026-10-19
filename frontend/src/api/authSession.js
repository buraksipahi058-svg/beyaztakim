// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
//
// client.js her istekte bu dosyadaki fonksiyonları çağırır. Giriş sistemi
// yazıldığında yalnızca bu dosyanın içi değişir; client.js'e dokunmak gerekmez.

// Her isteğe eklenecek fetch seçeneklerini döndürür.
// Örnekler:
//   token ile giriş:  return { headers: { Authorization: `Bearer ${token}` } };
//   çerez ile giriş:  return { credentials: 'include' };
export function getAuthRequestOptions() {
  return {};
}

// Backend 401 (giriş yapılmamış) döndüğünde çağrılır.
// Örnek: kayıtlı token'ı silip kullanıcıyı /login sayfasına göndermek.
export function handleUnauthorized() {}
