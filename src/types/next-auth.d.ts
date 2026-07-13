import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "DOCTOR" | "PATIENT";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "DOCTOR" | "PATIENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "DOCTOR" | "PATIENT";
  }
}