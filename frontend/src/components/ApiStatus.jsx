import { useEffect, useState } from 'react';
import { getHealth } from '../api/health.js';

const labels = {
  checking: 'API kontrol ediliyor',
  online: 'API bağlı',
  offline: 'API bağlantısı yok',
};

// Backend'in /health uç noktasını yoklayarak bağlantı durumunu gösterir.
export default function ApiStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    getHealth()
      .then(() => active && setStatus('online'))
      .catch(() => active && setStatus('offline'));
    return () => {
      active = false;
    };
  }, []);

  return (
    <span className={`api-status api-status--${status}`} title={labels[status]}>
      <span className="api-status__dot" />
      <span className="api-status__label">{labels[status]}</span>
    </span>
  );
}
