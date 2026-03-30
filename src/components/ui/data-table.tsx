'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button, TextInput, SearchInput, EmptyState, SelectInput, DateInput, MultiSelectInput } from '@/components/ui';
import { motion } from 'motion/react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterType = 'DateFilter' | 'SelectFilter' | 'MultiSelectFilter' | 'TextFilter' | 'DateRangeFilter';

export interface FilterParam {
    type: FilterType;
    accessor: string;
    label: string;
    args?: any;
}

export interface ColumnDef<TData> {
    field: string;
    header: string;
    body?: (data: TData) => React.ReactNode;
    sortable?: boolean;
    style?: React.CSSProperties;
}

export interface DataTableProps<TData> {
    columns: ColumnDef<TData>[];

    // ── Local data ──────────────────────────────────────────────────────────
    /** Pass a local array to enable fully client-side search, filter & pagination */
    data?: TData[];
    /**
     * Fields to search against when using local data + filterablePlaceholder.
     * Defaults to searching all string/number fields if omitted.
     */
    searchFields?: (keyof TData)[];

    // ── Remote / API data ───────────────────────────────────────────────────
    /** When provided, data is fetched from this URL */
    dataSourceUrl?: string;
    apiCallType?: 'GET' | 'POST';
    /** Initial POST body (merged with pagination & filters on each request) */
    postData?: Record<string, unknown>;
    /** Transform the raw API response into { data[], totalCount, totalPages, currentPage } */
    dataMapper?: (response: Record<string, unknown>) => Record<string, unknown>;
    /** Transform the outgoing payload before sending to the API */
    parsePayload?: (payload: Record<string, unknown>) => Record<string, unknown>;

    // ── Toolbar ─────────────────────────────────────────────────────────────
    filterablePlaceholder?: string;
    searchParamName?: string;
    enableTableFilter?: boolean;
    extendedFilter?: { enable: boolean; filters: FilterParam[] };
    isFilterVisibleOnStart?: boolean;
    headerNotes?: React.ReactNode;

    // ── Action button ────────────────────────────────────────────────────────
    hasAction?: boolean;
    actionName?: string;
    onAction?: () => void;
    actionOptions?: { asLink: boolean; link: string };

    // ── Pagination ───────────────────────────────────────────────────────────
    enablePaginator?: boolean;
    /** Rows per page (default 10) */
    pageSize?: number;

