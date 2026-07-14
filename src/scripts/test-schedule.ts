import { createWeeklySchedule, getDoctorSchedules } from "@/services/scheduleService";

async function main() {
  const doctorId = "cmrkm41nd0001ow1hmsf92trr";

  const schedule = await createWeeklySchedule({
    doctorId,
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
  });
  console.log("Created:", schedule);

  const all = await getDoctorSchedules(doctorId);
  console.log("All schedules:", all);
}

main();
