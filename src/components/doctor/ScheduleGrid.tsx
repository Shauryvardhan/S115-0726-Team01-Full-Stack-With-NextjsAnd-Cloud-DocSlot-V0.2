"use client";

import { useState } from "react";
import { createSchedule } from "@/actions/scheduleActions";
import { useRouter } from "next/navigation";

const DAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

type Schedule = { id: string; dayOfWeek: number; startTime: string; endTime: string; slotDuration: number };

export default function ScheduleGrid({
  doctorId,
  existingSchedules,
}: {
  doctorId: string;
  existingSchedules: Schedule[];
}) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const scheduleByDay = existingSchedules.reduce((acc, s) => {
    acc[s.dayOfWeek] = s;
    return acc;
  }, {} as Record<number, Schedule>);

  async function handleSave() {
    if (selectedDay === null) return;
    setSaving(true);
    setError("");

    const result = await createSchedule({
      doctorId,
      dayOfWeek: selectedDay,
      startTime,
      endTime,
      slotDuration,
    });

    setSaving(false);
    if (!result.success) {
      setError(Object.values(result.errors ?? {}).flat().join(", ") || "Failed to save");
      return;
    }
    router.refresh();
    setSelectedDay(null);
  }

  return (
    <div className="grid grid-cols-7 gap-3 mb-6">
      {DAYS.map((day) => {
        const existing = scheduleByDay[day.value];
        return (
          <button
            key={day.value}
            onClick={() => setSelectedDay(day.value)}
            className={`border rounded-lg p-3 text-center ${
              existing ? "bg-blue-50 border-blue-300" : "border-gray-200"
            } ${selectedDay === day.value ? "ring-2 ring-blue-600" : ""}`}
          >
            <p className="text-sm font-medium">{day.label}</p>
            {existing ? (
              <p className="text-xs text-gray-500 mt-1">
                {existing.startTime}–{existing.endTime}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Unavailable</p>
            )}
          </button>
        );
      })}

      {selectedDay !== null && (
        <div className="col-span-7 border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold mb-3">
            {DAYS.find((d) => d.value === selectedDay)?.label} Availability
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Slot Duration (min)</label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      )}
    </div>
  );
}