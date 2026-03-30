'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Droplets,
  BadgePercent,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Tooltip } from 'primereact/tooltip';

const mainMenu = [
  { icon: LayoutDashboard, label: 'DASHBOARD', href: '/dashboard' },
  { icon: Users,           label: 'CLIENTS',   href: '/clients'   },
  { icon: FileText,        label: 'BILLING',   href: '/billing'   },
  { icon: CreditCard,      label: 'PAYMENTS',  href: '/payments'  },
];

const settingsMenu = [
  { icon: Settings,     label: 'SETTINGS',  href: '/settings'               },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout?: () => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className={cn(
      'h-screen bg-[var(--sidebar-bg)] flex flex-col transition-all duration-500 relative sticky top-0 rounded-r-[32px] shadow-2xl z-50',
      isCollapsed ? 'w-24 py-8' : 'w-[280px] py-10',
    )}>
      <Tooltip target=".sidebar-item" position="right" />

      {/* Profile Section */}
      <div className={cn("flex flex-col items-center mb-10 transition-all", isCollapsed ? "px-2" : "px-8")}>
        <div className="relative mb-4">
          <div className={cn(
            "rounded-full border-4 border-[var(--sidebar-bg)] shadow-md bg-white/10 flex items-center justify-center text-white font-bold tracking-wider",
            isCollapsed ? "w-12 h-12 text-lg" : "w-20 h-20 text-3xl"
          )}>
            AD
          </div>
        </div>
        {!isCollapsed && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
             <span className="text-white font-bold text-[14px] tracking-widest uppercase">Admin User</span>
             <span className="text-white/60 text-[11px] tracking-wide mt-1 lowercase">admin@sewage.gov.gh</span>
           </motion.div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-16 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-zinc-100 text-[var(--sidebar-bg)] hover:bg-zinc-50 transition-all z-50 hover:scale-110 active:scale-95"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Nav */}
      <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">

        {/* Main */}
        <div>
          <nav className="space-y-1">
            {mainMenu.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-pr-tooltip={isCollapsed ? item.label : ''}
                  className={cn(
                    'sidebar-item flex items-center gap-4 py-4 transition-all relative group',
                    active
                      ? 'text-[var(--sidebar-bg)] bg-[var(--bg-dashboard)] rounded-l-full ml-8 pl-6'
                      : 'text-white/70 hover:text-white rounded-l-full ml-8 pl-6',
                    isCollapsed && 'ml-4 pl-0 justify-center rounded-xl w-16 h-14'
                  )}
                >
                  <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-[var(--sidebar-bg)]' : 'text-white/60 group-hover:text-white')} />
                  {!isCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap text-[11px] font-bold tracking-[0.15em] mt-0.5">
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings */}
        <div>
          <nav className="space-y-1">
            {settingsMenu.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-pr-tooltip={isCollapsed ? item.label : ''}
                  className={cn(
                    'sidebar-item flex items-center gap-4 py-4 transition-all relative group',
                    active
                      ? 'text-[var(--sidebar-bg)] bg-[var(--bg-dashboard)] rounded-l-full ml-8 pl-6'
                      : 'text-white/70 hover:text-white rounded-l-full ml-8 pl-6',
                    isCollapsed && 'ml-4 pl-0 justify-center rounded-xl w-16 h-14'
                  )}
                >
                  <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-[var(--sidebar-bg)]' : 'text-white/60 group-hover:text-white')} />
                  {!isCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 whitespace-nowrap text-[11px] font-bold tracking-[0.15em] mt-0.5">
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>


    </div>
  );
}
