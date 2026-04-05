# SmartPath — Pathology Lab Management System

> A production-grade, full-stack lab management platform built for **Prathamesh Advanced Diagnostic Center**, Nashik.  
> Handles patient registration, test bookings, sample tracking, result entry, report generation, and billing — end to end.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand, Axios, React Hook Form, Zod |
| Patient Service | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Redis (ioredis) |
| Booking Service | Node.js, Express, MongoDB (Mongoose), JWT, PDFKit, date-fns |
| Auth | JWT (RS256), RBAC with role-based middleware |
| Database | MongoDB via `MONGO_URL` |
| Cache | Redis (graceful fallback if offline) |

---

## Project Structure

```
smartpath/
├── apps/
│   └── web/                        # Next.js frontend (port 3000)
│       ├── app/
│       │   ├── (public)/           # Landing, tests catalog, about, contact
│       │   ├── (auth)/             # Login, register
│       │   ├── (patient)/          # Patient portal (dashboard, bookings, reports, profile)
│       │   └── (admin)/            # Admin panel (patients, bookings, tests, lab, billing)
│       ├── components/
│       ├── hooks/
│       ├── lib/api.ts              # All Axios API functions
│       └── store/authStore.ts      # Zustand auth store
│
├── services/
│   ├── patient-service/            # Port 3001 — Auth, Patients, Tests, Packages
│   │   └── src/
│   │       ├── models/             # Patient, Test, Package
│   │       ├── routes/             # auth, patient, test, package
│   │       ├── controllers/
│   │       ├── middleware/         # authMiddleware, authorizeRoles
│   │       └── validators/
│   │
│   └── booking-service/            # Port 3002 — Bookings, Samples, Results, Invoices
│       └── src/
│           ├── models/             # Booking, Sample, Result, Invoice
│           ├── routes/             # booking, sample, result, invoice
│           ├── controllers/
│           └── uploads/            # Generated PDFs (reports + invoices)
│
├── .env                            # Shared environment variables
├── turbo.json
└── package.json
```

---

## Roles & Permissions

| Role | Access |
|---|---|
| `admin` | Everything |
| `receptionist` | Patients, Bookings, Invoices |
| `technician` | Samples, Results (entry) |
| `pathologist` | Results (approval), Report generation |
| `patient` | Own portal — bookings, reports, profile |

---

## Environment Variables

Create a `.env` file at the root:

```env
# MongoDB
MONGO_URL=mongodb://admin:password@localhost:27017/smartpath?authSource=admin

# Redis
REDIS_URL=redis://:password@localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Service Ports
PATIENT_SERVICE_PORT=3001
BOOKING_SERVICE_PORT=3002

# Frontend
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally or via Docker
- Redis (optional — services fail gracefully without it)

### 1. Clone and install

```bash
git clone https://github.com/your-org/smartpath.git
cd smartpath
npm install
```

### 2. Start all services

```bash
# Start everything (frontend + both services) via Turborepo
npm run dev
```

Or start individually:

```bash
# Frontend — http://localhost:3000
cd apps/web && npm run dev

# Patient service — http://localhost:3001
cd services/patient-service && npm run dev

# Booking service — http://localhost:3002
cd services/booking-service && npm run dev
```

---

## API Reference

### Patient Service — `http://localhost:3001`

#### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register patient or staff |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/auth/logout` | JWT | Logout, clears cache |

#### Patients
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/patients/profile` | Any | Own profile |
| PUT | `/api/patients/profile` | Any | Update own profile |
| GET | `/api/patients` | admin, receptionist, technician, pathologist | List all patients |
| POST | `/api/patients` | admin, receptionist | Create patient |
| GET | `/api/patients/:id` | Staff | Get patient by ID |
| PUT | `/api/patients/:id` | admin, receptionist | Update patient |
| DELETE | `/api/patients/:id` | admin | Soft delete |

#### Tests & Packages
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tests/catalog` | Public | All active tests |
| GET | `/api/tests` | JWT | Paginated + search |
| POST | `/api/tests` | admin | Create test |
| PUT | `/api/tests/:id` | admin | Update test |
| DELETE | `/api/tests/:id` | admin | Soft delete |
| GET | `/api/packages` | JWT | All packages |
| POST | `/api/packages` | admin | Create package |
| PUT | `/api/packages/:id` | admin | Update package |

