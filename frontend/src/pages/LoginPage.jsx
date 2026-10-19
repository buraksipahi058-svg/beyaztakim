// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
// Yer tutucu sayfa: giriş formu buraya yazılacak.
// layout: false olduğu için sol menü olmadan ve giriş kontrolü yapılmadan açılır.
export default function LoginPage() {
  return (
    <main className="standalone-page">
      <h1>Giriş yap</h1>
      <p>Bu sayfa henüz yapım aşamasında.</p>
    </main>
  );
}

LoginPage.route = { path: '/login', layout: false };
