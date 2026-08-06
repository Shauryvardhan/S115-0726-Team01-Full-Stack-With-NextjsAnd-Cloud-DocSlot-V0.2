# Low-Level Design: DocSlot

## 1. Database Schema (Prisma)
User (id, name, email, password[hashed], phone, role, timestamps)
├─ Doctor (1:1) — specialization, qualifications, bio, consultationFee, status
└─ Patient (1:1) — dateOfBirth, gender

Doctor
└─ Schedule[] (1:many) — dayOfWeek, startTime, endTime, slotDuration, isActive
└─ AppointmentSlot[] (1:many) — date, startTime, endTime, isBooked
└─ Appointment (1:1, unique slotId) — patientId, doctorId, status, reason

Key constraints:
AppointmentSlot: @@unique([scheduleId, date, startTime]) — prevents duplicate slot generation
Appointment: slotId String @unique — enforces one appointment per slot at the database level

## 2. Core Algorithms

### 2.1 Slot Generation (slotService.ts)
function generateSlotsForSchedule(scheduleId, weeksAhead = 4):
schedule = fetch Schedule by id
for week in 0..weeksAhead:
targetDate = next occurrence of schedule.dayOfWeek, offset by week weeks
current = schedule.startTime
while current < schedule.endTime:
end = current + schedule.slotDuration
if end > schedule.endTime: break
queue slot { scheduleId, date: targetDate, startTime: current, endTime: end }
current = end
bulk insert queued slots, skipDuplicates: true

### 2.2 Double-Booking Prevention (bookingActions.ts)
function bookAppointment(input):
validate input via Zod
slot = fetch AppointmentSlot by slotId
if slot.isBooked: return error "just taken"
transaction:
updatedSlot = update AppointmentSlot
where { id: slotId, isBooked: false }   // <- conditional write, the real guard
set { isBooked: true }
create Appointment { slotId: updatedSlot.id, ... }
if transaction fails (P2025 — row not found because isBooked was already true):
return error "just taken"
else: return success

The where: { isBooked: false } inside the update — not just the earlier read — is what makes this safe under concurrency: two simultaneous requests can both pass the initial check, but only one can win the conditional update.

### 2.3 Cursor-Based Pagination (appointmentHistoryService.ts)
function getAppointmentHistory(patientId, cursor?):
results = query Appointment
where { patientId }
take PAGE_SIZE + 1
cursor: cursor ? { id: cursor } : undefined
skip: cursor ? 1 : 0
orderBy { createdAt: desc }
hasNextPage = results.length > PAGE_SIZE
items = hasNextPage ? results[0..PAGE_SIZE] : results
nextCursor = hasNextPage ? last(items).id : null
return { items, nextCursor }

### 2.4 Timezone-Safe "Today" Filtering (doctorDashboardService.ts)
function getTodaysAppointments(doctorId):
now = current server time
startOfDay = new Date(now.year, now.month, now.date, 0, 0, 0)
endOfDay   = new Date(now.year, now.month, now.date, 23, 59, 59)
return query Appointment
where { doctorId, status: CONFIRMED, slot.date BETWEEN startOfDay AND endOfDay }

Filters on slot.date (when the appointment happens), not createdAt (when it was booked) — and computes explicit local day boundaries rather than a loose date comparison, avoiding UTC/local-timezone edge cases.

## 3. Server Action Signatures

| Action | Signature | Purpose |
|---|---|---|
| registerUser | (input: RegisterInput) → {success, userId?, errors?} | Create User + role-specific row, bcrypt hash |
| createSchedule | (input: ScheduleInput) → {success, scheduleId?, errors?} | Create schedule + generate slots |
| updateSchedule | (id, input) → {success} | Edit schedule; regenerates unbooked slots, protects booked ones |
| bookAppointment | (input: BookingInput) → {success, appointmentId?, errors?} | Transactional booking with double-booking guard |
| cancelAppointment | (id, patientId, reason?) → {success, error?} | Authorization-checked cancellation |
| fetchAppointmentHistory | (patientId, cursor?) → {items, nextCursor} | Paginated history |
| fetchTodaysAppointments | (doctorId) → {appointments, stats} | Dashboard default view |

## 4. Folder Structure
src/
├── app/            # Routes: (auth)/, doctor/, patient/, api/
├── actions/        # Server Action entry points
├── services/       # Business logic, framework-agnostic
├── components/     # UI, grouped by feature
├── validations/    # Zod schemas
├── lib/            # Prisma client singleton, auth config
└── types/          # Shared TypeScript types
