import { fetchAppointmentHistory } from "@/actions/appointmentActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/shared/Badge";
import HistoryList from "@/components/appointment/HistoryList";

export default async function AppointmentHistoryPage() {
  const session = await auth();
  const patient = await prisma.patient.findUnique({ where: { userId: session!.user.id } });
  if (!patient) return <p className="text-gray-500">No patient profile found.</p>;

  const { items, nextCursor } = await fetchAppointmentHistory(patient.id);
  const upcoming = items.filter((a) => a.status === "CONFIRMED" && new Date(a.slot.date) >= new Date());
  const past = items.filter((a) => a.status !== "CONFIRMED" || new Date(a.slot.date) < new Date());

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>

      <h2 className="font-semibold text-gray-700 mb-2">Upcoming Visits ({upcoming.length})</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {upcoming.map((a) => (
          <div key={a.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">Dr. {a.doctor.user.name}</p>
              <Badge status={a.status} />
            </div>
            <p className="text-sm text-gray-500">
              {new Date(a.slot.date).toLocaleDateString("en-IN")} · {a.slot.startTime}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-gray-700 mb-2">Past Appointments</h2>
      <HistoryList initialItems={past} initialCursor={nextCursor} patientId={patient.id} />
    </div>
  );
}