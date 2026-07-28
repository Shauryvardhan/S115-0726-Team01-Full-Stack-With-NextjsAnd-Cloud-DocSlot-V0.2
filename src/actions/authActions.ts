"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";
import { registerSchema, type RegisterInput } from "@/validations/authSchema";

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { success: false, errors: { email: ["Email already registered"] } };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: normalizedEmail,
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

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" });
}