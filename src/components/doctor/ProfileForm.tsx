"use client";

import { useState } from "react";
import { updateDoctorProfile } from "@/actions/doctorProfileActions";

type DoctorProfile = {
  id: string;
  name: string | null;
  specialization: string;
  qualifications: string;
  bio: string;
  consultationFee: string;
};

const SPECIALTIES = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Psychiatry",
  "Gynaecology",
  "Ophthalmology",
  "ENT Specialist",
];

export default function ProfileForm({ doctor }: { doctor: DoctorProfile }) {
  const [form, setForm] = useState(doctor);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const res = await updateDoctorProfile(form.id, {
      specialization: form.specialization,
      qualifications: form.qualifications,
      bio: form.bio,
      consultationFee: form.consultationFee,
    });

    setSaving(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "Profile updated successfully! Your public profile is live." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to update profile." });
    }
  }

  const initials =
    doctor.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "DR";

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
          {initials}
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-bold text-gray-900">Dr. {doctor.name || "Medical Professional"}</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Verified Doctor
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">{form.specialization || "General Practice"} Specialist</p>
          <p className="text-xs text-gray-400 mt-1">ID: #{doctor.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 border-b pb-3">Professional Credentials & Fee</h3>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {statusMessage.type === "success" ? (
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Specialization */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
              Specialization
            </label>
            <div className="relative">
              <input
                type="text"
                list="specialty-options"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="e.g. Cardiology"
                className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                required
              />
              <datalist id="specialty-options">
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
              Consultation Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-400 font-semibold text-sm">₹</span>
              <input
                type="number"
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                placeholder="500"
                min="0"
                step="50"
                className="w-full pl-8 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
            Qualifications & Degrees
          </label>
          <input
            type="text"
            value={form.qualifications}
            onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
            placeholder="e.g. MD, FACC - Harvard Medical School"
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
            Professional Biography
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={5}
            placeholder="Describe your medical experience, treatment philosophy, and expertise..."
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-y leading-relaxed"
          />
          <p className="text-[11px] text-gray-400 text-right mt-1 font-medium">
            {form.bio.length} characters
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Saving Changes...</span>
              </>
            ) : (
              "Save Profile Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}