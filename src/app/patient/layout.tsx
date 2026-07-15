import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "PATIENT") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-white p-4 flex flex-col gap-2">
        <p className="font-semibold text-blue-600 mb-4">DocSlot — Patient</p>
        <Link href="/patient/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">
          Dashboard
        </Link>
        <Link href="/patient/search" className="px-3 py-2 rounded hover:bg-gray-100">
          Find Doctors
        </Link>
        <Link href="/patient/appointments" className="px-3 py-2 rounded hover:bg-gray-100">
          Appointments
        </Link>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
