# Product Requirements Document: DocSlot

**Smart Doctor Appointment Booking System**

|  |  |
| :---- | :---- |
| **Team** | TEAM01 — Shauryvardhan Undre, Mohammed Aamir, Sohini Tandon |
| **Program** | Kalvium — Integrated Work Sprint |
| **Timeline** | 22 days (fixed) |
| **Status** | In development |
| **Document version** | 1.0 |

---

## 1\. Overview

### 1.1 Problem Statement

Booking a doctor's appointment today is fragmented and manual — patients call clinics, wait on hold, or show up without knowing if a doctor is actually available. Doctors, meanwhile, have no simple way to publish their real availability or see who's coming in on a given day without checking a separate register or spreadsheet.

DocSlot is a Practo-style appointment booking platform that solves this by letting doctors define recurring weekly availability, which the system automatically converts into individual, bookable time slots. Patients search, book, and manage appointments against real-time availability; doctors get a clean daily view of who's arriving.

### 1.2 Goals

- Ship a working, demo-ready MVP within the fixed 22-day sprint window  
- Build a resume-worthy, production-patterned full-stack application (not a toy project)  
- Give each team member a fully-owned, end-to-end vertical they can independently explain and defend to judges  
- Implement real Kalvium curriculum concepts (App Router, Server Actions, middleware, Prisma, pagination) in a genuine product context, not isolated exercises

### 1.3 Non-Goals (explicitly out of scope for this cycle)

| Excluded | Reason |
| :---- | :---- |
| Payment gateway | Not required for MVP demo |
| Video consultation | Out of 22-day scope |
| AI chatbot / in-app chat | Out of 22-day scope |
| Notifications (SMS/email) | Out of 22-day scope |
| Ratings & reviews | Out of 22-day scope |
| Prescription upload | Out of 22-day scope |
| Multi-language support | Out of 22-day scope |
| **Admin Dashboard** | Deferred — see §1.4. Schema is prepared for it, but no UI is built this cycle. |

### 1.4 Deferred: Admin Dashboard

An Admin Dashboard (platform overview, doctor approval workflow, patient activity) was part of the original design reference but is **not** in scope for this 22-day cycle — it would add an estimated 3-4 days the team cannot spare.

**Forward-compatibility decision:** the `Doctor` model includes a `status` field (`PENDING | APPROVED | REJECTED`) from the initial schema design, at zero cost today, so an Admin approval flow can be added later as an isolated `(admin)` route group without requiring a schema migration or touching existing Doctor/Patient code.

---

## 2\. Target Users

| User | Needs |
| :---- | :---- |
| **Patient** | Find a doctor quickly, see real availability, book without double-booking risk, track appointment history, cancel if needed |
| **Doctor** | Define availability once and have bookable slots generate automatically, see exactly who's arriving today without digging through a full calendar |

---

## 3\. Technology Stack

| Layer | Choice | Rationale |
| :---- | :---- | :---- |
| Framework | Next.js 16 (App Router) | Single full-stack app — no separate frontend/backend repos |
| Language | TypeScript | Better Prisma type inference; industry standard; resume value |
| Styling | Tailwind CSS | Speed of iteration for a 22-day timeline |
| Forms & Validation | React Hook Form \+ Zod | Shared validation schema between client and server — no duplicated rules |
| Database | Neon PostgreSQL | Serverless Postgres; scales to zero when idle, fits a student project's usage pattern |
| ORM | Prisma | Type-safe queries; schema-as-source-of-truth; strong TypeScript integration |
| Auth | NextAuth (Auth.js) v5, Credentials Provider | Email/password auth with JWT sessions; no third-party OAuth complexity needed for MVP |
| Password hashing | bcryptjs | Industry-standard hashing, never store plaintext |
| Deployment | Vercel \+ Neon | Native Next.js hosting; zero-config CI from GitHub |
| Version control | Git \+ GitHub | Feature-branch workflow, one merge at a time |

**Architecture principle:** one unified Next.js application — no MERN-style separate frontend/backend. Route Handlers and Server Actions serve as the backend layer within the same codebase.

---

## 4\. Data Model

Core entities and their relationships:

- **User** — base identity/auth record (email, hashed password, role: `DOCTOR` | `PATIENT`)  
- **Doctor** — role-specific profile (specialization, consultation fee, `status` field prepared for future admin approval)  
- **Patient** — role-specific profile (date of birth, gender)  
- **Schedule** — a doctor's recurring weekly availability pattern (day of week, start/end time, slot duration)  
- **AppointmentSlot** — an individual bookable time slot generated from a `Schedule` for a specific calendar date; enforces a database-level `@@unique` constraint on `(scheduleId, date, startTime)` as the first layer of double-booking prevention  
- **Appointment** — the actual booking record linking a `Patient`, `Doctor`, and a single `AppointmentSlot` (enforced one-to-one via a unique `slotId`) as the second layer of double-booking prevention; carries a status (`CONFIRMED | CANCELLED | COMPLETED`)

