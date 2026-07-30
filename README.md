# DocSlot — Smart Doctor Appointment Booking System

A Practo-style doctor appointment booking platform built as part of the Kalvium Integrated Work Sprint (TEAM01). Doctors define recurring weekly availability, which the system automatically converts into individual bookable time slots. Patients search, book, and manage appointments against real-time availability.

## Team

**TEAM01**
- Shauryvardhan Undre — Slot generation, booking validation, double-booking prevention
- Mohammed Aamir — Appointment history, pagination, doctor search & profile
- Sohini Tandon — Doctor dashboard, RBAC, timezone-safe scheduling logic

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Forms & Validation:** React Hook Form + Zod
- **Database:** Neon PostgreSQL
- **ORM:** Prisma
- **Auth:** NextAuth (Auth.js) v5 — Credentials Provider, JWT sessions
- **Password Hashing:** bcryptjs
- **Deployment:** Vercel + Neon

## Features

- Role-based auth (Doctor / Patient) with protected routes
- Doctors define weekly schedules → system auto-generates bookable slots
- Patients search doctors, view profiles, and book appointments
- Field-level form validation (email, phone, required fields)
- Database-level double-booking prevention (transaction-based)
- Paginated appointment history with cancel functionality
- Doctor dashboard showing only today's confirmed appointments by default

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### Setup

1. Clone the repo and install dependencies:
```bash
   git clone <repo-url>
   cd docslot
   npm install
```

2. Copy the environment template and fill in your values:
```bash
   cp .env.example .env
```
   - `DATABASE_URL` — your Neon connection string
   - `AUTH_SECRET` — generate with `npx auth secret`

3. Run the database migration:
```bash
   npx prisma migrate dev
```

4. Start the dev server:
```bash
   npm run dev
```

5. Visit `http://localhost:3000`

## Project Structure

src/
├── app/ # Routes (App Router) — (auth), doctor/, patient/, api/
├── actions/ # Server Actions — form submission entry points
├── services/ # Business logic (slot generation, pagination, etc.)
├── components/ # UI components, organized by feature
├── validations/ # Zod schemas
├── lib/ # Shared utilities (Prisma client, auth config)
└── types/ # Shared TypeScript types

prisma/
├── schema.prisma # Database schema
└── migrations/ # Migration history


## Testing

A full backend integration test is available, verifying the complete chain from schedule creation through booking to history/dashboard reflection:

```bash
npx tsx src/scripts/full-integration-test.ts
```

Double-booking prevention can be verified under a real race condition with:

```bash
npx tsx src/scripts/verify-double-booking-prevention.ts
```

## Scope Notes

This is a scoped MVP built within a fixed sprint timeline. The following were intentionally excluded: payment processing, video consultation, in-app chat/notifications, ratings & reviews, and an Admin Dashboard (though the data model includes a `DoctorStatus` field to support an approval workflow in a future cycle without requiring a schema migration).