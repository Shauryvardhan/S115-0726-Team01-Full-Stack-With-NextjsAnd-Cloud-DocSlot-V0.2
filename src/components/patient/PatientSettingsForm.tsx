"use client";

import { useState } from "react";
import { updatePatientProfile } from "@/actions/patientProfileActions";

type PatientSettingsProps = {
  patient: {
    id: string;
    name: string | null;
    email: string;
    phone?: string | null;
    gender?: string | null;
    bloodGroup?: string | null;
    emergencyContactName?: string | null;
    emergencyContactRelation?: string | null;
    emergencyContactPhone?: string | null;
    allergies?: string | null;
    emailReminders?: boolean | null;
    smsAlerts?: boolean | null;
  };
};

export default function PatientSettingsForm({ patient }: PatientSettingsProps) {
  const [form, setForm] = useState({
    name: patient.name || "",
    email: patient.email || "",
    phone: patient.phone || "",
    gender: patient.gender || "Male",
    bloodGroup: patient.bloodGroup || "O+",
    allergies: patient.allergies || "",
    emergencyContactName: patient.emergencyContactName || "",
    emergencyContactRelation: patient.emergencyContactRelation || "",
    emergencyContactPhone: patient.emergencyContactPhone || "",
    emailReminders: patient.emailReminders ?? true,
    smsAlerts: patient.smsAlerts ?? true,
    marketingEmails: false,
  });

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    setError(null);
    const res = await updatePatientProfile(form);
    setSaving(false);
    if (res.success) {
      setStatus("Settings and profile preferences saved successfully!");
    } else {
      setError(res.error || "Failed to save settings");
    }
  }

  const initials =
    patient.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "PT";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Patient Avatar Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-sm">
          {initials}
        </div>
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{patient.name || "Patient Account"}</h2>
          <p className="text-xs text-gray-500 font-medium">{patient.email}</p>
          <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
            <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
              Verified Patient
            </span>
            <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-100">
              Active Member
            </span>
          </div>
        </div>
      </div>

      {status && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 border-b pb-3">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Emergency Contact & Medical Notes */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 border-b pb-3">Emergency Contact & Health Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Blood Group</label>
            <select
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            >
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Emergency Contact</label>
            <input
              type="text"
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Emergency Phone</label>
            <input
              type="text"
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">Known Allergies / Medical Notes</label>
          <input
            type="text"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="e.g. Penicillin, Lactose intolerance"
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 border-b pb-3">Notification Preferences</h3>
        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-bold text-gray-900">Email Appointment Reminders</p>
              <p className="text-xs text-gray-500 font-medium">Receive email notifications 24h before scheduled visits.</p>
            </div>
            <input
              type="checkbox"
              checked={form.emailReminders}
              onChange={(e) => setForm({ ...form, emailReminders: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-bold text-gray-900">SMS Instant Notifications</p>
              <p className="text-xs text-gray-500 font-medium">Get SMS alerts for appointment confirmations & changes.</p>
            </div>
            <input
              type="checkbox"
              checked={form.smsAlerts}
              onChange={(e) => setForm({ ...form, smsAlerts: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? "Saving Settings..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
