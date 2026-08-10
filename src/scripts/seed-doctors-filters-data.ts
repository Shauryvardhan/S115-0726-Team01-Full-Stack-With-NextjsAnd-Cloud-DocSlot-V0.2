import { prisma } from "@/lib/prisma";

async function main() {
  const doctors = await prisma.doctor.findMany({
    include: { user: true },
  });

  console.log(`Found ${doctors.length} doctors.`);

  const sampleData = [
    { gender: "Male", rating: 4.8 },
    { gender: "Female", rating: 4.6 },
    { gender: "Male", rating: 4.2 },
    { gender: "Female", rating: 3.9 },
    { gender: "Female", rating: 4.9 },
    { gender: "Male", rating: 3.7 },
  ];

  for (let i = 0; i < doctors.length; i++) {
    const doc = doctors[i];
    const data = sampleData[i % sampleData.length];

    await prisma.doctor.update({
      where: { id: doc.id },
      data: {
        gender: doc.gender || data.gender,
        rating: doc.rating || data.rating,
      },
    });
    console.log(`Updated Dr. ${doc.user.name} (${doc.id}): gender=${doc.gender || data.gender}, rating=${doc.rating || data.rating}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
