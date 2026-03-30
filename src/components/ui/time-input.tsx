'use client';

import { Calendar } from 'primereact/calendar';
import { cn } from '@/lib/utils';

export interface TimeInputProps {
  label?: string;
  name?: string;
  value?: Date | null;
  onChange?: (e: { target: { name?: string; value: Date | null } }) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hourFormat?: '12' | '24';
}

export default function TimeInput({
  label,
  name,
  value,
  onChange,
  error,
  className,
  placeholder,
  required,
  disabled,
  hourFormat = '12',
}: TimeInputProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-zinc-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Calendar
        name={name}
        value={value ?? null}
        onChange={(e) =>
          onChange?.({ target: { name, value: (e.value as Date) ?? null } })
        }
        timeOnly
        hourFormat={hourFormat}
        showIcon
        icon="pi pi-clock"
        placeholder={placeholder}
        className={cn('w-full', error && 'p-invalid')}
        disabled={disabled}
      />
      {error && <small className="p-error text-red-500 text-xs">{error}</small>}
    </div>
  );
}
