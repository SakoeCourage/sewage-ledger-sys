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
  { Month: 'Apr 2025', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Kofi Asante', ReceivedBy: 'Ama Owusu', Amount: 350 },
  { Month: 'Apr 2025', PaymentMode: 'MoMo', ClientType: 'Industrial', ClientName: 'Accra Beverages Ltd', ReceivedBy: 'Ama Owusu', Amount: 5200 },
  { Month: 'Apr 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Tema Port Authority', ReceivedBy: 'Kofi Asante', Amount: 22000 },
  { Month: 'Apr 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Heritage Pharma', ReceivedBy: 'Kofi Asante', Amount: 9500 },
  { Month: 'Apr 2025', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Ama Owusu', ReceivedBy: 'Ama Owusu', Amount: 420 },
  { Month: 'May 2025', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Eunice Darko', ReceivedBy: 'Ama Owusu', Amount: 390 },
  { Month: 'May 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Korle-Bu Medical', ReceivedBy: 'Kofi Asante', Amount: 19500 },
  { Month: 'May 2025', PaymentMode: 'Cash', ClientType: 'Industrial', ClientName: 'Star Oil Depot', ReceivedBy: 'Ama Owusu', Amount: 4200 },
  { Month: 'May 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Golden Palm Hotel', ReceivedBy: 'Kofi Asante', Amount: 7500 },
  { Month: 'May 2025', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Kwame Mensah', ReceivedBy: 'Ama Owusu', Amount: 310 },
  { Month: 'Jun 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Tema Textiles Co.', ReceivedBy: 'Kofi Asante', Amount: 18000 },
  { Month: 'Jun 2025', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Adjoa Antwi', ReceivedBy: 'Ama Owusu', Amount: 360 },
  { Month: 'Jun 2025', PaymentMode: 'MoMo', ClientType: 'Industrial', ClientName: 'Meridian Clinic', ReceivedBy: 'Ama Owusu', Amount: 6200 },
  { Month: 'Jun 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Accra Cold Store', ReceivedBy: 'Kofi Asante', Amount: 11000 },
  { Month: 'Jun 2025', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Fiifi Boateng', ReceivedBy: 'Ama Owusu', Amount: 400 },
  { Month: 'Jul 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Heritage Pharma', ReceivedBy: 'Kofi Asante', Amount: 14500 },
  { Month: 'Jul 2025', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Nana Akua Boateng', ReceivedBy: 'Ama Owusu', Amount: 480 },
  { Month: 'Jul 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Palace Suites Hotel', ReceivedBy: 'Kofi Asante', Amount: 8800 },
  { Month: 'Jul 2025', PaymentMode: 'Cash', ClientType: 'Industrial', ClientName: 'Nungua Fish Processing', ReceivedBy: 'Ama Owusu', Amount: 5600 },
  { Month: 'Jul 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Tema Port Authority', ReceivedBy: 'Kofi Asante', Amount: 25000 },
  { Month: 'Aug 2025', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Yaw Darko', ReceivedBy: 'Ama Owusu', Amount: 450 },
  { Month: 'Aug 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Continental Bakery', ReceivedBy: 'Kofi Asante', Amount: 7200 },
  { Month: 'Aug 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Korle-Bu Medical', ReceivedBy: 'Kofi Asante', Amount: 20000 },
  { Month: 'Aug 2025', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Isaac Quartey', ReceivedBy: 'Ama Owusu', Amount: 500 },
  { Month: 'Sep 2025', PaymentMode: 'MoMo', ClientType: 'Industrial', ClientName: 'Accra Beverages Ltd', ReceivedBy: 'Ama Owusu', Amount: 5800 },
  { Month: 'Sep 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Accra Rubber Products', ReceivedBy: 'Kofi Asante', Amount: 12000 },
  { Month: 'Sep 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Star Oil Depot', ReceivedBy: 'Kofi Asante', Amount: 8400 },
  { Month: 'Oct 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Tema Textiles Co.', ReceivedBy: 'Kofi Asante', Amount: 19500 },
  { Month: 'Oct 2025', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Kofi Asante', ReceivedBy: 'Ama Owusu', Amount: 380 },
  { Month: 'Oct 2025', PaymentMode: 'Cash', ClientType: 'Industrial', ClientName: 'Golden Palm Hotel', ReceivedBy: 'Ama Owusu', Amount: 4500 },
  { Month: 'Nov 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Heritage Pharma', ReceivedBy: 'Kofi Asante', Amount: 10200 },
  { Month: 'Nov 2025', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Eunice Darko', ReceivedBy: 'Ama Owusu', Amount: 350 },
  { Month: 'Nov 2025', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Tema Port Authority', ReceivedBy: 'Kofi Asante', Amount: 23000 },
  { Month: 'Dec 2025', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Fiifi Boateng', ReceivedBy: 'Ama Owusu', Amount: 400 },
  { Month: 'Dec 2025', PaymentMode: 'MoMo', ClientType: 'Industrial', ClientName: 'Meridian Clinic', ReceivedBy: 'Ama Owusu', Amount: 6800 },
  { Month: 'Dec 2025', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Accra Cold Store', ReceivedBy: 'Kofi Asante', Amount: 13500 },
  { Month: 'Jan 2026', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Korle-Bu Medical', ReceivedBy: 'Kofi Asante', Amount: 22000 },
  { Month: 'Jan 2026', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Nana Akua Boateng', ReceivedBy: 'Ama Owusu', Amount: 520 },
  { Month: 'Jan 2026', PaymentMode: 'Cash', ClientType: 'Industrial', ClientName: 'Nungua Fish Processing', ReceivedBy: 'Ama Owusu', Amount: 6100 },
  { Month: 'Jan 2026', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Palace Suites Hotel', ReceivedBy: 'Kofi Asante', Amount: 9600 },
  { Month: 'Feb 2026', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Tema Port Authority', ReceivedBy: 'Kofi Asante', Amount: 26000 },
  { Month: 'Feb 2026', PaymentMode: 'MoMo', ClientType: 'Residential', ClientName: 'Adjoa Antwi', ReceivedBy: 'Ama Owusu', Amount: 410 },
  { Month: 'Feb 2026', PaymentMode: 'Cheque', ClientType: 'Industrial', ClientName: 'Accra Rubber Products', ReceivedBy: 'Kofi Asante', Amount: 11500 },
  { Month: 'Mar 2026', PaymentMode: 'Cash', ClientType: 'Residential', ClientName: 'Isaac Quartey', ReceivedBy: 'Ama Owusu', Amount: 490 },
  { Month: 'Mar 2026', PaymentMode: 'Bank Transfer', ClientType: 'Industrial', ClientName: 'Heritage Pharma', ReceivedBy: 'Kofi Asante', Amount: 15000 },
  { Month: 'Mar 2026', PaymentMode: 'MoMo', ClientType: 'Industrial', ClientName: 'Golden Palm Hotel', ReceivedBy: 'Ama Owusu', Amount: 5500 },
];

export default function PaymentAnalysisPage() {
  const [dateRange, setDateRange] = useState<(Date | null)[]>([null, null]);
  const [start, end] = dateRange;

  const filtered = useMemo(
    () => ALL_DATA.filter((d) => inRange(d.Month, start, end)),
    [start, end]
  );

  const report = useMemo(() => ({
    dataSource: { data: filtered },
    slice: {
      rows: [{ uniqueName: 'Month' }, { uniqueName: 'PaymentMode' }],
      columns: [{ uniqueName: 'Measures' }],
      measures: [
        { uniqueName: 'Amount', aggregation: 'sum', caption: 'Amount (GHS)' },
        { uniqueName: 'Amount', aggregation: 'count', caption: 'No. of Payments' },
      ],
    },
    options: { grid: { type: 'compact', showTotals: 'on', showGrandTotals: 'on' }, configuratorActive: false },
  }), [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Payment Analysis Report</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Payment trends by mode, client type, and cashier across all months</p>
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
