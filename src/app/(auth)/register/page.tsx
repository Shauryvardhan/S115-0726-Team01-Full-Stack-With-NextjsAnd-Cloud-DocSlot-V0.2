"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/authActions";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "PATIENT" as "PATIENT" | "DOCTOR",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await registerUser(form);
    setLoading(false);

    if (!result.success) {
      setErrors(result.errors ?? {});
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Register — DocSlot</h1>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, role: "PATIENT" })}
          className={`flex-1 py-2 rounded border ${form.role === "PATIENT" ? "bg-blue-600 text-white" : ""}`}
        >
          Patient
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, role: "DOCTOR" })}
          className={`flex-1 py-2 rounded border ${form.role === "DOCTOR" ? "bg-blue-600 text-white" : ""}`}
        >
          Doctor
        </button>
      </div>

      <div>
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name[0]}</p>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email[0]}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password[0]}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}