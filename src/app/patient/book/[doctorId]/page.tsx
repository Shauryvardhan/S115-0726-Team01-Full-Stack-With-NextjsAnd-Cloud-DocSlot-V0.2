import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import BookingForm from "@/components/appointment/BookingForm";

export default async function BookAppointmentPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;

  const session = await auth();
  if (!session) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });
  if (!patient) {
    return <p className="text-gray-500">No patient profile found for this account.</p>;
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { user: true },
  });
  if (!doctor) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 28);
  futureDate.setHours(23, 59, 59, 999);

  const slots = await prisma.appointmentSlot.findMany({
    where: {
      schedule: { doctorId },
      isBooked: false,
      date: { gte: today, lte: futureDate },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

  const slotsByDate = slots.reduce((acc, slot) => {
  const dateKey = toLocalDateKey(slot.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Book with Dr. {doctor.user.name}</h1>
      <p className="text-gray-500 mb-6">{doctor.specialization}</p>

      <BookingForm doctorId={doctorId} patientId={patient.id} slotsByDate={slotsByDate} />
    </div>
  );
}