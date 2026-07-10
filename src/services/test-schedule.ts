import { createWeeklySchedule, getDoctorSchedules } from "@/services/scheduleService";

async function main() {
  // Replace with a real doctorId from Prisma Studio once you've seeded one
  const doctorId = "PASTE_A_REAL_DOCTOR_ID_HERE";

  const schedule = await createWeeklySchedule({
    doctorId,
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "17:00",
  });
  console.log("Created:", schedule);

  const all = await getDoctorSchedules(doctorId);
  console.log("All schedules:", all);
}

main();