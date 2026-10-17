import { Link } from 'react-router';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <EmptyState icon="search" message="Aradığınız sayfa bulunamadı" />
      <Link to="/">Notlara dön</Link>
    </div>
  );
}

NotFoundPage.route = { path: '*', inMenu: false };
