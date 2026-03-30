'use client';

import { useState } from 'react';
import {
  Button,
  TextInput,
  SelectInput,
  DateInput,
  TimeInput,
  MultiSelectInput,
  SearchInput,
  EmptyState,
  Modal,
  BottomSheet,
  AppDataTable,
  toast,
} from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import { AlertCircle, Trash2, Eye, Pencil } from 'lucide-react';

export default function ComponentsPage() {
  // ── Table demo data ──
  type LedgerRow = {
    id: string;
    reference: string;
    customer: string;
    zone: string;
    amount: number;
    status: string;
    date: string;
  };

  const tableData: LedgerRow[] = Array.from({ length: 37 }, (_, i) => ({
    id:        String(i + 1),
    reference: `SL-${String(i + 1).padStart(4, '0')}`,
    customer:  ['Alice Mensah', 'Kwame Asante', 'Abena Osei', 'Kofi Boateng', 'Ama Darko'][i % 5],
    zone:      ['Zone A', 'Zone B', 'Zone C', 'Zone D'][i % 4],
    amount:    (i + 1) * 125.5,
    status:    ['Active', 'Pending', 'Inactive', 'Active', 'Active'][i % 5],
    date:      new Date(2024, i % 12, (i % 28) + 1).toISOString(),
  }));

  const tableColumns: ColumnDef<LedgerRow>[] = [
    { field: 'reference', header: 'Reference', sortable: true },
    { field: 'customer',  header: 'Customer',  sortable: true },
    { field: 'zone',      header: 'Zone',      sortable: true },
    {
      field: 'amount', header: 'Amount', sortable: true,
      body: (row) => (
        <span>GHS {row.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      field: 'status', header: 'Status',
      body: (row) => (
        <span className={[
          'px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide',
          row.status === 'Active'   ? 'bg-emerald-50 text-emerald-700'  : '',
          row.status === 'Pending'  ? 'bg-orange-50  text-orange-600'   : '',
          row.status === 'Inactive' ? 'bg-zinc-100   text-zinc-500'     : '',
        ].join(' ')}>{row.status}</span>
      ),
    },
    {
      field: 'date', header: 'Date',
      body: (row) => new Date(row.date).toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      field: 'id', header: 'Actions',
      body: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => toast.info(`Viewing ${row.reference}`)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => toast.info(`Editing ${row.reference}`)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-[#4a907a] transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => toast.error(`Deleted ${row.reference}`)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Text inputs
  const [textValue, setTextValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  // Select
  const [selectValue, setSelectValue] = useState<string | number | null>(null);
  const [multiValue, setMultiValue] = useState<(string | number)[]>([]);

  // Date / Time
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [dateRangeValue, setDateRangeValue] = useState<(Date | null)[] | null>(null);
  const [timeValue, setTimeValue] = useState<Date | null>(null);

  // Modals
  const [modalBasic, setModalBasic] = useState(false);
  const [modalForm, setModalForm] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalSm, setModalSm] = useState(false);
  const [modalXl, setModalXl] = useState(false);

  // Bottom Sheets
  const [sheetBasic, setSheetBasic] = useState(false);
  const [sheetForm, setSheetForm] = useState(false);
  const [sheetHalf, setSheetHalf] = useState(false);
  const [sheetFull, setSheetFull] = useState(false);

  const selectOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Suspended', value: 'suspended' },
  ];

  const multiOptions = [
    { label: 'Water Supply', value: 'water' },
    { label: 'Sewage Treatment', value: 'sewage' },
    { label: 'Waste Management', value: 'waste' },
    { label: 'Billing', value: 'billing' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4a907a]">UI Showcase</p>
          <h1 className="text-3xl font-bold text-zinc-800">Component Library</h1>
          <p className="text-sm text-zinc-500">Review all components and provide feedback.</p>
        </div>

        {/* ── Data Table ── */}
        <Section title="Data Table" subtitle="37 local rows — client-side search, filters, sort and pagination. Swap data prop for dataSourceUrl to go live.">
          <AppDataTable
            columns={tableColumns}
            data={tableData}
            filterablePlaceholder="Search by reference, customer, zone…"
            searchFields={['reference', 'customer', 'zone', 'status']}
            pageSize={8}
            hasAction
            actionName="New Entry"
            onAction={() => toast.success('New entry', 'Open your form here.')}
            extendedFilter={{
              enable: true,
              filters: [
                {
                  type: 'SelectFilter',
                  accessor: 'zone',
                  label: 'Zone',
                  args: {
                    options: [
                      { label: 'Zone A', value: 'Zone A' },
                      { label: 'Zone B', value: 'Zone B' },
                      { label: 'Zone C', value: 'Zone C' },
                      { label: 'Zone D', value: 'Zone D' },
                    ],
                  },
                },
                {
                  type: 'SelectFilter',
                  accessor: 'status',
                  label: 'Status',
                  args: {
                    options: [
                      { label: 'Active',   value: 'Active'   },
                      { label: 'Pending',  value: 'Pending'  },
                      { label: 'Inactive', value: 'Inactive' },
                    ],
                  },
                },
              ],
            }}
          />
        </Section>

        {/* ── Text Inputs ── */}
        <Section title="Text Inputs" subtitle="Standard text, email, password, number fields">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Full Name"
              name="fullName"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
            <TextInput
              label="Email Address"
              name="email"
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              placeholder="e.g. john@example.com"
            />
            <TextInput
              label="Password"
              name="password"
              type="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              placeholder="Enter password"
            />
            <TextInput
              label="Amount (Number with commas)"
              name="amount"
              type="number"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              placeholder="e.g. 1,000,000"
            />
            <TextInput
              label="Field with Error"
              name="errorField"
              value=""
              onChange={() => {}}
              placeholder="This field has an error"
              error="This field is required"
            />
            <TextInput
              label="Disabled Input"
              name="disabled"
              value="Read only value"
              onChange={() => {}}
              disabled
            />
          </div>
        </Section>

        {/* ── Textarea ── */}
        <Section title="Textarea" subtitle="Multi-line text input">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInput
              label="Description"
              name="description"
              value={textareaValue}
              onChange={(e) => setTextareaValue(e.target.value)}
              placeholder="Enter a description..."
              multiline
              rows={4}
            />
            <TextInput
              label="Notes (Disabled)"
              name="notes"
              value="This textarea is disabled and cannot be edited."
              onChange={() => {}}
              multiline
              rows={4}
              disabled
            />
          </div>
        </Section>

        {/* ── Select ── */}
        <Section title="Select Input" subtitle="Single-value dropdown with filter and clear">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectInput
              label="Status"
              name="status"
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
              placeholder="Select a status"
              required
            />
            <SelectInput
              label="Status with Error"
              name="statusError"
              options={selectOptions}
              value={null}
              onChange={() => {}}
              placeholder="Select a status"
              error="Please select a status"
            />
            <SelectInput
              label="Disabled Select"
              name="disabledSelect"
              options={selectOptions}
              value="active"
              onChange={() => {}}
              disabled
            />
          </div>
          {selectValue && (
            <p className="text-xs text-zinc-500 mt-4">Selected: <span className="font-bold text-[#4a907a]">{selectValue}</span></p>
          )}
        </Section>

        {/* ── Multi Select ── */}
        <Section title="Multi-Select Input" subtitle="Multiple values with chip display and filter">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiSelectInput
              label="Departments (chip)"
              name="departments"
              options={multiOptions}
              value={multiValue}
              onChange={(e) => setMultiValue(e.target.value)}
              placeholder="Select departments"
            />
            <MultiSelectInput
              label="Departments (comma)"
              name="departmentsComma"
              options={multiOptions}
              value={[]}
              onChange={() => {}}
              display="comma"
              placeholder="Select departments"
            />
          </div>
          {multiValue.length > 0 && (
            <p className="text-xs text-zinc-500 mt-4">Selected: <span className="font-bold text-[#4a907a]">{multiValue.join(', ')}</span></p>
          )}
        </Section>

        {/* ── Date Inputs ── */}
        <Section title="Date Input" subtitle="Single date, date range, month picker and date+time">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DateInput
              label="Single Date"
              name="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value as Date | null)}
              placeholder="Select a date"
            />
            <DateInput
              label="Date Range"
              name="dateRange"
              selectionMode="range"
              value={dateRangeValue as any}
              onChange={(e) => setDateRangeValue(e.target.value as (Date | null)[])}
              placeholder="Select a range"
            />
            <DateInput
              label="Month Picker"
              name="month"
              view="month"
              value={null}
              onChange={() => {}}
              placeholder="Select a month"
            />
            <DateInput
              label="Date & Time"
              name="datetime"
              value={null}
              onChange={() => {}}
              showTime
              placeholder="Select date and time"
            />
            <DateInput
              label="Date with Error"
              name="dateError"
              value={null}
              onChange={() => {}}
              error="Please select a date"
            />
          </div>
        </Section>

        {/* ── Time Input ── */}
        <Section title="Time Input" subtitle="12-hour and 24-hour time pickers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TimeInput
              label="Time (12h)"
              name="time12"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              placeholder="Select time"
              hourFormat="12"
            />
            <TimeInput
              label="Time (24h)"
              name="time24"
              value={null}
              onChange={() => {}}
              placeholder="Select time"
              hourFormat="24"
            />
          </div>
        </Section>

        {/* ── Search Input ── */}
        <Section title="Search Input" subtitle="Debounced search with clear button">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchInput
              onSearch={(val) => console.log('Search:', val)}
              placeholder="Search records..."
            />
            <SearchInput
              onSearch={() => {}}
              placeholder="Loading state..."
              loading
            />
          </div>
        </Section>

        {/* ── Buttons ── */}
        <Section title="Buttons" subtitle="All variants including loading and disabled states">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="alert">Alert</Button>
              <Button variant="neutral">Neutral</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" loading>Loading...</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="danger" loading>Deleting...</Button>
            </div>
          </div>
        </Section>

        {/* ── Empty State ── */}
        <Section title="Empty State" subtitle="Displayed when there is no data to show">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState caption="No records found" />
            <EmptyState
              caption="No reports available"
              icon={<AlertCircle className="w-12 h-12 opacity-20" />}
            />
          </div>
        </Section>

        {/* ── Modals ── */}
        <Section title="Modal" subtitle="Centered dialog with backdrop, keyboard dismiss and spring animation">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setModalBasic(true)}>Basic Modal</Button>
            <Button variant="neutral" onClick={() => setModalForm(true)}>Modal with Form</Button>
            <Button variant="danger" onClick={() => setModalConfirm(true)}>Confirm / Destructive</Button>
            <Button variant="ghost" onClick={() => setModalSm(true)}>Small (sm)</Button>
            <Button variant="ghost" onClick={() => setModalXl(true)}>Extra Large (xl)</Button>
          </div>

          {/* Basic */}
          <Modal
            open={modalBasic}
            onClose={() => setModalBasic(false)}
            title="Basic Modal"
            description="This is a simple modal with a title and description."
            footer={
              <>
                <Button variant="neutral" onClick={() => setModalBasic(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setModalBasic(false)}>Confirm</Button>
              </>
            }
          >
            <p className="text-sm text-zinc-600 leading-relaxed">
              Modals are great for short, focused interactions. Click outside, press{' '}
              <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs font-mono">Esc</kbd>, or
              use the close button to dismiss.
            </p>
          </Modal>

          {/* Form */}
          <Modal
            open={modalForm}
            onClose={() => setModalForm(false)}
            title="Add New Record"
            description="Fill in the details below to create a new entry."
            size="lg"
            footer={
              <>
                <Button variant="neutral" onClick={() => setModalForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setModalForm(false)}>Save Record</Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Full Name" name="modalName" value="" onChange={() => {}} placeholder="John Doe" required />
                <TextInput label="Email" name="modalEmail" type="email" value="" onChange={() => {}} placeholder="john@example.com" />
              </div>
              <SelectInput
                label="Status"
                name="modalStatus"
                options={selectOptions}
                value={null}
                onChange={() => {}}
                placeholder="Select status"
              />
              <DateInput label="Start Date" name="modalDate" value={null} onChange={() => {}} placeholder="Select date" />
              <TextInput label="Notes" name="modalNotes" value="" onChange={() => {}} placeholder="Any additional notes..." multiline rows={3} />
            </div>
          </Modal>

          {/* Confirm / Destructive */}
          <Modal
            open={modalConfirm}
            onClose={() => setModalConfirm(false)}
            size="sm"
            footer={
              <>
                <Button variant="neutral" onClick={() => setModalConfirm(false)}>Cancel</Button>
                <Button variant="danger" onClick={() => setModalConfirm(false)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              </>
            }
          >
            <div className="flex flex-col items-center text-center py-2 gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-800 text-base">Delete this record?</h3>
                <p className="text-sm text-zinc-400 mt-1">This action is permanent and cannot be undone.</p>
              </div>
            </div>
          </Modal>

          {/* Small */}
          <Modal open={modalSm} onClose={() => setModalSm(false)} title="Small Modal" size="sm"
            footer={<Button variant="primary" onClick={() => setModalSm(false)}>Got it</Button>}
          >
            <p className="text-sm text-zinc-500">A compact modal for quick notices or confirmations.</p>
          </Modal>

          {/* XL */}
          <Modal open={modalXl} onClose={() => setModalXl(false)} title="Extra Large Modal" description="Suitable for detailed views or complex forms." size="xl"
            footer={
              <>
                <Button variant="neutral" onClick={() => setModalXl(false)}>Close</Button>
                <Button variant="primary" onClick={() => setModalXl(false)}>Save</Button>
              </>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <TextInput key={i} label={`Field ${i + 1}`} name={`field${i}`} value="" onChange={() => {}} placeholder="Enter value..." />
              ))}
            </div>
          </Modal>
        </Section>

        {/* ── Bottom Sheets ── */}
        <Section title="Bottom Sheet" subtitle="Slides up from the bottom — drag down to dismiss">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => setSheetBasic(true)}>Basic Sheet</Button>
            <Button variant="neutral" onClick={() => setSheetForm(true)}>Sheet with Form</Button>
            <Button variant="ghost" onClick={() => setSheetHalf(true)}>Half Height</Button>
            <Button variant="ghost" onClick={() => setSheetFull(true)}>Full Height</Button>
          </div>

          {/* Basic */}
          <BottomSheet
            open={sheetBasic}
            onClose={() => setSheetBasic(false)}
            title="Basic Bottom Sheet"
            description="Drag the handle down or tap outside to close."
            footer={
              <>
                <Button variant="neutral" onClick={() => setSheetBasic(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setSheetBasic(false)}>Confirm</Button>
              </>
            }
          >
            <p className="text-sm text-zinc-600 leading-relaxed">
              Bottom sheets are ideal for contextual actions on mobile and tablet layouts.
              Try dragging the pill handle downward to dismiss this sheet.
            </p>
          </BottomSheet>

          {/* Form */}
          <BottomSheet
            open={sheetForm}
            onClose={() => setSheetForm(false)}
            title="New Entry"
            description="Add a new sewage ledger entry below."
            footer={
              <>
                <Button variant="neutral" onClick={() => setSheetForm(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setSheetForm(false)}>Save Entry</Button>
              </>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput label="Reference No." name="sheetRef" value="" onChange={() => {}} placeholder="e.g. SL-0001" required />
                <TextInput label="Amount" name="sheetAmount" type="number" value="" onChange={() => {}} placeholder="0.00" />
              </div>
              <SelectInput label="Category" name="sheetCat" options={selectOptions} value={null} onChange={() => {}} placeholder="Select category" />
              <DateInput label="Date" name="sheetDate" value={null} onChange={() => {}} placeholder="Select date" />
              <TextInput label="Remarks" name="sheetRemarks" value="" onChange={() => {}} placeholder="Optional notes..." multiline rows={3} />
            </div>
          </BottomSheet>

          {/* Half */}
          <BottomSheet open={sheetHalf} onClose={() => setSheetHalf(false)} title="Half Height Sheet" size="half"
            footer={<Button variant="primary" onClick={() => setSheetHalf(false)}>Done</Button>}
          >
            <p className="text-sm text-zinc-500">This sheet takes up 50% of the viewport height.</p>
          </BottomSheet>

          {/* Full */}
          <BottomSheet open={sheetFull} onClose={() => setSheetFull(false)} title="Full Height Sheet" description="Takes up 92% of the viewport." size="full"
            footer={
              <>
                <Button variant="neutral" onClick={() => setSheetFull(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setSheetFull(false)}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <TextInput key={i} label={`Field ${i + 1}`} name={`sheetField${i}`} value="" onChange={() => {}} placeholder="Enter value..." />
              ))}
            </div>
          </BottomSheet>
        </Section>

        {/* ── Toasts ── */}
        <Section title="Toast Notifications" subtitle="Sonner toasts styled to match the design system">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="success" onClick={() => toast.success('Record saved', 'The entry has been added to the ledger.')}>
                Success
              </Button>
              <Button variant="danger" onClick={() => toast.error('Action failed', 'Something went wrong. Please try again.')}>
                Error
              </Button>
              <Button variant="alert" onClick={() => toast.warning('Low balance', 'This account is below the minimum threshold.')}>
                Warning
              </Button>
              <Button variant="neutral" onClick={() => toast.info('Sync started', 'Data is being pulled from the server.')}>
                Info
              </Button>
              <Button variant="ghost" onClick={() => toast.loading('Processing...', 'Please wait while we save your changes.')}>
                Loading
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="neutral"
                onClick={() =>
                  toast.promise(
                    new Promise((res) => setTimeout(res, 2000)),
                    {
                      loading: 'Saving record...',
                      success: 'Record saved successfully!',
                      error: 'Failed to save record.',
                    },
                  )
                }
              >
                Promise Toast (2s)
              </Button>

              <Button
                variant="neutral"
                onClick={() =>
                  toast.action(
                    'Entry deleted',
                    'The record has been removed from the ledger.',
                    { label: 'Undo', onClick: () => toast.success('Restored', 'The entry has been restored.') },
                  )
                }
              >
                With Action (Undo)
              </Button>

              <Button variant="ghost" onClick={() => toast.dismiss()}>
                Dismiss All
              </Button>
            </div>
          </div>
        </Section>

        {/* Live Values Panel */}
        <Section title="Live Values" subtitle="Real-time state of all controlled inputs">
          <div className="bg-zinc-900 rounded-xl p-6 text-xs font-mono text-emerald-400 space-y-1 overflow-x-auto">
            <p><span className="text-zinc-500">textValue:</span> {JSON.stringify(textValue)}</p>
            <p><span className="text-zinc-500">emailValue:</span> {JSON.stringify(emailValue)}</p>
            <p><span className="text-zinc-500">numberValue:</span> {JSON.stringify(numberValue)}</p>
            <p><span className="text-zinc-500">textareaValue:</span> {JSON.stringify(textareaValue)}</p>
            <p><span className="text-zinc-500">selectValue:</span> {JSON.stringify(selectValue)}</p>
            <p><span className="text-zinc-500">multiValue:</span> {JSON.stringify(multiValue)}</p>
            <p><span className="text-zinc-500">dateValue:</span> {JSON.stringify(dateValue)}</p>
            <p><span className="text-zinc-500">dateRangeValue:</span> {JSON.stringify(dateRangeValue)}</p>
            <p><span className="text-zinc-500">timeValue:</span> {JSON.stringify(timeValue)}</p>
          </div>
        </Section>

      </div>
    </div>
  );
}

// ── Section wrapper ──
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-200 pb-3">
        <h2 className="text-base font-bold text-zinc-800">{title}</h2>
        <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
        {children}
      </div>
    </div>
  );
}
