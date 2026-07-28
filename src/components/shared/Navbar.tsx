import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-3 border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="font-bold text-blue-600 text-xl tracking-tight">
          DocSlot
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/patient/search"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            Find Doctors
          </Link>
          <Link
            href="/doctor/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            For Doctors
          </Link>
        </div>
      </div>
      <div className="flex gap-4 items-center">
        <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
          Login
        </Link>
        <Link
          href="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
