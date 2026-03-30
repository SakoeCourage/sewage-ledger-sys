# Ghana Sewage Ledger System — Project Plan

## Overview
A data collection and billing management system for a sewage utility company.
It records clients (individual or corporate), manages their monthly bills based
on discharge volume and billing rates, and tracks payments against those bills.

---

## API Base URL
`http://remoteledger.somee.com`

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/Auth` | Login — returns JWT token |

**LoginDTO**
```json
{ "username": "string", "password": "string" }
```

---

### Client
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/Client` | Register a new client |
| GET | `/api/Client/all` | List all clients |
| GET | `/api/Client/search?seacrchItem=` | Search clients by name/code |
| GET | `/api/Client/byCode?code=` | Get a single client with their bills & payments |

**ClientDTO (create)**
```json
{
  "clientType": "Individual | Corporate",
  "name": "string",
  "address": "string",
  "meterNo": "string",
  "tin": "string (nullable)",
  "industryType": "string",
  "dischargeVol": 0.0,
  "docID": "string (nullable)",
  "cert": "string (nullable)",
  "lease": "string (nullable)",
  "billingRateID": 0,
  "userID": 0
}
```

**ClientForViewDTO (response)**
```json
{
  "clientID": 0,
  "clientCode": "string",
  "clientType": "string",
  "name": "string",
  "address": "string",
  "meterNo": "string",
  "tin": "string",
  "industryType": "string",
  "dischargeVol": 0.0,
  "docID": "string",
  "cert": "string",
  "lease": "string",
  "currentBillingRate": {},
  "registeredBy": {},
  "bills": [ ...ClientBillForViewDTO ],
  "payments": [ ...ClientPaymentForViewDTO ]
}
```

---

### Bill
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/Bill` | Create a new bill for a client |
| GET | `/api/Bill/all` | List all bills |
| GET | `/api/Bill/byMonth?month=` | Filter bills by month |
| GET | `/api/Bill/byClient?clientCode=&month=` | Get bills for a specific client |

**BillDTO (create)**
```json
{
  "month": "string",
  "clientID": 0,
  "billingRateID": 0,
  "userID": 0,
  "isSupervisorApproved": false,
  "isDispatched": false,
  "narration": "string (nullable)"
}
```

**BillForViewDTO (response)**
```json
{
  "billID": 0,
  "month": "string",
  "code": "string",
  "dated": "datetime",
  "balanceBroughtForward": 0.0,
  "client": {},
  "billingRate": {},
  "billedBy": {},
  "isSupervisorApproved": false,
  "isDispatched": false,
  "narration": "string"
}
```

---

### Billing Rate
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/BillingRate` | Create a billing rate |
| GET | `/api/BillingRate/all` | List all billing rates |

**BillingRateDTO (create)**
```json
{ "billingType": "string", "rate": 0.0, "userID": 0 }
```

**BillingRateForViewDTO (response)**
```json
{
  "billingRateID": 0,
  "dated": "datetime",
  "billingType": "string",
  "rate": 0.0,
  "createdBy": {}
}
```

---

### Payment
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/Payment` | Record a payment from a client |
| GET | `/api/Payment/all` | List all payments |

**PaymentDTO (create)**
```json
{
  "clientID": 0,
  "paymentMode": "Cash | Cheque | MoMo | Bank Transfer",
  "refNo": "string (nullable)",
  "bank": "string (nullable)",
  "dateOnCheque": "string (nullable)",
  "amount": 0.0,
  "userID": 0
}
```

**PaymentForViewDTO (response)**
```json
{
  "paymentID": 0,
  "code": "string",
  "dated": "datetime",
  "client": {},
  "paymentMode": "string",
  "refNo": "string",
  "bank": "string",
  "dateOnCheque": "string",
  "amount": 0.0,
  "cashier": {}
}
```

---

### User
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/User` | Create a system user |
| GET | `/api/User/all` | List all users |

**UserDTO**
```json
{
  "surname": "string",
  "otherNames": "string",
  "tel": "string",
  "email": "string",
  "username": "string",
  "password": "string",
  "roles": [ ...RoleForViewDTO ]
}
```

---

### Role
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/Role` | Create a role |
| GET | `/api/Role/all` | List all roles |
| GET | `/api/Role/{id}` | Get role by ID |

---

## Pages & Sidebar Plan

### Main Navigation
| Label | Route | API Used |
|-------|-------|----------|
| Dashboard | `/dashboard` | Bills + Payments + Clients (summary counts) |
| Clients | `/clients` | `GET /api/Client/all` |
| Billing | `/billing` | `GET /api/Bill/all`, `/byMonth` |
| Payments | `/payments` | `GET /api/Payment/all` |

### Sub-pages (not in sidebar)
| Label | Route | Description |
|-------|-------|-------------|
| New Client | `/clients/new` | `POST /api/Client` |
| Client Detail | `/clients/[code]` | `GET /api/Client/byCode` — shows ledger (bills + payments) |
| New Bill | `/billing/new` | `POST /api/Bill` |
| New Payment | `/payments/new` | `POST /api/Payment` |

### Configuration (Settings group)
| Label | Route | API Used |
|-------|-------|----------|
| Billing Rates | `/settings/billing-rates` | `GET/POST /api/BillingRate` |
| Users | `/settings/users` | `GET/POST /api/User` |
| Roles | `/settings/roles` | `GET/POST /api/Role` |

---

## Key Notes
- `clientType` distinguishes **Individual** vs **Corporate** clients
- Bills have a `balanceBroughtForward` — ledger carries over unpaid amounts
- Bills require **supervisor approval** (`isSupervisorApproved`) and can be **dispatched** (`isDispatched`)
- Payments support multiple modes: Cash, Cheque, MoMo, Bank Transfer
- All write operations require a `userID` — auth token will carry this
- The `clientCode` is the primary lookup key for a client's full ledger
