import { prisma } from '@/lib/prisma';
import { toTitleCase } from '@/lib/titleCase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AdminActions } from '@/components/admin/AdminActions';
import { AdminEditForm } from '@/components/admin/AdminEditForm';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-body">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

export default async function AdminListingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.tiffinService.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      offerings: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!listing) notFound();

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <a
            href="/admin"
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-body"
          >
            ← Back to dashboard
          </a>
          <h1 className="text-2xl font-bold text-body">{listing.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {toTitleCase(listing.city)}
            {listing.area ? `, ${toTitleCase(listing.area)}` : ''}
          </p>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* LEFT: listing details */}
        <div className="space-y-6">
          <Section title="Basic information">
            <Row label="Name" value={listing.name} />
            <Row label="City" value={toTitleCase(listing.city)} />
            <Row label="Area" value={listing.area ? toTitleCase(listing.area) : '—'} />
            <Row label="WhatsApp" value={listing.whatsappNumber} />
            {listing.description && (
              <div className="pt-1">
                <p className="text-sm text-gray-400">Description</p>
                <p className="mt-1 text-sm leading-relaxed text-body">{listing.description}</p>
              </div>
            )}
          </Section>

          <Section title="Meal details">
            <Row label="Meals offered" value={listing.mealsOffered.join(', ')} />
            <div className="pt-1">
              <p className="text-sm text-gray-400">Offerings & Pricing</p>
              <div className="mt-2 space-y-2">
                {listing.offerings.map((offering) => (
                  <div key={offering.id} className="text-sm border border-black/5 rounded-xl p-3 bg-gray-50/50">
                    <p className="font-semibold text-body">{offering.sizeName}</p>
                    <p className="text-xs text-gray-500 mt-1">Includes: {offering.mealComponents.join(', ') || '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Price: {offering.pricePerMeal ? `₹${offering.pricePerMeal}/meal` : ''}
                      {offering.pricePerMeal && offering.pricePerMonth ? ' | ' : ''}
                      {offering.pricePerMonth ? `₹${offering.pricePerMonth}/month` : ''}
                      {!offering.pricePerMeal && !offering.pricePerMonth ? '—' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Row
              label="Vegetarian"
              value={
                listing.isVegetarian
                  ? listing.hasNonVeg
                    ? 'Mixed'
                    : 'Pure Veg'
                  : 'Non-Veg'
              }
            />
            <Row label="Spice level" value={listing.spiceLevel ?? '—'} />
            <Row label="Container" value={listing.containerType ?? '—'} />
            <Row
              label="Tiffin wash"
              value={
                listing.requiresTiffinWash == null
                  ? '—'
                  : listing.requiresTiffinWash
                    ? 'Yes'
                    : 'No'
              }
            />
          </Section>

          <Section title="Pricing & delivery">
            <Row label="Operational days" value={listing.operationalDays.join(', ')} />
            <Row label="Delivery areas" value={listing.deliveryAreas.join(', ')} />
          </Section>

          {/* Images */}
          {listing.images.length > 0 && (
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Images ({listing.images.length})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl"
                  >
                    <Image
                      src={img.publicUrl}
                      alt={img.altText ?? listing.name}
                      width={300}
                      height={220}
                      className="h-44 w-full object-cover transition duration-200 group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: sticky action sidebar */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Submission metadata */}
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Submission
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <StatusBadge status={listing.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Submitted</span>
                <span className="text-sm text-body">
                  {listing.createdAt.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-sm text-gray-400">ID</span>
                <span className="break-all font-mono text-xs text-gray-400">{listing.id}</span>
              </div>
            </div>
          </div>

          {/* Submitter note */}
          {listing.submitterNote && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Note from submitter
              </p>
              <p className="text-sm leading-relaxed text-amber-800">{listing.submitterNote}</p>
            </div>
          )}

          {/* Edit form */}
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
      </div>
    </div>
  );
}
