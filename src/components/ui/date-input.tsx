'use client';

import { Calendar, CalendarViewChangeEvent } from 'primereact/calendar';
import { cn } from '@/lib/utils';

// -------------------------
// Helpers
// -------------------------

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
}

// -------------------------
// Props
// -------------------------

type CalendarView = 'date' | 'month' | 'year';
type SelectionMode = 'single' | 'range' | 'multiple';

export interface DateInputProps {
  label?: string;
  name?: string;
  value?: Date | string | null | (Date | null)[];
  onChange?: (e: { target: { name?: string; value: Date | null | (Date | null)[] } }) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  view?: CalendarView;
  selectionMode?: SelectionMode;
  required?: boolean;
  disabled?: boolean;
  showTime?: boolean;
}

// -------------------------
// Component
// -------------------------

export default function DateInput({
  label,
  name,
  value,
  onChange,
  error,
  className,
  placeholder,
  minDate,
  maxDate,
  view = 'date',
  selectionMode = 'single',
  required,
  disabled,
  showTime,
}: DateInputProps) {
  const dateFormat = view === 'month' ? 'MM yy' : view === 'year' ? 'yy' : 'dd M yy';

  const parsedValue =
    selectionMode === 'range' || selectionMode === 'multiple'
      ? (value as (Date | null)[])
      : toDate(value as Date | string | null);

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
        value={parsedValue as Date | null | Date[]}
        onChange={(e) => onChange?.({ target: { name, value: e.value as Date | null | (Date | null)[] } })}
        view={view}
        dateFormat={dateFormat}
        minDate={toDate(minDate as Date | string | null) ?? undefined}
        maxDate={toDate(maxDate as Date | string | null) ?? undefined}
        selectionMode={selectionMode}
        showIcon
        showTime={showTime}
        placeholder={placeholder}
        className={cn('w-full', error && 'p-invalid')}
        disabled={disabled}
      />
      {error && <small className="p-error text-red-500 text-xs">{error}</small>}
    </div>
  );
}
