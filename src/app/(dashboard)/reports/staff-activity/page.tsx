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
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Apr 2025', BillsGenerated: 48, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Apr 2025', BillsGenerated: 6, PaymentsRecorded: 14, AmountCollected: 16800 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Apr 2025', BillsGenerated: 0, PaymentsRecorded: 11, AmountCollected: 41200 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Apr 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'May 2025', BillsGenerated: 49, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'May 2025', BillsGenerated: 0, PaymentsRecorded: 16, AmountCollected: 18400 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'May 2025', BillsGenerated: 5, PaymentsRecorded: 12, AmountCollected: 44500 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'May 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Jun 2025', BillsGenerated: 47, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Jun 2025', BillsGenerated: 4, PaymentsRecorded: 13, AmountCollected: 15600 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Jun 2025', BillsGenerated: 0, PaymentsRecorded: 10, AmountCollected: 38200 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Jun 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Jul 2025', BillsGenerated: 52, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Jul 2025', BillsGenerated: 0, PaymentsRecorded: 15, AmountCollected: 19200 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Jul 2025', BillsGenerated: 7, PaymentsRecorded: 14, AmountCollected: 52600 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Jul 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Aug 2025', BillsGenerated: 51, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Aug 2025', BillsGenerated: 5, PaymentsRecorded: 17, AmountCollected: 21000 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Aug 2025', BillsGenerated: 0, PaymentsRecorded: 13, AmountCollected: 55200 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Aug 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Sep 2025', BillsGenerated: 47, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Sep 2025', BillsGenerated: 0, PaymentsRecorded: 14, AmountCollected: 17800 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Sep 2025', BillsGenerated: 3, PaymentsRecorded: 11, AmountCollected: 47400 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Sep 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Oct 2025', BillsGenerated: 49, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Oct 2025', BillsGenerated: 6, PaymentsRecorded: 15, AmountCollected: 16200 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Oct 2025', BillsGenerated: 0, PaymentsRecorded: 12, AmountCollected: 44800 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Oct 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Nov 2025', BillsGenerated: 46, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Nov 2025', BillsGenerated: 0, PaymentsRecorded: 13, AmountCollected: 15400 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Nov 2025', BillsGenerated: 4, PaymentsRecorded: 10, AmountCollected: 42200 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Nov 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Dec 2025', BillsGenerated: 48, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Dec 2025', BillsGenerated: 5, PaymentsRecorded: 16, AmountCollected: 17600 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Dec 2025', BillsGenerated: 0, PaymentsRecorded: 12, AmountCollected: 43800 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Dec 2025', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Jan 2026', BillsGenerated: 55, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Jan 2026', BillsGenerated: 0, PaymentsRecorded: 18, AmountCollected: 23400 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Jan 2026', BillsGenerated: 8, PaymentsRecorded: 15, AmountCollected: 59600 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Jan 2026', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Feb 2026', BillsGenerated: 52, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Feb 2026', BillsGenerated: 6, PaymentsRecorded: 17, AmountCollected: 21500 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Feb 2026', BillsGenerated: 0, PaymentsRecorded: 14, AmountCollected: 56800 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Feb 2026', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'John Mensah', Role: 'Billing Officer', Month: 'Mar 2026', BillsGenerated: 55, PaymentsRecorded: 0, AmountCollected: 0 },
  { StaffName: 'Ama Owusu', Role: 'Cashier', Month: 'Mar 2026', BillsGenerated: 0, PaymentsRecorded: 16, AmountCollected: 22100 },
  { StaffName: 'Kofi Asante', Role: 'Cashier', Month: 'Mar 2026', BillsGenerated: 7, PaymentsRecorded: 15, AmountCollected: 58400 },
  { StaffName: 'Akosua Boateng', Role: 'Supervisor', Month: 'Mar 2026', BillsGenerated: 0, PaymentsRecorded: 0, AmountCollected: 0 },
];

export default function StaffActivityPage() {
  const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
  const [start, end] = dateRange;

  const filtered = useMemo(
    () => ALL_DATA.filter((d) => inRange(d.Month, start, end)),
    [start, end]
  );

  const report = useMemo(() => ({
    dataSource: { data: filtered },
    slice: {
      rows: [{ uniqueName: 'StaffName' }, { uniqueName: 'Role' }],
      columns: [{ uniqueName: 'Month' }],
      measures: [
        { uniqueName: 'BillsGenerated', aggregation: 'sum', caption: 'Bills Generated' },
        { uniqueName: 'PaymentsRecorded', aggregation: 'sum', caption: 'Payments Recorded' },
        { uniqueName: 'AmountCollected', aggregation: 'sum', caption: 'Amount Collected (GHS)' },
      ],
    },
    options: { grid: { type: 'compact', showTotals: 'on', showGrandTotals: 'on' }, configuratorActive: false },
  }), [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Staff Activity Report</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Bills generated and payments recorded per staff member across all months</p>
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
