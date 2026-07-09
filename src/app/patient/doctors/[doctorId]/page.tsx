// [doctorId] is a dynamic route segment. Next.js 15+ passes route params
// as a Promise, so we await it — this is a TypeScript + App Router
// convention worth remembering.
export default async function DoctorProfileViewPage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Doctor Profile: {doctorId}</h1>
      <p className="text-gray-500">Bio, qualifications, booking widget go here (Day 13).</p>
    </div>
  );
}