    // ── Misc ────────────────────────────────────────────────────────────────
    heading?: string | React.ReactNode;
    showErrorAsBanner?: boolean;
    emptyDataText?: string;
    persistFiltersInUrl?: boolean;
    className?: string;
    stretchHeight?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a sliding page window of up to `window` numbers centred on `current`. */
function pageWindow(current: number, total: number, win = 5): number[] {
    if (total <= win) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - Math.floor(win / 2));
    const end = Math.min(total, start + win - 1);
    start = Math.max(1, end - win + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/** Case-insensitive substring match for a single value */
function matchesSearch(value: unknown, term: string): boolean {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(term.toLowerCase());
}

// ─── Internal component ───────────────────────────────────────────────────────

function AppDataTableInternal<TData extends Record<string, unknown>>({
    columns,
    data: staticData,
    searchFields,
    dataSourceUrl,
    apiCallType = 'GET',
    postData: initialPostData = {},
    filterablePlaceholder,
    searchParamName = 'search',
    enableTableFilter = true,
    extendedFilter,
    isFilterVisibleOnStart = false,
    headerNotes,
    hasAction,
    actionName,
    onAction,
    actionOptions,
    enablePaginator = true,
    pageSize: pageSizeProp = 10,
    heading,
    showErrorAsBanner = true,
    emptyDataText = 'No data found.',
    persistFiltersInUrl = true,
    dataMapper,
    parsePayload,
    className,
    stretchHeight = false,
}: DataTableProps<TData>) {
    const router   = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isLocalMode = !!staticData && !dataSourceUrl;

    // ── State ──────────────────────────────────────────────────────────────
    const [isFilterVisible, setIsFilterVisible] = useState(isFilterVisibleOnStart);
    const [page, setPage] = useState(1);
    const pageSize = pageSizeProp;

    const [filters, setFilters] = useState<Record<string, any>>(() => {
        if (persistFiltersInUrl && typeof window !== 'undefined') {
            const raw = searchParams?.get('filters');
            if (raw) { try { return JSON.parse(raw); } catch { /* ignore */ } }
        }
        return apiCallType === 'POST' ? initialPostData : {};
    });

    // ── URL sync ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!persistFiltersInUrl || !searchParams) return;
        const params = new URLSearchParams(searchParams.toString());
        const current = params.get('filters');
        const next = Object.keys(filters).length ? JSON.stringify(filters) : null;
        if (current === next) return;
        if (next) {
            params.set('filters', next);
        } else {
            params.delete('filters');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [filters, persistFiltersInUrl, router, pathname, searchParams]);

    // ── Filter change handler ──────────────────────────────────────────────
    const handleFilterChange = useCallback((
        accessor: string | string[],
        value: unknown,
    ) => {
        setPage(1);
        setFilters(prev => {
            const next = { ...prev };
            const keys = Array.isArray(accessor) ? accessor : [accessor];
            const vals = Array.isArray(accessor) ? (value as unknown[]) : [value];
            keys.forEach((k, i) => {
                const v = vals[i];
                if (v === null || v === undefined || v === '') {
                    delete next[k];
                } else {
                    next[k] = v;
                }
            });
            return next;
        });
    }, []);

    // ── Local data: filter + paginate in memory ────────────────────────────
    const localResult = useMemo(() => {
        if (!isLocalMode || !staticData) return null;

        let rows = [...staticData];

        // Text search
        const term = filters[searchParamName];
        if (term) {
            rows = rows.filter(row => {
                const fields = searchFields ?? (Object.keys(row) as (keyof TData)[]);
                return fields.some(f => matchesSearch(row[f as string], term));
            });
        }

        // Extended filters
        if (extendedFilter?.enable) {
            extendedFilter.filters.forEach(f => {
                const val = filters[f.accessor];
                if (val === undefined || val === null || val === '') return;

                if (f.type === 'TextFilter') {
                    rows = rows.filter(row => matchesSearch(row[f.accessor], val));
                }
                if (f.type === 'SelectFilter') {
                    rows = rows.filter(row => String(row[f.accessor]) === String(val));
                }
                if (f.type === 'MultiSelectFilter' && Array.isArray(val) && val.length) {
                    rows = rows.filter(row => (val as unknown[]).map(String).includes(String(row[f.accessor])));
                }
                if (f.type === 'DateFilter' && val instanceof Date) {
                    rows = rows.filter(row => {
                        const d = new Date(String(row[f.accessor]));
                        return d.toDateString() === val.toDateString();
                    });
                }
                if (f.type === 'DateRangeFilter' && Array.isArray(val) && val[0] instanceof Date) {
                    const [from, to] = val as [Date, Date | null];
                    rows = rows.filter(row => {
                        const d = new Date(String(row[f.accessor]));
                        if (to) return d >= from && d <= to;
                        return d >= from;
                    });
                }
            });
        }

        const totalElements = rows.length;
        const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
        const safePage      = Math.min(page, totalPages);
        const start         = (safePage - 1) * pageSize;
        const content       = rows.slice(start, start + pageSize);

        return { content, totalElements, totalPages, pageNumber: safePage };
    }, [isLocalMode, staticData, filters, searchParamName, searchFields, extendedFilter, page, pageSize]);

    // ── Remote fetch ───────────────────────────────────────────────────────
    const fetchRemote = async () => {
        if (!dataSourceUrl) return { content: [], totalElements: 0, totalPages: 0, pageNumber: 1 };

        const payload = { ...filters, pageNumber: page, pageSize };
        const final   = parsePayload ? parsePayload(payload) : payload;

        const response = apiCallType === 'POST'
            ? await api.post(dataSourceUrl, final)
            : await api.get(dataSourceUrl, { params: final });

        const raw = dataMapper ? dataMapper(response.data) : response.data;
        return {
            content:       raw.data     || raw.content || [],
            pageNumber:    raw.currentPage || raw.pageNumber || raw.current_page || 1,
            totalPages:    raw.totalPages  || raw.last_page  || 0,
            totalElements: raw.totalCount  || raw.totalElements || raw.total || 0,
        };
    };

    const { data: remoteData, isLoading, isError, error, refetch } = useQuery({
        queryKey: [dataSourceUrl, filters, page, pageSize, apiCallType],
        queryFn:  fetchRemote,
        enabled:  !isLocalMode && !!dataSourceUrl,
    });

    // ── Resolved table data ────────────────────────────────────────────────
    const tableData   = isLocalMode ? localResult! : remoteData;
    const displayRows = tableData?.content ?? [];
    const totalPages  = tableData?.totalPages  ?? 1;
    const totalItems  = tableData?.totalElements ?? 0;
    const loading     = isLocalMode ? false : isLoading;
    const pages       = pageWindow(page, totalPages);

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className={cn(stretchHeight ? 'flex flex-col h-full gap-4' : 'space-y-4', className)}>

            {/* Error banner */}
            {isError && showErrorAsBanner && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="flex-1 text-sm font-medium">
                        Failed to load data. {(error as Error)?.message}
                    </p>
                    <Button variant="ghost" className="text-red-700" onClick={() => refetch()}>
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Toolbar */}
            {((enableTableFilter && filterablePlaceholder) || extendedFilter?.enable || hasAction || headerNotes) && (
                <div className="bg-white rounded-xl p-3 shadow-sm border border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                        {filterablePlaceholder && (
                            <SearchInput
                                defaultValue={filters[searchParamName] ?? ''}
                                onSearch={val => handleFilterChange(searchParamName, val)}
                                placeholder={filterablePlaceholder}
                                className="flex-1 max-w-md !h-12"
                                loading={loading}
                            />
                        )}
                        {extendedFilter?.enable && (
                            <button
                                onClick={() => setIsFilterVisible(v => !v)}
                                title={isFilterVisible ? 'Hide filters' : 'Show filters'}
                                className={cn(
                                    'p-3 rounded-xl transition-all duration-200',
                                    isFilterVisible
                                        ? 'text-[#4a907a] bg-[#4a907a]/10 shadow-inner'
                                        : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100',
                                )}
                            >
                                <Filter className="w-5 h-5" fill={isFilterVisible ? 'currentColor' : 'none'} />
                            </button>
                        )}
                        {headerNotes}
                    </div>

                    {hasAction && (
                        <Button
                            variant="primary"
                            onClick={actionOptions?.asLink ? () => router.push(actionOptions.link) : onAction}
                            className="!rounded-lg shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{actionName}</span>
                        </Button>
                    )}
                </div>
            )}

