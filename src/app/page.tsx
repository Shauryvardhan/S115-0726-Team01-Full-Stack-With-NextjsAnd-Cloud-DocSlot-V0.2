import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <nav className="flex justify-between items-center px-8 py-4 border-b">
        <p className="font-bold text-blue-600 text-xl">DocSlot</p>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm text-gray-600">Login</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto text-center py-20 px-4">
        <h1 className="text-4xl font-bold mb-4">
          Book Smarter. <span className="text-blue-600">Care Faster.</span>
        </h1>
        <p className="text-gray-500 mb-8">
          The easiest way to find and book appointments with top-rated doctors.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            Get Started →
          </Link>
          <Link href="/patient/search" className="border px-6 py-3 rounded-lg font-medium">
            Find Doctors
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4 max-w-3xl mx-auto pb-16 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">50k+</p>
          <p className="text-xs text-gray-500">Verified Patients</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">2k+</p>
          <p className="text-xs text-gray-500">Specialist Doctors</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">100+</p>
          <p className="text-xs text-gray-500">Medical Specialties</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">4.8/5</p>
          <p className="text-xs text-gray-500">User Satisfaction</p>
        </div>
      </section>
    </main>
  );
}
