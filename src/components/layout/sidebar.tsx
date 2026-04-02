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
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Tooltip } from 'primereact/tooltip';
import { getUserProfile, logout } from '@/lib/auth';
import { useState, useEffect } from 'react';

const mainMenu = [
  { icon: LayoutDashboard, label: 'DASHBOARD', href: '/dashboard' },
  { icon: Users,           label: 'CLIENTS',   href: '/clients'   },
  { icon: FileText,        label: 'BILLING',   href: '/billing'   },
  { icon: CreditCard,      label: 'PAYMENTS',  href: '/payments'  },
  { icon: BarChart2,       label: 'REPORTS',   href: '/reports'   },
];

const settingsMenu = [
  { icon: Settings,     label: 'SETTINGS',  href: '/settings'               },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onLogout?: () => void;
}

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen = false, 
  setIsMobileOpen, 
  onLogout 
}: SidebarProps) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    setUserProfile(getUserProfile());
  }, []);

  const displayName = userProfile?.UserName || 'Admin User';
  const displayEmail = userProfile?.UserName ? `${userProfile.UserName.toLowerCase()}@sewage.gov.gh` : 'admin@sewage.gov.gh';
  const initials = displayName.substring(0, 2).toUpperCase();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  const handleToggle = () => {
    if (window.innerWidth < 1024 && setIsMobileOpen) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={cn(
      'h-screen bg-[var(--sidebar-bg)] flex flex-col transition-all duration-500 rounded-r-[32px] shadow-2xl z-50',
      'fixed lg:sticky top-0 left-0',
      isCollapsed ? 'lg:w-24 lg:py-8 w-[280px] py-10' : 'w-[280px] py-10',
      !isMobileOpen ? '-translate-x-full lg:translate-x-0' : 'translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.3)]'
    )}>
      <div className="hidden lg:block">
        <Tooltip target=".sidebar-item" position="right" />
      </div>

      {/* Profile Section */}
      <div className={cn("flex flex-col items-center mb-10 transition-all", isCollapsed ? "lg:px-2 px-8" : "px-8")}>
        <div className="relative mb-4">
          <div className={cn(
            "rounded-full border-4 border-[var(--sidebar-bg)] shadow-md bg-white/10 flex items-center justify-center text-white font-bold tracking-wider",
            isCollapsed ? "lg:w-12 lg:h-12 lg:text-lg w-20 h-20 text-3xl" : "w-20 h-20 text-3xl"
          )}>
            {initials}
          </div>
        </div>
        {(!isCollapsed || isMobileOpen) && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("flex flex-col items-center text-center", isCollapsed && "lg:hidden flex")}>
             <span className="text-white font-bold text-[14px] tracking-widest uppercase">{displayName}</span>
             <span className="text-white/60 text-[11px] tracking-wide mt-1 lowercase">{displayEmail}</span>
           </motion.div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={handleToggle}
        className={cn(
          "absolute -right-4 top-16 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-zinc-100 text-[var(--sidebar-bg)] hover:bg-zinc-50 transition-all z-50 hover:scale-110 active:scale-95",
          !isMobileOpen ? "hidden lg:flex" : "flex"
        )}
      >
        {isMobileOpen ? <ChevronLeft className="w-4 h-4" /> : (isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />)}
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
                  onClick={() => {
                    if (window.innerWidth < 1024 && setIsMobileOpen) {
                      setIsMobileOpen(false);
                    }
                  }}
                  data-pr-tooltip={isCollapsed ? item.label : ''}
                  className={cn(
                    'sidebar-item flex items-center gap-4 py-4 transition-all relative group',
                    active
                      ? 'text-[var(--sidebar-bg)] bg-[var(--bg-dashboard)] rounded-l-full ml-8 pl-6'
                      : 'text-white/70 hover:text-white rounded-l-full ml-8 pl-6',
                    isCollapsed && 'lg:ml-4 lg:pl-0 lg:justify-center lg:rounded-xl lg:w-16 lg:h-14 ml-8 pl-6'
                  )}
                >
                  <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-[var(--sidebar-bg)]' : 'text-white/60 group-hover:text-white')} />
                  {!isCollapsed || isMobileOpen ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("whitespace-nowrap text-[11px] font-bold tracking-[0.15em] mt-0.5", isCollapsed && "lg:hidden block")}>
                      {item.label}
                    </motion.span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings */}
        <div>
          <nav className="p-0">
            {settingsMenu.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024 && setIsMobileOpen) {
                      setIsMobileOpen(false);
                    }
                  }}
                  data-pr-tooltip={isCollapsed ? item.label : ''}
                  className={cn(
                    'sidebar-item flex items-center gap-4 py-4 transition-all relative group',
                    active
                      ? 'text-[var(--sidebar-bg)] bg-[var(--bg-dashboard)] rounded-l-full ml-8 pl-6'
                      : 'text-white/70 hover:text-white rounded-l-full ml-8 pl-6',
                    isCollapsed && 'lg:ml-4 lg:pl-0 lg:justify-center lg:rounded-xl lg:w-16 lg:h-14 font-black transition-all duration-300 ml-8 pl-6'
                  )}
                >
                  <item.icon className={cn('w-[18px] h-[18px] shrink-0', active ? 'text-[var(--sidebar-bg)]' : 'text-white/60 group-hover:text-white')} />
                  {!isCollapsed || isMobileOpen ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("flex-1 whitespace-nowrap text-[11px] font-bold tracking-[0.15em] mt-0.5", isCollapsed && "lg:hidden block")}>
                      {item.label}
                    </motion.span>
                  ) : null}
                </Link>
              );
            })}

            {/* Dedicated Logout */}
            <button
               onClick={() => logout()}
               data-pr-tooltip={isCollapsed ? 'LOGOUT' : ''}
                className={cn(
                  "sidebar-item w-full flex items-center gap-4 py-4 transition-all relative group text-white/50 hover:text-rose-400 rounded-l-full ml-8 pl-6 mt-4",
                  isCollapsed && "lg:ml-4 lg:pl-0 lg:justify-center lg:rounded-xl lg:w-16 lg:h-14 ml-8 pl-6"
                )}
            >
               <LogOut className="w-[18px] h-[18px] shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                {!isCollapsed || isMobileOpen ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("whitespace-nowrap text-[11px] font-bold tracking-[0.15em] mt-0.5", isCollapsed && "lg:hidden block")}>
                    LOGOUT
                  </motion.span>
                ) : null}
            </button>
          </nav>
        </div>
      </div>


    </div>
  );
}
