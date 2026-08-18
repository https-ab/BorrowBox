import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-t-3xl sm:rounded-3xl bg-white shadow-lift
              max-h-[92vh] overflow-y-auto`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white/90 backdrop-blur px-6 pt-5 pb-3 rounded-t-3xl">
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
