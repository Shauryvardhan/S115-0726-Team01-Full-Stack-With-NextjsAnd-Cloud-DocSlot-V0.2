"use server";

import { prisma } from "@/lib/prisma";
import { createWeeklySchedule } from "@/services/scheduleService";
import { generateSlotsForSchedule, regenerateSlotsForSchedule } from "@/services/slotService";
import { z } from "zod";

const scheduleSchema = z.object({
  doctorId: z.string().min(1),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  slotDuration: z.number().min(10).max(120).default(30),
});

export async function createSchedule(input: z.infer<typeof scheduleSchema>) {
  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (parsed.data.startTime >= parsed.data.endTime) {
    return { success: false, errors: { endTime: ["End time must be after start time"] } };
  }

  const schedule = await createWeeklySchedule(parsed.data);
  await generateSlotsForSchedule(schedule.id);

  return { success: true, scheduleId: schedule.id };
}

export async function updateSchedule(scheduleId: string, input: Partial<z.infer<typeof scheduleSchema>>) {
  await prisma.schedule.update({
    where: { id: scheduleId },
    data: input,
  });

  await regenerateSlotsForSchedule(scheduleId);

  return { success: true };
}