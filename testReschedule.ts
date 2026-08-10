import { PrismaClient } from "@prisma/client";
import { rescheduleAppointment } from "./src/actions/bookingActions";

const prisma = new PrismaClient();

async function runTest() {
  console.log("Starting reschedule appointment test...");

  // 1. Find a confirmed appointment to reschedule
  const appointment = await prisma.appointment.findFirst({
    where: { status: "CONFIRMED" },
    include: { slot: true },
  });

  if (!appointment) {
    console.log("No confirmed appointment found to test with.");
    return;
  }

  const oldSlotId = appointment.slotId;
  console.log(`Found appointment ${appointment.id}, currently in slot ${oldSlotId}`);
  console.log(`Old slot booked status: ${appointment.slot.isBooked}`);

  // 2. Find an available slot for the same doctor
  const newSlot = await prisma.appointmentSlot.findFirst({
    where: {
      schedule: { doctorId: appointment.doctorId },
      isBooked: false,
    },
  });

  if (!newSlot) {
    console.log("No available slot found for this doctor to reschedule to.");
    return;
  }

  const newSlotId = newSlot.id;
  console.log(`Found new available slot: ${newSlotId}`);

  // 3. Call the reschedule function
  console.log("Calling rescheduleAppointment...");
  const result = await rescheduleAppointment(
    appointment.id,
    appointment.patientId,
    newSlotId
  );

  console.log("Result:", result);

  if (result.success) {
    // 4. Verify the database state
    const oldSlotUpdated = await prisma.appointmentSlot.findUnique({
      where: { id: oldSlotId },
    });
    const newSlotUpdated = await prisma.appointmentSlot.findUnique({
      where: { id: newSlotId },
    });
    const appointmentUpdated = await prisma.appointment.findUnique({
      where: { id: appointment.id },
    });

    console.log("\n--- Verification ---");
    console.log(`Old slot (expected isBooked: false): ${oldSlotUpdated?.isBooked}`);
    console.log(`New slot (expected isBooked: true): ${newSlotUpdated?.isBooked}`);
    console.log(`Appointment's new slotId (expected ${newSlotId}): ${appointmentUpdated?.slotId}`);

    if (
      oldSlotUpdated?.isBooked === false &&
      newSlotUpdated?.isBooked === true &&
      appointmentUpdated?.slotId === newSlotId
    ) {
      console.log("Test passed successfully!");
    } else {
      console.log("Test failed - state mismatch.");
    }
  }
}

runTest()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
