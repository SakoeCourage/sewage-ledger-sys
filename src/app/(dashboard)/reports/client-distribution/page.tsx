'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReportPivot from '@/components/reports/report-pivot';

const data = [
  { ClientCode: 'CLT001', ClientName: 'Accra Beverages Ltd', ClientType: 'Industrial', IndustryType: 'Manufacturing', BillingTier: 'Industrial A', DischargeVolume: 1400, RegistrationYear: '2021', RegistrationQuarter: 'Q1 2021' },
  { ClientCode: 'CLT002', ClientName: 'Tema Textiles Co.', ClientType: 'Industrial', IndustryType: 'Manufacturing', BillingTier: 'Industrial A', DischargeVolume: 1200, RegistrationYear: '2020', RegistrationQuarter: 'Q3 2020' },
  { ClientCode: 'CLT003', ClientName: 'Golden Palm Hotel', ClientType: 'Industrial', IndustryType: 'Hospitality', BillingTier: 'Industrial B', DischargeVolume: 800, RegistrationYear: '2022', RegistrationQuarter: 'Q2 2022' },
  { ClientCode: 'CLT004', ClientName: 'Korle-Bu Medical', ClientType: 'Industrial', IndustryType: 'Medical', BillingTier: 'Industrial A', DischargeVolume: 1600, RegistrationYear: '2019', RegistrationQuarter: 'Q4 2019' },
  { ClientCode: 'CLT005', ClientName: 'Kwabenya Abattoir', ClientType: 'Industrial', IndustryType: 'Abattoir', BillingTier: 'Industrial A', DischargeVolume: 1100, RegistrationYear: '2021', RegistrationQuarter: 'Q2 2021' },
  { ClientCode: 'CLT006', ClientName: 'Star Oil Depot', ClientType: 'Industrial', IndustryType: 'Petroleum', BillingTier: 'Industrial B', DischargeVolume: 900, RegistrationYear: '2022', RegistrationQuarter: 'Q1 2022' },
  { ClientCode: 'CLT007', ClientName: 'Kofi Asante', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 80, RegistrationYear: '2023', RegistrationQuarter: 'Q1 2023' },
  { ClientCode: 'CLT008', ClientName: 'Ama Owusu', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 70, RegistrationYear: '2022', RegistrationQuarter: 'Q3 2022' },
  { ClientCode: 'CLT009', ClientName: 'Kwame Mensah', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 95, RegistrationYear: '2021', RegistrationQuarter: 'Q4 2021' },
  { ClientCode: 'CLT010', ClientName: 'Accra Cold Store', ClientType: 'Industrial', IndustryType: 'Food Processing', BillingTier: 'Industrial B', DischargeVolume: 1050, RegistrationYear: '2020', RegistrationQuarter: 'Q2 2020' },
  { ClientCode: 'CLT011', ClientName: 'Eunice Darko', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 65, RegistrationYear: '2023', RegistrationQuarter: 'Q2 2023' },
  { ClientCode: 'CLT012', ClientName: 'Meridian Clinic', ClientType: 'Industrial', IndustryType: 'Medical', BillingTier: 'Industrial B', DischargeVolume: 750, RegistrationYear: '2022', RegistrationQuarter: 'Q4 2022' },
  { ClientCode: 'CLT013', ClientName: 'Fiifi Boateng', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 85, RegistrationYear: '2020', RegistrationQuarter: 'Q1 2020' },
  { ClientCode: 'CLT014', ClientName: 'Continental Bakery', ClientType: 'Industrial', IndustryType: 'Food Processing', BillingTier: 'Industrial B', DischargeVolume: 680, RegistrationYear: '2023', RegistrationQuarter: 'Q1 2023' },
  { ClientCode: 'CLT015', ClientName: 'Palace Suites Hotel', ClientType: 'Industrial', IndustryType: 'Hospitality', BillingTier: 'Industrial B', DischargeVolume: 920, RegistrationYear: '2021', RegistrationQuarter: 'Q3 2021' },
  { ClientCode: 'CLT016', ClientName: 'Abena Frimpong', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 60, RegistrationYear: '2024', RegistrationQuarter: 'Q1 2024' },
  { ClientCode: 'CLT017', ClientName: 'Nungua Fish Processing', ClientType: 'Industrial', IndustryType: 'Food Processing', BillingTier: 'Industrial A', DischargeVolume: 1300, RegistrationYear: '2019', RegistrationQuarter: 'Q2 2019' },
  { ClientCode: 'CLT018', ClientName: 'Yaw Darko', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 90, RegistrationYear: '2022', RegistrationQuarter: 'Q2 2022' },
  { ClientCode: 'CLT019', ClientName: 'Tema Port Authority', ClientType: 'Industrial', IndustryType: 'Government', BillingTier: 'Industrial A', DischargeVolume: 2200, RegistrationYear: '2018', RegistrationQuarter: 'Q3 2018' },
  { ClientCode: 'CLT020', ClientName: 'Adjoa Antwi', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 75, RegistrationYear: '2023', RegistrationQuarter: 'Q3 2023' },
  { ClientCode: 'CLT021', ClientName: 'Heritage Pharma', ClientType: 'Industrial', IndustryType: 'Manufacturing', BillingTier: 'Industrial A', DischargeVolume: 1350, RegistrationYear: '2020', RegistrationQuarter: 'Q4 2020' },
  { ClientCode: 'CLT022', ClientName: 'Bright Laundry Services', ClientType: 'Industrial', IndustryType: 'Laundry', BillingTier: 'Industrial B', DischargeVolume: 550, RegistrationYear: '2023', RegistrationQuarter: 'Q2 2023' },
  { ClientCode: 'CLT023', ClientName: 'Nana Akua Boateng', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 78, RegistrationYear: '2021', RegistrationQuarter: 'Q1 2021' },
  { ClientCode: 'CLT024', ClientName: 'Accra Rubber Products', ClientType: 'Industrial', IndustryType: 'Manufacturing', BillingTier: 'Industrial A', DischargeVolume: 1150, RegistrationYear: '2021', RegistrationQuarter: 'Q4 2021' },
  { ClientCode: 'CLT025', ClientName: 'Isaac Quartey', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 92, RegistrationYear: '2020', RegistrationQuarter: 'Q3 2020' },
  { ClientCode: 'CLT026', ClientName: 'Volta River Authority', ClientType: 'Industrial', IndustryType: 'Government', BillingTier: 'Industrial A', DischargeVolume: 1800, RegistrationYear: '2019', RegistrationQuarter: 'Q1 2019' },
  { ClientCode: 'CLT027', ClientName: 'Gifty Appiah', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 68, RegistrationYear: '2024', RegistrationQuarter: 'Q2 2024' },
  { ClientCode: 'CLT028', ClientName: 'Accra Tannery Ltd', ClientType: 'Industrial', IndustryType: 'Manufacturing', BillingTier: 'Industrial A', DischargeVolume: 1250, RegistrationYear: '2022', RegistrationQuarter: 'Q3 2022' },
  { ClientCode: 'CLT029', ClientName: 'Osei Bonsu', ClientType: 'Residential', IndustryType: '-', BillingTier: 'Standard', DischargeVolume: 82, RegistrationYear: '2023', RegistrationQuarter: 'Q4 2023' },
  { ClientCode: 'CLT030', ClientName: 'Kasapreko Co. Ltd', ClientType: 'Industrial', IndustryType: 'Manufacturing', BillingTier: 'Industrial A', DischargeVolume: 1500, RegistrationYear: '2020', RegistrationQuarter: 'Q1 2020' },
];

const report = {
  dataSource: { data },
  slice: {
    rows: [
      { uniqueName: 'ClientType' },
      { uniqueName: 'IndustryType' },
    ],
    columns: [{ uniqueName: 'Measures' }],
    measures: [
      { uniqueName: 'ClientCode', aggregation: 'count', caption: 'No. of Clients' },
      { uniqueName: 'DischargeVolume', aggregation: 'sum', caption: 'Total Discharge Vol (m³)' },
      { uniqueName: 'DischargeVolume', aggregation: 'average', caption: 'Avg Discharge Vol (m³)' },
    ],
  },
  options: {
    grid: { type: 'compact', showTotals: 'on', showGrandTotals: 'on' },
    configuratorActive: false,
  },
};

export default function ClientDistributionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Client Distribution Report</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Client breakdown by type, industry, discharge volume, and registration period</p>
        </div>
      </div>
      <ReportPivot report={report} />
    </div>
  );
}
