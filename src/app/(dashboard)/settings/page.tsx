'use client';

import Link from 'next/link';
import { BadgePercent, ShieldCheck, Users, ChevronRight } from 'lucide-react';

const sections = [
  {
    href: '/settings/billing-rates',
    icon: BadgePercent,
    label: 'Billing Rates',
    description: 'Configure sewage billing rate tiers used when generating client bills.',
  },
  {
    href: '/settings/roles',
    icon: ShieldCheck,
    label: 'Roles',
    description: 'Create and manage access roles assigned to system users.',
  },
  {
    href: '/settings/users',
    icon: Users,
    label: 'Users',
    description: 'Add or manage staff accounts that have access to this system.',
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-800">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">System configuration and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(({ href, icon: Icon, label, description }) => (
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
