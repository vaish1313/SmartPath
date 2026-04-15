# SmartPath — Pathology Lab Management System

> Modern lab management platform for **Prathamesh Advanced Diagnostic Center**, Nashik.

---

## 🚀 Features

- **Patient Portal** - Dashboard, bookings, reports, payments, profile
- **Admin Panel** - Patients, bookings, lab, billing, staff, reviews
- **Payment Integration** - Razorpay test mode
- **Report Generation** - Automated PDF reports
- **Role-Based Access** - Admin, Receptionist, Lab Tech, Pathologist, Patient

---

## 🛠️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand  
**Backend:** Node.js, Express, MongoDB, Redis  
**Auth:** JWT + NextAuth (Google OAuth)  
**Payments:** Razorpay | **PDF:** Puppeteer

---

## 📁 Structure

```
smartpath/
├── apps/web/              # Next.js frontend (port 3000)
├── services/
│   ├── patient-service/   # Auth, Patients, Tests (port 3001)
│   └── booking-service/   # Bookings, Lab, Billing (port 3002)
└── scripts/               # Database seed/reset
```

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Start MongoDB & Redis
docker run -d -p 27017:27017 --name mongodb mongo
docker run -d -p 6379:6379 --name redis redis

# 3. Seed database
npm run seed-db

# 4. Start all services
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Patient Service: http://localhost:3001
- Booking Service: http://localhost:3002

**Test Credentials:**
- Admin: `admin@prathamesh.com` / `Admin@123`
- Patient: `amit@gmail.com` / `Patient@123`

---

## ⚙️ Environment Setup

### `.env` (root)
```env
MONGO_URL=mongodb://admin:your_password@localhost:27017/smartpath?authSource=admin
REDIS_URL=redis://:your_password@localhost:6379
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### `apps/web/.env.local`
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
PATIENT_SERVICE_URL=http://localhost:3001
BOOKING_SERVICE_URL=http://localhost:3002
```

---

## 💳 Payment Testing

**Test Card:** `4111 1111 1111 1111` | **CVV:** `123` | **Expiry:** `12/25`

Get keys: https://dashboard.razorpay.com/app/keys

---

## 🔐 Roles

| Role | Access |
|---|---|
| Admin | Full access |
| Receptionist | Patients, bookings, billing |
| Lab Technician | Samples, results |
| Pathologist | Result approval, reports |
| Patient | Own portal |

---

## 📊 Commands

```bash
npm run dev        # Start all services
npm run seed-db    # Seed test data
npm run reset-db   # Wipe database
npm run build      # Build all packages
```

---

## 🏥 Lab Info

**Prathamesh Advanced Diagnostic Center**  
Near Old CBS, Nashik — 422001  
📞 +91 98765 43210 | ✉️ hello@padc.in  
40+ tests | 6 packages | NABL Accredited

---

**Built with ❤️ for Prathamesh Advanced Diagnostic Center**
