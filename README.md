# WedaMate (වැඩMate) — Local Services. Made Easy.

<div align="center">
  <img src="client/public/logo.png" alt="WedaMate Official Logo" width="220" />
  <p><strong>Sri Lanka's Premier On-Demand Local Services & "Drive My Vehicle" Marketplace</strong></p>
  <p>
    Built with the <strong>MERN Stack</strong> (MongoDB, Express.js, React 19, Node.js) • Pure JavaScript • Tailwind CSS • Vite
  </p>
</div>

---

## 🌟 Executive Overview & Problem Statement

In Sri Lanka, finding reliable household technicians, electricians, plumbers, and emergency vehicle assistance often relies on scattered WhatsApp groups, roadside notices, or word-of-mouth with no price transparency or quality assurance.

Furthermore, vehicle owners across the Western Province (Colombo, Negombo, Gampaha, Panadura) face a distinct, acute challenge:
- **Vehicle Ownership without a Dedicated Chauffeur:** Many families, elderly citizens, and professionals own cars, SUVs, or vans but frequently need a temporary, professional driver for airport runs (Bandaranaike International Airport / BIA), medical appointments, inter-district outstation tours (Kandy, Galle, Nuwara Eliya), wedding events, or late-night returns.
- Standard ride-hailing apps (Uber, PickMe) force customers to pay for *another person's vehicle*.
- **WedaMate's Primary Differentiator:** **"Drive My Vehicle"** — a specialized flow connecting vehicle owners directly with vetted, licensed drivers to operate the customer's *own* private vehicle, with vehicle type matching (Car/SUV/Van/Pickup), transmission matching (Automatic/Manual), tiered pricing (hourly, half-day, full-day in LKR), and specific driving-skill review metrics.

---

## 🚀 Key Feature Sets

### 1. Dual Marketplace Ecosystem
- **Local Services Catalog:** Browse verified service providers across plumbing, electrical & solar, AC repair, home cleaning, vehicle maintenance, carpentry, painting, and tutoring.
- **Dedicated "Drive My Vehicle" Hub:** Specialized search, filtering by transmission skill (Manual, Automatic, Both), vehicle categories vetted to drive, minimum experience years, driving skill ratings (out of 5★), and real-time dispatch availability.

### 2. Sri Lankan Geography & Currency Engine
- Native localized coverage across Western Province corridors: **Colombo** (Fort, Kollupitiya, Borella, Dehiwala), **Gampaha** (Negombo, Ja-Ela, Wattala, Katunayake/BIA), **Kalutara** (Panadura, Wadduwa), and outstation trip capabilities.
- Currency in Sri Lankan Rupees (**LKR**), transparent transparent checkout calculations, 10% platform commission deduction, and PayHere gateway readiness.

### 3. Role-Based Access Control (RBAC) & Four Dashboards
- 👤 **Customer Portal:** Browse services/drivers, manage private vehicles, track active bookings, instant messaging, and leave post-completion reviews with specialized sub-scores.
- 👷 **Service Provider Hub:** Manage offered services, set service areas, accept/decline customer jobs, send custom quotes for complex tasks, set availability calendar, and track net earnings.
- 🚗 **Driver Dispatch Hub:** Real-time Online/Offline toggle, trip logs, vehicle preferences, hourly & daily rate management, and license verification tracking.
- 👑 **Platform Command Center (Admin):** Executive analytics (Gross Volume, Net Platform Revenue, Completion Rates), user moderation & suspension, KYC & driving license audit panel, booking status overrides, review suppression, and economic parameters configuration (take rate %, base fee, driver wage floor).

### 4. Robust Operational Guards
- **Strict Double-Booking Prevention:** Automatically rejects overlapping bookings for the same provider/driver on matching dates and time slots.
- **Trust & Quality Guardrails:** Reviews can only be submitted for bookings in `completed` status; duplicate reviews are prevented at the database level.
- **Zero-Setup Database Fallback:** Automatic in-memory embedded MongoDB server with automatic seed population if no external MongoDB URI is supplied, ensuring immediate runability on any developer machine.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7, Lucide Icons |
| **Backend** | Node.js (ES Modules), Express.js |
| **Database** | MongoDB with Mongoose ODM (or zero-config `mongodb-memory-server` fallback) |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing, Role Middleware |
| **Language** | 100% Modern JavaScript (ES6+) — **No TypeScript** |

---

## 📂 Project Architecture

