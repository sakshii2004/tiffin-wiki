import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AdminActions } from '@/components/admin/AdminActions';
import { AdminEditForm } from '@/components/admin/AdminEditForm';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="w-40 shrink-0 text-sm font-medium text-gray-500">{label}</span>
      <span className="text-body">{value}</span>
    </div>
  );
}

export default async function AdminListingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 16: params is a Promise

  const listing = await prisma.tiffinService.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!listing) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin" className="text-sm text-gray-500 hover:text-body">
          ← Back to dashboard
        </a>
      </div>

      {/* Submitter note — highlighted box */}
      {listing.submitterNote && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-1 text-sm font-medium text-amber-900">Note from submitter:</p>
          <p className="text-amber-800">{listing.submitterNote}</p>
        </div>
      )}

      {/* All listing fields rendered in a readable format */}
      <div className="mb-6 space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
        <DetailRow label="Name" value={listing.name} />
        <DetailRow label="City" value={listing.city} />
        <DetailRow label="Area" value={listing.area ?? '—'} />
        <DetailRow label="WhatsApp" value={listing.whatsappNumber} />
        <DetailRow label="Meals" value={listing.mealsOffered.join(', ')} />
        <DetailRow label="Meal sizes" value={listing.mealSizes.join(', ')} />
        <DetailRow label="Components" value={listing.mealComponents.join(', ')} />
        <DetailRow
          label="Veg"
          value={
            listing.isVegetarian ? (listing.hasNonVeg ? 'Mixed' : 'Pure Veg') : 'Non-Veg'
          }
        />
        <DetailRow label="Container" value={listing.containerType ?? '—'} />
        <DetailRow
          label="Tiffin wash"
          value={
            listing.requiresTiffinWash == null
              ? '—'
              : listing.requiresTiffinWash
                ? 'Yes'
                : 'No'
          }
        />
        <DetailRow label="Spice" value={listing.spiceLevel ?? '—'} />
        <DetailRow label="Price/meal" value={listing.pricePerMeal ? `₹${listing.pricePerMeal}` : '—'} />
        <DetailRow
          label="Price/month"
          value={listing.pricePerMonth ? `₹${listing.pricePerMonth}` : '—'}
        />
        <DetailRow label="Operational days" value={listing.operationalDays.join(', ')} />
        <DetailRow label="Delivery areas" value={listing.deliveryAreas.join(', ')} />
        <DetailRow label="Description" value={listing.description ?? '—'} />
        <DetailRow label="Status" value={listing.status} />
        <DetailRow label="Submitted" value={listing.createdAt.toLocaleString('en-IN')} />
      </div>

      {/* Image grid */}
      {listing.images.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {listing.images.map((img) => (
            <Image
              key={img.id}
              src={img.publicUrl}
              alt={img.altText ?? listing.name}
              width={200}
              height={150}
              className="h-36 w-full rounded-md object-cover"
            />
          ))}
        </div>
      )}

      {/* Inline edit (PATCH) — build_spec item 44 */}
      <AdminEditForm
        listingId={listing.id}
        initial={{
          name: listing.name,
          city: listing.city,
          area: listing.area ?? '',
          whatsappNumber: listing.whatsappNumber,
          description: listing.description ?? '',
        }}
      />

      {/* Admin actions: Approve + Reject */}
      <AdminActions
        listingId={listing.id}
        currentStatus={listing.status}
        currentAdminNote={listing.adminNote ?? ''}
      />
    </div>
  );
}
