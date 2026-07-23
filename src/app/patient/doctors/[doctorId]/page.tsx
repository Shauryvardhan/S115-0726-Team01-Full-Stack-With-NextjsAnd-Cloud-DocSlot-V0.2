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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">Dr. {doctor.user.name}</h1>
            <p className="text-blue-600">{doctor.specialization}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Consultation Fee</p>
            <p className="font-bold">₹{doctor.consultationFee.toString()}</p>
          </div>
        </div>

        {doctor.bio && (
          <div className="mb-4">
            <h2 className="font-semibold text-sm mb-1">About</h2>
            <p className="text-sm text-gray-600">{doctor.bio}</p>
          </div>
        )}

        {doctor.qualifications && (
          <div className="mb-6">
            <h2 className="font-semibold text-sm mb-1">Qualifications</h2>
            <p className="text-sm text-gray-600">{doctor.qualifications}</p>
          </div>
        )}

        <Link
          href={`/patient/book/${doctor.id}`}
          className="block text-center bg-blue-600 text-white py-3 rounded-lg font-medium"
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}