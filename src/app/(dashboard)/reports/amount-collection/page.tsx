'use client';

import { useState, useMemo } from 'react';
import ReportPivot from '@/components/reports/report-pivot';
import DateInput from '@/components/ui/date-input';

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function inRange(monthStr: string, start: Date | null, end: Date | null): boolean {
  const [mon, yr] = monthStr.split(' ');
  const d = new Date(parseInt(yr), MONTH_MAP[mon], 1);
  if (start && d < new Date(start.getFullYear(), start.getMonth(), 1)) return false;
  if (end && d > new Date(end.getFullYear(), end.getMonth(), 1)) return false;
  return true;
}

const ALL_DATA = [
  { Month: 'Apr 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 14200, AmountCollected: 11800 },
  { Month: 'Apr 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 52000, AmountCollected: 44500 },
  { Month: 'Apr 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 29000, AmountCollected: 21000 },
  { Month: 'May 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 14600, AmountCollected: 12400 },
  { Month: 'May 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 54000, AmountCollected: 47200 },
  { Month: 'May 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 30500, AmountCollected: 24000 },
  { Month: 'Jun 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 13900, AmountCollected: 11200 },
  { Month: 'Jun 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 49800, AmountCollected: 40100 },
  { Month: 'Jun 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 27600, AmountCollected: 19500 },
  { Month: 'Jul 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 15100, AmountCollected: 13200 },
  { Month: 'Jul 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 56500, AmountCollected: 50000 },
  { Month: 'Jul 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 31800, AmountCollected: 27400 },
  { Month: 'Aug 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 15400, AmountCollected: 13800 },
  { Month: 'Aug 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 58200, AmountCollected: 52600 },
  { Month: 'Aug 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 33000, AmountCollected: 29100 },
  { Month: 'Sep 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 14800, AmountCollected: 12500 },
  { Month: 'Sep 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 55000, AmountCollected: 46800 },
  { Month: 'Sep 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 30200, AmountCollected: 23700 },
  { Month: 'Oct 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 14300, AmountCollected: 11600 },
  { Month: 'Oct 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 53400, AmountCollected: 44000 },
  { Month: 'Oct 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 29800, AmountCollected: 22100 },
  { Month: 'Nov 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 13700, AmountCollected: 10900 },
  { Month: 'Nov 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 51200, AmountCollected: 41500 },
  { Month: 'Nov 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 28400, AmountCollected: 20200 },
  { Month: 'Dec 2025', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 14000, AmountCollected: 11300 },
  { Month: 'Dec 2025', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 52800, AmountCollected: 43200 },
  { Month: 'Dec 2025', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 29100, AmountCollected: 21600 },
  { Month: 'Jan 2026', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 15800, AmountCollected: 14200 },
  { Month: 'Jan 2026', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 60100, AmountCollected: 55800 },
  { Month: 'Jan 2026', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 34500, AmountCollected: 31200 },
  { Month: 'Feb 2026', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 15200, AmountCollected: 13600 },
  { Month: 'Feb 2026', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 58600, AmountCollected: 53100 },
  { Month: 'Feb 2026', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 33200, AmountCollected: 29800 },
  { Month: 'Mar 2026', ClientType: 'Residential', BillingTier: 'Standard', AmountBilled: 15500, AmountCollected: 13900 },
  { Month: 'Mar 2026', ClientType: 'Industrial', BillingTier: 'Industrial A', AmountBilled: 59400, AmountCollected: 54200 },
  { Month: 'Mar 2026', ClientType: 'Industrial', BillingTier: 'Industrial B', AmountBilled: 33800, AmountCollected: 30400 },
];

export default function AmountCollectionPage() {
  const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
  const [start, end] = dateRange;

  const filtered = useMemo(
    () => ALL_DATA.filter((d) => inRange(d.Month, start, end)),
    [start, end]
  );

  const report = useMemo(() => ({
    dataSource: { data: filtered },
    slice: {
      rows: [{ uniqueName: 'Month' }, { uniqueName: 'ClientType' }],
      columns: [{ uniqueName: 'Measures' }],
      measures: [
        { uniqueName: 'AmountBilled', aggregation: 'sum', caption: 'Billed (GHS)' },
        { uniqueName: 'AmountCollected', aggregation: 'sum', caption: 'Collected (GHS)' },
      ],
    },
    options: { grid: { type: 'compact', showTotals: 'on', showGrandTotals: 'on' }, configuratorActive: false },
  }), [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Amount Collection Report</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Monthly collections vs billed amounts by client type and billing tier</p>
        </div>
        <div className="w-full sm:w-72">
          <DateInput
            placeholder="Select month range"
            view="month"
            selectionMode="range"
            value={dateRange}
            onChange={(e) => setDateRange((e.target.value as (Date | null)[]) ?? [null, null])}
          />
        </div>
      </div>
      <ReportPivot report={report} />
    </div>
  );
}
