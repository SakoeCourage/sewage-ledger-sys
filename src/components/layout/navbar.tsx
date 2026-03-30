'use client';

import React from 'react';
import { User, LogOut, Command } from 'lucide-react';
import { InputText } from 'primereact/inputtext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface NavbarProps {
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export default function Navbar({ onProfileClick, onLogout }: NavbarProps) {
  return (
    <nav className="h-24 bg-transparent px-10 flex items-center justify-between sticky top-0 z-40">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl relative group flex items-center">
        <InputText
          placeholder="SEARCH..."
          className="pl-6 pr-16 w-full rounded-full bg-white border-transparent focus:ring-0 focus:bg-white transition-all h-12 text-xs uppercase font-bold tracking-widest placeholder:text-zinc-400 shadow-sm"
        />
        <div className="absolute right-4 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
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
