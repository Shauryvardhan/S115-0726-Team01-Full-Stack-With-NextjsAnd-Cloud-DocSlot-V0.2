import { z } from "zod";

export const bookingSchema = z.object({
  slotId: z.string().min(1, "Please select a time slot"),
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  patientEmail: z.string().email("Enter a valid email"),
  patientPhone: z.string().min(10, "Enter a valid phone number"),
  reason: z.string().optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;