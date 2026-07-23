"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen grid grid-cols-2 w-full">
      <div className="bg-blue-900 text-white p-12 flex flex-col justify-end">
        <p className="font-bold text-xl mb-2">DocSlot</p>
        <h2 className="text-2xl font-bold mb-2">Join the healthcare revolution</h2>
        <p className="text-sm text-blue-100">
          Experience seamless healthcare management with our platform.
        </p>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="p-8 w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">Login — DocSlot</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2 cursor-pointer font-medium">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}