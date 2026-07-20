import { prisma } from "@/lib/prisma";
import { bookAppointment } from "@/actions/bookingActions";

async function main() {
  const freshSlot = await prisma.appointmentSlot.findFirst({
    where: {
      scheduleId: "cmrss0vcs0001e7b9c642drqy",
      isBooked: false,
    },
  });

  if (!freshSlot) {
    console.log("❌ No unbooked slots found for this schedule — all used up.");
    return;
  }

  console.log("Using slot:", freshSlot.id, "| isBooked before test:", freshSlot.isBooked);

  const bookingData = {
    slotId: freshSlot.id,
    patientId: "cmrkhr2ze00017fwx4w69b34n",
    doctorId: "cmrkm41nd0001ow1hmsf92trr",
    patientName: "Test Patient",
    patientEmail: "test@example.com",
    patientPhone: "9876543210",
    reason: "Checkup",
  };

  console.log("Firing two simultaneous booking attempts...");
  const [result1, result2] = await Promise.all([
    bookAppointment(bookingData),
    bookAppointment(bookingData),
  ]);

  console.log("Result 1:", result1);
  console.log("Result 2:", result2);
}

main();
