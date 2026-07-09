export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Book Appointment with {doctorId}</h1>
      <p className="text-gray-500">Calendar + slot picker go here (Day 14).</p>
    </div>
  );
}
