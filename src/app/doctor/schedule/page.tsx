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

  // Cast schedules for client component
  const formattedSchedules = schedules.map((s) => ({
    id: s.id,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    slotDuration: s.slotDuration,
  }));

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Top bar with title, Week/Month toggle, and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Schedule</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button className="px-3.5 py-1 bg-white shadow-sm text-xs font-semibold rounded-md text-blue-600 transition-all">
              Week
            </button>
            <button className="px-3.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-all">
              Month
            </button>
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      <ScheduleGrid doctorId={doctor.id} existingSchedules={formattedSchedules} />
    </div>
  );
}