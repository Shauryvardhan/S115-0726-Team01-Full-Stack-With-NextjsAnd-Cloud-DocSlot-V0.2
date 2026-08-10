"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type UpdatePatientProfileInput = {
  name: string;
  phone?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  emailReminders?: boolean;
  smsAlerts?: boolean;
};

export async function updatePatientProfile(data: UpdatePatientProfileInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Please log in to update settings." };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return { success: false, error: "Patient profile not found." };
    }

    // Perform real update on User model (name, phone)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone || null,
      },
    });

    // Perform real update on Patient model
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        gender: data.gender || null,
        bloodGroup: data.bloodGroup || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactRelation: data.emergencyContactRelation || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        allergies: data.allergies || null,
        emailReminders: data.emailReminders ?? true,
        smsAlerts: data.smsAlerts ?? true,
      },
    });

    // Revalidate settings and dashboard routes so Next.js does not serve stale data
    revalidatePath("/patient/settings");
    revalidatePath("/patient/dashboard");

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update profile settings";
    return { success: false, error: errorMsg };
  }
}
