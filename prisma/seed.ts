import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { computeSearchPrices } from '../lib/searchPrices';

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
      operationalDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      deliveryAreas: ['Kothrud', 'Karve Nagar', 'Warje'],
      status: 'APPROVED' as const,
      offerings: [
        {
          sizeName: 'Full tiffin',
          mealComponents: ['roti', 'sabji', 'dal', 'rice'],
          pricePerMonth: 2500,
          sortOrder: 0,
        },
        {
          sizeName: 'Half tiffin',
          mealComponents: ['roti', 'sabji', 'dal'],
          pricePerMonth: 1500,
          sortOrder: 1,
        },
      ],
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
      operationalDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
      deliveryAreas: ['Andheri West', 'Versova'],
      status: 'APPROVED' as const,
      offerings: [
        {
          sizeName: 'Full tiffin',
          mealComponents: ['roti', 'sabji', 'rice', 'dal', 'salad'],
          pricePerMonth: 3200,
          sortOrder: 0,
        },
      ],
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
      operationalDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      deliveryAreas: ['Koramangala', 'BTM Layout', 'HSR Layout'],
      status: 'APPROVED' as const,
      offerings: [
        {
          sizeName: 'Full tiffin',
          mealComponents: ['roti', 'sabji', 'rice', 'dal', 'salad', 'dessert'],
          pricePerMonth: 2800,
          sortOrder: 0,
        },
      ],
    },
  ];

  for (const listing of listings) {
    const { offerings, ...rest } = listing;
    await prisma.tiffinService.upsert({
      where: { slug: listing.slug },
      update: {},
      create: {
        ...rest,
        offerings: {
          create: offerings.map((o) => {
            const sp = computeSearchPrices(undefined, o.pricePerMonth, listing.operationalDays);
            return {
              sizeName: o.sizeName,
              mealComponents: o.mealComponents,
              pricePerMonth: o.pricePerMonth,
              searchPricePerMeal: sp.searchPricePerMeal,
              searchPricePerMonth: sp.searchPricePerMonth,
              sortOrder: o.sortOrder,
            };
          }),
        },
      },
    });
  }

  console.log('Seed complete: 3 listings created.');

  // Backfill existing offerings in the DB if any
  const allOfferings = await prisma.tiffinOffering.findMany({
    include: { service: { select: { operationalDays: true } } },
  });

  for (const offering of allOfferings) {
    const sp = computeSearchPrices(
      offering.pricePerMeal,
      offering.pricePerMonth,
      offering.service.operationalDays,
    );

    await prisma.tiffinOffering.update({
      where: { id: offering.id },
      data: {
        searchPricePerMeal: sp.searchPricePerMeal,
        searchPricePerMonth: sp.searchPricePerMonth,
      },
    });
  }

  console.log(`Backfilled ${allOfferings.length} offerings.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
