# High-Level Design: DocSlot

## 1. Architecture Overview

DocSlot is a single, unified Next.js 16 (App Router) full-stack application — no separate frontend/backend repositories. The App Router's Route Handlers and Server Actions serve as the backend layer within the same codebase.

┌─────────────────────────────────────────────────┐
│ Browser (Client) │
│ React Components (Server + Client Components) │
└───────────────────────┬───────────────────────────┘
│
┌───────────────────────▼───────────────────────────┐
│ Next.js App Router (Vercel) │
│ ┌───────────┐ ┌──────────────┐ ┌─────────────┐ │
│ │ Pages │ │ Server │ │ Middleware │ │
│ │ (Server │ │ Actions │ │ (RBAC / │ │
│ │ Components)│ │ │ │ proxy.ts) │ │
│ └─────┬──────┘ └──────┬───────┘ └──────────────┘ │
└────────┼────────────────┼────────────────────────────┘
│ │
┌────────▼────────────────▼────────────────────────────┐
│ Services Layer (business logic) │
│ scheduleService · slotService · bookingActions │
│ appointmentHistoryService · doctorDashboardService │
└────────────────────────┬───────────────────────────────┘
│
┌─────────────────────────▼──────────────────────────────┐
│ Prisma ORM (type-safe client) │
└─────────────────────────┬──────────────────────────────┘
│
┌─────────────────────────▼──────────────────────────────┐
│ Neon PostgreSQL (serverless) │
└────────────────────────────────────────────────────────┘


## 2. Major Components

| Component | Responsibility |
|---|---|
| **Auth (NextAuth v5)** | Credentials-based login, JWT sessions, role embedded in token |
| **Middleware (`proxy.ts`)** | Route-level RBAC — blocks cross-role access before a page renders |
| **Services** | Pure business logic (slot generation, pagination, dashboard stats) — testable independent of HTTP |
| **Server Actions** | Thin wrappers around services; handle validation and are the client-callable entry points |
| **Prisma + Neon** | Type-safe schema-as-source-of-truth; serverless Postgres that scales to zero |

## 3. Data Flow: Booking an Appointment

1. Patient loads Book Appointment page → Server Component fetches real available slots directly from Neon via Prisma
2. Patient selects a slot, submits the form → Server Action validates input via Zod
3. Server Action runs a Prisma `$transaction`: updates the slot's `isBooked` flag conditionally (`where: { isBooked: false }`) and creates the `Appointment` row atomically
4. If the slot was taken between page load and submit, the transaction fails cleanly and a "slot just taken" error returns
5. On success, the patient is redirected to their appointment history, which reflects the new booking immediately (no client-side cache to invalidate — data is re-fetched server-side on navigation)

## 4. Deployment Architecture

- **Hosting:** Vercel (native Next.js support, zero-config CI from GitHub)
- **Database:** Neon PostgreSQL, single shared instance across environments
- **Environment variables:** `DATABASE_URL`, `AUTH_SECRET` — managed via Vercel's environment settings, never committed

## 5. Key Design Decisions

- **Database-level double-booking prevention** over application-only checks — a unique constraint on `AppointmentSlot(scheduleId, date, startTime)` plus a unique `Appointment.slotId` guarantee correctness even under race conditions.
- **Route segments over route groups for role separation** (`/doctor/*`, `/patient/*` as real URL segments) — makes middleware matching simple and avoids path collisions.
- **Server Components by default** — data-heavy pages fetch directly from the database at render time, minimizing client-side loading states.