            {/* Extended filters panel */}
            {extendedFilter?.enable && isFilterVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 space-y-5"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-zinc-500">Filters</h4>
                        <button
                            onClick={() => setFilters(apiCallType === 'POST' ? initialPostData : {})}
                            className="text-[10px] font-black uppercase tracking-widest text-[#4a907a] hover:text-[#3d7a66] transition-colors flex items-center gap-1"
                        >
                            <RotateCcw className="w-3 h-3" /> Reset All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {extendedFilter.filters.map(f => (
                            <div key={f.accessor}>
                                {f.type === 'TextFilter' && (
                                    <TextInput label={f.label} name={f.accessor}
                                        value={filters[f.accessor] ?? ''}
                                        onChange={e => handleFilterChange(f.accessor, e.target.value)}
                                        placeholder={`Filter by ${f.label.toLowerCase()}…`}
                                    />
                                )}
                                {f.type === 'SelectFilter' && (
                                    <SelectInput label={f.label} name={f.accessor}
                                        options={f.args?.options ?? []}
                                        value={filters[f.accessor] ?? null}
                                        onChange={e => handleFilterChange(f.accessor, e.target.value)}
                                    />
                                )}
                                {f.type === 'MultiSelectFilter' && (
                                    <MultiSelectInput label={f.label} name={f.accessor}
                                        options={f.args?.options ?? []}
                                        value={filters[f.accessor] ?? []}
                                        onChange={e => handleFilterChange(f.accessor, e.target.value)}
                                    />
                                )}
                                {f.type === 'DateFilter' && (
                                    <DateInput label={f.label} name={f.accessor}
                                        value={filters[f.accessor]}
                                        onChange={e => handleFilterChange(f.accessor, e.target.value)}
                                    />
                                )}
                                {f.type === 'DateRangeFilter' && (
                                    <DateInput label={f.label} name={f.accessor}
                                        selectionMode="range"
                                        value={filters[f.accessor]}
                                        onChange={e => handleFilterChange(f.accessor, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Table card */}
            <div className={cn(
                'bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden',
                stretchHeight && 'flex-1 flex flex-col min-h-0',
            )}>
                {heading && (
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-zinc-400">{heading}</h3>
                        {loading && <RotateCcw className="w-4 h-4 text-zinc-300 animate-spin" />}
                    </div>
                )}

                <div className={cn('relative', stretchHeight && 'flex-1 min-h-0')}>
                    {loading ? (
                        /* Skeleton */
                        <div>
                            <div className="h-12 bg-zinc-50/50 border-b border-zinc-100" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 border-b border-zinc-50 flex items-center px-6 gap-4">
                                    {columns.map((_, j) => (
                                        <div key={j} className="flex-1 h-3 bg-zinc-100 rounded-full animate-pulse" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <DataTable
                            value={displayRows}
                            scrollable={stretchHeight}
                            scrollHeight={stretchHeight ? 'flex' : undefined}
                            emptyMessage={<EmptyState caption={emptyDataText} />}
                            className="p-datatable-sm"
                            pt={{
                                thead: { className: 'bg-zinc-50' },
                                column: {
                                    headerCell: { className: 'text-zinc-400 text-[10px] font-medium uppercase tracking-widest py-4 px-6 border-b border-zinc-100 bg-zinc-50/50 whitespace-nowrap' },
                                    bodyCell:   { className: 'py-4 px-6 text-sm font-normal text-zinc-600 border-b border-zinc-50 transition-colors min-w-[130px]' },
                                },
                            }}
                        >
                            {columns.map(col => (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={col.body}
                                    style={col.style}
                                    sortable={col.sortable}
                                />
                            ))}
                        </DataTable>
                    )}
                </div>

                {/* Pagination */}
                {enablePaginator && totalItems > 0 && (
                    <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
                        <p className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                            {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems} entries
                        </p>

                        <div className="flex items-center gap-1.5">
                            {/* First */}
                            <Button variant="neutral" className="!w-9 !h-9 !p-0 !rounded-lg" disabled={page === 1}
                                onClick={() => setPage(1)}>
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            {/* Prev */}
                            <Button variant="neutral" className="!w-9 !h-9 !p-0 !rounded-lg" disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {/* Page numbers */}
                            {pages.map(p => (
                                <Button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={cn(
                                        '!w-9 !h-9 !p-0 !rounded-lg text-xs font-bold',
                                        page === p
                                            ? 'bg-[#4a907a] text-white hover:!bg-[#3d7a66] shadow-sm'
                                            : 'bg-transparent text-zinc-500 hover:!bg-zinc-100',
                                    )}
                                >
                                    {p}
                                </Button>
                            ))}

                            {/* Next */}
                            <Button variant="neutral" className="!w-9 !h-9 !p-0 !rounded-lg" disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            {/* Last */}
                            <Button variant="neutral" className="!w-9 !h-9 !p-0 !rounded-lg" disabled={page >= totalPages}
                                onClick={() => setPage(totalPages)}>
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Public wrapper (Suspense boundary for useSearchParams) ───────────────────

export default function AppDataTable<TData extends Record<string, unknown>>(props: DataTableProps<TData>) {
    return (
        <React.Suspense fallback={
            <div className="h-32 flex items-center justify-center bg-white rounded-xl border border-zinc-100 shadow-sm animate-pulse text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Initializing table…
            </div>
        }>
            <AppDataTableInternal {...props} />
        </React.Suspense>
    );
}
