import { createWeeklySchedule, getDoctorSchedules } from "@/services/scheduleService";
import { generateSlotsForSchedule } from "@/services/slotService";

async function main() {
  const doctorId = "cmrllp1pu0001zmp2ffji4qxu";

  const schedule = await createWeeklySchedule({
    doctorId,
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "12:00",
    slotDuration: 30,
  });
  console.log("Schedule created:", schedule);

  const result = await generateSlotsForSchedule(schedule.id);
  console.log("Slots generated:", result);
}

main();