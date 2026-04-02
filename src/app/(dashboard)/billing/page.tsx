'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Users, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { AppDataTable, Button, BottomSheet, TextInput, SelectInput, DateInput } from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { getUserProfile } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bill {
  [key: string]: any;
  billID: number;
  code: string;
  month: string;
  dated: string;
  balanceBroughtForward: number;
  client: { name: string; code: string; email: string };
  billingRate: { type: string; rate: number };
  billedBy: { name: string; email: string; tel: string };
  isSupervisorApproved: boolean;
  isDispatched: boolean;
  narration: string;
}

interface Client {
  clientID: number;
  name: string;
  clientCode: string;
  currentBillingRate?: { billingRateID: number; type: string; rate: number };
  bills?: Bill[];
}

interface BillingRate { billingRateID: number; billingType: string; rate: number }

type BillingMode = 'individual' | 'period';

// ─── Schema ───────────────────────────────────────────────────────────────────

const individualSchema = z.object({
  clientID:             z.number({ message: 'Client is required' }),
  billingRateID:        z.number({ message: 'Billing rate is required' }),
  month:                z.date({ message: 'Month is required' }),
  isSupervisorApproved: z.boolean(),
  isDispatched:         z.boolean(),
  narration:            z.string().optional(),
});

type IndividualFormValues = z.infer<typeof individualSchema>;

// ─── Toggle helper ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={cn('relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-[#4a907a]' : 'bg-zinc-200')}
      >
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
          checked && 'translate-x-5')} />
      </div>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
    </label>
  );
}

// ─── Period Bill Preview Row ───────────────────────────────────────────────────

type RowStatus = 'pending' | 'loading' | 'success' | 'error';

interface PreviewRow {
  client: Client;
  status: RowStatus;
}

