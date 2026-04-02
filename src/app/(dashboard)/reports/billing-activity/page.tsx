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
  { Month: 'Apr 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 42, Approved: 40, Unapproved: 2, Dispatched: 38, NotDispatched: 4 },
  { Month: 'Apr 2025', GeneratedBy: 'Ama Owusu', BillType: 'Individual', TotalBills: 6, Approved: 6, Unapproved: 0, Dispatched: 6, NotDispatched: 0 },
  { Month: 'May 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 44, Approved: 41, Unapproved: 3, Dispatched: 39, NotDispatched: 5 },
  { Month: 'May 2025', GeneratedBy: 'Kofi Asante', BillType: 'Individual', TotalBills: 5, Approved: 5, Unapproved: 0, Dispatched: 4, NotDispatched: 1 },
  { Month: 'Jun 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 43, Approved: 39, Unapproved: 4, Dispatched: 37, NotDispatched: 6 },
  { Month: 'Jun 2025', GeneratedBy: 'Ama Owusu', BillType: 'Individual', TotalBills: 4, Approved: 4, Unapproved: 0, Dispatched: 4, NotDispatched: 0 },
  { Month: 'Jul 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 45, Approved: 44, Unapproved: 1, Dispatched: 43, NotDispatched: 2 },
  { Month: 'Jul 2025', GeneratedBy: 'Kofi Asante', BillType: 'Individual', TotalBills: 7, Approved: 6, Unapproved: 1, Dispatched: 5, NotDispatched: 2 },
  { Month: 'Aug 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 46, Approved: 45, Unapproved: 1, Dispatched: 44, NotDispatched: 2 },
  { Month: 'Aug 2025', GeneratedBy: 'Ama Owusu', BillType: 'Individual', TotalBills: 5, Approved: 5, Unapproved: 0, Dispatched: 5, NotDispatched: 0 },
  { Month: 'Sep 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 44, Approved: 40, Unapproved: 4, Dispatched: 38, NotDispatched: 6 },
  { Month: 'Sep 2025', GeneratedBy: 'Kofi Asante', BillType: 'Individual', TotalBills: 3, Approved: 3, Unapproved: 0, Dispatched: 3, NotDispatched: 0 },
  { Month: 'Oct 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 43, Approved: 38, Unapproved: 5, Dispatched: 36, NotDispatched: 7 },
  { Month: 'Oct 2025', GeneratedBy: 'Ama Owusu', BillType: 'Individual', TotalBills: 6, Approved: 5, Unapproved: 1, Dispatched: 4, NotDispatched: 2 },
  { Month: 'Nov 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 42, Approved: 37, Unapproved: 5, Dispatched: 35, NotDispatched: 7 },
  { Month: 'Nov 2025', GeneratedBy: 'Kofi Asante', BillType: 'Individual', TotalBills: 4, Approved: 4, Unapproved: 0, Dispatched: 3, NotDispatched: 1 },
  { Month: 'Dec 2025', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 43, Approved: 40, Unapproved: 3, Dispatched: 38, NotDispatched: 5 },
  { Month: 'Dec 2025', GeneratedBy: 'Ama Owusu', BillType: 'Individual', TotalBills: 5, Approved: 5, Unapproved: 0, Dispatched: 5, NotDispatched: 0 },
  { Month: 'Jan 2026', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 47, Approved: 46, Unapproved: 1, Dispatched: 45, NotDispatched: 2 },
  { Month: 'Jan 2026', GeneratedBy: 'Kofi Asante', BillType: 'Individual', TotalBills: 8, Approved: 8, Unapproved: 0, Dispatched: 8, NotDispatched: 0 },
  { Month: 'Feb 2026', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 46, Approved: 44, Unapproved: 2, Dispatched: 42, NotDispatched: 4 },
  { Month: 'Feb 2026', GeneratedBy: 'Ama Owusu', BillType: 'Individual', TotalBills: 6, Approved: 6, Unapproved: 0, Dispatched: 6, NotDispatched: 0 },
  { Month: 'Mar 2026', GeneratedBy: 'John Mensah', BillType: 'Period', TotalBills: 48, Approved: 46, Unapproved: 2, Dispatched: 44, NotDispatched: 4 },
  { Month: 'Mar 2026', GeneratedBy: 'Kofi Asante', BillType: 'Individual', TotalBills: 7, Approved: 7, Unapproved: 0, Dispatched: 7, NotDispatched: 0 },
];

export default function BillingActivityPage() {
  const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
  const [start, end] = dateRange;

  const filtered = useMemo(
    () => ALL_DATA.filter((d) => inRange(d.Month, start, end)),
    [start, end]
  );

  const report = useMemo(() => ({
    dataSource: { data: filtered },
    slice: {
      rows: [{ uniqueName: 'Month' }, { uniqueName: 'GeneratedBy' }],
      columns: [{ uniqueName: 'Measures' }],
      measures: [
        { uniqueName: 'TotalBills', aggregation: 'sum', caption: 'Total Bills' },
        { uniqueName: 'Approved', aggregation: 'sum', caption: 'Approved' },
        { uniqueName: 'Unapproved', aggregation: 'sum', caption: 'Unapproved' },
        { uniqueName: 'Dispatched', aggregation: 'sum', caption: 'Dispatched' },
        { uniqueName: 'NotDispatched', aggregation: 'sum', caption: 'Not Dispatched' },
      ],
    },
    options: { grid: { type: 'compact', showTotals: 'on', showGrandTotals: 'on' }, configuratorActive: false },
  }), [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Billing Activity Report</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Monthly bill generation, approval status, and dispatch rates per staff</p>
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
