'use client';

import dynamic from 'next/dynamic';
import '@webdatarocks/webdatarocks/webdatarocks.css';

const Pivot = dynamic(
  () => import('@webdatarocks/react-webdatarocks').then((m) => m.Pivot),
  { ssr: false, loading: () => <div className="h-[520px] flex items-center justify-center text-sm text-zinc-400">Loading report...</div> }
);

interface ReportPivotProps {
  report: object;
}

export default function ReportPivot({ report }: ReportPivotProps) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-100 shadow-sm bg-white">
      <Pivot toolbar={true} report={report} height={520} />
    </div>
  );
}
