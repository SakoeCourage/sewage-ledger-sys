'use client';

import { InputText } from 'primereact/inputtext';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash-es';
import { cn } from '@/lib/utils';
import Loadingspinner from './loading-spinner';

export interface SearchInputProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    className?: string;
    loading?: boolean;
    defaultValue?: string;
}

export default function SearchInput({
    onSearch,
    placeholder = 'Search...',
    className,
    loading = false,
    defaultValue = '',
}: SearchInputProps) {
    const [searchValue, setSearchValue] = useState(defaultValue);

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            onSearch(value);
        }, 300),
        [onSearch]
    );

    useEffect(() => {
        debouncedSearch(searchValue);
        return debouncedSearch.cancel;
    }, [searchValue, debouncedSearch]);

    const handleClear = () => {
        setSearchValue('');
        onSearch('');
    };

    return (
        <div className={cn(
            'flex items-center gap-3 px-4 py-2 bg-white border border-zinc-200 rounded-lg transition-all duration-300 focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-[#4a907a]',
            className
        )}>
            {loading ? (
                <div className="animate-spin text-zinc-400">
                    <Search className="w-5 h-5 opacity-20" />
                </div>
            ) : (
                <Search className="w-5 h-5 text-zinc-400" />
            )}

            <InputText
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholder}
                className="flex-1 !border-none !shadow-none !bg-transparent !p-0 text-sm focus:!ring-0"
                autoComplete="off"
            />

            {searchValue && (
                <button
                    onClick={handleClear}
                    className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-red-500 transition-colors"
                    type="button"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
