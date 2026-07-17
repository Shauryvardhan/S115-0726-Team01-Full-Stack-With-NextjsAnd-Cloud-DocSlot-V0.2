// import { createSchedule, updateSchedule } from "@/actions/scheduleActions";
// import { prisma } from "@/lib/prisma";

// async function main() {
//   const doctorId = "cmrllp1pu0001zmp2ffji4qxu";

//   console.log("--- Step 1: Create schedule ---");
//   const created = await createSchedule({
//     doctorId,
//     dayOfWeek: 2,
//     startTime: "10:00",
//     endTime: "13:00",
//     slotDuration: 30,
//   });
//   console.log("Create result:", created);

//   if (!created.success || !created.scheduleId) {
//     console.log("Schedule creation failed, stopping.");
//     return;
//   }

//   const slotsBefore = await prisma.appointmentSlot.findMany({
//     where: { scheduleId: created.scheduleId },
//   });
//   console.log(`Slots after creation: ${slotsBefore.length}`);
//   console.log("Sample slot IDs before update:", slotsBefore.slice(0, 3).map(s => s.id));

//   console.log("\n--- Step 2: Update schedule (change end time) ---");
//   const updated = await updateSchedule(created.scheduleId, {
//     endTime: "14:00",
//   });
//   console.log("Update result:", updated);

//   const slotsAfter = await prisma.appointmentSlot.findMany({
//     where: { scheduleId: created.scheduleId },
//   });
//   console.log(`Slots after update: ${slotsAfter.length}`);
//   console.log("Sample slot IDs after update:", slotsAfter.slice(0, 3).map(s => s.id));
// }

// main();
import { prisma } from "@/lib/prisma";

async function main() {
  const bookedSlotId = "cmrof13sp000qmnse2x4z8lyf";

  const slot = await prisma.appointmentSlot.findUnique({
    where: { id: bookedSlotId },
  });

  if (!slot) {
    console.log("❌ FAILED: booked slot was deleted!");
  } else {
    console.log("✅ Booked slot survived:", slot);
  }

  const allSlotsForSchedule = await prisma.appointmentSlot.findMany({
    where: { scheduleId: "cmrof12xs0001mnsezwkw4xpx" },
  });
  console.log(`Total slots now: ${allSlotsForSchedule.length}`);
  console.log(`Booked slots: ${allSlotsForSchedule.filter(s => s.isBooked).length}`);
}

main();