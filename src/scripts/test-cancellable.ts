import { prisma } from "../lib/prisma";
import { cancelAppointment } from "../actions/appointmentActions";
// Only run this script after seeding your database with appointments for a patient. It will attempt to cancel a completed appointment and a confirmed future appointment, and check the status of the future appointment after the cancellation attempt.
async function main() {
  const patient = await prisma.patient.findFirst();
  if (!patient) {
    console.log("No patient found.");
    return;
  }

  const completedAppointmentId = "cmrn0qwh80001fejn9zgpvcx0";
  const confirmedFutureAppointmentId = "cmrssaelk0003ck1y8uyk0hnf";

  console.log("--- Attempt to cancel a COMPLETED appointment ---");
  const result1 = await cancelAppointment(completedAppointmentId, patient.id);
  console.log(result1);

  console.log("\n--- Attempt to cancel a CONFIRMED future appointment ---");
  const result2 = await cancelAppointment(confirmedFutureAppointmentId, patient.id);
  console.log(result2);

  const check = await prisma.appointment.findUnique({ where: { id: confirmedFutureAppointmentId } });
  console.log("Status after cancel attempt:", check?.status);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());