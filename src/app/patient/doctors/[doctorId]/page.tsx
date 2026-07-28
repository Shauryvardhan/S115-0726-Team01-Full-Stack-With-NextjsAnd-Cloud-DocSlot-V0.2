import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DoctorProfileViewPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: true },
  });

  if (!doctor) notFound();

  const initial = (doctor.user.name ?? "D").charAt(0).toUpperCase();

  // Get similar doctors in same specialization
  const similarDoctors = await prisma.doctor.findMany({
    where: {
      status: "APPROVED",
      specialization: doctor.specialization,
      id: { not: doctor.id },
    },
    take: 3,
    include: { user: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto w-full px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/patient/search" className="hover:text-blue-600 transition-colors">Find Doctors</Link>
          <span>›</span>
          <span className="text-gray-500">{doctor.specialization}</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">Dr. {doctor.user.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto w-full px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold flex-shrink-0 relative">
                  {initial}
                  {/* Rating Badge */}
                  <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs font-bold rounded-lg px-2 py-1 flex items-center gap-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    4.9
                  </div>
                </div>

                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">Board Certified</span>
                    <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">Top Rated 2023</span>
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Dr. {doctor.user.name}, MD
                  </h1>
                  <p className="text-blue-600 font-semibold mb-3">{doctor.specialization}</p>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600">{doctor.specialization}</span>
                    {doctor.qualifications && (
                      <span className="text-xs border border-gray-200 rounded-full px-3 py-1 text-gray-600">{doctor.qualifications}</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Experience</p>
                      <p className="text-lg font-bold text-gray-900">12+ Years</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Patients</p>
                      <p className="text-lg font-bold text-gray-900">8.4k+</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Reviews</p>
                      <p className="text-lg font-bold text-gray-900">1.2k</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Rating</p>
                      <p className="text-lg font-bold text-gray-900">4.9</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                About Dr. {doctor.user.name?.split(" ")[0]}
              </h2>
              {doctor.bio ? (
                <p className="text-sm text-gray-600 leading-relaxed">{doctor.bio}</p>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">
                  Dr. {doctor.user.name} is a highly respected {doctor.specialization} specialist with extensive clinical experience. Their approach combines state-of-the-art medical technology with a compassionate, patient-centered philosophy.
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#0d9488" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span><strong>Fluent</strong> in English and Hindi</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span><strong>Accepted Insurances:</strong> BlueCross, Aetna, Cigna, Medicare</span>
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth="1.5">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                Education
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 pl-2 border-l-2 border-blue-200">
                  <div>
                    <p className="font-semibold text-sm text-blue-600">Johns Hopkins University</p>
                    <p className="text-xs text-gray-500">MD, {doctor.specialization} Specialization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pl-2 border-l-2 border-blue-200">
                  <div>
                    <p className="font-semibold text-sm text-orange-600">Stanford Medical Center</p>
                    <p className="text-xs text-gray-500">Residency, Internal Medicine</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Location */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Clinic Location
                </h2>
                <button className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Directions
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">City Health Plaza, Suite #12, New York, NY</p>
              <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-gray-400 mt-2">Map View</p>
                </div>
              </div>
            </div>

            {/* Similar Doctors */}
            {similarDoctors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Similar {doctor.specialization} Specialists</h2>
                    <p className="text-sm text-gray-400">Highly rated specialists in your area</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {similarDoctors.map((sim) => {
                    const simInitial = (sim.user.name ?? "D").charAt(0).toUpperCase();
                    return (
                      <Link
                        key={sim.id}
                        href={`/patient/doctors/${sim.id}`}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                          <span className="text-3xl font-bold text-blue-300">{simInitial}</span>
                        </div>
                        <div className="p-4">
                          <p className="font-bold text-sm text-blue-600 hover:underline">
                            Dr. {sim.user.name}
                          </p>
                          <p className="text-xs text-gray-500">{sim.specialization}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-20">
              {/* Price */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Consultation Fee</p>
                  <p className="text-3xl font-bold text-gray-900">₹{doctor.consultationFee.toString()}</p>
                </div>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">Verified Price</span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-5" />

              {/* Book Button */}
              <Link
                href={`/patient/book/${doctor.id}`}
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors mb-4"
              >
                Proceed to Book →
              </Link>

              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Free cancellation until 24h prior
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}