**Key design decision:** double-booking is prevented at the **database level** via unique constraints, not solely through application-level checks — this means the guarantee holds even under race conditions (two patients booking the same slot simultaneously).

---

## 5\. Feature Requirements & Ownership

Each feature is owned end-to-end (backend service → Server Action → frontend UI) by one team member, so every person can independently explain their full vertical to judges.

### 5.1 Slot Generation & Booking Validation — Shauryvardhan Undre

**Requirement:** *"Practo wants an appointment system with doctor-specific time slots generated from a schedule."* Doctors define a recurring weekly schedule; the system automatically generates individual bookable `AppointmentSlot` records for real calendar dates. Patients booking through the form receive field-level validation errors (not generic error banners) for invalid email, phone, date, or already-unavailable slots.

**Acceptance criteria:**

- Doctor can create/edit a weekly schedule (day, start time, end time, slot duration)  
- Slots are auto-generated from the schedule for upcoming calendar dates  
- Booking form validates each field independently using a shared Zod schema (client \+ server)  
- Invalid submissions show the specific field and reason, not a generic error  
- A slot that's already booked returns a clear "this slot was just taken" message, not a raw error

### 5.2 Appointment History (Load More Pagination) — Mohammed Aamir

**Requirement:** *"History page loads older appointments as the user scrolls."* Implemented as cursor-based pagination with a "Load More" control (chosen over true infinite scroll for reliability and testability within the sprint timeline — same backend logic, simpler UX contract).

**Acceptance criteria:**

- Patient's appointment history loads an initial page of results  
- "Load More" fetches the next page via cursor (not offset), remaining accurate even if new appointments are added mid-session  
- Patient can cancel an upcoming appointment from the history view; cancellation updates status rather than deleting the record  
- Empty state handled gracefully for patients with no history

### 5.3 Doctor's Today's Appointments (Default Dashboard View) — Sohini Tandon

**Requirement:** *"Doctors see only today's appointments by default."* Immediately after login, a doctor's dashboard shows today's confirmed appointments with no manual filtering required.

**Acceptance criteria:**

- Dashboard query filters by explicit start-of-day/end-of-day boundaries against the appointment slot's date (not booking creation time), avoiding timezone edge cases  
- Only `CONFIRMED` appointments are shown (cancelled appointments don't clutter the queue)  
- Empty state ("No appointments today") handled cleanly  
- Loads automatically on login — no click or filter needed

---

## 6\. Non-Functional Requirements

| Requirement | Approach |
| :---- | :---- |
| **Security** | Passwords hashed with bcrypt; JWT session strategy; role-based middleware blocks cross-role route access (`/doctor/*` vs `/patient/*`) |
| **Data integrity** | Double-booking prevented at the database layer via unique constraints, not just application logic |
| **Performance** | Cursor-based pagination for history to remain performant as data grows; indexed queries on `patientId`/`doctorId` \+ `createdAt` |
| **Code quality** | Shared Prisma client singleton (prevents connection exhaustion); shared Zod validation schemas between client and server |
| **Maintainability** | Clean separation of `services/` (business logic) from `actions/` (Server Action entry points) for testability |

---

## 7\. Success Criteria (Demo / Grading)

- A patient can register, search for a doctor, book an appointment against a real generated slot, and see it in their history  
- A doctor can register, set a weekly schedule, and see today's confirmed appointments immediately on login  
- Booking form correctly rejects invalid input with field-specific errors  
- Two simultaneous booking attempts on the same slot: one succeeds, one is cleanly rejected — provable live to judges  
- Each team member can explain their vertical's backend logic, database design choices, and frontend implementation independently

---

## 8\. Timeline Summary

22-day fixed sprint, structured as:

- **Days 1-6:** Shared foundation — project setup, Prisma schema, database migration, authentication, RBAC middleware, dashboard shells  
- **Days 7-15:** Feature verticals built in parallel (backend then frontend) by each owner  
- **Days 16-19:** Integration testing, bug fixing, cross-review, polish  
- **Days 20-22:** Deployment, final testing, documentation, presentation prep

---

## 9\. Risks

| Risk | Mitigation |
| :---- | :---- |
| Shared file merge conflicts (schema, config) across 3 contributors | Feature-branch-per-person workflow; pull `main` before merging; merge one person at a time, not simultaneously |
| Double-booking race condition | Database-level unique constraints as the authoritative guard, not just UI/application checks |
| Fixed 22-day deadline with no buffer | Scope already trimmed (Load More instead of true infinite scroll, Admin Dashboard deferred, simplified schedule-edit edge cases) |
| Environment/tooling setup delays (DB connection, local dev environment) | Front-loaded in Days 1-3 rather than discovered mid-sprint |

