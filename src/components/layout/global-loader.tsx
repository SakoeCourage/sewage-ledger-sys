'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

function LoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  // Hide loader when route finally changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  // Intercept all links to show loader on start
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (
        anchor &&
        anchor.href &&
        anchor.target !== '_blank' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        anchor.href.startsWith(window.location.origin) &&
        anchor.href !== window.location.href
      ) {
        // It's an internal navigation
        setIsNavigating(true);
      }
    };

    const handleNavStart = () => setIsNavigating(true);

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('navigation-start', handleNavStart);
    
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('navigation-start', handleNavStart);
    };
  }, []);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-sm"
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.1, 0.3] 
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute w-32 h-32 bg-emerald-400/20 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5] 
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
              className="absolute w-24 h-24 bg-emerald-400/30 rounded-full"
            />
            
            {/* Center Icon */}
            <div className="relative bg-white/10 p-5 rounded-full border border-white/20 shadow-2xl backdrop-blur-xl">
              <Droplets className="w-8 h-8 text-emerald-300 animate-bounce" />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <p className="text-emerald-50 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
              Loading
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GlobalLoader() {
  return (
    <Suspense>
      <LoaderContent />
    </Suspense>
  );
}
