import { prisma } from "@/lib/prisma";
import { createSchedule } from "@/actions/scheduleActions";
import { bookAppointment } from "@/actions/bookingActions";
import { fetchAppointmentHistory } from "@/actions/appointmentActions";
import { fetchTodaysAppointments } from "@/actions/doctorDashboardActions";

async function main() {
  console.log("=== STEP 1: Real doctor + patient must already exist ===");
  const doctor = await prisma.doctor.findFirst();
  const patient = await prisma.patient.findFirst();

  if (!doctor || !patient) {
    console.log("❌ Missing a real Doctor or Patient — register both via /register first.");
    return;
  }
  console.log("Doctor:", doctor.id, "| Patient:", patient.id);

  console.log("\n=== STEP 2: Doctor creates a schedule for TODAY ===");
  const today = new Date().getDay();
  const scheduleResult = await createSchedule({
    doctorId: doctor.id,
    dayOfWeek: today,
    startTime: "16:00",
    endTime: "18:00",
    slotDuration: 30,
  });
  console.log("Schedule created:", scheduleResult);

  if (!scheduleResult.success || !scheduleResult.scheduleId) {
    console.log("❌ Schedule creation failed, stopping.");
    return;
  }

  console.log("\n=== STEP 3: Find today's real generated slot ===");
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaySlot = await prisma.appointmentSlot.findFirst({
    where: {
      scheduleId: scheduleResult.scheduleId,
      date: { gte: startOfDay, lte: endOfDay },
      isBooked: false,
    },
  });

  if (!todaySlot) {
    console.log("❌ No slot generated for today — check slotService's weeksAhead/date math.");
    return;
  }
  console.log("Found today's slot:", todaySlot.id, todaySlot.startTime);

  console.log("\n=== STEP 4: Patient books that real slot ===");
  const bookingResult = await bookAppointment({
    slotId: todaySlot.id,
    patientId: patient.id,
    doctorId: doctor.id,
    patientName: "Integration Test Patient",
    patientEmail: "integrationtest@example.com",
    patientPhone: "9876543210",
    reason: "Full chain test",
  });
  console.log("Booking result:", bookingResult);

  if (!bookingResult.success) {
    console.log("❌ Booking failed, stopping.");
    return;
  }

  console.log("\n=== STEP 5: Aamir's history query should show this booking ===");
  const history = await fetchAppointmentHistory(patient.id);
  const found = history.items.find((a) => a.id === bookingResult.appointmentId);
  console.log(found ? "✅ Appointment found in history" : "❌ Appointment MISSING from history");

  console.log("\n=== STEP 6: Sohini's dashboard should show this appointment as TODAY ===");
  const dashboard = await fetchTodaysAppointments(doctor.id);
  const foundInDashboard = dashboard.appointments.find((a) => a.id === bookingResult.appointmentId);
  console.log(foundInDashboard ? "✅ Appointment found in today's dashboard" : "❌ Appointment MISSING from dashboard");
  console.log("Dashboard stats:", dashboard.stats);

  console.log("\n=== INTEGRATION TEST COMPLETE ===");
}

main();
