"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelAppointment } from "@/actions/appointmentActions";
import Badge from "@/components/shared/Badge";

type UpcomingVisitItem = {
  id: string;
  status: string;
  reason?: string | null;
  doctor: {
    id: string;
    specialization: string;
    user: {
      name: string | null;
    };
  };
  slot: {
    date: string | Date;
    startTime: string;
    endTime?: string;
  };
};

type UpcomingVisitsProps = {
  initialItems: UpcomingVisitItem[];
  patientId: string;
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
];

export default function UpcomingVisits({ initialItems, patientId }: UpcomingVisitsProps) {
  const router = useRouter();
  const [items, setItems] = useState<UpcomingVisitItem[]>(initialItems);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(id: string) {
    const reason = window.prompt("Why are you cancelling this appointment? (optional)");
    if (reason === null) return; // user clicked Cancel on the prompt itself

    setCancellingId(id);
    const res = await cancelAppointment(id, patientId, reason || undefined);
    setCancellingId(null);
    if (res.success) {
      setItems(items.map((i) => (i.id === id ? { ...i, status: "CANCELLED" } : i)));
      router.refresh();
    } else {
      alert(res.error || "Failed to cancel appointment");
    }
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Visits</h2>
          <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
            {items.filter((i) => i.status === "CONFIRMED").length}
          </span>
        </div>
        <Link
          href="/patient/search"
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline flex items-center gap-1"
        >
          Book New +
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-8 text-center bg-white shadow-sm">
          <p className="text-gray-500 text-sm mb-3">You have no upcoming visits scheduled.</p>
          <Link
            href="/patient/search"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Find a Doctor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((a, idx) => {
            const isVideo = idx % 2 === 1;
            const initials =
              a.doctor.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "DR";
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const formattedDate = new Date(a.slot.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={a.id}
                className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white flex flex-col justify-between hover:border-gray-300 transition-all"
              >
                <div>
                  {/* Top row: Doctor info and Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div>
                        <Link
                          href={`/patient/doctors/${a.doctor.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 text-base block transition-colors"
                        >
                          Dr. {a.doctor.user.name}
                        </Link>
                        <p className="text-xs text-gray-500 font-medium">{a.doctor.specialization}</p>
                      </div>
                    </div>
                    <Badge status={a.status} />
                  </div>

                  {/* Middle row: Date, Time, Location */}
                  <div className="bg-gray-50 rounded-lg p-3.5 mb-4 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-700">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {a.slot.startTime} {a.slot.endTime ? `- ${a.slot.endTime}` : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {isVideo ? (
                        <>
                          <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-blue-600">Video Consultation</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>St. Mary&apos;s Health Center, Wing B</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom row: Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  {isVideo ? (
                    <button
                      onClick={() => alert("Joining video consultation room...")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors text-center shadow-sm"
                    >
                      Join Call
                    </button>
                  ) : (
                    <Link
                      href={`/patient/doctors/${a.doctor.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors text-center shadow-sm block"
                    >
                      View Details
                    </Link>
                  )}

                  {a.status === "CONFIRMED" && (
                    isVideo ? (
                      <Link
                        href={`/patient/book/${a.doctor.id}`}
                        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors text-center block"
                      >
                        Reschedule
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleCancel(a.id)}
                        disabled={cancellingId === a.id}
                        className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors text-center disabled:opacity-50"
                      >
                        {cancellingId === a.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
