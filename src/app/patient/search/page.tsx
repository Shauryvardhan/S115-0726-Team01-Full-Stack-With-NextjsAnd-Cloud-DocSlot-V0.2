import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DoctorFilters from "@/components/patient/DoctorFilters";

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
  searchParams: Promise<{
    specialty?: string;
    q?: string;
    gender?: string;
    minRating?: string;
    maxFee?: string;
    availability?: string;
  }>;
}) {
  const { specialty, q, gender, minRating, maxFee, availability } = await searchParams;
  const PAGE_SIZE = 6;

  const now = new Date();
  let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined;

  if (availability === "today") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    dateFilter = { gte: startOfToday, lte: endOfToday };
  } else if (availability === "week") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 23, 59, 59, 999);
    dateFilter = { gte: startOfToday, lte: endOfWeek };
  }

  const whereClause: any = {
    status: "APPROVED" as const,
    ...(specialty && { specialization: { contains: specialty, mode: "insensitive" as const } }),
    ...(gender && { gender: { equals: gender, mode: "insensitive" as const } }),
    ...(minRating && { rating: { gte: parseFloat(minRating) } }),
    ...(maxFee && { consultationFee: { lte: parseFloat(maxFee) } }),
    ...(dateFilter && {
      schedules: {
        some: {
          slots: {
            some: {
              isBooked: false,
              date: dateFilter,
            },
          },
        },
      },
    }),
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
        <DoctorFilters
          initialSpecialty={specialty}
          initialGender={gender}
          initialMinRating={minRating}
          initialMaxFee={maxFee}
          initialAvailability={availability}
        />
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
            const rating = (doctor.rating ?? 4.5).toFixed(1);

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