---

### Booking Service — `http://localhost:3002`

#### Bookings
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/bookings` | admin, receptionist, patient | Create booking |
| GET | `/api/bookings` | admin, receptionist, technician, pathologist | All bookings |
| GET | `/api/bookings/my` | patient | Own bookings |
| GET | `/api/bookings/patient/:id` | Staff + own patient | Patient bookings |
| GET | `/api/bookings/slots` | Public | Available time slots |
| GET | `/api/bookings/:id` | JWT | Booking detail |
| PUT | `/api/bookings/:id/status` | Staff | Update status |
| PUT | `/api/bookings/:id/assign` | admin, receptionist | Assign technician |
| DELETE | `/api/bookings/:id` | admin | Cancel booking |

#### Samples
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/samples` | admin, technician, receptionist | Register sample |
| GET | `/api/samples` | Staff | All samples |
| GET | `/api/samples/booking/:id` | Staff | Sample for booking |
| PUT | `/api/samples/:id/status` | admin, technician | Update status |

#### Results
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/results` | admin, technician | Enter results |
| GET | `/api/results` | Staff | All results |
| GET | `/api/results/booking/:id` | Staff | Result for booking |
| GET | `/api/results/patient/:id` | Staff + own patient | Patient results |
| PUT | `/api/results/:id/approve` | admin, pathologist | Approve result |
| PUT | `/api/results/:id/reject` | admin, pathologist | Reject with note |
| POST | `/api/results/:id/generate-report` | Staff | Generate PDF report |

#### Invoices
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/invoices` | admin, receptionist | Create invoice from booking |
| GET | `/api/invoices` | admin, receptionist | All invoices |
| GET | `/api/invoices/:id` | Staff + own patient | Invoice detail |
| PUT | `/api/invoices/:id` | admin, receptionist | Update discount/notes |
| POST | `/api/invoices/:id/payment` | admin, receptionist | Record payment |
| POST | `/api/invoices/:id/generate-pdf` | admin, receptionist | Generate invoice PDF |

---

## Frontend Pages

### Public
- `/` — Landing page
- `/tests` — Test catalog
- `/about` — About the lab
- `/contact` — Contact form

### Auth
- `/login` — Login (redirects by role)
- `/register` — Patient self-registration

### Patient Portal (`/dashboard`, `/bookings`, `/reports`, `/profile`)
- Dashboard with booking stats
- Book a test (multi-step wizard)
- Booking history and detail
- Reports list and PDF download
- Profile management

### Admin Panel (`/admin/*`)
- **Patients** — CRUD with search, add/edit modals
- **Bookings** — Full booking management, status updates
- **Tests** — Test catalog CRUD with modal forms
- **Packages** — Bundle tests into packages
- **Lab** — Sample tracking + result entry + approval
- **Billing** — Invoice generation, payment recording, PDF export
- **Staff Management** — Create staff accounts by role

---

## Auto-generated IDs

| Entity | Format | Example |
|---|---|---|
| Patient | `SP-XXXXXX` | `SP-100001` |
| Booking | `BK-XXXXXX` | `BK-100001` |
| Test | `TST-XXXX` | `TST-1001` |
| Package | `PKG-XXXX` | `PKG-1001` |
| Sample | `SMP-XXXXXX` | `SMP-100001` |
| Result | `RES-XXXXXX` | `RES-100001` |
| Invoice | `INV-XXXXXX` | `INV-100001` |

---

## PDF Generation

Both report and invoice PDFs are generated server-side using **PDFKit** and saved to:

```
services/booking-service/uploads/
├── reports/     # RES-XXXXXX.pdf
└── invoices/    # INV-XXXXXX.pdf
```

Served statically at `http://localhost:3002/uploads/...`

---

## Lab — Prathamesh Advanced Diagnostic Center

- Location: Nashik, Maharashtra
- NABL Accredited · ISO 15189 Certified
- 200+ diagnostic tests available
- 24-hour report turnaround

---

## License

Private — Prathamesh Advanced Diagnostic Center. All rights reserved.
