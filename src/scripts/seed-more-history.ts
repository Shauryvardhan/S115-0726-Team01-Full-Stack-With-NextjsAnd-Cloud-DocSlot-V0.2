import { prisma } from "@/lib/prisma";

async function main() {
  const patient = await prisma.patient.findFirst({
    where: { user: { email: "journey1patient@docslot.com" } },
  });
  const doctor = await prisma.doctor.findFirst();

  if (!patient || !doctor) {
    console.log("Missing patient or doctor");
    return;
  }

  const slots = await prisma.appointmentSlot.findMany({
    where: { appointment: null },
    take: 15,
  });

  console.log(`Found ${slots.length} genuinely free slots`);

  let seeded = 0;
  for (const slot of slots) {
    await prisma.appointment.create({
      data: { patientId: patient.id, doctorId: doctor.id, slotId: slot.id, status: "COMPLETED" },
    });
    await prisma.appointmentSlot.update({
      where: { id: slot.id },
      data: { isBooked: true },
    });
    seeded++;
  }

  console.log(`Seeded ${seeded} past appointments for pagination testing`);
}

main();
