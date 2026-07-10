import { prisma } from "@/lib/prisma";

export async function getTodaysAppointments(doctorId: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: "CONFIRMED",
      slot: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    },
    include: {
      patient: { include: { user: true } },
      slot: true,
    },
    orderBy: {
      slot: { startTime: "asc" },
    },
  });
}