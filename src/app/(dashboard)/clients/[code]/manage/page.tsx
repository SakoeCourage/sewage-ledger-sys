'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CreditCard, 
  Info, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Activity,
  Plus
} from 'lucide-react';
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
import { getUserProfile } from '@/lib/auth';

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
  currentBillingRate: { rate: number; type: string };
  bills: Bill[];
  payments: Payment[];
}

interface Bill {
  [key: string]: any;
  billID: number;
  month: string;
  year: number;
  dated: string;
  isSupervisorApproved: boolean;
  isDispatched: boolean;
  rate: { rate: number; billingType: string };
}

interface Payment {
  [key: string]: any;
  paymentID: number;
  code: string;
  dated: string;
  paymentMode: string;
  refNo: string;
  bank: string;
  dateOnCheque: string;
  amount: number;
  cashier: { name: string; email: string; tel: string };
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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'payments'>('overview');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const qc = useQueryClient();

  useEffect(() => {
    setUserProfile(getUserProfile());
  }, []);

  const { data: client, isLoading, isError } = useQuery<Client>({
    queryKey: ['client-ledger', code],
    queryFn: async () => {
      const res = await api.get(`/api/Client/byCode?code=${code}`);
      return res.data;
    }
  });

  const GHANA_BANKS = [
    { label: 'GCB Bank', value: 'GCB Bank' },
    { label: 'Ecobank Ghana', value: 'Ecobank Ghana' },
    { label: 'Stanbic Bank', value: 'Stanbic Bank' },
    { label: 'Zenith Bank', value: 'Zenith Bank' },
    { label: 'Absa Bank', value: 'Absa Bank' },
    { label: 'Fidelity Bank', value: 'Fidelity Bank' },
    { label: 'CalBank', value: 'CalBank' },
    { label: 'ADB Bank', value: 'ADB Bank' },
    { label: 'Prudential Bank', value: 'Prudential Bank' },
    { label: 'SG-Ghana', value: 'SG-Ghana' },
    { label: 'UBA Ghana', value: 'UBA Ghana' },
    { label: 'Access Bank', value: 'Access Bank' },
    { label: 'FNB Ghana', value: 'FNB Ghana' },
  ];

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentMode: undefined, amount: '', refNo: '', bank: '', dateOnCheque: new Date() },
  });

  const paymentMode = useWatch({ control, name: 'paymentMode' });
  const showRef  = paymentMode === 'Cheque' || paymentMode === 'MoMo' || paymentMode === 'Bank Transfer';
  const showBank = paymentMode === 'Cheque' || paymentMode === 'Bank Transfer';
  const showDate = paymentMode === 'Cheque';

  // ─── Calculations ─────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!client) return { totalBilled: 0, totalPaid: 0, balance: 0 };
    const totalBilled = client.bills?.reduce((sum, b) => sum + (b.rate?.rate || 0), 0) || 0;
    const totalPaid = client.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    return {
      totalBilled,
      totalPaid,
      balance: totalBilled - totalPaid,
    };
  }, [client]);

  // ─── Handlers ─────────────────────────────────────────────────────────────────

  const onPaymentSubmit = async (values: PaymentFormValues) => {
    try {
      await api.post('/api/Payment', {
        ClientID: client?.clientID,
        PaymentMode: values.paymentMode,
        Amount: parseFloat(values.amount),
        RefNo: values.refNo || null,
        Bank: values.bank || null,
        DateOnCheque: values.dateOnCheque ? values.dateOnCheque.toISOString().split('T')[0] : null,
        UserID: userProfile?.UserID || 1, // Dynamically set from authenticated session
      });
      toast.success('Payment recorded successfully');
      qc.invalidateQueries({ queryKey: ['client-ledger', code] });
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

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState 
          caption="Failed to load client profile. Please check your connection or try again later." 
          actionName="Retry Connection"
          onAction={() => qc.invalidateQueries({ queryKey: ['client-ledger', code] })}
        />
      </div>
    );
  }

  if (!client) return <EmptyState caption="Client not found. We couldn't find a client with the provided code." />;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* ── Minimalist Underline Tabs ── */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-2">
        <div className="flex items-center gap-8 relative h-12">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
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

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Billing Rate ({client.currentBillingRate?.type})</p>
                        <p className="text-[13px] font-semibold text-zinc-700">GHS {client.currentBillingRate?.rate?.toLocaleString()}</p>
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
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Discharge Volume</p>
                        <p className="text-[13px] font-semibold text-zinc-700 tabular-nums">{client.dischargeVol?.toLocaleString()} Litres</p>
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
                          <span className="text-teal-50 text-[10px] font-bold uppercase">Discharge Vol.</span>
                          <span className="font-black text-sm text-white tabular-nums">{client.dischargeVol?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-teal-50 text-[10px] font-bold uppercase">Total Paid</span>
                          <span className="font-black text-sm text-white tabular-nums">GHS {stats.totalPaid?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-teal-100 text-[10px] font-bold uppercase">Last Billing Rate</span>
                          <span className="font-black text-sm text-white tabular-nums">
                            {client.bills?.[0] ? `GHS ${client.bills[0].rate?.rate?.toLocaleString()}` : '—'}
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

            {activeTab === 'bills' && (
              <motion.div key="bills" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden p-5">
                   {client.bills?.length > 0 ? (
                      <AppDataTable<Bill>
                        columns={[
                          { field: 'code', header: 'Code' },
                          { field: 'month', header: 'Month', body: (r: Bill) => <span className="font-medium text-zinc-700">{r.month}</span> },
                          { field: 'date', header: 'Date', body: (r: Bill) => new Date(r.date as string).toLocaleDateString('en-GB') },
                          { 
                            field: 'balanceBroughtForward', 
                            header: 'Bal. B/F', 
                            body: (r: Bill) => <span className="font-medium text-zinc-400 tabular-nums">GHS {r.balanceBroughtForward?.toLocaleString()}</span> 
                          },
                          { 
                            field: 'isSupervisorApproved', 
                            header: 'Approved',
                            body: (r: Bill) => (
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", r.isSupervisorApproved ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400")}>
                                {r.isSupervisorApproved ? 'Yes' : 'No'}
                              </span>
                            )
                          },
                          { 
                            field: 'isDispatched', 
                            header: 'Dispatched',
                            body: (r: Bill) => (
                              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", r.isDispatched ? "bg-blue-50 text-blue-600" : "bg-zinc-50 text-zinc-400")}>
                                {r.isDispatched ? 'Yes' : 'No'}
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
                    {client.payments?.length > 0 ? (
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
                          { field: 'amount', header: 'Amount Paid', body: (r: Payment) => <span className="font-bold text-emerald-600 tabular-nums">GHS {r.amount?.toLocaleString()}</span> },
                          { field: 'cashier', header: 'Cashier', body: (r: Payment) => <span className="text-[11px] font-medium text-zinc-500 uppercase">{r.cashier?.name || '—'}</span> },
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
              <SelectInput label="Bank Name" name={field.name} value={field.value ?? ''} filter
                options={GHANA_BANKS}
                onChange={(e) => field.onChange(e.target.value)} placeholder="Select Bank" />
            )} />
          )}

          <Controller name="dateOnCheque" control={control} render={({ field }) => (
            <DateInput label="Date on Record" name={field.name} value={field.value ?? null}
              onChange={(e) => field.onChange(e.target.value)} placeholder="Pick date" />
          )} />
        </form>
      </BottomSheet>
    </div>
  );
}
