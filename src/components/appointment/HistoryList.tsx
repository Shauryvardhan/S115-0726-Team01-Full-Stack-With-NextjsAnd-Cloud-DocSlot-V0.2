"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchAppointmentHistory } from "@/actions/appointmentActions";
import Badge from "@/components/shared/Badge";

type AppointmentHistoryItem = {
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
  };
};

type HistoryListProps = {
  initialItems: AppointmentHistoryItem[];
  initialCursor: string | null;
  patientId: string;
};

export default function HistoryList({ initialItems, initialCursor, patientId }: HistoryListProps) {
  const [items, setItems] = useState<AppointmentHistoryItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  async function loadMore() {
    setLoading(true);
    const result: { items: AppointmentHistoryItem[]; nextCursor: string | null } = await fetchAppointmentHistory(
      patientId,
      cursor ?? undefined
    );
    setItems([...items, ...result.items]);
    setCursor(result.nextCursor);
    setLoading(false);
  }

  const filteredItems = items.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Past Appointments</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
        >
          <option value="ALL">All Types</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="CONFIRMED">Confirmed</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-8 text-center bg-white shadow-sm my-4">
          <p className="text-gray-500 text-sm">No past appointments found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((a, idx) => {
            const formattedDate = new Date(a.slot.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const isCancelled = a.status === "CANCELLED";
            const actionText =
              idx % 4 === 0 ? "Review Results" : idx % 4 === 1 ? "View Invoice" : idx % 4 === 2 ? "Certificate" : "Review Results";

            return (
              <div
                key={a.id}
                className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-white hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Icon Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCancelled ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isCancelled ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : idx % 3 === 0 ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.01M15 9h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : idx % 3 === 1 ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>

                  {/* Doctor & Specialty/Date */}
                  <div className="min-w-0 flex-1 pr-4">
                    <Link
                      href={`/patient/doctors/${a.doctor.id}`}
                      className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors truncate block"
                    >
                      Dr. {a.doctor.user.name}
                    </Link>
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                      {a.reason || a.doctor.specialization || "Routine Checkup"} • {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Badge and Action */}
                <div className="flex items-center gap-4 md:gap-6 shrink-0">
                  <Badge status={a.status} />
                  {isCancelled ? (
                    <Link
                      href={`/patient/book/${a.doctor.id}`}
                      className="text-gray-700 hover:text-gray-900 text-xs font-bold whitespace-nowrap hover:underline"
                    >
                      Book Again
                    </Link>
                  ) : a.status === "COMPLETED" ? (
                    <Link
                      href={`/patient/doctors/${a.doctor.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold whitespace-nowrap hover:underline"
                    >
                      {actionText}
                    </Link>
                  ) : (
                    <Link
                      href={`/patient/doctors/${a.doctor.id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold whitespace-nowrap hover:underline"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="py-2.5 px-6 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center mx-auto my-6 gap-2 shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More Appointments ∨"}
        </button>
      )}
    </div>
  );
}