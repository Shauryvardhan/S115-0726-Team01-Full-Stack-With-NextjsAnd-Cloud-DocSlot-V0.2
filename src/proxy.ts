import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isDoctorRoute = pathname.startsWith("/doctor");
  const isPatientRoute = pathname.startsWith("/patient");
  const isProtectedRoute = isDoctorRoute || isPatientRoute;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isDoctorRoute && session?.user.role !== "DOCTOR") {
    return NextResponse.redirect(
      new URL(session ? "/patient/dashboard" : "/login", req.url)
    );
  }

  if (isPatientRoute && session?.user.role !== "PATIENT") {
    return NextResponse.redirect(
      new URL(session ? "/doctor/dashboard" : "/login", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/doctor/:path*", "/patient/:path*"],
};
