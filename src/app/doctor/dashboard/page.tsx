import { fetchTodaysAppointments } from "@/actions/doctorDashboardActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DoctorDashboardContent from "@/components/doctor/DoctorDashboardContent";

export default async function DoctorDashboardPage() {
  const session = await auth();
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session!.user.id },
    include: { user: true },
  });
  if (!doctor) return <p className="text-gray-500">No doctor profile found.</p>;

  const { appointments, stats } = await fetchTodaysAppointments(doctor.id);

  const formattedAppointments = appointments.map((a) => ({
    id: a.id,
    patient: {
      id: a.patient.id,
      user: { name: a.patient.user.name },
    },
    slot: {
      startTime: a.slot.startTime,
      endTime: a.slot.endTime,
    },
    reason: a.reason,
    status: a.status,
  }));

  return (
    <DoctorDashboardContent
      initialAppointments={formattedAppointments}
      stats={stats}
      doctorName={doctor.user.name}
    />
  );
}