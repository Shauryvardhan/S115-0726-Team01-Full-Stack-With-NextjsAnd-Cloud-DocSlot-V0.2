import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PatientSettingsForm from "@/components/patient/PatientSettingsForm";

export default async function PatientSettingsPage() {
  const session = await auth();
  const patient = await prisma.patient.findUnique({
    where: { userId: session!.user.id },
    include: { user: true },
  });

  if (!patient) return <p className="text-gray-500">No patient profile found.</p>;

  return (
    <div className="max-w-4xl mx-auto py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings & Profile</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Manage your contact details, emergency information, and notification preferences.
        </p>
      </div>

      <PatientSettingsForm
        patient={{
          id: patient.id,
          name: patient.user.name,
          email: patient.user.email,
          phone: patient.user.phone,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactRelation: patient.emergencyContactRelation,
          emergencyContactPhone: patient.emergencyContactPhone,
          allergies: patient.allergies,
          emailReminders: patient.emailReminders,
          smsAlerts: patient.smsAlerts,
        }}
      />
    </div>
  );
}
