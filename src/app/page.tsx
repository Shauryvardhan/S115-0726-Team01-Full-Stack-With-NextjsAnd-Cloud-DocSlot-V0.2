import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <section className="max-w-3xl mx-auto text-center py-24 px-4 flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Trusted by 2,000+ medical professionals
        </div>

        <h1 className="text-5xl font-bold mb-5 leading-tight text-gray-900">
          Book Smarter. <span className="text-blue-600">Care Faster.</span>
        </h1>
        <p className="text-gray-500 mb-10 text-lg max-w-xl">
          The easiest way to find and book appointments with top-rated doctors. Experience seamless healthcare management.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/25"
          >
            Get Started →
          </Link>
          <Link
            href="/patient/search"
            className="border-2 border-gray-200 hover:border-gray-300 px-8 py-3.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Find Doctors
          </Link>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600 mb-1">50k+</p>
            <p className="text-sm text-gray-500">Verified Patients</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 mb-1">2k+</p>
            <p className="text-sm text-gray-500">Specialist Doctors</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 mb-1">100+</p>
            <p className="text-sm text-gray-500">Medical Specialties</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600 mb-1">4.8/5</p>
            <p className="text-sm text-gray-500">User Satisfaction</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
