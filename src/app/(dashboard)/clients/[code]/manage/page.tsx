'use client';

import { useState, useMemo, use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ChevronLeft, 
  CreditCard, 
  History, 
  Info, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  MapPin,
  Hash,
  Activity,
  Plus,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import api from '@/lib/api';
import { 
  AppDataTable, 
  Button, 
  BottomSheet, 
  TextInput, 
  SelectInput, 
  DateInput,
  EmptyState 
} from '@/components/ui';
import { toast } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const getMockClient = (code: string, name: string = 'Ghana Industrial Ltd'): Client => ({
  clientID: 9999,
  clientCode: code,
  clientType: 'Corporate',
  name: name,
  address: '123 Utility Avenue, Accra, Ghana',
  meterNo: 'MTR-882910',
  tin: 'GHA-77281-0',
  industryType: 'Manufacturing',
  dischargeVol: 450.5,
  docID: 'DOC-001',
  cert: 'CERT-QX',
  lease: 'LSE-2024',
  bills: [
    {
      billID: 101,
      code: 'B-001',
      month: 'January 2026',
      dated: '2026-01-05T10:00:00Z',
      balanceBroughtForward: 0,
      isSupervisorApproved: true,
      isDispatched: true,
      narration: 'Initial billing',
      billingRate: { rate: 1200.50 }
    },
    {
      billID: 102,
      code: 'B-002',
      month: 'February 2026',
      dated: '2026-02-05T10:00:00Z',
      balanceBroughtForward: 1200.50,
      isSupervisorApproved: true,
      isDispatched: true,
      narration: 'Monthly utility charge',
      billingRate: { rate: 1350.00 }
    },
    {
      billID: 103,
      code: 'B-003',
      month: 'March 2026',
      dated: '2026-03-05T10:00:00Z',
      balanceBroughtForward: 2550.50,
      isSupervisorApproved: false,
      isDispatched: false,
      narration: 'Current period billing',
      billingRate: { rate: 1100.00 }
    }
  ],
  payments: [
    {
      paymentID: 201,
      code: 'R-001',
      dated: '2026-01-20T14:30:00Z',
      paymentMode: 'Bank Transfer',
      amount: 1200.50,
      refNo: 'TXN-99201',
      bank: 'GCB Bank'
    },
    {
      paymentID: 202,
      code: 'R-002',
      dated: '2026-02-25T09:15:00Z',
      paymentMode: 'MoMo',
      amount: 500.00,
      refNo: 'MTN-00213',
      bank: ''
    }
  ]
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  clientID: number;
  clientCode: string;
  clientType: string;
  name: string;
  address: string;
  meterNo: string;
  tin: string;
  industryType: string;
  dischargeVol: number;
  docID: string;
  cert: string;
  lease: string;
  bills: Bill[];
  payments: Payment[];
}

interface Bill {
  [key: string]: any;
  billID: number;
  code: string;
  month: string;
  dated: string;
  balanceBroughtForward: number;
  isSupervisorApproved: boolean;
  isDispatched: boolean;
  narration: string;
  billingRate: { rate: number };
}

interface Payment {
  [key: string]: any;
  paymentID: number;
  code: string;
  dated: string;
  paymentMode: string;
  amount: number;
  refNo: string;
  bank: string;
}

interface LedgerEntry {
  [key: string]: any;
  id: string;
  date: string;
  type: 'Bill' | 'Payment';
  amount: number;
  reference: string;
  description: string;
  runningBalance: number;
}

// ─── Payment Schema ───────────────────────────────────────────────────────────

const MODES = ['Cash', 'Cheque', 'MoMo', 'Bank Transfer'] as const;

const paymentSchema = z.object({
  paymentMode: z.enum(MODES, { message: 'Payment mode is required' }),
  amount:      z.string().min(1, 'Amount is required'),
  refNo:       z.string().optional(),
  bank:        z.string().optional(),
  dateOnCheque: z.date().nullable().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-xl", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-zinc-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ManageClientPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const searchParams = useSearchParams();
  const clientName = searchParams.get('name') || 'Ghana Industrial Ltd';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'bills' | 'payments'>('overview');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const qc = useQueryClient();

  const { data: client, isLoading } = useQuery<Client>({
    queryKey: ['client-ledger', code],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/Client/byCode?code=${code}`);
        return res.data;
      } catch (err) {
        console.warn('Backend fetch failed, using mock data for demo:', err);
        return getMockClient(code, clientName);
      }
    },
    // If the above fails or we want to force simulation:
    initialData: () => getMockClient(code, clientName),
  });

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMode: undefined, amount: '', refNo: '', bank: '', dateOnCheque: null },
  });

  const paymentMode = useWatch({ control, name: 'paymentMode' });
  const showRef  = paymentMode === 'Cheque' || paymentMode === 'MoMo' || paymentMode === 'Bank Transfer';
  const showBank = paymentMode === 'Cheque' || paymentMode === 'Bank Transfer';
  const showDate = paymentMode === 'Cheque';

  // ─── Calculations ─────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!client) return { totalBilled: 0, totalPaid: 0, balance: 0 };
    const totalBilled = client.bills.reduce((sum, b) => sum + (b.billingRate?.rate || 0), 0);
    const totalPaid = client.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return {
      totalBilled,
      totalPaid,
      balance: totalBilled - totalPaid,
    };
  }, [client]);

  const ledger = useMemo<LedgerEntry[]>(() => {
    if (!client) return [];
    
    const entries: any[] = [
      ...client.bills.map(b => ({
        id: `bill-${b.billID}`,
        date: b.dated,
        type: 'Bill',
        amount: b.billingRate?.rate || 0,
        reference: b.code,
        description: `Bill for ${b.month}`,
      })),
      ...client.payments.map(p => ({
        id: `pay-${p.paymentID}`,
        date: p.dated,
        type: 'Payment',
        amount: -(p.amount || 0),
        reference: p.code,
        description: `Payment via ${p.paymentMode}`,
      }))
    ];

    // Sort by date ascending to calculate running balance
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    return entries.map(entry => {
      balance += entry.amount;
      return { ...entry, runningBalance: balance };
    }).reverse(); // Latest first for display
  }, [client]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const onPaymentSubmit = async (values: PaymentFormValues) => {
    try {
      await api.post('/api/Payment', {
        clientID: client?.clientID,
        paymentMode: values.paymentMode,
        amount: parseFloat(values.amount),
        refNo: values.refNo || null,
        bank: values.bank || null,
        dateOnCheque: values.dateOnCheque ? values.dateOnCheque.toISOString().split('T')[0] : null,
        userID: 0,
      });
      toast.success('Payment recorded successfully');
      qc.invalidateQueries({ queryKey: ['client-ledger', code] });
      qc.invalidateQueries({ queryKey: ['payments'] });
      reset();
      setIsPaymentSheetOpen(false);
    } catch {
      toast.error('Failed to record payment');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4a907a]/20 border-t-[#4a907a] rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!client) return <EmptyState caption="Client not found. We couldn't find a client with that code." />;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* ── Minimalist Underline Tabs ── */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-2">
        <div className="flex items-center gap-8 relative h-12">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'ledger', label: 'Ledger', icon: History },
            { id: 'bills', label: 'Bills', icon: Receipt },
            { id: 'payments', label: 'Payments', icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative flex items-center gap-2 h-full text-xs font-black uppercase tracking-[0.2em] transition-colors",
                activeTab === tab.id ? "text-[#4a907a]" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4a907a] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
        
        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 opacity-50 hidden sm:block">
          {client.name}
        </span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <h3 className="text-xs font-bold text-[#4a907a] uppercase tracking-[0.15em] mb-6 pb-3 border-b border-zinc-100">
                      Client Registration Profile
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Client Name</p>
                        <p className="text-[13px] font-semibold text-zinc-700 leading-relaxed">{client.name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Client Code</p>
                        <p className="text-[13px] font-semibold text-zinc-700">{client.clientCode}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Client Type</p>
                        <p className="text-[13px] font-semibold text-zinc-700">{client.clientType}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Industry Category</p>
                        <p className="text-[13px] font-semibold text-zinc-700">{client.industryType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <h3 className="text-xs font-bold text-[#4a907a] uppercase tracking-[0.15em] mb-6 pb-3 border-b border-zinc-100">
                      Location & Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Physical Address</p>
                        <p className="text-[13px] font-semibold text-zinc-700 leading-relaxed">{client.address || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Meter Number</p>
                        <p className="text-[13px] font-semibold text-zinc-700 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-zinc-300" /> {client.meterNo}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tax ID (TIN)</p>
                        <p className="text-[13px] font-semibold text-zinc-700">{client.tin || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Industry Type</p>
                        <p className="text-[13px] font-semibold text-zinc-700">{client.industryType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                    <h3 className="text-xs font-bold text-[#4a907a] uppercase tracking-[0.15em] mb-6 pb-3 border-b border-zinc-100">
                      Documents & Registrations
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-2">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Document ID</p>
                        <p className="text-[12px] font-semibold text-zinc-600 truncate">{client.docID || '—'}</p>
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-2">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Certificate</p>
                        <p className="text-[12px] font-semibold text-zinc-600 truncate">{client.cert || '—'}</p>
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col gap-2">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Lease Ref.</p>
                        <p className="text-[12px] font-semibold text-zinc-600 truncate">{client.lease || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 text-zinc-50">
                  <div className="bg-[#4a907a] rounded-3xl p-8 relative overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Wallet className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-teal-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Financial Status</p>
                      <h4 className="text-3xl font-black mb-10 text-white tabular-nums">
                        GHS {stats.balance.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                      </h4>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-teal-50 text-[10px] font-bold uppercase">Total Billed</span>
                          <span className="font-black text-sm text-white tabular-nums">GHS {stats.totalBilled?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-teal-50 text-[10px] font-bold uppercase">Total Paid</span>
                          <span className="font-black text-sm text-white tabular-nums">GHS {stats.totalPaid?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-teal-100 text-[10px] font-bold uppercase">Last Bill</span>
                          <span className="font-black text-sm text-white tabular-nums">
                            {client.bills?.[0] ? `GHS ${client.bills[0].billingRate?.rate?.toLocaleString()}` : '—'}
                          </span>
                        </div>
                      </div>

                      <Button 
                        variant="primary" 
                        className="w-full mt-10 bg-white text-[#4a907a] hover:bg-teal-50 border-none !h-14 font-black uppercase tracking-widest text-xs"
                        onClick={() => setIsPaymentSheetOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Make Payment
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ledger' && (
              <motion.div
                key="ledger"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-zinc-100 overflow-hidden"
              >
                <AppDataTable<LedgerEntry>
                  columns={[
                    { field: 'date', header: 'Date', body: (r: LedgerEntry) => <span className="text-zinc-500 font-medium">{new Date(r.date as string).toLocaleDateString('en-GB')}</span> },
                    { 
                      field: 'type', 
                      header: 'Transaction', 
                      body: (r: LedgerEntry) => (
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg", r.type === 'Bill' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                            {r.type === 'Bill' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-semibold text-zinc-700">{r.type}</span>
                        </div>
                      )
                    },
                    { field: 'description', header: 'Description' },
                    { field: 'reference', header: 'Reference', body: (r: LedgerEntry) => <code className="text-[10px] bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100">{r.reference as string}</code> },
                    { 
                      field: 'amount', 
                      header: 'Amount', 
                      body: (r: LedgerEntry) => (
                        <span className={cn("font-bold tabular-nums", r.type === 'Bill' ? "text-amber-600" : "text-emerald-600")}>
                          {r.type === 'Bill' ? '+' : '-'}{Math.abs(r.amount as number).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </span>
                      )
                    },
                    { 
                      field: 'runningBalance', 
                      header: 'Balance',
                      body: (r: LedgerEntry) => (
                        <span className="font-bold text-zinc-900 tabular-nums">
                          GHS {(r.runningBalance as number).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </span>
                      )
                    },
                  ]}
                  data={ledger}
                  pageSize={10}
                />
              </motion.div>
            )}

            {activeTab === 'bills' && (
              <motion.div key="bills" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden p-5">
                   {client.bills.length > 0 ? (
                      <AppDataTable<Bill>
                        columns={[
                          { field: 'code', header: 'Code' },
                          { field: 'month', header: 'Billing Month', body: (r: Bill) => <span className="font-medium text-zinc-700">{r.month}</span> },
                          { field: 'dated', header: 'Date', body: (r: Bill) => new Date(r.dated as string).toLocaleDateString('en-GB') },
                          { field: 'billingRate', header: 'Amount', body: (r: Bill) => <span className="font-bold tabular-nums">GHS {(r.billingRate as any)?.rate?.toLocaleString()}</span> },
                          { 
                            field: 'isSupervisorApproved', 
                            header: 'Status',
                            body: (r: Bill) => (
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", r.isSupervisorApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                {r.isSupervisorApproved ? 'Approved' : 'Pending'}
                              </span>
                            )
                          }
                        ]}
                        data={client.bills}
                        pageSize={10}
                      />
                   ) : (
                     <EmptyState caption="No bills found. This client hasn't been billed yet." />
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Payment History</h3>
                      <p className="text-[10px] text-zinc-500 font-medium mt-1">View and manage all financial receipts for this client</p>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => setIsPaymentSheetOpen(true)}
                      className="!h-10 px-6 bg-[#4a907a] hover:bg-[#3d7a67] text-white text-[10px] font-black uppercase tracking-widest shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Record Payment
                    </Button>
                  </div>
                  
                  <div className="p-2">
                    {client.payments.length > 0 ? (
                      <AppDataTable<Payment>
                        columns={[
                          { field: 'code', header: 'Receipt No.' },
                          { field: 'dated', header: 'Date', body: (r: Payment) => <span className="text-zinc-500 font-medium">{new Date(r.dated as string).toLocaleDateString('en-GB')}</span> },
                          { 
                            field: 'paymentMode', 
                            header: 'Mode',
                            body: (r: Payment) => (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 text-[13px]">
                                <CreditCard className="w-3.5 h-3.5 text-zinc-400" /> {r.paymentMode}
                              </span>
                            )
                          },
                          { field: 'refNo', header: 'Reference', body: (r: Payment) => <span className="text-zinc-500">{r.refNo || '—'}</span> },
                          { field: 'amount', header: 'Amount Paid', body: (r: Payment) => <span className="font-bold text-emerald-600 tabular-nums">GHS {(r.amount as number).toLocaleString()}</span> },
                        ]}
                        data={client.payments}
                        pageSize={10}
                      />
                    ) : (
                      <div className="p-10">
                        <EmptyState caption="No payments recorded. No financial transactions found for this client." />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Record Payment Sheet ── */}
      <BottomSheet
        open={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
        title="Record Payment"
        description={`Record a new payment for ${client.name}`}
        size="auto"
        footer={
          <>
            <Button variant="neutral" onClick={() => setIsPaymentSheetOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit(onPaymentSubmit)}>
              {isSubmitting ? 'Recording…' : 'Record Payment'}
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 p-4 bg-zinc-50 rounded-xl flex items-center justify-between border border-zinc-100">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Outstanding Balance</p>
              <p className="text-xl font-bold text-zinc-800">GHS {stats.balance.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
            </div>
            <Wallet className="w-8 h-8 text-zinc-200" />
          </div>

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
                onChange={field.onChange} placeholder="e.g. CHQ-00123" />
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
