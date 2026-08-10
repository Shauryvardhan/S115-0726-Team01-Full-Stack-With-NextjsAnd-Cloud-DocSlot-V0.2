import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Find Doctors — DocSlot" };


const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
];

export default async function SearchDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; q?: string }>;
}) {
  const { specialty, q } = await searchParams;
  const PAGE_SIZE = 6;

  const whereClause = {
    status: "APPROVED" as const,
    ...(specialty && { specialization: { contains: specialty, mode: "insensitive" as const } }),
    ...(q && {
      OR: [
        { user: { name: { contains: q, mode: "insensitive" as const } } },
        { specialization: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const doctors = await prisma.doctor.findMany({
    where: whereClause,
    include: { user: true },
    take: PAGE_SIZE + 1,
  });

  const hasMore = doctors.length > PAGE_SIZE;
  const visibleDoctors = hasMore ? doctors.slice(0, PAGE_SIZE) : doctors;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <aside className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-20">
          <h2 className="font-bold text-gray-900 mb-4">Filters</h2>
          <form className="space-y-5">
            {/* Availability */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Availability</p>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Available Today</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700">Available this week</span>
              </label>
            </div>

            {/* Minimum Rating */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Minimum Rating</p>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-blue-600 text-white font-medium cursor-pointer">
                <option>⭐ 4.5+ Stars</option>
                <option>⭐ 4.0+ Stars</option>
                <option>⭐ 3.5+ Stars</option>
                <option>Any Rating</option>
              </select>
            </div>

            {/* Fee Range */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fee Range</p>
              <input
                type="range"
                min="50"
                max="500"
                defaultValue="250"
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹50</span>
                <span>₹500+</span>
              </div>
            </div>

            {/* Gender */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender</p>
              <div className="flex gap-2">
                <button type="button" className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium">
                  Male
                </button>
                <button type="button" className="flex-1 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium">
                  Female
                </button>
              </div>
            </div>

            {/* Specialty Filter */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specialty</p>
              <input
                name="specialty"
                placeholder="e.g. Cardiology"
                defaultValue={specialty}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white border-2 border-blue-600 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </form>
        </div>
      </aside>

      {/* Doctor Cards */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {visibleDoctors.length} Doctor{visibleDoctors.length !== 1 ? "s" : ""} found
              {specialty ? ` in ${specialty}` : ""}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Sort by:</span>
            <select className="border-0 text-blue-600 font-semibold cursor-pointer bg-transparent">
              <option>Relevance</option>
              <option>Fee: Low to High</option>
              <option>Fee: High to Low</option>
              <option>Rating</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleDoctors.map((doctor, index) => {
            const initial = (doctor.user.name ?? "D").charAt(0).toUpperCase();
            const colorClass = COLORS[index % COLORS.length];
            const rating = (4.2 + (index * 0.15) % 0.8).toFixed(1);

            return (
              <div
                key={doctor.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                {/* Avatar Header */}
                <div className={`relative h-44 ${colorClass.split(" ")[0]} flex items-center justify-center`}>
                  <span className={`text-5xl font-bold ${colorClass.split(" ")[1]} opacity-40`}>
                    {initial}
                  </span>
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-800">{rating}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <Link href={`/patient/doctors/${doctor.id}`} className="block group-hover:text-blue-600 transition-colors">
                    <h3 className="font-bold text-gray-900 mb-0.5">Dr. {doctor.user.name}</h3>
                  </Link>
                  <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialization}</p>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Medical Center
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ₹{doctor.consultationFee.toString()} consultation
                  </div>

                  <Link
                    href={`/patient/book/${doctor.id}`}
                    className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {visibleDoctors.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No doctors found matching your search.</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Showing first {PAGE_SIZE} results — refine your search to narrow down further.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}