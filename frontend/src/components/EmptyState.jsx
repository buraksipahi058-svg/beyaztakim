import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

// Listede gösterilecek kayıt yokken kullanılan boş durum görünümü.
export default function EmptyState({ icon, message }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Icon name={icon} size={96} className="empty-state__icon" />
      <p>{message}</p>
    </motion.div>
  );
}
