'use client';

import Link from 'next/link';
import { Banknote, AlertTriangle, FileBarChart2, Wallet, PieChart, UserCheck, ChevronRight } from 'lucide-react';

const reports = [
  {
    href: '/reports/amount-collection',
    icon: Banknote,
    label: 'Amount Collection',
    description: 'Track monthly collections, collection rates, and cumulative amounts collected over time.',
  },
  {
    href: '/reports/arrears',
    icon: AlertTriangle,
    label: 'Arrears & Outstanding Balances',
    description: 'View clients with unpaid balances, aging analysis, and total outstanding debt.',
  },
  {
    href: '/reports/billing-activity',
    icon: FileBarChart2,
    label: 'Billing Activity',
    description: 'Monitor bills generated per month, approval rates, and dispatch status breakdowns.',
  },
  {
    href: '/reports/payment-analysis',
    icon: Wallet,
    label: 'Payment Analysis',
    description: 'Analyse payment modes, daily and monthly payment trends, and top-paying clients.',
  },
  {
    href: '/reports/client-distribution',
    icon: PieChart,
    label: 'Client Distribution',
    description: 'Explore client demographics by type, industry, discharge volume, and growth over time.',
  },
  {
    href: '/reports/staff-activity',
    icon: UserCheck,
    label: 'Staff Activity',
    description: 'Review bills generated and payments recorded per staff member and cashier.',
  },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-800">Reports</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Operational and financial reports for the sewage billing system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-start gap-4 hover:border-[#4a907a]/40 hover:shadow-md transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#4a907a]/10 flex items-center justify-center shrink-0 group-hover:bg-[#4a907a]/15 transition-colors">
              <Icon className="w-5 h-5 text-[#4a907a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800 group-hover:text-[#4a907a] transition-colors">
                {label}
              </p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#4a907a] shrink-0 mt-0.5 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
