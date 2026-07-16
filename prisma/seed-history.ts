import { prisma } from "../src/lib/prisma";

export async function seedAppointmentHistory() {
  const patient = await prisma.patient.findFirst();
  const doctor = await prisma.doctor.findFirst();
  const slots = await prisma.appointmentSlot.findMany({ take: 15 });

  if (!patient || !doctor || slots.length === 0) {
    console.log("Need at least 1 patient, 1 doctor, and some slots first — run other seeds/scripts first.");
    return;
  }

  const statuses = ["COMPLETED", "COMPLETED", "CANCELLED", "CONFIRMED"] as const;

  for (let i = 0; i < slots.length; i++) {
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        slotId: slots[i].id,
        status: statuses[i % statuses.length],
      },
    });
  }

  console.log(`Seeded ${slots.length} appointments.`);
}

seedAppointmentHistory();