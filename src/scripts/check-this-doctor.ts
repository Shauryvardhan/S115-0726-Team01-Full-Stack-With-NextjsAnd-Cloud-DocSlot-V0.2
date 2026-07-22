import { prisma } from "@/lib/prisma";

async function main() {
  const doctor = await prisma.doctor.findUnique({
    where: { id: "cmrvn1vrm00065mw5sqk4hchk" },
    include: { user: true, schedules: true },
  });

  console.log("Doctor:", doctor?.user.name, doctor?.user.email);
  console.log("Schedules:", doctor?.schedules.length ?? 0);
}

main();
