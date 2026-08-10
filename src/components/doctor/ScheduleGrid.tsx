"use client";

import { useState } from "react";
import { createSchedule, updateSchedule, blockTodayForDoctor } from "@/actions/scheduleActions";
import { useRouter } from "next/navigation";

const HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

type DayInfo = { label: string; date: string; value: number };

type Schedule = { id: string; dayOfWeek: number; startTime: string; endTime: string; slotDuration: number };

export default function ScheduleGrid({
  doctorId,
  existingSchedules,
  bookedSlots,
  weekDays,
  statsAvailable,
  statsTotal,
}: {
  doctorId: string;
  existingSchedules: Schedule[];
  bookedSlots: Record<string, string>;
  weekDays: DayInfo[];
  statsAvailable: number;
  statsTotal: number;
}) {
  const router = useRouter();
  const [showRecurring, setShowRecurring] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  // Track availability state for grid cells (dayValue -> Set of hour strings)
  const [availableSlots, setAvailableSlots] = useState<Record<number, Set<string>>>(() => {
    const initial: Record<number, Set<string>> = {};
    weekDays.forEach((d) => {
      const sched = existingSchedules.find((s) => s.dayOfWeek === d.value);
      const hoursSet = new Set<string>();
      if (sched) {
        const startH = parseInt(sched.startTime.split(":")[0]);
        const endH = parseInt(sched.endTime.split(":")[0]);
        HOURS.forEach((h) => {
          const hourNum = parseInt(h.split(":")[0]);
          if (hourNum >= startH && hourNum < endH) {
            hoursSet.add(h);
          }
        });
      } else {
        // Default some open hours if no existing schedule
        HOURS.forEach((h) => {
          const hourNum = parseInt(h.split(":")[0]);
          if (hourNum >= 9 && hourNum <= 16) hoursSet.add(h);
        });
      }
      initial[d.value] = hoursSet;
    });
    return initial;
  });

  function toggleSlot(dayValue: number, hour: string) {
    if (bookedSlots[`${dayValue}-${hour}`]) return; // Cannot toggle booked slots
    setAvailableSlots((prev) => {
      const currentSet = new Set(prev[dayValue] || []);
      if (currentSet.has(hour)) {
        currentSet.delete(hour);
      } else {
        currentSet.add(hour);
      }
      return { ...prev, [dayValue]: currentSet };
    });
  }

  async function handleSaveRecurring() {
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
    setShowRecurring(false);
    alert("Recurring schedule applied successfully!");
    router.refresh();
  }

  async function handleSaveSchedule() {
    setSaving(true);
    setError("");

    try {
      // Persist availability changes for each day that has an existing schedule
      for (const day of weekDays) {
        const sched = existingSchedules.find((s) => s.dayOfWeek === day.value);
        if (!sched) continue;

        const daySlots = availableSlots[day.value];
        if (!daySlots || daySlots.size === 0) continue;

        // Compute effective start/end from toggled availability
        const activeHours = HOURS.filter((h) => daySlots.has(h)).map((h) => parseInt(h.split(":")[0]));
        if (activeHours.length === 0) continue;

        const newStart = `${String(Math.min(...activeHours)).padStart(2, "0")}:00`;
        const newEnd = `${String(Math.max(...activeHours) + 1).padStart(2, "0")}:00`;

        if (newStart !== sched.startTime || newEnd !== sched.endTime) {
          await updateSchedule(sched.id, { startTime: newStart, endTime: newEnd });
        }
      }

      router.refresh();
      alert("Schedule saved successfully!");
    } catch {
      setError("Failed to save schedule changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleEmergencyBlock() {
    if (!confirm("Block all remaining unbooked slots for today? This cannot be undone.")) return;
    setIsBlocking(true);
    try {
      const result = await blockTodayForDoctor(doctorId);
      alert(`${result.removedCount} unbooked slot(s) removed for today.`);
      router.refresh();
    } finally {
      setIsBlocking(false);
    }
  }

  // Compute stats
  const availablePercent = statsTotal > 0
    ? Math.round((statsAvailable / statsTotal) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
      {/* Left Sidebar Column */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-wider mb-2.5 uppercase">Calendar Control</p>
          <div className="space-y-3">
            <button
              onClick={() => setShowRecurring(!showRecurring)}
              className={`flex items-center justify-between w-full p-3.5 border rounded-xl transition-all font-semibold text-sm shadow-sm ${
                showRecurring
                  ? "bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100"
                  : "bg-white border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Set Recurring</span>
              </div>
              <span className="text-lg leading-none font-bold">&gt;</span>
            </button>

            <button
              onClick={handleEmergencyBlock}
              disabled={isBlocking}
              className="flex items-center justify-between w-full p-3.5 bg-white border border-red-200 rounded-xl hover:bg-red-50/50 transition-all font-semibold text-sm text-red-600 shadow-sm disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span>{isBlocking ? "Blocking..." : "Emergency Block"}</span>
              </div>
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Recurring Schedule Form Panel */}
        {showRecurring && (
          <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3 animate-fadeIn">
            <h3 className="font-bold text-sm text-blue-900">Configure Day Availability</h3>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Select Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium"
              >
                {weekDays.map((d) => (
                  <option key={d.value} value={d.value}>
                    Every {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
                />
              </div>
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <button
              onClick={handleSaveRecurring}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Apply Recurring Hours"}
            </button>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-gray-400 tracking-wider mb-2.5 uppercase">Schedule Stats</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-semibold text-gray-700">Slots Available</span>
              <span className="text-xl font-bold text-blue-900">{statsAvailable}/{statsTotal}</span>
            </div>
            <div className="w-full bg-blue-200/80 rounded-full h-2 my-3 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${availablePercent}%` }} />
            </div>
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              {statsTotal > 0
                ? `Your schedule is ${availablePercent}% open for the coming week.`
                : "No slots configured for this week. Use Set Recurring to add availability."}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-6 border-t border-gray-200 space-y-2.5 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-800 shrink-0" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Right Grid Column */}
      <div className="lg:col-span-8">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm p-4 md:p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-16 p-2 text-center font-normal text-xs text-gray-400"></th>
                  {weekDays.map((day, i) => (
                    <th key={day.value} className={`p-2.5 text-center ${i === 2 ? "bg-blue-50/50 rounded-t-lg" : ""}`}>
                      <div className="text-xs font-semibold uppercase text-gray-500">{day.label}</div>
                      <div className={`text-base font-bold mt-0.5 ${i === 2 ? "text-blue-600" : "text-gray-900"}`}>
                        {day.date}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="p-2 text-right text-xs font-semibold text-gray-400 pr-3 align-top pt-3">
                      {hour}
                    </td>
                    {weekDays.map((day, i) => {
                      const slotKey = `${day.value}-${hour}`;
                      const bookedLabel = bookedSlots[slotKey];
                      const isAvailable = availableSlots[day.value]?.has(hour);

                      return (
                        <td key={day.value} className={`p-1 ${i === 2 ? "bg-blue-50/30" : ""}`}>
                          {bookedLabel ? (
                            <div className="bg-teal-800 text-white p-2 rounded-lg text-left text-[10px] font-semibold flex flex-col justify-center leading-tight shadow-sm min-h-[44px]">
                              <span>BOOKED</span>
                              <span className="font-normal opacity-90 truncate">{bookedLabel}</span>
                            </div>
                          ) : isAvailable ? (
                            <button
                              onClick={() => toggleSlot(day.value, hour)}
                              className="w-full min-h-[44px] bg-blue-50/80 border border-blue-100 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-100/80 hover:text-blue-600 transition-all group shadow-sm"
                            >
                              <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleSlot(day.value, hour)}
                              className="w-full min-h-[44px] bg-gray-50/60 border border-gray-100 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-all group"
                            >
                              <svg className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium text-center sm:text-left">
              Click any slot to toggle availability. Changes apply to next week.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.refresh()}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}