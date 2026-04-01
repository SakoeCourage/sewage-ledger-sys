'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Receipt, Wallet, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import { AppDataTable } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  [key: string]: any;
  clientCode: string;
  name: string;
  clientType: string;
  address: string;
  meterNo: string;
}

interface Bill {
  [key: string]: any;
  billID: number;
  code: string;
  month: string;
  dated: string;
  client: { name: string; clientCode: string };
  billingRate: { billingType: string; rate: number };
  isSupervisorApproved: boolean;
  isDispatched: boolean;
}

interface Payment {
  [key: string]: any;
  paymentID: number;
  dated: string;
  client: { name: string; clientCode: string };
  amount: number;
  paymentMode: string;
  refNo: string;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  href?: string;
}

function StatCard({ label, value, icon, color, loading, href }: StatCardProps) {
  const content = (
    <div className={cn("bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center gap-4 transition-all", href && "hover:shadow-md hover:border-[var(--sidebar-bg)]/40 hover:-translate-y-0.5 active:scale-[0.98]")}>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-zinc-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-semibold text-zinc-800 mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block outline-none">{content}</Link>;
  }
  return content;
}

// ─── Column Definitions ───────────────────────────────────────────────────────

const clientColumns: ColumnDef<Client>[] = [
  { field: 'clientCode', header: 'Code', sortable: true },
  { field: 'name', header: 'Name', sortable: true },
  {
    field: 'clientType',
    header: 'Type',
    body: (row) => (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
          row.clientType === 'Industry'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-emerald-50 text-emerald-700',
        )}
      >
        {row.clientType}
      </span>
    ),
  },
  { field: 'address', header: 'Address' },
  { field: 'meterNo', header: 'Meter No.' },
];

const billColumns: ColumnDef<Bill>[] = [
  { field: 'code', header: 'Bill Code', sortable: true },
  { field: 'month', header: 'Month', sortable: true },
  {
    field: 'client',
    header: 'Client',
    body: (row) => row.client?.name ?? '—',
  },
  {
    field: 'billingRate',
    header: 'Rate Type',
    body: (row) => row.billingRate?.billingType ?? '—',
  },
  {
    field: 'dated',
    header: 'Date',
    body: (row) =>
      row.dated ? new Date(row.dated).toLocaleDateString('en-GB') : '—',
    sortable: true,
  },
  {
    field: 'isSupervisorApproved',
    header: 'Approved',
    body: (row) => (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
          row.isSupervisorApproved
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-zinc-100 text-zinc-500',
        )}
      >
        {row.isSupervisorApproved ? 'Approved' : 'Pending'}
      </span>
    ),
  },
];

const paymentColumns: ColumnDef<Payment>[] = [
  {
    field: 'client',
    header: 'Client',
    body: (row) => row.client?.name ?? '—',
  },
  {
    field: 'amount',
    header: 'Amount (GHS)',
    body: (row) =>
      typeof row.amount === 'number'
        ? <span className="font-bold tabular-nums">GHS {row.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
        : '—',
    sortable: true,
  },
  { field: 'paymentMode', header: 'Mode', sortable: true },
  { field: 'refNo', header: 'Ref No.' },
  {
    field: 'dated',
    header: 'Date',
    body: (row) =>
      row.dated ? new Date(row.dated).toLocaleDateString('en-GB') : '—',
    sortable: true,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: clients = [], isLoading: loadingClients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.get('/api/Client/all').then((r) => r.data),
  });

  const { data: bills = [], isLoading: loadingBills } = useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: () => api.get('/api/Bill/all').then((r) => r.data),
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => api.get('/api/Payment/all').then((r) => r.data),
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  const recentBills = bills.slice(-5).reverse();
  const recentPayments = payments.slice(-5).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-800">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Overview of clients, billing, and payments</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={clients.length}
          icon={<Users className="w-5 h-5 text-white" />}
          color="bg-[var(--sidebar-bg)]"
          loading={loadingClients}
          href="/clients"
        />
        <StatCard
          label="Total Bills"
          value={bills.length}
          icon={<Receipt className="w-5 h-5 text-white" />}
          color="bg-blue-500"
          loading={loadingBills}
          href="/billing"
        />
        <StatCard
          label="Total Payments"
          value={payments.length}
          icon={<Wallet className="w-5 h-5 text-white" />}
          color="bg-violet-500"
          loading={loadingPayments}
          href="/payments"
        />
        <StatCard
          label="Amount Collected"
          value={
            loadingPayments
              ? '—'
              : `GHS ${totalCollected.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`
          }
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-amber-500"
          loading={loadingPayments}
          href="/payments"
        />
      </div>

      {/* Clients overview */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-zinc-700 mb-4">Clients</h2>
        <AppDataTable<Client>
          columns={clientColumns}
          data={clients.slice(0, 5)}
          pageSize={5}
          enablePaginator={false}
        />
      </div>

      {/* Recent bills & payments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Recent Bills</h2>
          <AppDataTable<Bill>
            columns={billColumns}
            data={recentBills}
            pageSize={5}
            enablePaginator={false}
          />
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Recent Payments</h2>
          <AppDataTable<Payment>
            columns={paymentColumns}
            data={recentPayments}
            pageSize={5}
            enablePaginator={false}
          />
        </div>
      </div>
    </div>
  );
}
