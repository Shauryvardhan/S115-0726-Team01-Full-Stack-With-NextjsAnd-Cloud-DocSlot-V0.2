import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SearchDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; q?: string }>;
}) {
  const { specialty, q } = await searchParams;

  const doctors = await prisma.doctor.findMany({
    where: {
      status: "APPROVED",
      ...(specialty && { specialization: { contains: specialty, mode: "insensitive" } }),
      ...(q && {
        OR: [
          { user: { name: { contains: q, mode: "insensitive" } } },
          { specialization: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { user: true },
  });

  return (
    <div className="grid grid-cols-4 gap-6">
      <aside className="col-span-1">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-sm mb-3">Filters</h2>
          <form>
            <label className="text-xs text-gray-500 block mb-1">Specialty</label>
            <input
              name="specialty"
              placeholder="e.g. Cardiology"
              defaultValue={specialty}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
            >
              Apply Filters
            </button>
          </form>
        </div>
      </aside>

      <div className="col-span-3">
        <h1 className="text-xl font-bold mb-1">{doctors.length} Doctors Found</h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white border rounded-lg p-4">
              <Link href={`/patient/doctors/${doctor.id}`} className="font-semibold hover:underline">
                Dr. {doctor.user.name}
              </Link>
              <p className="text-sm text-blue-600 mb-1">{doctor.specialization}</p>
              <p className="text-xs text-gray-500 mb-3">
                ₹{doctor.consultationFee.toString()} consultation fee
              </p>
              <Link
                href={`/patient/book/${doctor.id}`}
                className="block text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
        {doctors.length === 0 && (
          <p className="text-gray-500 border rounded-lg p-6 text-center mt-4">
            No doctors found matching your search.
          </p>
        )}
      </div>
    </div>
  );
}