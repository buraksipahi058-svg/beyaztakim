// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
//
// Sol menülü tüm sayfaları sarar (bkz. App.jsx). Giriş sistemi yazıldığında:
// kullanıcı giriş yapmamışsa <Navigate to="/login" replace /> döndürmeli,
// giriş yapmışsa children'ı göstermeli.
//
// Şimdilik giriş sistemi olmadığı için herkesi içeri alır.
export default function RequireAuth({ children }) {
  return children;
}
