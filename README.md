# SmartPath — Pathology Lab Management System

> A production-grade, full-stack lab management platform built for **Prathamesh Advanced Diagnostic Center**, Nashik.  
> Handles patient registration, test bookings, sample tracking, result entry, report generation, billing, and patient reviews — end to end.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 14 (App Router), Tailwind CSS, Zustand, Axios, React Hook Form, Zod |
| Auth | JWT (custom) + NextAuth.js (Google OAuth), RBAC middleware |
| Patient Service | Node.js, Express, MongoDB (Mongoose), bcrypt, Redis |
| Booking Service | Node.js, Express, MongoDB (Mongoose), PDFKit, date-fns |
| Payments | Razorpay (orders + webhook verification) |
| Database | MongoDB via `MONGO_URL` |
| Cache | Redis (graceful fallback if offline) |

---

## Project Structure

```
smartpath/
├── apps/
│   └── web/                          # Next.js frontend (port 3000)
│       ├── app/
│       │   ├── (public)/             # Landing, tests catalog, about, contact
│       │   ├── (auth)/               # Login, register
│       │   ├── (patient)/            # Patient portal — dashboard, bookings, reports, profile
│       │   ├── (admin)/              # Staff panel — patients, bookings, tests, lab, billing
│       │   ├── auth/google/callback/ # Google OAuth callback handler
│       │   └── api/auth/[...nextauth]/ # NextAuth.js route
│       ├── components/
│       │   ├── admin/                # StatsRow, RevenueChart, BookingsTable, PatientsList
│       │   ├── booking/              # Multi-step booking wizard components
│       │   ├── landing/              # Hero, Features, Testimonials, etc.
│       │   ├── layout/               # Navbar, Sidebar, AdminSidebar, Footer, MobileNav
│       │   ├── patient/              # ReviewModal
│       │   └── shared/               # ConfirmDialog, LoadingSpinner, EmptyState
│       ├── hooks/
│       │   └── useAuth.ts            # Unified auth hook (smartpath_token + NextAuth)
│       ├── lib/api.ts                # All Axios API functions
│       ├── store/authStore.ts        # Zustand auth store
│       └── middleware.ts             # Edge middleware — RBAC + route protection
│
├── services/
│   ├── patient-service/              # Port 3001 — Auth, Patients, Tests, Packages, Reviews
│   │   └── src/
│   │       ├── models/               # Patient, Test, Package, Review
│   │       ├── routes/               # auth, patient, test, package, review
│   │       ├── controllers/
│   │       ├── middleware/           # authMiddleware, authorizeRoles
│   │       └── validators/
│   │
│   └── booking-service/              # Port 3002 — Bookings, Samples, Results, Invoices, Payments
│       └── src/
│           ├── models/               # Booking, Sample, Result, Invoice
│           ├── routes/               # booking, sample, result, invoice, payment
│           ├── controllers/
│           └── uploads/              # Generated PDFs (reports + invoices)
│
├── scripts/
│   ├── seed-db.js                    # Seed admin, staff, patients, tests, packages
│   └── reset-db.js                   # Wipe all collections
│
├── .env                              # Shared environment variables (both services)
├── turbo.json
└── package.json
```

---

## Roles & Access

| Role | Routes | Capabilities |
|---|---|---|
| `admin` | `/admin/*` | Everything — full CRUD, staff management, reports |
| `receptionist` | `/admin/*` | Patients, bookings, invoices, billing |
| `lab_technician` | `/admin/*` | Samples, result entry |
| `pathologist` | `/admin/*` | Result approval, report generation |
| `patient` | `/dashboard`, `/bookings`, `/reports`, `/profile` | Own portal only |

---

## Environment Variables

### Root `.env` (shared by both services)

