import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await prisma.tiffinService.findMany({
    where: { status: 'APPROVED' },
    select: { slug: true, updatedAt: true },
  });

  const listingUrls = listings.map((l) => ({
    url: `https://tiffin.wiki/tiffin/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    { url: 'https://tiffin.wiki', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://tiffin.wiki/add', changeFrequency: 'monthly', priority: 0.5 },
    ...listingUrls,
  ];
}
