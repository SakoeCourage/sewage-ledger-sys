'use client';

import AppLayout from '@/components/layout/app-layout';
import { logout } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout onLogout={logout}>
      {children}
    </AppLayout>
  );
}
