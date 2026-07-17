"use server";

import { prisma } from "@/lib/prisma";
import { getTodaysAppointments } from "@/services/doctorDashboardService";

export async function fetchTodaysAppointments(doctorId: string) {
  const appointments = await getTodaysAppointments(doctorId);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const totalSlotsToday = await prisma.appointmentSlot.count({
    where: {
      schedule: { doctorId },
      date: { gte: startOfDay, lte: endOfDay },
    },
  });

  return {
    appointments,
    stats: {
      booked: appointments.length,
      total: totalSlotsToday,
    },
  };
}