function PreviewClientRow({ row }: { row: PreviewRow }) {
  const rate = row.client.currentBillingRate;
  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-3 rounded-xl border transition-colors',
      row.status === 'success' ? 'bg-emerald-50 border-emerald-100' :
      row.status === 'error'   ? 'bg-red-50 border-red-100' :
      row.status === 'loading' ? 'bg-zinc-50 border-zinc-100 animate-pulse' :
                                  'bg-white border-zinc-100'
    )}>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold text-zinc-700">{row.client.name}</span>
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
          {rate ? `${rate.type} — GHS ${rate.rate?.toLocaleString()}` : 'No billing rate'}
        </span>
      </div>
      <div className="shrink-0">
        {row.status === 'pending' && <span className="w-5 h-5 rounded-full border-2 border-zinc-200 block" />}
        {row.status === 'loading' && <Loader2 className="w-4 h-4 text-[#4a907a] animate-spin" />}
        {row.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {row.status === 'error'   && <AlertCircle  className="w-4 h-4 text-red-400" />}
      </div>
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Bill>[] = [
  { field: 'code', header: 'Bill Code', sortable: true },
  { field: 'month', header: 'Month', sortable: true },
  { field: 'client', header: 'Client', body: (row) => <span className="font-medium text-zinc-700">{row.client?.name ?? '—'}</span> },
  { field: 'billingRate', header: 'Rate Type', body: (row) => row.billingRate?.type ?? '—' },
  {
    field: 'balanceBroughtForward', header: 'Bal. B/F (GHS)', sortable: true,
    body: (row) => typeof row.balanceBroughtForward === 'number'
      ? row.balanceBroughtForward.toLocaleString('en-GH', { minimumFractionDigits: 2 }) : '—',
  },
  { field: 'dated', header: 'Date', sortable: true, body: (row) => row.dated ? new Date(row.dated).toLocaleDateString('en-GB') : '—' },
  {
    field: 'isSupervisorApproved', header: 'Approved',
    body: (row) => (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        row.isSupervisorApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
        {row.isSupervisorApproved ? 'Yes' : 'Pending'}
      </span>
    ),
  },
  {
    field: 'isDispatched', header: 'Dispatched',
    body: (row) => (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        row.isDispatched ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-500')}>
        {row.isDispatched ? 'Yes' : 'No'}
      </span>
    ),
  },
  { field: 'billedBy', header: 'Billed By', body: (row) => row.billedBy?.name ?? '—' },
];

// ─── API Error Parser ─────────────────────────────────────────────────────────

function parseApiError(err: unknown, fallback = 'An error occurred'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as any).response?.data;
    if (data && typeof data === 'object') {
      // Handle {duplicateError: [...]} or any array-valued key
      for (const key of Object.keys(data)) {
        const val = data[key];
        if (Array.isArray(val) && val.length > 0) return val[0];
        if (typeof val === 'string') return val;
      }
    }
    if (typeof data === 'string') return data;
  }
  return fallback;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [open, setOpen]                   = useState(false);
  const [mode, setMode]                   = useState<BillingMode>('period');
  const [periodMonth, setPeriodMonth]     = useState<Date | null>(new Date());
  const [previewRows, setPreviewRows]     = useState<PreviewRow[]>([]);
  const [isGenerating, setIsGenerating]   = useState(false);
  const [generationDone, setGenerationDone] = useState(false);
  const qc = useQueryClient();

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: () => api.get('/api/Bill/all').then((r) => r.data),
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/api/Client/all').then((r) => r.data),
  });

  const { data: rates = [] } = useQuery<BillingRate[]>({
    queryKey: ['billing-rates'],
    queryFn: () => api.get('/api/BillingRate/all').then((r) => r.data),
  });

  // All clients eligible. Default to first available billing rate for demo.
  const eligibleClients = clients;
  const defaultRateID = rates[0]?.billingRateID ?? null;

  // Refresh preview rows whenever eligible clients or period month changes
  useEffect(() => {
    if (mode === 'period') {
      setPreviewRows(eligibleClients.map((c) => ({ client: c, status: 'pending' })));
      setGenerationDone(false);
    }
  }, [eligibleClients, mode]);

  // ── Individual form ──
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<IndividualFormValues>({
    resolver: zodResolver(individualSchema),
    defaultValues: { clientID: undefined, billingRateID: undefined, month: undefined, isSupervisorApproved: false, isDispatched: false, narration: '' },
  });

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.clientID }));
  const rateOptions   = rates.map((r) => ({ label: `${r.billingType} — GHS ${r.rate.toLocaleString()}`, value: r.billingRateID }));

  const onIndividualSubmit = async (values: IndividualFormValues) => {
    const d = values.month;
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    try {
      const user = getUserProfile();
      await api.post('/api/Bill', { ...values, month: monthStr, userID: user?.UserID || 1 });
      toast.success('Bill created successfully');
      qc.invalidateQueries({ queryKey: ['bills'] });
      reset();
      handleClose();
    } catch (err) {
      toast.error(parseApiError(err, 'Failed to create bill. Please try again.'));
    }
  };

  // ── Period generation: mirrors individual billing per client ──
  const onGeneratePeriod = async () => {
    if (!periodMonth || !defaultRateID || eligibleClients.length === 0) return;
    const d = periodMonth;
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const user = getUserProfile();
    setIsGenerating(true);
    setPreviewRows(eligibleClients.map((c) => ({ client: c, status: 'pending' })));

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < eligibleClients.length; i++) {
      const client = eligibleClients[i];

      setPreviewRows((prev) => prev.map((r, idx) => idx === i ? { ...r, status: 'loading' } : r));

      try {
        // Same payload structure as individual billing
        await api.post('/api/Bill', {
          clientID:             client.clientID,
          billingRateID:        defaultRateID,
          month:                monthStr,
          isSupervisorApproved: false,
          isDispatched:         false,
          narration:            '',
          userID:               user?.UserID || 1,
        });
        setPreviewRows((prev) => prev.map((r, idx) => idx === i ? { ...r, status: 'success' } : r));
        successCount++;
      } catch (err) {
        const msg = parseApiError(err, 'Failed');
        setPreviewRows((prev) => prev.map((r, idx) => idx === i ? { ...r, status: 'error', errorMsg: msg } : r));
        failCount++;
      }
    }

    setIsGenerating(false);
    setGenerationDone(true);
    qc.invalidateQueries({ queryKey: ['bills'] });

    if (failCount === 0) {
      toast.success(`${successCount} bills generated for ${monthStr}`);
    } else {
      toast.error(`${successCount} generated, ${failCount} failed`);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMode('individual');
    setPeriodMonth(null);
    setGenerationDone(false);
    reset();
  };

  const successCount = previewRows.filter((r) => r.status === 'success').length;
  const errorCount   = previewRows.filter((r) => r.status === 'error').length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Billing</h1>
          <p className="text-sm text-zinc-500 mt-0.5">View and manage client bills</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> New Bill
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <AppDataTable<Bill>
          columns={columns}
          data={bills}
          filterablePlaceholder="Search bills…"
          searchFields={['code', 'month', 'narration']}
          pageSize={10}
          enableTableFilter
          extendedFilter={{
            enable: true,
            filters: [
              { type: 'SelectFilter', accessor: 'isSupervisorApproved', label: 'Approval Status',
                args: { options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] } },
              { type: 'SelectFilter', accessor: 'isDispatched', label: 'Dispatched',
                args: { options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] } },
            ],
          }}
        />
      </div>

      {/* ── Bill Creation Sheet ── */}
      <BottomSheet
        open={open}
        onClose={handleClose}
        title="New Bill"
        description="Generate an individual bill or run a full period cycle for all clients"
        size="auto"
        footer={
          <>
            <Button variant="neutral" onClick={handleClose}>Cancel</Button>
            {mode === 'individual' ? (
              <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onIndividualSubmit)}>
                {isSubmitting ? 'Saving…' : 'Create Bill'}
              </Button>
            ) : generationDone ? (
              <Button variant="primary" onClick={handleClose}>Done</Button>
            ) : (
              <Button
                variant="primary"
                loading={isGenerating}
                onClick={onGeneratePeriod}
                disabled={!periodMonth || !defaultRateID || eligibleClients.length === 0 || isGenerating}
              >
                {isGenerating ? `Generating…` : `Generate ${eligibleClients.length} Bills`}
              </Button>
            )}
          </>
        }
      >
        {/* Mode Toggle */}
        <div className="flex bg-zinc-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('individual')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
              mode === 'individual' ? 'bg-white text-[#4a907a] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
            )}
          >
            <FileText className="w-3.5 h-3.5" /> Individual
          </button>
          <button
            onClick={() => setMode('period')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all',
              mode === 'period' ? 'bg-white text-[#4a907a] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
            )}
          >
            <Users className="w-3.5 h-3.5" /> Period (All Clients)
          </button>
        </div>

        {/* ── Individual Mode ── */}
        {mode === 'individual' && (
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Controller name="clientID" control={control} render={({ field }) => (
              <SelectInput label="Client" name={field.name} value={field.value ?? null} required
                options={clientOptions} filter onChange={(e) => field.onChange(e.target.value)} error={errors.clientID?.message} />
            )} />

            <Controller name="billingRateID" control={control} render={({ field }) => (
              <SelectInput label="Billing Rate" name={field.name} value={field.value ?? null} required
                options={rateOptions} onChange={(e) => field.onChange(e.target.value)} error={errors.billingRateID?.message} />
            )} />

            <Controller name="month" control={control} render={({ field }) => (
              <DateInput label="Billing Month" name={field.name} value={field.value ?? null}
                view="month" placeholder="Select month"
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.month?.message} required />
            )} />

            <div className="flex flex-col gap-4 pt-2">
              <Controller name="isSupervisorApproved" control={control} render={({ field }) => (
                <Toggle checked={field.value} onChange={field.onChange} label="Supervisor Approved" />
              )} />
              <Controller name="isDispatched" control={control} render={({ field }) => (
                <Toggle checked={field.value} onChange={field.onChange} label="Dispatched" />
              )} />
            </div>

            <div className="sm:col-span-2">
              <Controller name="narration" control={control} render={({ field }) => (
                <TextInput label="Narration (optional)" name={field.name} value={field.value ?? ''}
                  multiline rows={3} onChange={field.onChange} placeholder="Additional notes…" />
              )} />
            </div>
          </form>
        )}

        {/* ── Period Mode ── */}
        {mode === 'period' && (
          <div className="flex flex-col gap-5">
            {/* Month Picker only */}
            <div className="w-full sm:w-64">
              <DateInput
                label="Billing Period (Month)"
                name="periodMonth"
                value={periodMonth}
                view="month"
                placeholder="Select billing month"
                onChange={(e) => setPeriodMonth(e.target.value as Date | null)}
              />
            </div>

            {/* Summary Banner */}
            <div className="flex items-center gap-4 p-4 bg-[#4a907a]/5 border border-[#4a907a]/20 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-[#4a907a] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-700">
                  {eligibleClients.length} eligible client{eligibleClients.length !== 1 ? 's' : ''} will be billed
                </p>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Only clients with a previous bill and an active billing rate are included
                </p>
              </div>
            </div>

            {/* Generation result summary */}
            {generationDone && (
              <div className="flex gap-3">
                {successCount > 0 && (
                  <div className="flex-1 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-emerald-700">{successCount} generated</span>
                  </div>
                )}
                {errorCount > 0 && (
                  <div className="flex-1 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-xs font-bold text-red-600">{errorCount} failed</span>
                  </div>
                )}
              </div>
            )}

            {eligibleClients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400">
                <Users className="w-8 h-8 opacity-30" />
                <p className="text-xs font-medium">No eligible clients found</p>
                <p className="text-[10px]">Clients must have at least one existing bill and an active billing rate</p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
