'use client';

import { Dropdown } from 'primereact/dropdown';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectInputProps {
  label?: string;
  name: string;
  value?: string | number | null;
  options: SelectOption[];
  onChange?: (e: { target: { name: string; value: string | number | null } }) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showClear?: boolean;
  filter?: boolean;
}

export default function SelectInput({
  label,
  name,
  value,
  options,
  onChange,
  error,
  className,
  placeholder,
  required,
  disabled,
  showClear = true,
  filter = true,
}: SelectInputProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-zinc-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Dropdown
        name={name}
        value={value ?? null}
        options={options}
        optionLabel="label"
        optionValue="value"
        onChange={(e) => onChange?.({ target: { name, value: e.value } })}
        placeholder={placeholder ?? `Select ${label ?? ''}`.trim()}
        className={cn('w-full', error && 'p-invalid')}
        filter={filter}
        showClear={showClear}
        disabled={disabled}
        pt={{
          trigger: { style: { borderLeft: 'none' } },
          clearIcon: { className: 'pr-1' },
          input: { className: 'rounded-r-none !pr-4' },
        }}
      />
      {error && <small className="p-error text-red-500 text-xs">{error}</small>}
    </div>
  );
}
