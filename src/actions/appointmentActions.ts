"use server";

import { prisma } from "@/lib/prisma";
import { getAppointmentHistory, isCancellable } from "@/services/appointmentHistoryService";

export async function fetchAppointmentHistory(patientId: string, cursor?: string) {
  return getAppointmentHistory(patientId, cursor);
}

export async function cancelAppointment(appointmentId: string, patientId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { slot: true },
  });

  if (!appointment) {
    return { success: false, error: "Appointment not found" };
  }

  if (appointment.patientId !== patientId) {
    return { success: false, error: "Not authorized to cancel this appointment" };
  }

  if (!isCancellable(appointment)) {
    return { success: false, error: "This appointment can no longer be cancelled" };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  return { success: true };
}