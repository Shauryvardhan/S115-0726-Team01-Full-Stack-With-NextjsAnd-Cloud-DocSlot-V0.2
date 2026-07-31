"use client";

import { useState } from "react";
import { fetchDoctorAppointmentHistory } from "@/actions/appointmentActions";
import Badge from "@/components/shared/Badge";

type Item = {
  id: string;
  status: string;
  reason?: string | null;
  slot: { date: string | Date; startTime: string };
  patient: { id: string; user: { name: string | null } };
};

export default function DoctorHistoryList({
  initialItems,
  initialCursor,
  doctorId,
}: {
  initialItems: Item[];
  initialCursor: string | null;
  doctorId: string;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const result = await fetchDoctorAppointmentHistory(doctorId, cursor ?? undefined);
    setItems([...items, ...result.items]);
    setCursor(result.nextCursor);
    setLoading(false);
  }

  if (items.length === 0) {
    return (
      <p className="text-gray-500 border rounded-lg p-6 text-center">
        No appointment history yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        {items.map((a) => (
          <div key={a.id} className="flex justify-between items-center border-b py-3">
            <div>
              <p className="font-medium text-sm">{a.patient.user.name}</p>
              <p className="text-xs text-gray-500">
                {new Date(a.slot.date).toLocaleDateString("en-IN")} · {a.slot.startTime}
                {a.reason ? ` · ${a.reason}` : ""}
              </p>
            </div>
            <Badge status={a.status} />
          </div>
        ))}
      </div>
      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full mt-4 py-2 border rounded-lg text-blue-600 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
