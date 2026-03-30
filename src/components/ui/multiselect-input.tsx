'use client';

import { MultiSelect } from 'primereact/multiselect';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  label: string;
  value: string | number;
}

export interface MultiSelectInputProps {
  label?: string;
  name?: string;
  value?: (string | number)[];
  options: MultiSelectOption[];
  onChange?: (e: { target: { name?: string; value: (string | number)[] } }) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  filter?: boolean;
  display?: 'chip' | 'comma';
  maxSelectedLabels?: number;
}

export default function MultiSelectInput({
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
  filter = true,
  display = 'chip',
  maxSelectedLabels = 3,
}: MultiSelectInputProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-sm font-medium text-zinc-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <MultiSelect
        name={name}
        value={value ?? []}
        options={options}
        optionLabel="label"
        optionValue="value"
        onChange={(e) => onChange?.({ target: { name, value: e.value as (string | number)[] } })}
        placeholder={placeholder ?? `Select ${label ?? ''}`.trim()}
        className={cn('w-full', error && 'p-invalid')}
        display={display}
        filter={filter}
        maxSelectedLabels={maxSelectedLabels}
        disabled={disabled}
        pt={{
          trigger: { style: { borderLeft: 'none' } },
          label: { className: 'rounded-r-none' },
        }}
      />
      {error && <small className="p-error text-red-500 text-xs">{error}</small>}
    </div>
  );
}
