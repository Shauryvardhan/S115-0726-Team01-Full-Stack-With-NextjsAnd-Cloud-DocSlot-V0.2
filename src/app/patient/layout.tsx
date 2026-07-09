// Every page inside patient/ shares this layout — patient sidebar
// (Dashboard, Find Doctors, Appointments, Settings, Logout) lives here.
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-white p-4">
        {/* TODO Day 7: real patient sidebar nav */}
        <p className="font-semibold text-blue-600">DocSlot — Patient</p>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
