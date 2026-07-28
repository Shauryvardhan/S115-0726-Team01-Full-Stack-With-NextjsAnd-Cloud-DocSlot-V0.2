"use client";

import { useState, useMemo } from "react";
import { bookAppointment } from "@/actions/bookingActions";
import { useRouter } from "next/navigation";

type Slot = { id: string; date: Date; startTime: string; endTime: string };

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-first: Mon=0, Sun=6
  return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

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

  const today = new Date();
  const initialDate = dates[0] ? new Date(dates[0]) : today;

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
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

  // Available date set for quick lookup
  const availableDatesSet = useMemo(() => new Set(Object.keys(slotsByDate)), [slotsByDate]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const morningSlots = (slotsByDate[selectedDate] ?? []).filter((s) => s.startTime < "12:00");
  const afternoonSlots = (slotsByDate[selectedDate] ?? []).filter((s) => s.startTime >= "12:00");

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function handleDateClick(day: number) {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateKey = `${currentYear}-${m}-${d}`;
    if (availableDatesSet.has(dateKey)) {
      setSelectedDate(dateKey);
      setSelectedSlot(null);
    }
  }

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
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium mb-1">No available slots</p>
        <p className="text-sm text-gray-400">This doctor has no open slots in the next 4 weeks.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column — Calendar */}
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Select Date</h2>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-600 font-semibold">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
              >
                ›
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map((label) => (
              <div key={label} className="text-center text-xs font-semibold text-gray-400 py-1">
                {label}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first day */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const m = String(currentMonth + 1).padStart(2, "0");
              const d = String(day).padStart(2, "0");
              const dateKey = `${currentYear}-${m}-${d}`;
              const isAvailable = availableDatesSet.has(dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={!isAvailable}
                  className={`h-10 w-full rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                        ? "bg-blue-100 text-blue-600 font-bold"
                        : isAvailable
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-gray-300 cursor-default"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointment Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-blue-900 mb-1">Appointment Note</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Please arrive <strong>15 minutes early</strong> for your first consultation to complete the necessary paperwork.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column — Slots + Patient Details */}
      <div className="space-y-6">
        {/* Available Slots */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Available Slots</h2>

          {/* Morning */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span>☀️</span> Morning
            </p>
            <div className="grid grid-cols-4 gap-2">
              {morningSlots.length === 0 && (
                <p className="text-xs text-gray-400 col-span-4">No morning slots</p>
              )}
              {morningSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    selectedSlot?.id === slot.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>

          {/* Afternoon */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <span>☾</span> Afternoon
            </p>
            <div className="grid grid-cols-4 gap-2">
              {afternoonSlots.length === 0 && (
                <p className="text-xs text-gray-400 col-span-4">No afternoon slots</p>
              )}
              {afternoonSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    selectedSlot?.id === slot.id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Patient Details</h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Patient Full Name</label>
              <input
                placeholder="John Doe"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 ${
                  errors.patientName ? "border-red-500 bg-red-50" : "border-gray-200"
                }`}
              />
              {errors.patientName && (
                <p className="text-red-600 text-xs mt-1">{errors.patientName[0]}</p>
              )}
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={form.patientEmail}
                    onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 ${
                      errors.patientEmail ? "border-red-500 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.patientEmail && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                </div>
                {errors.patientEmail && (
                  <p className="text-red-600 text-xs mt-1">{errors.patientEmail[0]}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number</label>
                <div className="relative">
                  <input
                    placeholder="+91 9876543210"
                    value={form.patientPhone}
                    onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 ${
                      errors.patientPhone ? "border-red-500 bg-red-50" : "border-gray-200"
                    }`}
                  />
                  {errors.patientPhone && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  )}
                </div>
                {errors.patientPhone && (
                  <p className="text-red-600 text-xs mt-1">{errors.patientPhone[0]}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Reason for Visit</label>
              <textarea
                placeholder="e.g., Annual checkup, flu symptoms..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-400 resize-none"
                rows={3}
              />
              {errors.reason && (
                <p className="text-red-600 text-xs mt-1">{errors.reason[0]}</p>
              )}
            </div>
          </div>

          {errors.slotId && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg mt-4">
              {errors.slotId[0]}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedSlot}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              "Booking..."
            ) : (
              <>
                Confirm Booking
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            By booking, you agree to our Terms and Health Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
}