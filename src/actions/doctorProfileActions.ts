"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDoctorProfile(
  doctorId: string,
  data: {
    specialization: string;
    qualifications: string;
    bio: string;
    consultationFee: string;
  }
) {
  try {
    const feeNum = parseFloat(data.consultationFee) || 0;

    const updated = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization: data.specialization,
        qualifications: data.qualifications,
        bio: data.bio,
        consultationFee: feeNum,
      },
    });

    revalidatePath("/doctor/profile");
    revalidatePath("/patient/search");
    revalidatePath(`/patient/doctors/${doctorId}`);

    return { success: true, doctor: updated };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: errorMsg };
  }
}