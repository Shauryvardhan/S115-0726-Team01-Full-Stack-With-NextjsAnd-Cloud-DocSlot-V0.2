import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "journey1patient@docslot.com";
  const newPassword = "testpass123";

  const hashed = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log(`Password reset for ${user.email}. New password: ${newPassword}`);
}

main();