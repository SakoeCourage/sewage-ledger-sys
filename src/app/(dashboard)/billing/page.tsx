'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
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

interface Client { clientID: number; name: string }
interface BillingRate { billingRateID: number; billingType: string; rate: number }

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  clientID:             z.number({ message: 'Client is required' }),
  billingRateID:        z.number({ message: 'Billing rate is required' }),
  month:                z.date({ message: 'Month is required' }),
  isSupervisorApproved: z.boolean(),
  isDispatched:         z.boolean(),
  narration:            z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Toggle helper ────────────────────────────────────────────────────────────

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
        {row.isSupervisorApproved ? 'Yes' : 'No'}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [open, setOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const qc = useQueryClient();

  useEffect(() => {
    setUserProfile(getUserProfile());
  }, []);

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

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.clientID }));
  const rateOptions   = rates.map((r) => ({ label: `${r.billingType} — GHS ${r.rate.toLocaleString()}`, value: r.billingRateID }));

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clientID: undefined, billingRateID: undefined, month: undefined, isSupervisorApproved: false, isDispatched: false, narration: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const d = values.month;
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    try {
      const user = getUserProfile();
      await api.post('/api/Bill', { ...values, month: monthStr, userID: user?.UserID || 1 });
      toast.success('Bill created successfully');
      qc.invalidateQueries({ queryKey: ['bills'] });
      reset();
      setOpen(false);
    } catch {
      toast.error('Failed to create bill. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Billing</h1>
          <p className="text-sm text-zinc-500 mt-0.5">View and manage client bills</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Bill</Button>
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

      {/* ── New Bill Sheet ── */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Create New Bill"
        description="Select a client and billing period"
        size="auto"
        footer={
          <>
            <Button variant="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Saving…' : 'Create Bill'}
            </Button>
          </>
        }
      >
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
      </BottomSheet>
    </div>
  );
}
