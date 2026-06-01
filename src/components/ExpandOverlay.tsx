import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function ExpandOverlay({ title, onClose, children }: Props) {
  return (
    <motion.div
      data-testid="overlay-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-bg-raised p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase tracking-wider text-text-bright">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted transition hover:text-text-bright"
          >
            ✕
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
