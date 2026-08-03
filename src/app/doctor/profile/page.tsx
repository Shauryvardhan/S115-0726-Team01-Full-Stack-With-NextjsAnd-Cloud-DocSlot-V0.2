import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ProfileForm from "@/components/doctor/ProfileForm";

export default async function DoctorProfilePage() {
  const session = await auth();
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session!.user.id },
    include: { user: true },
  });

  if (!doctor) return <p className="text-gray-500">No doctor profile found.</p>;

  const [completedCount, totalPatients] = await Promise.all([
    prisma.appointment.count({
      where: { doctorId: doctor.id, status: "COMPLETED" },
    }),
    prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      select: { patientId: true },
      distinct: ["patientId"],
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Doctor Profile</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Manage your public credentials, specialization, biography, and consultation pricing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalPatients.length}</p>
          <p className="text-xs text-gray-500">Total Patients</p>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
          <p className="text-xs text-gray-500">Completed Visits</p>
        </div>
      </div>

      <ProfileForm
        doctor={{
          id: doctor.id,
          name: doctor.user.name,
          specialization: doctor.specialization,
          qualifications: doctor.qualifications ?? "",
          bio: doctor.bio ?? "",
          consultationFee: doctor.consultationFee.toString(),
        }}
      />
    </div>
  );
}
