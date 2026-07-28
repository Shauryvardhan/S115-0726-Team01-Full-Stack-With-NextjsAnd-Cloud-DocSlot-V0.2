import Link from "next/link";
import { auth } from "@/lib/auth";
import { handleSignOut } from "@/actions/authActions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/shared/Footer";
import DoctorSidebarLinks from "@/components/doctor/DoctorSidebarLinks";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "DOCTOR") redirect("/patient/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const userName = user?.name ?? "Doctor";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col fixed h-full z-40">
        <div className="px-5 pt-5 pb-2">
          <Link href="/doctor/dashboard" className="flex items-center gap-1">
            <span className="font-bold text-blue-600 text-xl">DocSlot</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Doctor Portal</p>
        </div>

        <nav className="flex-1 px-3 mt-4">
          <DoctorSidebarLinks />
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Dr. {userName}</p>
              <p className="text-xs text-gray-400 truncate">Manage practice</p>
            </div>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full cursor-pointer"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
