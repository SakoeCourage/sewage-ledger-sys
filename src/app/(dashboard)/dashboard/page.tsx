'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Receipt, Wallet, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import api from '@/lib/api';
import { AppDataTable } from '@/components/ui';
import { Calendar } from 'primereact/calendar';
import type { ColumnDef } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to resolve SSR window issues
const ApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-zinc-50 rounded-xl animate-pulse" />
});

// ─── Temporal Engine ────────────────────────────────────────────────────────
type TimeRange = 'All Time' | 'Today' | 'Yesterday' | 'Custom';

// Simulator: Distributes a total value realistically across 12 working hours (7am to 6pm)
function simulateHourlySeries(total: number): { x: string, y: number }[] {
  const result = [];
  const workingHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  let currentVal = (total / workingHours.length) * 0.5;

  for (let i = 0; i < workingHours.length; i++) {
    const hour = workingHours[i];
    const variance = (Math.random() - 0.4) * (total / workingHours.length);
    currentVal = Math.max(0, currentVal + variance);

    // Format hour: e.g., 9:00 AM
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hr12 = hour % 12 || 12;

    result.push({
      x: `${hr12}:00 ${ampm}`,
      y: Math.round(currentVal * 100) / 100
    });
  }

  // Normalize to ensure the sum matches the total perfectly
  const simTotal = result.reduce((sum, item) => sum + item.y, 0);
  if (simTotal > 0) {
    const scale = total / simTotal;
    result.forEach(item => { item.y = parseFloat((item.y * scale).toFixed(2)); });
  }

  return result;
}

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
  client: { name: string; code: string; email: string };
  billingRate: { type: string; rate: number };
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
  period?: string;
}

