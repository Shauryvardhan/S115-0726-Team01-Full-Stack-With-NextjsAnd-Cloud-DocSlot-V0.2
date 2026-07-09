// Every page inside doctor/ shares this layout — this is where the
// doctor-specific sidebar (Dashboard, Schedule, Profile, Logout) will live.
export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-white p-4">
        {/* TODO Day 8: real doctor sidebar nav */}
        <p className="font-semibold text-blue-600">DocSlot — Doctor</p>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}