import { createSchedule } from "@/actions/scheduleActions";

async function main() {
  const result = await createSchedule({
    doctorId: "cmrvn1vrm00065mw5sqk4hchk",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });
  console.log("Schedule created:", result);
}

main();
