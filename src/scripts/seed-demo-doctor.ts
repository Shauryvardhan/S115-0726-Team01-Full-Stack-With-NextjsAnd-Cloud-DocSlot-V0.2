import { prisma } from "@/lib/prisma";
import { createSchedule } from "@/actions/scheduleActions";

async function main() {
  const doctor = await prisma.doctor.findFirst({
    where: { user: { email: "demo.doctor@docslot.com" } },
  });

  if (!doctor) {
    console.log("Doctor not found — register demo.doctor@docslot.com first");
    return;
  }

  console.log("Demo doctor ID:", doctor.id);

  const result = await createSchedule({
    doctorId: doctor.id,
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });

  console.log("Schedule created:", result);
}

main();