```env
NODE_ENV=development

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

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

### `apps/web/.env.local` (frontend only)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_string_here

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally or via Docker
- Redis (optional — services degrade gracefully without it)

### 1. Install

```bash
git clone https://github.com/your-org/smartpath.git
cd smartpath
npm install
```

### 2. Configure environment

Fill in the env files (already present in the repo):

- `.env` — root, shared by both services
- `apps/web/.env.local` — frontend only (NextAuth + Google OAuth)

### 3. Seed the database

```bash
npm run seed-db
```

This creates:
- Admin: `admin@prathamesh.com` / `Admin@123`
- Lab Tech: `tech1@prathamesh.com` / `Tech@123`
- Lab Tech: `tech2@prathamesh.com` / `Tech@123`
- Pathologist: `path1@prathamesh.com` / `Path@123`
- Receptionist: `reception1@prathamesh.com` / `Reception@123`
- 5 sample patients (`amit@gmail.com`, `priya@gmail.com`, etc.) / `Patient@123`
- 40 diagnostic tests across 6 categories
- 6 health packages

To wipe and re-seed:

```bash
npm run reset-db && npm run seed-db
```

### 4. Start all services

```bash
npm run dev
```

Or individually:

```bash
cd apps/web && npm run dev           # http://localhost:3000
cd services/patient-service && npm run dev   # http://localhost:3001
cd services/booking-service && npm run dev   # http://localhost:3002
```

---

## Authentication

SmartPath uses a dual auth system:

### Email / Password
- `POST /api/auth/login` → returns JWT stored in `localStorage` + cookie
- Middleware reads `smartpath_token` cookie for RBAC
- `useAuth()` hook verifies token via `/api/auth/me` on mount

### Google OAuth
- Powered by NextAuth.js (`next-auth`)
- On callback, calls `POST /api/auth/google-oauth` on patient-service to register/login
- Returns a SmartPath JWT stored identically to email/password flow
- Middleware also checks NextAuth session token as fallback

### Route Protection

| Path | Protection |
|---|---|
| `/admin/*` | Staff only (non-patients) — finer role checks in `(admin)/layout.tsx` |
| `/dashboard`, `/bookings`, `/reports`, `/profile`, `/portal` | Patients only |
| `/login`, `/register` | Redirects authenticated users to their home |
| `/`, `/tests`, `/about`, `/contact` | Public |

---

## API Reference

### Patient Service — `http://localhost:3001`

#### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register patient |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/google-oauth` | Public | Google OAuth register/login |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/auth/logout` | JWT | Logout, clears Redis cache |

#### Patients
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/patients/profile` | Any | Own profile |
| PUT | `/api/patients/profile` | Any | Update own profile |
| GET | `/api/patients` | Staff | List all patients |
| POST | `/api/patients` | admin, receptionist | Create patient |
| GET | `/api/patients/:id` | Staff | Get by ID |
| PUT | `/api/patients/:id` | admin, receptionist | Update |
| DELETE | `/api/patients/:id` | admin | Delete |

#### Tests & Packages
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tests/catalog` | Public | All active tests |
| GET | `/api/tests` | JWT | Paginated + search |
| POST | `/api/tests` | admin | Create |
| PUT | `/api/tests/:id` | admin | Update |
| DELETE | `/api/tests/:id` | admin | Delete |
| GET | `/api/packages` | JWT | All packages |
| POST | `/api/packages` | admin | Create |
| PUT | `/api/packages/:id` | admin | Update |

#### Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | Public | Approved reviews (for landing page) |
| POST | `/api/reviews` | patient | Submit review for a completed booking |
| GET | `/api/reviews/booking/:bookingId` | JWT | Check if booking has a review |

---

### Booking Service — `http://localhost:3002`

#### Bookings
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/bookings` | admin, receptionist, patient | Create |
| GET | `/api/bookings` | Staff | All bookings |
| GET | `/api/bookings/stats` | Staff | Dashboard stats + revenue chart |
| GET | `/api/bookings/my` | patient | Own bookings |
| GET | `/api/bookings/slots` | Public | Available time slots |
| GET | `/api/bookings/:id` | JWT | Booking detail |
| PUT | `/api/bookings/:id/status` | Staff | Update status |
| DELETE | `/api/bookings/:id` | admin | Cancel |

#### Samples
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/samples` | admin, lab_technician, receptionist | Register sample |
| GET | `/api/samples` | Staff | All samples |
| GET | `/api/samples/booking/:id` | Staff | Sample for booking |
| PUT | `/api/samples/:id/status` | admin, lab_technician | Update status |

#### Results
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/results` | admin, lab_technician | Enter results |
| GET | `/api/results` | Staff | All results |
| GET | `/api/results/booking/:id` | Staff | Result for booking |
| GET | `/api/results/patient/:id` | Staff + own patient | Patient results |
| PUT | `/api/results/:id/approve` | admin, pathologist | Approve |
| PUT | `/api/results/:id/reject` | admin, pathologist | Reject with note |
| POST | `/api/results/:id/generate-report` | Staff | Generate PDF |

#### Invoices & Payments
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/api/invoices` | admin, receptionist | Create from booking |
| GET | `/api/invoices` | admin, receptionist | All invoices |
| GET | `/api/invoices/:id` | Staff + own patient | Detail |
| PUT | `/api/invoices/:id` | admin, receptionist | Update discount/notes |
| POST | `/api/invoices/:id/payment` | admin, receptionist | Record cash/offline payment |
| POST | `/api/invoices/:id/generate-pdf` | admin, receptionist | Generate PDF |
| POST | `/api/payments/create-order` | JWT | Create Razorpay order |
| POST | `/api/payments/verify` | JWT | Verify payment signature |
| POST | `/api/payments/webhook` | Public (HMAC verified) | Razorpay webhook |

---

## Frontend Pages

### Public
- `/` — Landing page with hero, features, popular tests, live patient reviews
- `/tests` — Full test catalog with search
- `/about` — About the lab
- `/contact` — Contact form

### Auth
- `/login` — Email/password + Google OAuth
- `/register` — 3-step patient self-registration (auto-logs in on completion)

### Patient Portal
| Route | Description |
|---|---|
| `/dashboard` | Stats (total, completed, in-progress, cancelled bookings) + recent bookings |
| `/bookings` | Booking history with filters, cancel, pay, and review options |
| `/bookings/:id` | Booking detail with timeline and invoice |
| `/book-test` | Multi-step test booking wizard |
| `/reports` | Lab reports list |
| `/reports/:id` | Report detail + PDF download |
| `/profile` | Profile management |

### Staff Panel (`/admin/*`)
| Route | Description |
|---|---|
| `/admin` | Admin dashboard — live stats, revenue chart, recent bookings & patients |
| `/admin/patients` | Patient list with search and CRUD |
| `/admin/bookings` | All bookings with filters and status management |
| `/admin/tests` | Test catalog management |
| `/admin/packages` | Health package management |
| `/admin/lab` | Sample tracking + result entry |
| `/admin/lab/results/:id` | Result detail and approval |
| `/admin/billing` | Invoice list |
| `/admin/billing/:id` | Invoice detail + payment recording |
| `/admin/reports` | Reports overview |
| `/admin/staff` | Create staff accounts (admin only) |

### Staff Dashboards (role-specific landing pages)
| Role | Landing Route |
|---|---|
| admin | `/admin` |
| lab_technician / pathologist | `/admin/lab` |
| receptionist | `/admin/bookings` |

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

Report and invoice PDFs are generated server-side with **PDFKit** and saved to:

```
services/booking-service/uploads/
├── reports/      # RES-XXXXXX.pdf
└── invoices/     # INV-XXXXXX.pdf
```

Served statically at `http://localhost:3002/uploads/...`

---

## Patient Reviews

Patients can leave a review after a completed booking from the bookings page. Reviews are stored in MongoDB and displayed live on the landing page testimonials carousel. The carousel falls back to static reviews if the API is unreachable.

---

## Database Scripts

```bash
npm run seed-db    # Seed all collections with realistic data
npm run reset-db   # Wipe all collections (irreversible)
```

---

## Lab Info

- **Name:** Prathamesh Advanced Diagnostic Center
- **Location:** Nashik, Maharashtra
- **Tests:** 40+ across Hematology, Biochemistry, Thyroid, Urine, Immunology, Hormones
- **Packages:** 6 curated health packages (Basic, Full Body, Diabetes, Cardiac, Women's, Thyroid)
- **Turnaround:** 1–48 hours depending on test

---

## License

Private — Prathamesh Advanced Diagnostic Center. All rights reserved.