```
WedaMate/
├── package.json                   # Root monorepo scripts (concurrently dev, seed, test)
├── README.md                      # Comprehensive developer manual & documentation
│
├── server/                        # Express API Backend
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── app.js                 # Express app configuration & middleware
│   │   ├── server.js              # Server entry point & graceful shutdown
│   │   ├── config/
│   │   │   ├── constants.js       # Roles, booking statuses, Sri Lankan districts
│   │   │   └── db.js              # Mongo connection & MongoMemoryServer fallback
│   │   ├── models/                # 16 Mongoose Schemas (User, Booking, DriverProfile, etc.)
│   │   ├── controllers/           # API handlers (auth, bookings, drivers, admin, etc.)
│   │   ├── routes/                # Express routers with role authorization guards
│   │   ├── middleware/            # JWT protect, role authorize, upload, error handler
│   │   ├── services/              # Payment math, notification dispatch, map abstractions
│   │   └── seed/
│   │       ├── seed.js            # Seeder engine with 4 standard demo accounts
│   │       └── seedData.js        # Sri Lankan categories, services & locations
│   └── tests/
│       └── api.test.js            # 9/9 Automated Node test suite
│
└── client/                        # React Frontend (Vite)
    ├── package.json
    ├── vite.config.js             # Vite config with /api & /uploads proxy to port 5000
    ├── public/
    │   └── logo.png               # Official WedaMate logo asset
    └── src/
        ├── App.jsx                # Router assembly & route guards
        ├── main.jsx               # React entry point
        ├── index.css              # Design tokens, Google Fonts, Tailwind imports
        ├── context/               # AuthContext, ToastContext, NotificationContext
        ├── routes/                # ProtectedRoute, RoleRoute
        ├── services/              # Axios-free standardized API client & service wrappers
        ├── components/
        │   ├── ui/                # Button, Input, Modal, Badge, Card, Avatar, Rating, Logo
        │   ├── layout/            # Navbar, Footer, Sidebar, MobileBottomNav
        │   └── cards/             # ProviderCard, DriverCard, ServiceCard, BookingCard
        └── pages/
            ├── auth/              # LoginPage (with 1-click demo buttons), RegisterPage
            ├── public/            # HomePage, ServicesPage, DriversPage, Details, Contact
            ├── customer/          # Dashboard, Bookings, Vehicles, Messages, Profile
            ├── provider/          # Dashboard, Services, Quotes, Availability, Earnings
            ├── driver/            # DriverDashboard (Dispatch Hub), DriverProfile
            └── admin/             # 10 Admin modules (Analytics, Users, Drivers, KYC, etc.)
```

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later recommended)
- `npm` (v9 or later)
- *Note:* Local MongoDB installation is **NOT** required; an embedded in-memory MongoDB instance will automatically initialize and seed itself if no `MONGODB_URI` is provided.

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/wedamate.git
cd wedamate

# Install all dependencies across root, server, and client in one command
npm run install:all
```

### 2. Environment Variables Configuration
Configure environment variables if you want to connect to an external MongoDB instance:

**Server Environment (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=wedamate_super_secret_jwt_key_2026_srilanka
JWT_EXPIRE=30d
# Optional: MONGODB_URI=mongodb://localhost:27017/wedamate
# If left commented or omitted, embedded MongoDB automatically runs!
```

### 3. Run the Development Server
Run backend and frontend simultaneously with a single command:
```bash
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login Ready)

You can sign in instantly using the **1-Click Demo Buttons** on the `/login` screen or with the credentials below:

| Role | Email | Password | Dashboard URL | Capabilities |
|---|---|---|---|---|
| **👑 Admin** | `admin@wedamate.local` | `admin123` | `/admin` | Full analytics, KYC audit, user management, fee control |
| **👤 Customer** | `customer@wedamate.local` | `customer123` | `/dashboard` | Book services, hire drivers, register private vehicles |
| **👷 Provider** | `provider@wedamate.local` | `provider123` | `/provider/dashboard` | Manage services, accept jobs, send quotes, view earnings |
| **🚗 Driver** | `driver@wedamate.local` | `driver123` | `/driver/dashboard` | Online/Offline dispatch toggle, drive customer vehicles |

---

## 🧪 Automated Testing

WedaMate includes a comprehensive automated test suite testing auth, authorization, pricing models, double-booking prevention, and review submission rules:

```bash
npm test
```

### Test Suite Coverage:
```
✔ 1. Authentication - Register Customer, Provider, Driver, Admin
✔ 2. Authentication - Login successfully and verify JWT token
✔ 3. Authorization - Role guards protect Admin endpoints from Customers
✔ 4. Booking Creation - Customer books a service with fee calculation
✔ 5. Double-Booking Prevention - Rejects overlapping booking on same slot
✔ 6. Provider Booking Acceptance & Transition to Completed
✔ 7. Drive My Vehicle - Dedicated Driver booking with vehicle metadata
✔ 8. Reviews - Guard against reviewing incomplete bookings
✔ 9. Reviews - Submit review on completed booking and prevent duplicate
```

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details. Built with pride for Sri Lanka.
