import { prisma } from "@/lib/prisma";

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export async function generateSlotsForSchedule(scheduleId: string, weeksAhead: number = 4) {
  const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
  if (!schedule) throw new Error("Schedule not found");

  const slotsToCreate: { scheduleId: string; date: Date; startTime: string; endTime: string }[] = [];
  const today = new Date();

  for (let week = 0; week < weeksAhead; week++) {
    const targetDate = new Date(today);
    const daysUntilTarget = (schedule.dayOfWeek - today.getDay() + 7) % 7 + week * 7;
    targetDate.setDate(today.getDate() + daysUntilTarget);
    targetDate.setHours(0, 0, 0, 0);

    let current = schedule.startTime;
    while (current < schedule.endTime) {
      const end = addMinutes(current, schedule.slotDuration);
      if (end > schedule.endTime) break;

      slotsToCreate.push({
        scheduleId: schedule.id,
        date: targetDate,
        startTime: current,
        endTime: end,
      });

      current = end;
    }
  }

  return prisma.appointmentSlot.createMany({
    data: slotsToCreate,
    skipDuplicates: true,
  });
}

export async function regenerateSlotsForSchedule(scheduleId: string, weeksAhead: number = 4) {
  await prisma.appointmentSlot.deleteMany({
    where: {
      scheduleId,
      isBooked: false,
      date: { gte: new Date() },
    },
  });

  return generateSlotsForSchedule(scheduleId, weeksAhead);
}