'use client';

import { Button as PrimeButton, ButtonProps as PrimeButtonProps } from 'primereact/button';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'danger' | 'success' | 'info' | 'alert' | 'ghost' | 'neutral';

// We omit 'text' and 'label' from PrimeButtonProps to avoid type collisions
export interface ButtonProps extends Omit<PrimeButtonProps, 'label' | 'text'> {
  variant?: ButtonVariant;
  children?: ReactNode;
  labelText?: string; // Renamed from 'text' to 'labelText' to avoid collision
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: () => void;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--sidebar-bg)] hover:brightness-90 text-white',
  danger:  'bg-red-600 hover:bg-red-800 text-white',
  success: 'bg-green-600 hover:bg-green-800 text-white',
  info:    'bg-sky-600 hover:bg-sky-800 text-white',
  alert:   'bg-orange-600 hover:bg-orange-800 text-white',
  ghost:   'bg-transparent hover:bg-zinc-100 text-current',
  neutral: 'bg-zinc-100 ring-1 ring-zinc-300 text-zinc-900 hover:bg-zinc-200',
};

export default function Button({
  variant,
  children,
  labelText,
  loading,
  disabled,
  type = 'button',
  className,
  onClick,
  ...rest
}: ButtonProps) {
  const colorCls = variant ? variantClass[variant] : '';

  return (
    <PrimeButton
      unstyled
      type={type}
      disabled={disabled || loading}
      loading={loading}
      label={!children ? labelText : undefined}
      className={cn(
        'btn border-none rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer',
        'px-4 py-2 text-sm font-medium transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        colorCls,
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </PrimeButton>
  );
}
