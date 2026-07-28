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

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Doctor Profile</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Manage your public credentials, specialization, biography, and consultation pricing.
        </p>
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