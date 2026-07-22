"use client";

import { useState } from "react";
import { bookAppointment } from "@/actions/bookingActions";
import { useRouter } from "next/navigation";

type Slot = { id: string; date: Date; startTime: string; endTime: string };

export default function BookingForm({
  doctorId,
  patientId,
  slotsByDate,
}: {
  doctorId: string;
  patientId: string;
  slotsByDate: Record<string, Slot[]>;
}) {
  const router = useRouter();
  const dates = Object.keys(slotsByDate).sort();
  const [selectedDate, setSelectedDate] = useState(dates[0] ?? "");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const morningSlots = (slotsByDate[selectedDate] ?? []).filter((s) => s.startTime < "12:00");
  const afternoonSlots = (slotsByDate[selectedDate] ?? []).filter((s) => s.startTime >= "12:00");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setLoading(true);
    setErrors({});

    const result = await bookAppointment({
      slotId: selectedSlot.id,
      doctorId,
      patientId,
      ...form,
    });

    setLoading(false);
    if (!result.success) {
      setErrors(result.errors ?? {});
      return;
    }
    router.push("/patient/appointments");
  }

  if (dates.length === 0) {
    return (
      <p className="text-gray-500 border rounded-lg p-6 text-center">
        No available slots for this doctor right now.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h2 className="font-semibold text-sm text-gray-500 mb-3">SELECT DATE</h2>
        <div className="grid grid-cols-4 gap-2">
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              className={`flex flex-col items-center px-2 py-2 rounded-lg border text-sm ${
                selectedDate === date ? "bg-blue-600 text-white border-blue-600" : "border-gray-200"
              }`}
            >
              <span className="text-xs opacity-70">
                {new Date(date).toLocaleDateString("en-IN", { month: "short" })}
              </span>
              <span className="font-medium">{new Date(date).getDate()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-sm text-gray-500 mb-2">☀ MORNING</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {morningSlots.length === 0 && (
            <p className="text-xs text-gray-400 col-span-2">No morning slots</p>
          )}
          {morningSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                selectedSlot?.id === slot.id ? "bg-blue-600 text-white border-blue-600" : "border-gray-200"
              }`}
            >
              {slot.startTime}
            </button>
          ))}
        </div>

        <h2 className="font-semibold text-sm text-gray-500 mb-2">☾ AFTERNOON</h2>
        <div className="grid grid-cols-2 gap-2">
          {afternoonSlots.length === 0 && (
            <p className="text-xs text-gray-400 col-span-2">No afternoon slots</p>
          )}
          {afternoonSlots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                selectedSlot?.id === slot.id ? "bg-blue-600 text-white border-blue-600" : "border-gray-200"
              }`}
            >
              {slot.startTime}
            </button>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <form onSubmit={handleSubmit} className="col-span-2 border-t pt-4 mt-2">
          <h2 className="font-semibold mb-3">Patient Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <input
                placeholder="Patient Full Name"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.patientName ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.patientName && (
                <p className="text-red-600 text-xs mt-1">{errors.patientName[0]}</p>
              )}
            </div>

            <div>
              <input
                placeholder="Email Address"
                value={form.patientEmail}
                onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.patientEmail ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.patientEmail && (
                <p className="text-red-600 text-xs mt-1">{errors.patientEmail[0]}</p>
              )}
            </div>

            <div>
              <input
                placeholder="Phone Number"
                value={form.patientPhone}
                onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.patientPhone ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.patientPhone && (
                <p className="text-red-600 text-xs mt-1">{errors.patientPhone[0]}</p>
              )}
            </div>

            <div className="col-span-2">
              <textarea
                placeholder="Reason for Visit"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      )}
    </div>
  );
}