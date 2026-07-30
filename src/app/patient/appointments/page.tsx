import { fetchAppointmentHistory } from "@/actions/appointmentActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HistoryList from "@/components/appointment/HistoryList";
import UpcomingVisits from "@/components/appointment/UpcomingVisits";

export const metadata = { title: "My Appointments — DocSlot" };


export default async function AppointmentHistoryPage() {
  const session = await auth();
  const patient = await prisma.patient.findUnique({ where: { userId: session!.user.id } });
  if (!patient) return <p className="text-gray-500">No patient profile found.</p>;

  const { items, nextCursor } = await fetchAppointmentHistory(patient.id);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = items.filter((a) => a.status === "CONFIRMED" && new Date(a.slot.date) >= startOfToday);
  const past = items.filter((a) => a.status !== "CONFIRMED" || new Date(a.slot.date) < startOfToday);

  // Cast types to match components
  const formattedUpcoming = upcoming.map((a) => ({
    id: a.id,
    status: a.status,
    reason: a.reason,
    doctor: {
      id: (a.doctor as unknown as { id: string }).id || "",
      specialization: (a.doctor as unknown as { specialization: string }).specialization || "General Practice",
      user: {
        name: a.doctor.user.name,
      },
    },
    slot: {
      date: a.slot.date,
      startTime: a.slot.startTime,
      endTime: (a.slot as unknown as { endTime?: string }).endTime,
    },
  }));

  const formattedPast = past.map((a) => ({
    id: a.id,
    status: a.status,
    reason: a.reason,
    doctor: {
      id: (a.doctor as unknown as { id: string }).id || "",
      specialization: (a.doctor as unknown as { specialization: string }).specialization || "General Practice",
      user: {
        name: a.doctor.user.name,
      },
    },
    slot: {
      date: a.slot.date,
      startTime: a.slot.startTime,
    },
  }));

  return (
    <div className="max-w-5xl mx-auto py-2">
      {/* Top bar with title, search, and notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search history..."
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 relative transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      <UpcomingVisits initialItems={formattedUpcoming} patientId={patient.id} />

      <HistoryList initialItems={formattedPast} initialCursor={nextCursor} patientId={patient.id} />
    </div>
  );
}