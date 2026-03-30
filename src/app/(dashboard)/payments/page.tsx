'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { AppDataTable, Button, BottomSheet, TextInput, SelectInput, DateInput } from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payment {
  [key: string]: any;
  paymentID: number;
  code: string;
  dated: string;
  client: { name: string; clientCode: string };
  paymentMode: string;
  refNo: string;
  bank: string;
  dateOnCheque: string;
  amount: number;
  cashier: { surname: string; otherNames: string };
}

interface Client { clientID: number; name: string }

// ─── Schema ───────────────────────────────────────────────────────────────────

const MODES = ['Cash', 'Cheque', 'MoMo', 'Bank Transfer'] as const;

const schema = z.object({
  clientID:    z.number({ message: 'Client is required' }),
  paymentMode: z.enum(MODES, { message: 'Payment mode is required' }),
  amount:      z.string().min(1, 'Amount is required'),
  refNo:       z.string().optional(),
  bank:        z.string().optional(),
  dateOnCheque: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Mode badge ───────────────────────────────────────────────────────────────

const modeColor: Record<string, string> = {
  Cash: 'bg-emerald-50 text-emerald-700',
  Cheque: 'bg-blue-50 text-blue-700',
  MoMo: 'bg-violet-50 text-violet-700',
  'Bank Transfer': 'bg-amber-50 text-amber-700',
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Payment>[] = [
  { field: 'code', header: 'Receipt No.', sortable: true },
  { field: 'client', header: 'Client', body: (row) => <span className="font-medium text-zinc-700">{row.client?.name ?? '—'}</span> },
  {
    field: 'amount', header: 'Amount (GHS)', sortable: true,
    body: (row) => typeof row.amount === 'number' ? row.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 }) : '—',
  },
  {
    field: 'paymentMode', header: 'Mode', sortable: true,
    body: (row) => (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', modeColor[row.paymentMode] ?? 'bg-zinc-100 text-zinc-600')}>
        {row.paymentMode}
      </span>
    ),
  },
  { field: 'refNo', header: 'Ref No.' },
  { field: 'bank', header: 'Bank' },
  { field: 'dated', header: 'Date', sortable: true, body: (row) => row.dated ? new Date(row.dated).toLocaleDateString('en-GB') : '—' },
  { field: 'cashier', header: 'Received By', body: (row) => row.cashier ? `${row.cashier.surname} ${row.cashier.otherNames}`.trim() : '—' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/api/Payment/all').then((r) => r.data),
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/api/Client/all').then((r) => r.data),
  });

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.clientID }));
  const total = payments.reduce((s, p) => s + (p.amount ?? 0), 0);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { clientID: undefined, paymentMode: undefined, amount: '', refNo: '', bank: '', dateOnCheque: null },
  });

  const paymentMode = useWatch({ control, name: 'paymentMode' });
  const showRef  = paymentMode === 'Cheque' || paymentMode === 'MoMo' || paymentMode === 'Bank Transfer';
  const showBank = paymentMode === 'Cheque' || paymentMode === 'Bank Transfer';
  const showDate = paymentMode === 'Cheque';

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/api/Payment', {
        clientID:    values.clientID,
        paymentMode: values.paymentMode,
        amount:      parseFloat(values.amount),
        refNo:       values.refNo ?? null,
        bank:        values.bank ?? null,
        dateOnCheque: values.dateOnCheque
          ? values.dateOnCheque.toISOString().split('T')[0]
          : null,
        userID: 0,
      });
      toast.success('Payment recorded successfully');
      qc.invalidateQueries({ queryKey: ['payments'] });
      reset();
      setOpen(false);
    } catch {
      toast.error('Failed to record payment. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Payments</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {payments.length} record{payments.length !== 1 ? 's' : ''} &mdash; Total:{' '}
            <span className="font-semibold text-zinc-700">GHS {total.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Record Payment</Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <AppDataTable<Payment>
          columns={columns}
          data={payments}
          filterablePlaceholder="Search payments…"
          searchFields={['code', 'refNo', 'bank', 'paymentMode']}
          pageSize={10}
          enableTableFilter
          extendedFilter={{
            enable: true,
            filters: [{
              type: 'SelectFilter', accessor: 'paymentMode', label: 'Payment Mode',
              args: { options: MODES.map((m) => ({ label: m, value: m })) },
            }],
          }}
        />
      </div>

      {/* ── Record Payment Sheet ── */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Record Payment"
        description="Enter the payment details below"
        size="auto"
        footer={
          <>
            <Button variant="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Saving…' : 'Record Payment'}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller name="clientID" control={control} render={({ field }) => (
            <SelectInput label="Client" name={field.name} value={field.value ?? null} required filter
              options={clientOptions} onChange={(e) => field.onChange(e.target.value)} error={errors.clientID?.message} />
          )} />

          <Controller name="paymentMode" control={control} render={({ field }) => (
            <SelectInput label="Payment Mode" name={field.name} value={field.value ?? null} required showClear={false}
              options={MODES.map((m) => ({ label: m, value: m }))}
              onChange={(e) => field.onChange(e.target.value)} error={errors.paymentMode?.message} />
          )} />

          <Controller name="amount" control={control} render={({ field }) => (
            <TextInput label="Amount (GHS)" name={field.name} type="number" value={field.value}
              onChange={field.onChange} error={errors.amount?.message} placeholder="0.00" required />
          )} />

          {showRef && (
            <Controller name="refNo" control={control} render={({ field }) => (
              <TextInput label="Reference Number" name={field.name} value={field.value ?? ''}
                onChange={field.onChange} placeholder="e.g. CHQ-00234" />
            )} />
          )}

          {showBank && (
            <Controller name="bank" control={control} render={({ field }) => (
              <TextInput label="Bank Name" name={field.name} value={field.value ?? ''}
                onChange={field.onChange} placeholder="e.g. GCB Bank" />
            )} />
          )}

          {showDate && (
            <Controller name="dateOnCheque" control={control} render={({ field }) => (
              <DateInput label="Date on Cheque" name={field.name} value={field.value ?? null}
                onChange={(e) => field.onChange(e.target.value)} placeholder="Pick date" />
            )} />
          )}
        </form>
      </BottomSheet>
    </div>
  );
}
