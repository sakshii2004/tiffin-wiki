import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.tiffinService.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true, city: true, updatedAt: true },
  });

  // Extract unique cities that have approved listings
  const uniqueCities = Array.from(new Set(listings.map((l) => l.city.toLowerCase()))).filter(Boolean);

  const cityUrls = uniqueCities.map((city) => ({
    url: `https://tiffin.wiki/search?city=${encodeURIComponent(city)}`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const listingUrls = listings.map((l) => ({
    url: `https://tiffin.wiki/tiffin/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: 'https://tiffin.wiki', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://tiffin.wiki/add', changeFrequency: 'monthly', priority: 0.5 },
    ...cityUrls,
    ...listingUrls,
  ];
}