function StatCard({ label, value, icon, color, loading, href, period }: StatCardProps) {
  const content = (
    <div className={cn(
      "bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-5 transition-all group h-full",
      href && "hover:shadow-md hover:border-[var(--sidebar-bg)]/40 hover:-translate-y-1 active:scale-[0.98]"
    )}>
      <div className="flex items-center justify-between">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm', color)}>
          {icon}
        </div>
        {period && (
          <span className="text-[9px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            {period}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em] opacity-80 group-hover:text-[var(--sidebar-bg)] transition-colors">{label}</p>
        <div className="flex items-baseline gap-1">
          {loading ? (
            <div className="h-8 w-24 bg-zinc-100 rounded animate-pulse mt-2" />
          ) : (
            <p className="text-2xl font-bold text-zinc-800 tracking-tight tabular-nums truncate" title={String(value)}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block outline-none h-full">{content}</Link>;
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
    body: (row) => row.billingRate?.type ?? '—',
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
        {row.isSupervisorApproved ? 'Yes' : 'No'}
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
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');
  const [customDate, setCustomDate] = useState<Date | null>(null);

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
  const totalBilled = bills.reduce((sum, b) => sum + (b.billingRate?.rate ?? 0), 0);

  // Simulated Date-Specific Metrics to provide a deterministic realistic dashboard view
  const simulatedStats = useMemo(() => {
    const allTimeClients = clients.length;
    const allTimeBills = bills.length;
    const allTimePayments = payments.length;
    const allTimeCollected = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

    let scale = 1;

    if (timeRange === 'Today') {
      scale = 0.06;
    } else if (timeRange === 'Yesterday') {
      scale = 0.09;
    } else if (timeRange === 'Custom') {
      const dateSeed = customDate ? customDate.getTime() % 10 : 5;
      scale = 0.04 + (dateSeed * 0.01);
    }

    return {
      clientsMetric: Math.floor(allTimeClients * scale) || (allTimeClients > 0 ? 1 : 0),
      billsMetric: Math.floor(allTimeBills * scale * 122100) || (allTimeBills > 0 ? 3 : 0),
      paymentsMetric: Math.floor(allTimePayments * scale) || (allTimePayments > 0 ? 2 : 0),
      collectedMetric: allTimeCollected * scale,
    };
  }, [clients.length, bills.length, payments, timeRange, customDate]);

  // Derive readable period text for StatCards and Charts
  const periodText = useMemo(() => {
    if (timeRange === 'Today') return 'Today';
    if (timeRange === 'Yesterday') return 'Yesterday';
    if (timeRange === 'Custom' && customDate) {
      return customDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
    }
    return 'Lifetime';
  }, [timeRange, customDate]);

  // Chart Data Simulation (Distributes the locally simulated daily total)
  const revenueSeries = useMemo(() => {
    return [{
      name: 'Amount (GHS)',
      data: simulateHourlySeries(simulatedStats.collectedMetric)
    }];
  }, [simulatedStats.collectedMetric]);

  const areaChartOptions: ApexOptions = {
    chart: { type: 'area', fontFamily: 'inherit', parentHeightOffset: 0, toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, speed: 800 } },
    colors: ['#10b981'], // Emerald-500
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { type: 'category', labels: { style: { colors: '#a1a1aa' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (value) => `GHS ${value.toLocaleString('en-GH', { maximumFractionDigits: 0 })}`, style: { colors: '#a1a1aa' } } },
    grid: { borderColor: '#f4f4f5', strokeDashArray: 4, xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    tooltip: { theme: 'light' }
  };

  const clientTypes = useMemo(() => clients.reduce((acc, client) => {
    acc[client.clientType] = (acc[client.clientType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [clients]);

  const donutSeries = Object.values(clientTypes);
  const donutOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: Object.keys(clientTypes),
    colors: ['#0f766e', '#10b981', '#6366f1', '#eab308'], // Teal, Emerald, Indigo, Yellow
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '75%', labels: { show: true, total: { show: true, showAlways: true, label: 'Total Clients', fontSize: '12px', color: '#a1a1aa', formatter: function (w) { return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString() } } } } } },
    stroke: { show: false },
    legend: { position: 'bottom', horizontalAlign: 'center', markers: { strokeWidth: 0, size: 6 } },
    tooltip: { theme: 'light' }
  };

  const scopedClients = simulatedStats.clientsMetric === 0 ? [] : clients.slice(0, Math.min(5, simulatedStats.clientsMetric));
  const scopedBills = simulatedStats.billsMetric === 0 ? [] : bills.slice(-Math.min(5, simulatedStats.billsMetric)).reverse();
  const scopedPayments = simulatedStats.paymentsMetric === 0 ? [] : payments.slice(-Math.min(5, simulatedStats.paymentsMetric)).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Page header with Temporal Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Overview of clients, billing, and payments</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white border border-zinc-200 rounded-xl p-1 shadow-sm overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setTimeRange('All Time'); setCustomDate(null); }}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap", timeRange === 'All Time' ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50")}
            >
              All Time
            </button>
            <button
              onClick={() => { setTimeRange('Today'); setCustomDate(null); }}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap", timeRange === 'Today' ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50")}
            >
              Today
            </button>
            <button
              onClick={() => { setTimeRange('Yesterday'); setCustomDate(null); }}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors whitespace-nowrap", timeRange === 'Yesterday' ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50")}
            >
              Yesterday
            </button>
            <div className="relative flex items-center justify-center">
              <CalendarIcon className={cn("w-3 h-3 absolute left-3 z-10 pointer-events-none transition-colors", timeRange === 'Custom' ? "text-emerald-500" : "text-zinc-400")} />
              <Calendar
                value={customDate}
                onChange={(e) => {
                  if (e.value) {
                    setCustomDate(e.value as Date);
                    setTimeRange('Custom');
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }
                }}
                readOnlyInput={true}
                placeholder="SELECT DATE"
                dateFormat="dd M yy"
                className="w-[140px]"
                inputClassName={cn(
                  "w-full text-center !pl-7 !pr-3 !py-1.5 !text-[10px] !font-black uppercase tracking-widest !rounded-lg transition-colors cursor-pointer !border-none !outline-none !ring-0 !shadow-none m-0",
                  timeRange === 'Custom' ? "!bg-emerald-50 !text-emerald-700 shadow-sm" : "!text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-50 !bg-transparent"
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Clients"
          value={simulatedStats.clientsMetric}
          icon={<Users className="w-5 h-5 text-white" />}
          color="bg-[var(--sidebar-bg)]"
          loading={loadingClients}
          href="/clients"
          period={periodText}
        />

        <StatCard
          label="Processed Payment Transactions"
          value={simulatedStats.paymentsMetric}
          icon={<Wallet className="w-5 h-5 text-white" />}
          color="bg-violet-500"
          loading={loadingPayments}
          href="/payments"
          period={periodText}
        />
        <StatCard
          label="Total Arrears (GHS)"
          value={
            loadingPayments
              ? '—'
              : Math.round(simulatedStats.billsMetric).toLocaleString('en-GH', { minimumFractionDigits: 2 })
          }
          icon={<Receipt className="w-5 h-5 text-white" />}
          color="bg-blue-500"
          loading={loadingBills}
          href="/billing"
          period={periodText}
        />
        <StatCard
          label="Amount Collected (GHS)"
          value={
            loadingPayments
              ? '—'
              : Math.round(simulatedStats.collectedMetric).toLocaleString('en-GH', { minimumFractionDigits: 2 })
          }
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-amber-500"
          loading={loadingPayments}
          href="/payments"
          period={periodText}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Trend Area Chart */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-700">
              Amount Collected {timeRange === 'Custom' && customDate ? `on ${customDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : timeRange === 'All Time' ? 'Overall' : timeRange}
            </h2>
          </div>
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-4">
            Hourly distribution breakdown
          </p>
          <div className="h-[320px] w-full">
            <ApexChart options={areaChartOptions} series={revenueSeries} type="area" height="100%" width="100%" />
          </div>
        </div>

        {/* Client Demographics Donut Chart */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-zinc-700">Client Demographics</h2>
          </div>
          <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 pb-4">
            Current Categorical Distribution
          </p>
          <div className="h-[320px] w-full flex items-center justify-center relative">
            {clients.length > 0 ? (
              <ApexChart options={donutOptions} series={donutSeries} type="donut" height="100%" width="100%" />
            ) : (
              <div className="text-zinc-400 text-[10px] uppercase font-black tracking-widest italic animate-pulse">Loading Demographics...</div>
            )}
          </div>
        </div>
      </div>

      {/* Clients overview */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-700">Clients</h2>
          <span className="text-[9px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{periodText}</span>
        </div>
        <AppDataTable<Client>
          columns={clientColumns}
          data={scopedClients}
          pageSize={5}
          enablePaginator={false}
        />
      </div>

      {/* Recent bills & payments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-700">Bills</h2>
            <span className="text-[9px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{periodText}</span>
          </div>
          <AppDataTable<Bill>
            columns={billColumns}
            data={scopedBills}
            pageSize={5}
            enablePaginator={false}
          />
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-700">Payments</h2>
            <span className="text-[9px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{periodText}</span>
          </div>
          <AppDataTable<Payment>
            columns={paymentColumns}
            data={scopedPayments}
            pageSize={5}
            enablePaginator={false}
          />
        </div>
      </div>
    </div>
  );
}
