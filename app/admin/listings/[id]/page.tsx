import { prisma } from '@/lib/prisma';
import { toTitleCase } from '@/lib/titleCase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AdminActions } from '@/components/admin/AdminActions';
import { AdminEditForm } from '@/components/admin/AdminEditForm';
import { ArrowLeft } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    REJECTED: 'bg-red-500/15 text-red-300 border-red-500/30',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono font-bold ${styles[status] ?? 'bg-slate-800 text-slate-300 border-slate-700'}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 font-mono">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-xs text-slate-200">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md shadow-md space-y-3">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
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
    <div className="w-full min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div>
          <Link
            href="/admin"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <ArrowLeft size={13} /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-black font-mono text-white tracking-tight">{listing.name}</h1>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            {toTitleCase(listing.city)}
            {listing.area ? `, ${toTitleCase(listing.area)}` : ''}
          </p>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* LEFT: listing details */}
        <div className="space-y-6">
          <Section title="1. Basic Information">
            <Row label="Name" value={listing.name} />
            <Row label="City" value={toTitleCase(listing.city)} />
            <Row label="Area" value={listing.area ? toTitleCase(listing.area) : '—'} />
            <Row label="WhatsApp" value={listing.whatsappNumber} />
            {listing.description && (
              <div className="pt-1 font-mono">
                <p className="text-xs text-slate-400">Description</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800">{listing.description}</p>
              </div>
            )}
          </Section>

          <Section title="2. Meal Details & Offerings">
            <Row label="Meals offered" value={listing.mealsOffered.join(', ')} />
            <div className="pt-1 font-mono">
              <p className="text-xs text-slate-400">Offerings & Pricing</p>
              <div className="mt-2 space-y-2">
                {listing.offerings.map((offering) => (
                  <div key={offering.id} className="text-xs border border-slate-800 rounded-xl p-3 bg-slate-950/60">
                    <p className="font-bold text-white text-sm">{offering.sizeName}</p>
                    <p className="text-xs text-slate-400 mt-1">Includes: {offering.mealComponents.join(', ') || '—'}</p>
                    <p className="text-xs text-emerald-400 font-bold mt-1">
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

          <Section title="3. Operational Days & Delivery Areas">
            <Row label="Operational days" value={listing.operationalDays.join(', ')} />
            <Row label="Delivery areas" value={listing.deliveryAreas.join(', ')} />
          </Section>

          {/* Images */}
          {listing.images.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-6 backdrop-blur-md shadow-md space-y-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Images ({listing.images.length})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.images.map((img) => (
                  <a
                    key={img.id}
                    href={img.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl border border-slate-800"
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
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Submission metadata */}
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-5 backdrop-blur-md shadow-md space-y-3 font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Submission Metadata
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-white">{listing.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Submitted</span>
                <span className="text-slate-300">
                  {new Date(listing.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              {listing.submitterNote && (
                <div className="pt-1">
                  <span className="text-slate-400">Submitter Note:</span>
                  <p className="mt-1 text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    &quot;{listing.submitterNote}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Edit form */}
          <AdminEditForm
            listingId={listing.id}
            initial={{
              name: listing.name,
              city: listing.city,
              area: listing.area ?? '',
              whatsappNumber: listing.whatsappNumber,
              description: listing.description ?? '',
              isVegetarian: listing.isVegetarian,
              hasNonVeg: listing.hasNonVeg,
              mealsOffered: listing.mealsOffered,
              operationalDays: listing.operationalDays,
              containerType: listing.containerType ?? '',
              spiceLevel: listing.spiceLevel ?? '',
              requiresTiffinWash: listing.requiresTiffinWash,
              deliveryAreas: listing.deliveryAreas,
              submitterNote: listing.submitterNote ?? '',
              adminNote: listing.adminNote ?? '',
              offerings: listing.offerings.map((o) => ({
                sizeName: o.sizeName,
                mealComponents: o.mealComponents,
                pricePerMeal: o.pricePerMeal,
                pricePerMonth: o.pricePerMonth,
              })),
            }}
          />

          {/* Admin actions */}
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
