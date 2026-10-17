import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutlet } from 'react-router';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Çıkış animasyonu sürerken eski sayfanın içeriği ekranda kalsın diye
// Outlet ilk render'daki haliyle dondurulur.
export function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozenOutlet] = useState(outlet);
  return frozenOutlet;
}

// Layout içinde AnimatePresence ile birlikte kullanılır; key olarak
// sayfa adresi verilir.
export default function PageTransition({ children }) {
  return (
    <motion.div
      className="page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
