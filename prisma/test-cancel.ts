import { prisma } from "../src/lib/prisma";
import { getAppointmentHistory } from "../src/services/appointmentHistoryService";
import { cancelAppointment } from "../src/actions/appointmentActions";

async function main() {
  const patient = await prisma.patient.findFirst();

  if (!patient) {
    console.log("No patient found — run your seed scripts first.");
    return;
  }

  // Grab a real appointment that isn't already cancelled
  const history = await getAppointmentHistory(patient.id);
  const target = history.items.find((a) => a.status !== "CANCELLED");

  if (!target) {
    console.log("No non-cancelled appointment found to test with. Re-run seed-history.ts to get fresh data.");
    return;
  }

  console.log("Target appointment:", target.id, "| current status:", target.status);
  console.log("Real patientId:", patient.id);

  // Case 1 — correct patientId, should succeed
  const correctResult = await cancelAppointment(target.id, patient.id);
  console.log("\n--- CASE 1: correct patientId ---");
  console.log(correctResult);

  // Confirm it's actually cancelled now
  const updated = await prisma.appointment.findUnique({ where: { id: target.id } });
  console.log("Status after cancel attempt:", updated?.status);

  // Grab a second, different appointment for case 2 (so we're not re-cancelling the same one)
  const secondTarget = history.items.find(
    (a) => a.id !== target.id && a.status !== "CANCELLED"
  );

  if (!secondTarget) {
    console.log("\nNo second appointment available to test the fake-patientId case. Seed more data if you want to test this too.");
    return;
  }

  // Case 2 — wrong/fake patientId, should fail with "not authorized"
  const fakePatientId = "fake-patient-id-does-not-exist";
  const wrongResult = await cancelAppointment(secondTarget.id, fakePatientId);
  console.log("\n--- CASE 2: fake patientId ---");
  console.log(wrongResult);

  // Confirm it was NOT actually cancelled
  const unchanged = await prisma.appointment.findUnique({ where: { id: secondTarget.id } });
  console.log("Status after unauthorized attempt (should be unchanged):", unchanged?.status);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());