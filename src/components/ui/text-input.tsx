'use client';

import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useCallback, useMemo, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// -------------------------
// Helpers (number formatting)
// -------------------------

function formatWithCommas(val: string | number | null | undefined): string {
  if (val === '' || val == null) return '';
  const str = String(val);
  const [whole, decimal] = str.split('.');
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
}

function stripCommas(str: string): string {
  return str.replace(/,/g, '');
}

// -------------------------
// Props
// -------------------------

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  name: string;
  value?: string | number | null;
  onChange?: (e: { target: { name: string; value: string } }) => void;
  error?: string;
  className?: string;
  /** Renders InputTextarea instead of InputText */
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  /** When true, formats value with comma separators */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  required?: boolean;
}

// -------------------------
// Component
// -------------------------

export default function TextInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  className,
  multiline = false,
  rows = 3,
  placeholder,
  disabled,
  required,
  ...props
}: TextInputProps) {
  const isNumber = type === 'number';

  const displayValue = useMemo(() => {
    if (!isNumber) return value ?? '';
    return formatWithCommas(value as string | number | null);
  }, [value, isNumber]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!isNumber) {
        onChange?.({ target: { name, value: e.target.value } });
        return;
      }
      const raw = stripCommas(e.target.value);
      if (raw !== '' && !/^-?\d*\.?\d*$/.test(raw)) return;
      onChange?.({ target: { name, value: raw } });
    },
    [isNumber, name, onChange],
  );

  const inputClass = cn('w-full rounded-lg h-12', error && 'p-invalid', className);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-zinc-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {multiline ? (
        <InputTextarea
          name={name}
          value={String(displayValue)}
          onChange={handleChange}
          rows={rows}
          placeholder={placeholder}
          className={inputClass}
          disabled={disabled}
          {...(props as object)}
        />
      ) : (
        <InputText
          name={name}
          type={isNumber ? 'text' : type}
          value={String(displayValue)}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode={isNumber ? 'numeric' : undefined}
          className={inputClass}
          disabled={disabled}
          {...(props as object)}
        />
      )}

      {error && <small className="p-error text-red-500 text-xs">{error}</small>}
    </div>
  );
}
