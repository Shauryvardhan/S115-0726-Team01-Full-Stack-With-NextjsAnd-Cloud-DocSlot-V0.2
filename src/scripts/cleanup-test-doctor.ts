import { prisma } from "@/lib/prisma";

async function main() {
  const doctorId = "cmrkm41nd0001ow1hmsf92trr";

  const deleted = await prisma.schedule.deleteMany({
    where: { doctorId },
  });

  console.log(`Deleted ${deleted.count} schedules (and their slots, via cascade) for doctor ${doctorId}`);
}

main();
