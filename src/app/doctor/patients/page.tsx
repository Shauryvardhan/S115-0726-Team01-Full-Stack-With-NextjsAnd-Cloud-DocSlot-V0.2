import { fetchDoctorAppointmentHistory } from "@/actions/appointmentActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/shared/Badge";
import DoctorHistoryList from "@/components/doctor/DoctorHistoryList";

export const metadata = { title: "Patient History — DocSlot" };

export default async function DoctorPatientHistoryPage() {
  const session = await auth();
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session!.user.id },
  });
  if (!doctor) return <p className="text-gray-500">No doctor profile found.</p>;

  const { items, nextCursor } = await fetchDoctorAppointmentHistory(doctor.id);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Patient History</h1>
      <DoctorHistoryList initialItems={items} initialCursor={nextCursor} doctorId={doctor.id} />
    </div>
  );
}
