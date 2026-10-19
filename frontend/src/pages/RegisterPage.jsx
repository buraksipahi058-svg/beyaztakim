// Sahibi: 1. kişi (Kullanıcı ve Güvenlik)
// Yer tutucu sayfa: kayıt formu buraya yazılacak.
// layout: false olduğu için sol menü olmadan ve giriş kontrolü yapılmadan açılır.
export default function RegisterPage() {
  return (
    <main className="standalone-page">
      <h1>Kayıt ol</h1>
      <p>Bu sayfa henüz yapım aşamasında.</p>
    </main>
  );
}

RegisterPage.route = { path: '/register', layout: false };
