'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { AppDataTable, Button, BottomSheet, TextInput, SelectInput } from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { getUserProfile } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  [key: string]: any;
  clientID: number;
  clientCode: string;
  clientType: string;
  name: string;
  address: string;
  meterNo: string;
  tin: string;
  industryType: string;
  dischargeVol: number;
}

interface BillingRate {
  billingRateID: number;
  billingType: string;
  rate: number;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  clientType:    z.enum(['Residential', 'Industry'] as const, { message: 'Client type is required' }),
  name:          z.string().min(1, 'Name is required'),
  address:       z.string().min(1, 'Address is required'),
  meterNo:       z.string().min(1, 'Meter number is required'),
  industryType:  z.string().min(1, 'Industry type is required'),
  dischargeVol:  z.string().min(1, 'Discharge volume is required'),
  billingRateID: z.number({ message: 'Billing rate is required' }),
  tin:   z.string().optional(),
  docID: z.string().optional(),
  cert:  z.string().optional(),
  lease: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<Client>[] = [
  { field: 'clientCode', header: 'Code', sortable: true },
  { field: 'name', header: 'Name', sortable: true },
  {
    field: 'clientType',
    header: 'Type',
    body: (row) => (
      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        row.clientType === 'Industry' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700')}>
        {row.clientType}
      </span>
    ),
  },
  { field: 'industryType', header: 'Industry' },
  { field: 'address', header: 'Address' },
  { field: 'meterNo', header: 'Meter No.', sortable: true },
  { field: 'tin', header: 'TIN' },
  {
    field: 'dischargeVol',
    header: 'Discharge Vol.',
    body: (row) => typeof row.dischargeVol === 'number' ? row.dischargeVol.toLocaleString() : '—',
    sortable: true,
  },
  {
    field: 'actions',
    header: '',
    style: { width: '4rem' },
    body: (row) => (
      <Link 
        href={`/clients/${row.clientCode}/manage?name=${encodeURIComponent(row.name)}`}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[#4a907a] hover:bg-[#4a907a]/10 transition-colors"
        title="Manage Client"
      >
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    ),
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/api/Client/all');
      return res.data;
    },
  });

  const { data: rates = [] } = useQuery<BillingRate[]>({
    queryKey: ['billing-rates'],
    queryFn: () => api.get('/api/BillingRate/all').then((r) => r.data),
  });

  const rateOptions = rates.map((r) => ({
    label: `${r.billingType} — GHS ${r.rate.toLocaleString()}`,
    value: r.billingRateID,
  }));

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientType: undefined, name: '', address: '', meterNo: '',
      industryType: '', dischargeVol: '', billingRateID: undefined,
      tin: '', docID: '', cert: '', lease: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = getUserProfile();
      await api.post('/api/Client', {
        ...values,
        dischargeVol: parseFloat(values.dischargeVol),
        userID: user?.UserID || 1,
      });
      toast.success('Client registered successfully');
      qc.invalidateQueries({ queryKey: ['clients'] });
      reset();
      setOpen(false);
    } catch {
      toast.error('Failed to register client. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Clients</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage residential and industry clients</p>
        </div>
        <Button variant="primary" className="w-full sm:w-auto" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Client</Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <AppDataTable<Client>
          columns={columns}
          data={clients}
          filterablePlaceholder="Search clients…"
          searchFields={['name', 'clientCode', 'meterNo', 'address', 'industryType', 'tin']}
          pageSize={10}
          enableTableFilter
          extendedFilter={{
            enable: true,
            filters: [{
              type: 'SelectFilter', accessor: 'clientType', label: 'Client Type',
              args: { options: [
                { label: 'Residential', value: 'Residential' },
                { label: 'Industry', value: 'Industry' }
              ] },
            }],
          }}
        />
      </div>

      {/* ── New Client Sheet ── */}
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Register New Client"
        description="Fill in the client details below"
        size="full"
        footer={
          <>
            <Button variant="neutral" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Saving…' : 'Save Client'}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Controller name="clientType" control={control} render={({ field }) => (
            <SelectInput label="Client Type" name={field.name} value={field.value} required
              options={[
                { label: 'Residential', value: 'Residential' },
                { label: 'Industry', value: 'Industry' }
              ]}
              onChange={field.onChange} error={errors.clientType?.message} />
          )} />

          <Controller name="name" control={control} render={({ field }) => (
            <TextInput label="Full Name / Company Name" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.name?.message} placeholder="e.g. Kwame Mensah" required />
          )} />

          <Controller name="industryType" control={control} render={({ field }) => (
            <SelectInput label="Industry Type" name={field.name} value={field.value} required
              options={[
                { label: 'Hospitality', value: 'Hospitality' },
                { label: 'Manufacturing', value: 'Manufacturing' },
                { label: 'Educational', value: 'Educational' },
                { label: 'Medical', value: 'Medical' },
                { label: 'Residential', value: 'Residential' },
                { label: 'Commercial', value: 'Commercial' },
                { label: 'Other', value: 'Other' },
              ]}
              onChange={field.onChange} error={errors.industryType?.message} />
          )} />

          <Controller name="meterNo" control={control} render={({ field }) => (
            <TextInput label="Meter Number" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.meterNo?.message} placeholder="e.g. MTR-00123" required />
          )} />

          <Controller name="dischargeVol" control={control} render={({ field }) => (
            <TextInput label="Discharge Volume (m³)" name={field.name} type="number" value={field.value}
              onChange={field.onChange} error={errors.dischargeVol?.message} placeholder="0.00" required />
          )} />

          <Controller name="billingRateID" control={control} render={({ field }) => (
            <SelectInput label="Billing Rate" name={field.name} value={field.value ?? null} required
              options={rateOptions} onChange={(e) => field.onChange(e.target.value)}
              error={errors.billingRateID?.message} />
          )} />

          <div className="sm:col-span-2">
            <Controller name="address" control={control} render={({ field }) => (
              <TextInput label="Address" name={field.name} value={field.value} multiline rows={2}
                onChange={field.onChange} error={errors.address?.message} placeholder="Physical Address e.g GK, Tema Community 5" required />
            )} />
          </div>

          <Controller name="tin" control={control} render={({ field }) => (
            <TextInput label="TIN (optional)" name={field.name} value={field.value ?? ''}
              onChange={field.onChange} placeholder="Tax Identification Number" />
          )} />

          <Controller name="docID" control={control} render={({ field }) => (
            <TextInput label="Document ID (optional)" name={field.name} value={field.value ?? ''}
              onChange={field.onChange} placeholder="Document reference" />
          )} />

          <Controller name="cert" control={control} render={({ field }) => (
            <TextInput label="Certificate (optional)" name={field.name} value={field.value ?? ''}
              onChange={field.onChange} placeholder="Certificate reference" />
          )} />

          <Controller name="lease" control={control} render={({ field }) => (
            <TextInput label="Lease (optional)" name={field.name} value={field.value ?? ''}
              onChange={field.onChange} placeholder="Lease reference" />
          )} />
        </form>
      </BottomSheet>
    </div>
  );
}
