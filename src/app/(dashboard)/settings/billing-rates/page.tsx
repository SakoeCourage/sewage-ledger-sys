'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { AppDataTable, Button, BottomSheet, TextInput } from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingRate {
  [key: string]: any;
  billingRateID: number;
  billingType: string;
  rate: number;
  dated: string;
  createdBy: { surname: string; otherNames: string };
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  billingType: z.string().min(1, 'Billing type is required'),
  rate:        z.string().min(1, 'Rate is required'),
});

type FormValues = z.infer<typeof schema>;

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<BillingRate>[] = [
  { field: 'billingRateID', header: 'ID', sortable: true },
  { field: 'billingType', header: 'Billing Type', sortable: true },
  {
    field: 'rate', header: 'Rate (GHS)', sortable: true,
    body: (row) => typeof row.rate === 'number'
      ? row.rate.toLocaleString('en-GH', { minimumFractionDigits: 2 }) : '—',
  },
  { field: 'dated', header: 'Created On', sortable: true, body: (row) => row.dated ? new Date(row.dated).toLocaleDateString('en-GB') : '—' },
  { field: 'createdBy', header: 'Created By', body: (row) => row.createdBy ? `${row.createdBy.surname} ${row.createdBy.otherNames}`.trim() : '—' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingRatesPage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: rates = [] } = useQuery<BillingRate[]>({
    queryKey: ['billing-rates'],
    queryFn: () => api.get('/api/BillingRate/all').then((r) => r.data),
  });

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { billingType: '', rate: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/api/BillingRate', { billingType: values.billingType, rate: parseFloat(values.rate), userID: 0 });
      toast.success('Billing rate created successfully');
      qc.invalidateQueries({ queryKey: ['billing-rates'] });
      reset();
      setOpen(false);
    } catch {
      toast.error('Failed to create billing rate. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Billing Rates</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Configure billing rate tiers</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Rate</Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <AppDataTable<BillingRate>
          columns={columns}
          data={rates}
          filterablePlaceholder="Search rates…"
          searchFields={['billingType']}
          pageSize={10}
        />
      </div>

      {/* ── New Rate Sheet ── */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="New Billing Rate"
        description="Define a new billing type and its rate"
        size="auto"
        footer={
          <>
            <Button variant="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Saving…' : 'Save Rate'}
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-5">
          <Controller name="billingType" control={control} render={({ field }) => (
            <TextInput label="Billing Type" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.billingType?.message}
              placeholder="e.g. Industrial, Residential" required />
          )} />

          <Controller name="rate" control={control} render={({ field }) => (
            <TextInput label="Rate (GHS)" name={field.name} type="number" value={field.value}
              onChange={field.onChange} error={errors.rate?.message}
              placeholder="0.00" required />
          )} />
        </form>
      </BottomSheet>
    </div>
  );
}
