import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

// Standalone scripts don't go through Next.js, so load .env explicitly and
// construct the client with the Neon driver adapter (Prisma 7 requires it —
// same setup as lib/prisma.ts).
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create 3 approved listings across different cities
  const listings = [
    {
      slug: 'annapurna-tiffin-pune-seed1',
      name: "Annapurna Tiffin",
      city: 'pune',
      area: 'Kothrud',
      whatsappNumber: '+919876543210',
      isVegetarian: true,
      hasNonVeg: false,
      mealsOffered: ['LUNCH', 'DINNER'],
      mealSizes: ['FULL', 'HALF'],
      mealComponents: ['ROTI', 'SABJI', 'DAL', 'RICE'],
      operationalDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      deliveryAreas: ['Kothrud', 'Karve Nagar', 'Warje'],
      pricePerMonth: 2500,
      status: 'APPROVED' as const,
    },
    {
      slug: 'mumbai-dabbawala-mumbai-seed2',
      name: "Mumbai Home Kitchen",
      city: 'mumbai',
      area: 'Andheri West',
      whatsappNumber: '+919988776655',
      isVegetarian: false,
      hasNonVeg: true,
      mealsOffered: ['LUNCH'],
      mealSizes: ['FULL'],
      mealComponents: ['ROTI', 'SABJI', 'RICE', 'DAL', 'SALAD'],
      operationalDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      deliveryAreas: ['Andheri West', 'Versova'],
      pricePerMonth: 3200,
      status: 'APPROVED' as const,
    },
    {
      slug: 'ghar-ka-khana-bangalore-seed3',
      name: "Ghar Ka Khana",
      city: 'bangalore',
      area: 'Koramangala',
      whatsappNumber: '+918877665544',
      isVegetarian: true,
      hasNonVeg: false,
      mealsOffered: ['LUNCH', 'DINNER'],
      mealSizes: ['FULL'],
      mealComponents: ['ROTI', 'SABJI', 'RICE', 'DAL', 'SALAD', 'DESSERT'],
      operationalDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      deliveryAreas: ['Koramangala', 'BTM Layout', 'HSR Layout'],
      pricePerMonth: 2800,
      status: 'APPROVED' as const,
    },
  ];

  for (const listing of listings) {
    await prisma.tiffinService.upsert({
      where: { slug: listing.slug },
      update: {},
      create: listing,
    });
  }

  console.log('Seed complete: 3 listings created.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
