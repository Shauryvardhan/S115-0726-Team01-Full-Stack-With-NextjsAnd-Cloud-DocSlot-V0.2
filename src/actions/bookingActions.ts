"use server";

import { prisma } from "@/lib/prisma";
import { bookingSchema, type BookingInput } from "@/validations/bookingSchema";
import { Prisma } from "@prisma/client";

export async function bookAppointment(input: BookingInput & { patientId: string; doctorId: string }) {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const slot = await prisma.appointmentSlot.findUnique({
    where: { id: parsed.data.slotId },
  });

  if (!slot) {
    return { success: false, errors: { slotId: ["This slot no longer exists"] } };
  }

  if (slot.isBooked) {
    return { success: false, errors: { slotId: ["This slot was just taken — please pick another"] } };
  }

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const updatedSlot = await tx.appointmentSlot.update({
        where: { id: parsed.data.slotId, isBooked: false },
        data: { isBooked: true },
      });

      return tx.appointment.create({
        data: {
          patientId: input.patientId,
          doctorId: input.doctorId,
          slotId: updatedSlot.id,
          reason: parsed.data.reason || undefined,
          status: "CONFIRMED",
        },
      });
    });

    return { success: true, appointmentId: appointment.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025" || error.code === "P2002") {
        return { success: false, errors: { slotId: ["This slot was just taken — please pick another"] } };
      }
    }
    throw error;
  }
}

export async function rescheduleAppointment(
  appointmentId: string,
  patientId: string,
  newSlotId: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) return { success: false, error: "Appointment not found" };
  if (appointment.patientId !== patientId) return { success: false, error: "Not authorized" };
  if (appointment.status !== "CONFIRMED") return { success: false, error: "Only confirmed appointments can be rescheduled" };

  const newSlot = await prisma.appointmentSlot.findUnique({ where: { id: newSlotId } });
  if (!newSlot || newSlot.isBooked) {
    return { success: false, error: "Selected slot is no longer available" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.appointmentSlot.update({
        where: { id: appointment.slotId },
        data: { isBooked: false },
      });
      await tx.appointmentSlot.update({
        where: { id: newSlotId, isBooked: false },
        data: { isBooked: true },
      });
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { slotId: newSlotId },
      });
    });
    return { success: true };
  } catch {
    return { success: false, error: "This slot was just taken — please pick another" };
  }
}