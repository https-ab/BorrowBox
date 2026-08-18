import { motion } from 'framer-motion';

/** Consistent page enter animation used by every route. */
export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
