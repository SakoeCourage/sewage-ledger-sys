'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SheetSize = 'auto' | 'half' | 'full';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: SheetSize;
  closable?: boolean;
  className?: string;
}

const sizeClass: Record<SheetSize, string> = {
  auto: 'max-h-[85vh]',
  half: 'h-[50vh]',
  full: 'h-[92vh]',
};

export default function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'auto',
  closable = true,
  className,
}: BottomSheetProps) {
  const dragControls = useDragControls();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closable, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            onClick={closable ? onClose : undefined}
          />

          {/* Sheet */}
          <motion.div
            key="sheet-panel"
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 && closable) onClose();
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className={cn(
              'relative w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl shadow-zinc-900/30 flex flex-col overflow-hidden',
              sizeClass[size],
              className,
            )}
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing shrink-0"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 bg-zinc-200 rounded-full" />
            </div>

            {/* Header */}
            {(title || closable) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-3 pb-4 border-b border-zinc-100 shrink-0">
                <div className="space-y-0.5">
                  {title && (
                    <h2 className="text-base font-bold text-zinc-800">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-zinc-400">{description}</p>
                  )}
                </div>
                {closable && (
                  <button
                    onClick={onClose}
                    className="shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            {children && (
              <div className="px-6 py-5 overflow-y-auto flex-1 no-scrollbar">
                {children}
              </div>
            )}

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
