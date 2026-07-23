import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ScheduleGrid from "@/components/doctor/ScheduleGrid";

export default async function ManageSchedulePage() {
  const session = await auth();
  const doctor = await prisma.doctor.findUnique({ where: { userId: session!.user.id } });
  if (!doctor) return <p className="text-gray-500">No doctor profile found.</p>;

  const schedules = await prisma.schedule.findMany({
    where: { doctorId: doctor.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage Schedule</h1>
      <ScheduleGrid doctorId={doctor.id} existingSchedules={schedules} />
    </div>
  );
}