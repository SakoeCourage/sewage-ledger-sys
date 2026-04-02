# Reporting Module Plan

## Overview
Simulated reports for demo purposes. Data is generated client-side based on existing client, bill, and payment data structures. Backend APIs are not yet available.

---

## Report Categories

### 1. Amount Collection Report
- Monthly amount collected trend
- Collection rate % (payments / bills)
- Collections by billing rate tier (Residential, Industrial, etc.)
- Cumulative collections over time

### 2. Arrears / Outstanding Balances Report
- Clients with outstanding balances (balance brought forward)
- Aging analysis — how long debts have been unpaid
- Top debtors ranked by amount owed
- Total arrears vs. total collected

### 3. Billing Activity Report
- Bills generated per month
- Approval rate (supervisor approved vs. pending)
- Dispatch rate (dispatched vs. not dispatched)
- Individual vs. period-generated bills breakdown

### 4. Payment Analysis Report
- Payment mode distribution — Cash, Cheque, MoMo, Bank Transfer
- Payments collected per day/week/month
- Top payers by amount
- Payments by cashier (staff performance)

### 5. Client Distribution Report
- Residential vs. Industrial client split
- Clients by industry type (Hospitality, Manufacturing, Medical, etc.)
- Client growth over time (new registrations per month)
- Discharge volume distribution across clients

### 6. Staff Activity Report
- Bills generated per staff member
- Payments recorded per cashier
- Approval activity by supervisor

---

## Implementation Notes
- Route: `/reports` with tab-based navigation per report category
- All data simulated using realistic values derived from existing domain models
- Charts powered by ApexCharts (already installed)
- Date range filtering on all reports
- Export to PDF/CSV where applicable
