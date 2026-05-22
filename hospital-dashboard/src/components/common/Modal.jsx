import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useEffect } from 'react';

const sizeClasses = {
  sm: 'max-w-md w-full',
  md: 'max-w-2xl w-full',
  lg: 'max-w-4xl w-full',
  xl: 'max-w-6xl w-full',
  full: 'max-w-[95vw] w-full',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Viewport Centering Wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`pointer-events-auto relative w-full shrink-0 min-w-[280px] sm:min-w-[360px] max-h-[90vh] flex flex-col rounded-2xl bg-surface border border-outline-variant dark:border-outline shadow-2xl dark:bg-surface text-on-surface overflow-hidden ${sizeClasses[size] || sizeClasses.md}`}
            >
              {/* Header */}
              {title ? (
                <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4 dark:border-outline shrink-0">
                  <h3 className="text-xl font-bold text-on-surface">{title}</h3>
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-surface-container-high dark:hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent"
                      title="Close"
                    >
                      <FiX className="w-5 h-5 text-on-surface-variant" />
                    </button>
                  )}
                </div>
              ) : (
                showClose && (
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 p-2 hover:bg-surface-container-high dark:hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent"
                    title="Close"
                  >
                    <FiX className="w-5 h-5 text-on-surface-variant" />
                  </button>
                )
              )}

              {/* Body */}
              <div className="overflow-y-auto p-6 custom-scrollbar flex-1 break-words whitespace-normal text-left">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
