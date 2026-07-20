import { prisma } from "../lib/prisma";

async function main() {
  const completed = await prisma.appointment.findFirst({
    where: { status: "COMPLETED" },
  });
  const confirmed = await prisma.appointment.findFirst({
    where: { status: "CONFIRMED" },
    orderBy: { createdAt: "desc" },
  });

  console.log("COMPLETED id:", completed?.id);
  console.log("CONFIRMED id:", confirmed?.id);
}

main().finally(() => prisma.$disconnect());