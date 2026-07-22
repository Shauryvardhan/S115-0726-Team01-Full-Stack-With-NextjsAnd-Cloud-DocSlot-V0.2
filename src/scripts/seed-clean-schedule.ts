import { createSchedule } from "@/actions/scheduleActions";

async function main() {
  const result = await createSchedule({
    doctorId: "cmrkm41nd0001ow1hmsf92trr",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });
  console.log(result);
}

main();
