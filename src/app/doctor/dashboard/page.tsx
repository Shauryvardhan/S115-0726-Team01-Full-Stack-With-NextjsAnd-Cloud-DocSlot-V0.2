import { fetchTodaysAppointments } from "@/actions/doctorDashboardActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DoctorDashboardPage() {
  const session = await auth();
  const doctor = await prisma.doctor.findUnique({ where: { userId: session!.user.id } });
  if (!doctor) return <p className="text-gray-500">No doctor profile found.</p>;

  const { appointments, stats } = await fetchTodaysAppointments(doctor.id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">DAILY CAPACITY</p>
          <p className="text-2xl font-bold">{stats.booked} of {stats.total}</p>
          <p className="text-xs text-gray-500 mb-2">Slots booked for today</p>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(stats.booked / Math.max(stats.total, 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <h2 className="font-semibold mb-3">Today&apos;s Appointments</h2>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Patient</th>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3 font-medium">{a.patient.user.name}</td>
                <td className="px-4 py-3 text-gray-500">{a.slot.startTime}</td>
                <td className="px-4 py-3 text-gray-500">{a.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <p className="text-center text-gray-500 py-6">No appointments today.</p>
        )}
      </div>
    </div>
  );
}