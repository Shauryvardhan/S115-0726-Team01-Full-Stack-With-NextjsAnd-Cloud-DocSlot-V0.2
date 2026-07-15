import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "DOCTOR") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-white p-4 flex flex-col gap-2">
        <p className="font-semibold text-blue-600 mb-4">DocSlot — Doctor</p>
        <Link href="/doctor/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">
          Dashboard
        </Link>
        <Link href="/doctor/schedule" className="px-3 py-2 rounded hover:bg-gray-100">
          Schedule
        </Link>
        <Link href="/doctor/profile" className="px-3 py-2 rounded hover:bg-gray-100">
          Profile
        </Link>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}