'use client';

import React from 'react';
import { User, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import HeaderSearch from './header-search';

interface NavbarProps {
  onProfileClick?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export default function Navbar({ onProfileClick, onLogout, onMenuClick }: NavbarProps) {
  return (
    <nav className="h-24 bg-transparent px-6 lg:px-10 flex items-center justify-between gap-4 sticky top-0 z-60">
      <div className="flex items-center gap-4 flex-1">
        {onMenuClick && (
          <Button
            variant="neutral"
            onClick={onMenuClick}
            className="lg:hidden !rounded-xl !h-12 !w-12 !p-0 border-none bg-white shadow-sm transition-all"
          >
            <Menu className="w-5 h-5 text-[var(--sidebar-bg)]" />
          </Button>
        )}

        {/* Global Search Bar */}
        <HeaderSearch />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {onLogout && (
          <Button
            variant="neutral"
            onClick={onLogout}
            className="!rounded-full !h-12 !w-12 !p-0 border-none bg-white hover:bg-zinc-50 hover:text-red-500 shadow-sm transition-all"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-zinc-400 hover:text-red-500" />
          </Button>
        )}
      </div>
    </nav>
  );
}
