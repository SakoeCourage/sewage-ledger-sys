'use client';

import { Toaster as Sonner, toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

// ── Toaster component — drop into layout once ──
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      expand
      visibleToasts={5}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            'w-full flex items-start gap-3',
            'bg-white border border-zinc-100 rounded-xl shadow-lg shadow-zinc-900/10',
            'px-4 py-3.5 text-sm',
          ].join(' '),
          title: 'font-semibold text-zinc-800 text-sm leading-snug',
          description: 'text-zinc-400 text-xs mt-0.5 leading-snug',
          actionButton: [
            'mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold',
            'bg-[#4a907a] text-white hover:bg-[#3d7a66] transition-colors',
          ].join(' '),
          cancelButton: [
            'mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold',
            'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors',
          ].join(' '),
          closeButton: [
            '!bg-zinc-100 !border-zinc-200 !text-zinc-400',
            'hover:!bg-zinc-200 hover:!text-zinc-700 !rounded-lg',
          ].join(' '),
        },
      }}
      icons={{
        success: <CheckCircle className="w-5 h-5 text-[#4a907a] shrink-0 mt-0.5" />,
        error:   <XCircle    className="w-5 h-5 text-red-500    shrink-0 mt-0.5" />,
        warning: <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
        info:    <Info       className="w-5 h-5 text-blue-500   shrink-0 mt-0.5" />,
        loading: <Loader2    className="w-5 h-5 text-zinc-400   shrink-0 mt-0.5 animate-spin" />,
      }}
    />
  );
}

// ── toast helper — import this anywhere to fire toasts ──
export const toast = {
  success: (title: string, description?: string) =>
    sonnerToast.success(title, { description }),

  error: (title: string, description?: string) =>
    sonnerToast.error(title, { description }),

  warning: (title: string, description?: string) =>
    sonnerToast.warning(title, { description }),

  info: (title: string, description?: string) =>
    sonnerToast.info(title, { description }),

  loading: (title: string, description?: string) =>
    sonnerToast.loading(title, { description }),

  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) =>
    sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error:   messages.error,
    }),

  action: (
    title: string,
    description: string,
    action: { label: string; onClick: () => void },
  ) =>
    sonnerToast(title, {
      description,
      action: { label: action.label, onClick: action.onClick },
    }),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};
