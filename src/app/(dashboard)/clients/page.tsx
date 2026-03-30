'use client';

import { useState } from 'react';
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
import { cn } from '@/lib/utils';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CLIENTS: Client[] = [
  { clientID: 1, clientCode: 'CLNT-001', clientType: 'Corporate', name: 'Ghana Broadcasting Corp.', industryType: 'Media', address: 'Kanda, Accra', meterNo: 'MTR-001', tin: 'TIN-001', dischargeVol: 120.5 },
  { clientID: 2, clientCode: 'CLNT-002', clientType: 'Individual', name: 'Kwame Mensah', industryType: 'Residential', address: 'East Legon, Accra', meterNo: 'MTR-002', tin: 'TIN-002', dischargeVol: 45.2 },
  { clientID: 3, clientCode: 'CLNT-003', clientType: 'Corporate', name: 'Golden Tulip Hotel', industryType: 'Hospitality', address: 'Airport City, Accra', meterNo: 'MTR-003', tin: 'TIN-003', dischargeVol: 850.0 },
];

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
  clientType:    z.enum(['Individual', 'Corporate'] as const, { message: 'Client type is required' }),
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
        row.clientType === 'Corporate' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700')}>
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
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/Client/all');
        return res.data;
      } catch (err) {
        console.warn('Backend fetch failed, using mock data for demo:', err);
        return MOCK_CLIENTS;
      }
    },
    initialData: MOCK_CLIENTS,
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
      await api.post('/api/Client', {
        ...values,
        dischargeVol: parseFloat(values.dischargeVol),
        userID: 0,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Clients</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage individual and corporate clients</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Client</Button>
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
              args: { options: [{ label: 'Individual', value: 'Individual' }, { label: 'Corporate', value: 'Corporate' }] },
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
              options={[{ label: 'Individual', value: 'Individual' }, { label: 'Corporate', value: 'Corporate' }]}
              onChange={field.onChange} error={errors.clientType?.message} />
          )} />

          <Controller name="name" control={control} render={({ field }) => (
            <TextInput label="Full Name / Company Name" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.name?.message} placeholder="e.g. Kwame Mensah" required />
          )} />

          <Controller name="industryType" control={control} render={({ field }) => (
            <TextInput label="Industry Type" name={field.name} value={field.value}
              onChange={field.onChange} error={errors.industryType?.message} placeholder="e.g. Manufacturing" required />
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
                onChange={field.onChange} error={errors.address?.message} placeholder="Physical address" required />
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
