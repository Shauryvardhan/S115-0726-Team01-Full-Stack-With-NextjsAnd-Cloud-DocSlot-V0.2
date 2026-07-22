"use client";

import { useState } from "react";
import { fetchAppointmentHistory } from "@/actions/appointmentActions";
import Badge from "@/components/shared/Badge";

type AppointmentHistoryItem = {
  id: string;
  status: string;
  doctor: {
    user: {
      name: string | null;
    };
  };
  slot: {
    date: string | Date;
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

  return (
    <div>
      <div className="flex flex-col gap-2">
        {items.map((a) => (
          <div key={a.id} className="flex justify-between items-center border-b py-3">
            <div>
              <p className="font-medium text-sm">Dr. {a.doctor.user.name}</p>
              <p className="text-xs text-gray-500">{new Date(a.slot.date).toLocaleDateString("en-IN")}</p>
            </div>
            <Badge status={a.status} />
          </div>
        ))}
      </div>
      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full mt-4 py-2 border rounded-lg text-blue-600 text-sm font-medium"
        >
          {loading ? "Loading..." : "Load More Appointments"}
        </button>
      )}
    </div>
  );
}