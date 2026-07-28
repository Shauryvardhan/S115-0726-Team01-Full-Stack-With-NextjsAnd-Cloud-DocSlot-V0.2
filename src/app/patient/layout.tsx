import Link from "next/link";
import { auth } from "@/lib/auth";
import { handleSignOut } from "@/actions/authActions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Footer from "@/components/shared/Footer";
import PatientSidebarLinks from "@/components/patient/PatientSidebarLinks";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  if (session.user.role !== "PATIENT") redirect("/doctor/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  const userName = user?.name ?? "Patient";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="px-5 pt-5 pb-2">
          <Link href="/patient/dashboard" className="flex items-center gap-1">
            <span className="font-bold text-blue-600 text-xl">DocSlot</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Patient Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 mt-4">
          <PatientSidebarLinks />
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">Manage health</p>
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

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Find a Doctor, specialty, or clinic..."
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-gray-400 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">{userInitial}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">{children}</main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
