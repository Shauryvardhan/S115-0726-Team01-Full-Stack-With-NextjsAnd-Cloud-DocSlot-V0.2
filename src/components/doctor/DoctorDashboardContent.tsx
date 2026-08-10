"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Badge from "@/components/shared/Badge";
import { blockTodayForDoctor } from "@/actions/scheduleActions";

type AppointmentItem = {
  id: string;
  patient: {
    id: string;
    user: { name: string | null };
  };
  slot: {
    startTime: string;
    endTime: string;
  };
  reason?: string | null;
  status: string;
};

type DoctorDashboardContentProps = {
  initialAppointments: AppointmentItem[];
  stats: { booked: number; total: number };
  doctorName: string;
  doctorId: string;
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
];

export default function DoctorDashboardContent({
  initialAppointments,
  stats,
  doctorName,
  doctorId,
}: DoctorDashboardContentProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isBlockingToday, setIsBlockingToday] = useState(false);

  async function handleMarkUnavailable() {
    if (!confirm("Mark all remaining unbooked slots today as unavailable? This can't be undone.")) return;

    setIsBlockingToday(true);
    try {
      const result = await blockTodayForDoctor(doctorId);
      alert(`${result.removedCount} unbooked slot(s) removed for today.`);
      router.refresh();
    } finally {
      setIsBlockingToday(false);
    }
  }

  const filteredList = initialAppointments.filter((a) =>
    (a.patient.user.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bookedCount = stats.booked;
  const totalCount = stats.total;
  const progressPercent = totalCount > 0 ? Math.min(Math.round((bookedCount / totalCount) * 100), 100) : 0;

  const firstPatient = initialAppointments[0]?.patient.user.name || null;
  const hasAppointments = initialAppointments.length > 0;

  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto py-2">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients or records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
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
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 relative transition-colors bg-white shadow-sm">
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
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm hidden sm:block">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <div className="text-xs font-semibold text-gray-600 border border-gray-200 px-3.5 py-2 rounded-lg bg-white shadow-sm whitespace-nowrap">
            Today: {todayStr}
          </div>
          <button
            onClick={handleMarkUnavailable}
            disabled={isBlockingToday}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBlockingToday ? "Blocking..." : "Mark Today Unavailable"}
          </button>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Daily Capacity Card */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Daily Capacity</p>
            <p className="text-3xl font-extrabold text-gray-900 mb-1">
              {bookedCount} <span className="text-xl font-semibold text-gray-500">of {totalCount}</span>
            </p>
            <p className="text-xs font-medium text-gray-500 mb-5">Slots booked for today</p>
          </div>
          <div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Current Session Banner */}
        {hasAppointments ? (
        <div className="col-span-1 md:col-span-2 bg-blue-600 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between relative overflow-hidden group">
          {/* Watermark SVG */}
          <svg
            className="absolute -right-6 -bottom-6 w-44 h-44 opacity-10 text-white pointer-events-none transition-transform duration-500 group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
          </svg>

          <div className="z-10 mb-4 sm:mb-0">
            <span className="bg-blue-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase inline-block mb-3 shadow-sm">
              Current Session
            </span>
            <h2 className="text-2xl font-bold mb-1.5 leading-tight">Next Patient: {firstPatient}</h2>
            <p className="text-xs text-blue-100 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {initialAppointments[0]?.slot.startTime} — {initialAppointments[0]?.slot.endTime}
            </p>
          </div>

          <div className="z-10 w-full sm:w-auto">
            <button
              onClick={() => {
                setSessionStarted(true);
                alert(`Starting consultation session with ${firstPatient}...`);
              }}
              className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-600 font-bold px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all transform active:scale-95"
            >
              <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>{sessionStarted ? "Resume Session" : "Begin Appointment"}</span>
            </button>
          </div>
        </div>
        ) : (
        <div className="col-span-1 md:col-span-2 bg-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-600 mb-1">No Appointments Today</h2>
          <p className="text-xs text-gray-400 font-medium">Your schedule is clear. Enjoy the break!</p>
        </div>
        )}
      </div>

      {/* Today's Appointments Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-base font-bold text-gray-900">Today&apos;s Appointments</h2>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last updated: 2 mins ago
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Patient</th>
                <th className="py-3.5 px-6">Time</th>
                <th className="py-3.5 px-6">Reason</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredList.map((a, idx) => {
                const initials =
                  a.patient.user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "PT";
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                // Extract PID or hash ID
                const pid = a.id.includes("_") ? a.id.split("_")[1] : a.id.slice(-5).toUpperCase();
                const isWaiting = a.status === "Waiting" || (idx === 0 && a.status === "CONFIRMED");
                const badgeStatus = isWaiting ? "Waiting" : "Scheduled";

                return (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${colorClass}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{a.patient.user.name}</p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">PID: #{pid}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900 text-xs">{a.slot.startTime}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        to {a.slot.endTime}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-gray-700">{a.reason || "Routine Checkup"}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          isWaiting
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {badgeStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => alert(`Viewing medical history and notes for ${a.patient.user.name}...`)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors inline-block text-xs font-semibold"
                        title="View Patient Details"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredList.length === 0 && (
            <div className="py-12 text-center">
              {searchTerm ? (
                <p className="text-gray-500 text-sm font-medium">No patients found matching &quot;{searchTerm}&quot;.</p>
              ) : (
                <div>
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm font-semibold mb-1">No appointments today</p>
                  <p className="text-gray-400 text-xs">Check your schedule page to manage upcoming availability.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
          <Link
            href="/doctor/schedule"
            className="text-blue-600 hover:text-blue-700 font-bold text-xs hover:underline inline-block transition-colors"
          >
            View All Appointments
          </Link>
        </div>
      </div>

      {/* Bottom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lab Results Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-blue-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Lab Results Pending</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-3 font-medium">
              Lab results for Patient #88219 (Sarah Jenkins) have arrived in the system. Review needed before session.
            </p>
            <button
              onClick={() => alert("Opening lab results viewer for Sarah Jenkins...")}
              className="text-blue-600 hover:text-blue-800 text-xs font-bold hover:underline transition-colors"
            >
              Review Results
            </button>
          </div>
        </div>

        {/* Emergency Alert Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-red-300 transition-all">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Emergency Alert</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-3 font-medium">
              Schedule conflict at 3:00 PM due to urgent referral. Please review your afternoon block.
            </p>
            <Link
              href="/doctor/schedule"
              className="text-red-600 hover:text-red-800 text-xs font-bold hover:underline transition-colors block"
            >
              Resolve Conflict
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
