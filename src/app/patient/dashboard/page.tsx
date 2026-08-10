import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Badge from "@/components/shared/Badge";

export const metadata = { title: "Dashboard — DocSlot" };


export default async function PatientDashboardPage() {
  const session = await auth();
  const patient = await prisma.patient.findUnique({
    where: { userId: session!.user.id },
    include: { user: true },
  });
  if (!patient) return <p className="text-gray-500">No patient profile found.</p>;

  const now = new Date();

  const upcomingAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: patient.id,
      status: "CONFIRMED",
      slot: { date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
    },
    orderBy: { slot: { date: "asc" } },
    select: {
      id: true,
      status: true,
      slot: { select: { date: true, startTime: true } },
      doctor: { select: { specialization: true, user: { select: { name: true } } } },
    },
  });

  const lastCompleted = await prisma.appointment.findFirst({
    where: { patientId: patient.id, status: "COMPLETED" },
    orderBy: { slot: { date: "desc" } },
    select: {
      reason: true,
      slot: { select: { date: true } },
    },
  });

  const recommendedDoctors = await prisma.doctor.findMany({
    where: { status: "APPROVED" },
    take: 3,
    select: {
      id: true,
      specialization: true,
      consultationFee: true,
      user: { select: { name: true } },
    },
  });

  const doctorInitial = (name: string | null) => (name ?? "D").charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Greeting */}
      <h1 className="text-3xl font-bold text-gray-900 mb-1">
        Hello, {patient.user.name?.split(" ")[0]}!
      </h1>
      <p className="text-gray-500 mb-8">
        Here&apos;s what&apos;s happening with your health profile today.
      </p>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Appointment — spans 2 columns */}
        <div className="lg:col-span-2">
          {upcomingAppointment ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-5">
                {/* Doctor Avatar */}
                <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold flex-shrink-0">
                  {doctorInitial(upcomingAppointment.doctor.user.name)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge status={upcomingAppointment.status} />
                      <span className="text-xs text-gray-400">Appointment</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                    Dr. {upcomingAppointment.doctor.user.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {upcomingAppointment.doctor.specialization}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(upcomingAppointment.slot.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}, {upcomingAppointment.slot.startTime}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/patient/appointments"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                    <button className="border border-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-3">No upcoming appointments</p>
              <Link
                href="/patient/search"
                className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm hover:underline"
              >
                Find a doctor →
              </Link>
            </div>
          )}
        </div>

        {/* Right Column — Info Cards */}
        <div className="flex flex-col gap-4">
          {/* Last Visit */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Last Visit</p>
            <p className="text-lg font-bold text-gray-900 mb-1">
              {lastCompleted ? (lastCompleted.reason || "General Checkup") : "No visits yet"}
            </p>
            {lastCompleted && (
              <Link href="/patient/appointments" className="text-xs text-blue-600 font-medium hover:underline">
                View Results →
              </Link>
            )}
          </div>

          {/* Routine Checkup */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0d9488" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-full">In 6 Months</span>
            </div>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-1">Routine Checkup</p>
            <p className="text-lg font-bold text-gray-900 mb-1">
              {new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-gray-400">Reminders will be sent 1 week before.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Link href="/patient/appointments" className="text-sm text-blue-600 font-medium hover:underline">
            View All History
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Blood Lab Results Uploaded</p>
                <p className="text-xs text-gray-400">Quest Diagnostics Center</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">2 hours ago</p>
              <button className="text-gray-400 hover:text-blue-600 cursor-pointer mt-1" title="Download Results (Coming soon)">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Prescription Refilled: Lisinopril</p>
                <p className="text-xs text-gray-400">Walgreens Pharmacy #4421</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Yesterday</p>
              <button className="text-gray-400 hover:text-blue-600 cursor-pointer mt-1" title="View Prescription (Coming soon)">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Payment Processed - Co-pay</p>
                <p className="text-xs text-gray-400">Cardiology Visit (₹40.00)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Cardiology Visit (₹40.00)</p>
              <button className="text-gray-400 hover:text-blue-600 cursor-pointer mt-1" title="Download Receipt (Coming soon)">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Doctors */}
      {recommendedDoctors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recommended Doctors</h2>
            <Link href="/patient/search" className="text-sm text-blue-600 font-medium hover:underline">
              See All Doctors →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {doctorInitial(doctor.user.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Dr. {doctor.user.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                  <span className="text-xs text-gray-500">₹{doctor.consultationFee.toString()} fee</span>
                  <Link
                    href={`/patient/book/${doctor.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Book Visit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}