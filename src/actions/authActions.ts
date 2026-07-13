"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/validations/authSchema";

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { success: false, errors: { email: ["Email already registered"] } };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      phone: parsed.data.phone,
      role: parsed.data.role,
      ...(parsed.data.role === "DOCTOR"
        ? { doctor: { create: { specialization: "General", consultationFee: 0 } } }
        : { patient: { create: {} } }),
    },
  });

  return { success: true, userId: user.id };
}