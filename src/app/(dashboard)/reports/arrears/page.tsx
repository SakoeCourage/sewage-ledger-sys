'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReportPivot from '@/components/reports/report-pivot';

const data = [
  { ClientCode: 'CLT001', ClientName: 'Accra Beverages Ltd', ClientType: 'Industrial', IndustryType: 'Manufacturing', TotalBilled: 85000, TotalPaid: 62000, OutstandingBalance: 23000, AgingBracket: '61-90 Days' },
  { ClientCode: 'CLT002', ClientName: 'Tema Textiles Co.', ClientType: 'Industrial', IndustryType: 'Manufacturing', TotalBilled: 72000, TotalPaid: 72000, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT003', ClientName: 'Golden Palm Hotel', ClientType: 'Industrial', IndustryType: 'Hospitality', TotalBilled: 48000, TotalPaid: 30000, OutstandingBalance: 18000, AgingBracket: '31-60 Days' },
  { ClientCode: 'CLT004', ClientName: 'Korle-Bu Medical', ClientType: 'Industrial', IndustryType: 'Medical', TotalBilled: 95000, TotalPaid: 95000, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT005', ClientName: 'Kwabenya Abattoir', ClientType: 'Industrial', IndustryType: 'Abattoir', TotalBilled: 61000, TotalPaid: 38000, OutstandingBalance: 23000, AgingBracket: '90+ Days' },
  { ClientCode: 'CLT006', ClientName: 'Star Oil Depot', ClientType: 'Industrial', IndustryType: 'Petroleum', TotalBilled: 54000, TotalPaid: 42000, OutstandingBalance: 12000, AgingBracket: '31-60 Days' },
  { ClientCode: 'CLT007', ClientName: 'Kofi Asante', ClientType: 'Residential', IndustryType: '-', TotalBilled: 4200, TotalPaid: 2800, OutstandingBalance: 1400, AgingBracket: '31-60 Days' },
  { ClientCode: 'CLT008', ClientName: 'Ama Owusu', ClientType: 'Residential', IndustryType: '-', TotalBilled: 3600, TotalPaid: 3600, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT009', ClientName: 'Kwame Mensah', ClientType: 'Residential', IndustryType: '-', TotalBilled: 5100, TotalPaid: 1200, OutstandingBalance: 3900, AgingBracket: '90+ Days' },
  { ClientCode: 'CLT010', ClientName: 'Accra Cold Store', ClientType: 'Industrial', IndustryType: 'Food Processing', TotalBilled: 67000, TotalPaid: 55000, OutstandingBalance: 12000, AgingBracket: '0-30 Days' },
  { ClientCode: 'CLT011', ClientName: 'Eunice Darko', ClientType: 'Residential', IndustryType: '-', TotalBilled: 3900, TotalPaid: 3200, OutstandingBalance: 700, AgingBracket: '0-30 Days' },
  { ClientCode: 'CLT012', ClientName: 'Meridian Clinic', ClientType: 'Industrial', IndustryType: 'Medical', TotalBilled: 42000, TotalPaid: 35000, OutstandingBalance: 7000, AgingBracket: '31-60 Days' },
  { ClientCode: 'CLT013', ClientName: 'Fiifi Boateng', ClientType: 'Residential', IndustryType: '-', TotalBilled: 4800, TotalPaid: 4800, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT014', ClientName: 'Continental Bakery', ClientType: 'Industrial', IndustryType: 'Food Processing', TotalBilled: 39000, TotalPaid: 22000, OutstandingBalance: 17000, AgingBracket: '61-90 Days' },
  { ClientCode: 'CLT015', ClientName: 'Palace Suites Hotel', ClientType: 'Industrial', IndustryType: 'Hospitality', TotalBilled: 58000, TotalPaid: 44000, OutstandingBalance: 14000, AgingBracket: '31-60 Days' },
  { ClientCode: 'CLT016', ClientName: 'Abena Frimpong', ClientType: 'Residential', IndustryType: '-', TotalBilled: 3300, TotalPaid: 0, OutstandingBalance: 3300, AgingBracket: '90+ Days' },
  { ClientCode: 'CLT017', ClientName: 'Nungua Fish Processing', ClientType: 'Industrial', IndustryType: 'Food Processing', TotalBilled: 44000, TotalPaid: 44000, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT018', ClientName: 'Yaw Darko', ClientType: 'Residential', IndustryType: '-', TotalBilled: 4500, TotalPaid: 3100, OutstandingBalance: 1400, AgingBracket: '61-90 Days' },
  { ClientCode: 'CLT019', ClientName: 'Tema Port Authority', ClientType: 'Industrial', IndustryType: 'Government', TotalBilled: 110000, TotalPaid: 110000, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT020', ClientName: 'Adjoa Antwi', ClientType: 'Residential', IndustryType: '-', TotalBilled: 3750, TotalPaid: 2500, OutstandingBalance: 1250, AgingBracket: '0-30 Days' },
  { ClientCode: 'CLT021', ClientName: 'Heritage Pharma', ClientType: 'Industrial', IndustryType: 'Manufacturing', TotalBilled: 76000, TotalPaid: 58000, OutstandingBalance: 18000, AgingBracket: '61-90 Days' },
  { ClientCode: 'CLT022', ClientName: 'Bright Laundry Services', ClientType: 'Industrial', IndustryType: 'Laundry', TotalBilled: 28000, TotalPaid: 16000, OutstandingBalance: 12000, AgingBracket: '90+ Days' },
  { ClientCode: 'CLT023', ClientName: 'Nana Akua Boateng', ClientType: 'Residential', IndustryType: '-', TotalBilled: 4200, TotalPaid: 4200, OutstandingBalance: 0, AgingBracket: 'Current' },
  { ClientCode: 'CLT024', ClientName: 'Accra Rubber Products', ClientType: 'Industrial', IndustryType: 'Manufacturing', TotalBilled: 63000, TotalPaid: 49000, OutstandingBalance: 14000, AgingBracket: '31-60 Days' },
  { ClientCode: 'CLT025', ClientName: 'Isaac Quartey', ClientType: 'Residential', IndustryType: '-', TotalBilled: 5400, TotalPaid: 5400, OutstandingBalance: 0, AgingBracket: 'Current' },
];

const report = {
  dataSource: { data },
  slice: {
    rows: [
      { uniqueName: 'AgingBracket' },
      { uniqueName: 'ClientType' },
      { uniqueName: 'ClientName' },
    ],
    columns: [{ uniqueName: 'Measures' }],
    measures: [
      { uniqueName: 'TotalBilled', aggregation: 'sum', caption: 'Total Billed (GHS)' },
      { uniqueName: 'TotalPaid', aggregation: 'sum', caption: 'Total Paid (GHS)' },
      { uniqueName: 'OutstandingBalance', aggregation: 'sum', caption: 'Outstanding (GHS)' },
    ],
  },
  options: {
    grid: { type: 'compact', showTotals: 'on', showGrandTotals: 'on' },
    configuratorActive: false,
  },
};

export default function ArrearsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Arrears & Outstanding Balances</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Client outstanding balances grouped by aging bracket and type</p>
        </div>
      </div>
      <ReportPivot report={report} />
    </div>
  );
}
