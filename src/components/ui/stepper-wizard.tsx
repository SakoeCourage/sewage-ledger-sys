'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from './index';
import { cn } from '@/lib/utils';

export interface Step {
  num: number;
  label: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
}

interface Breadcrumb {
  label: string;
  href: string;
}

interface StepperWizardProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  steps: Step[];
  currentStep: number;
  onBack?: () => void;
  className?: string;
}

export const StepperWizard: React.FC<StepperWizardProps> = ({
  title,
  breadcrumbs,
  steps,
  currentStep,
  onBack,
  className,
}) => {
  const currentStepData = steps.find((s) => s.num === currentStep);
  const isFinalStep = currentStep === steps[steps.length - 1]?.num;

  return (
    <div className={cn("max-w-3xl mx-auto space-y-8", className)}>
      <header className="flex flex-col items-center gap-4 text-center">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
            {breadcrumbs.map((bc) => (
              <React.Fragment key={bc.href}>
                <Link href={bc.href} className="hover:text-[#4a907a] transition-colors">
                  {bc.label}
                </Link>
                <ChevronRight className="w-3 h-3" />
              </React.Fragment>
            ))}
            <span className="text-zinc-400/50">{title}</span>
          </nav>
        )}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-semibold text-zinc-700">{title}</h1>
        </motion.div>
      </header>

      {!isFinalStep && (
        <div className="flex items-center justify-between mb-16 px-8 max-w-2xl mx-auto">
          {steps.filter(s => s.num < steps[steps.length - 1]?.num).map((s, i, arr) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                    currentStep > s.num
                      ? "bg-[#4a907a] text-white"
                      : currentStep === s.num
                        ? "bg-white text-[#4a907a] border-2 border-[#4a907a]"
                        : "bg-white text-zinc-300 border border-zinc-200"
                  )}
                >
                  {s.num}
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-[0.2em] absolute -bottom-7 w-max",
                    currentStep === s.num ? "text-[#4a907a]" : "text-zinc-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-px bg-zinc-200 relative mt-4.5 -z-0">
                  <motion.div
                    initial={false}
                    animate={{ width: currentStep > s.num ? '100%' : '0%' }}
                    className="absolute top-0 left-0 h-full bg-[#4a907a]"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {currentStepData && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-10 space-y-8"
            >
              {currentStepData.title && (
                <div className="space-y-1">
                  <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">
                    {currentStepData.title}
                  </h2>
                  {currentStepData.description && (
                    <p className="text-sm text-zinc-500 font-medium">
                      {currentStepData.description}
                    </p>
                  )}
                  <div className="h-px bg-zinc-200/30 w-full mt-6" />
                </div>
              )}
              {currentStepData.content}

              {onBack && currentStep > 1 && !isFinalStep && (
                <div className="flex justify-start pt-4 -mt-20 pointer-events-none">
                  <Button
                    variant="neutral"
                    onClick={onBack}
                    className="!rounded-lg gap-2 pointer-events-auto"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous Step
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
