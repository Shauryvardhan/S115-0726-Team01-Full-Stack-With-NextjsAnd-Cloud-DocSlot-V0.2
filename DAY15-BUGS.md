# Day 15 — Full Integration Test Bug Log

## Journey 1 (Aamir — Search/Profile/Booking/History)


## Journey 2 (Shauryvardhan — Doctor Schedule/Dashboard)


## Journey 3 (Sohini — RBAC/Validation)


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