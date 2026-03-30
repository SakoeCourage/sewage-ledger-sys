'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './sidebar';
import Navbar from './navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function AppLayout({ children, onLogout }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const breadcrumbs = pathname.split('/').filter(Boolean);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-dashboard)]">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 lg:p-12 no-scrollbar bg-[var(--bg-dashboard)] relative">
          {/* Breadcrumb generated from URL */}
          {breadcrumbs.length > 1 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const formattedCrumb = crumb.replace(/-/g, ' ');

                  return (
                    <React.Fragment key={crumb}>
                      <span className={isLast ? "text-[var(--sidebar-bg)] font-extrabold" : ""}>
                        {formattedCrumb}
                      </span>
                      {!isLast && <span>/</span>}
                    </React.Fragment>
                  );
                })}
              </div>

              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-[var(--sidebar-bg)] uppercase tracking-widest transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
