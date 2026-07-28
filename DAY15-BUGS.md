# Day 15 — Full Integration Test Bug Log

## Journey 1 (Aamir — Search/Profile/Booking/History)
- No bugs found in Search → Profile → Booking → History flow.
- Bio/qualifications not shown for test doctor — expected (empty test data), page correctly hides empty sections.
- Load More pagination not tested — fresh account had too few appointments to trigger it.

## Journey 2 (Shauryvardhan — Doctor Schedule/Dashboard)
1. [Book Appointment page] - Today's date/slots don't appear in the date picker, 
   even though slots exist (confirmed via Prisma Studio) - Expected today to be 
   the first selectable date - Root cause: `today` computed as exact current 
   timestamp instead of start-of-day, so today's midnight-stored slots always 
   appear "in the past" - Fix: Shauryvardhan to apply setHours(0,0,0,0) fix

   2. [Book Appointment page] - Date button showed "Jul 23" for what should be 
   "Jul 24" (today) - Root cause: date grouping key used toISOString() (UTC) 
   instead of local date components, causing an off-by-one day shift for 
   IST users - Fix: Shauryvardhan, use local getFullYear/getMonth/getDate 
   instead of toISOString()

   3. [Appointment History page] - Today's appointment showed under "Past" 
   instead of "Upcoming" - same root cause as bugs 1/2, exact timestamp 
   vs start-of-day comparison - Fixed.

    4. [Appointment History page] - Page crashed with "Decimal objects are 
    not supported" error - Root cause: passing full doctor object 
   (including Prisma Decimal consultationFee field) from Server Component 
   to Client Component - Fixed by mapping to a plain serializable object 
   before passing as props.

## Journey 3 (Sohini — RBAC/Validation)
5. [Data integrity] - AppointmentSlot.isBooked flag was found out of sync 
   with actual Appointment records for slots created via early seed 
   scripts (Day 7-9 testing) - the flag stayed false despite a real 
   Appointment existing - Root cause: only bookAppointment()'s transaction 
   correctly sets both; ad-hoc seed scripts created Appointments without 
   updating the flag - Not a production bug (real bookings always go 
   through bookAppointment()), but worth noting for anyone writing future 
   seed/test scripts: check for appointment: null, not isBooked: false.

   6. [Login page] - Wrong copy and dark background — appears to have reused 
   Register page's wrapper without updating tagline/colors - Fixed by 
   correcting copy to "Welcome back to DocSlot" and setting explicit 
   bg-white on the form panel - Owner: Sohini

   7. [Appointment History] - Decimal serialization crash resurfaced on 
   "Load More" click - Root cause: the earlier fix only sanitized the 
   first page (fetched in page.tsx), but Load More calls the Server 
   Action directly from the client, which still returned raw Doctor 
   objects with Decimal fields - Real fix: changed getAppointmentHistory() 
   to use Prisma `select` instead of `include`, so Decimal fields are 
   never fetched at all, fixing every call site including pagination.

## Day 16 (Aamir — Edge case testing)

- Empty state (Upcoming Visits 0, no past appointments): [describe what you saw]
- Load More last page: [button disappeared cleanly / stuck — describe]
- Search page no-results: [worked cleanly / broke]
- Doctor profile with no bio/qualifications: sections hide cleanly, no bugs