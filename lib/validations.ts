import { z } from 'zod';

// --- Reusable field validators ---

const e164Phone = z
  .string()
  .regex(/^\d{10}$/, 'Must be a valid 10-digit phone number (e.g. 9876543210)');

export const INDIAN_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad',
  'pune', 'chennai', 'ahmedabad', 'kolkata', 'other',
] as const;

// --- AddListingSchema ---
// Used in: /app/(public)/add/page.tsx (client) + /app/api/listings/route.ts (server)
export const AddListingSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(120, 'Max 120 characters'),
  city: z.string().min(1, 'Select a city').max(100),
  area: z.string().max(80).optional(),
  whatsappNumber: e164Phone,
  isVegetarian: z.boolean(),
  hasNonVeg: z.boolean(),
  mealsOffered: z.array(z.enum(['BREAKFAST', 'LUNCH', 'DINNER'])).min(1, 'Select at least one meal'),
  offerings: z.array(
    z.object({
      sizeName: z.string().min(1, 'Size name is required').max(60),
      mealComponents: z.array(z.string().min(1).max(60)).max(10, 'Maximum 10 items'),
      pricePerMeal: z.number().int().positive().optional(),
      pricePerMonth: z.number().int().positive().optional(),
    })
  ).min(1, 'Add at least one tiffin size'),
  spiceLevel: z.enum(['MILD', 'MEDIUM', 'SPICY']).optional(),
  containerType: z.enum(['STEEL', 'DISPOSABLE']).optional(),
  requiresTiffinWash: z.boolean().optional(),
  operationalDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])),
  deliveryAreas: z.array(z.string().min(1)).max(10, 'Maximum 10 delivery areas'),
  description: z.string().max(800).optional(),
  submitterNote: z.string().max(300).optional(),
  r2Keys: z.array(z.string()).max(5),
  // Honeypot: SERVER-ONLY. Must be empty string. If filled, the API silently
  // discards the submission. Do NOT validate this field on the client — see
  // AddListingClientSchema below.
  honeypot: z.string().max(0, 'Bot detected'),
});

export type AddListingInput = z.infer<typeof AddListingSchema>;

// --- AddListingClientSchema (client-only) ---
// Used in: /app/(public)/add/page.tsx (react-hook-form resolver).
// Omits `honeypot` so a real user whose browser autofills the hidden field never
// sees a confusing validation error. The honeypot is enforced SERVER-SIDE ONLY
// (via AddListingSchema in /app/api/listings/route.ts), where a filled honeypot
// causes the submission to be silently discarded — it is never surfaced to the
// user as a validation error.
export const AddListingClientSchema = AddListingSchema.omit({ honeypot: true });

export type AddListingClientInput = z.infer<typeof AddListingClientSchema>;

// --- ReviewSchema ---
// Used in: /app/(public)/tiffin/[slug]/review/page.tsx (client) + /app/api/reviews/route.ts (server)
export const ReviewSchema = z.object({
  serviceId: z.string().cuid(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  body: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 0 || val.length >= 10,
      'Review text must be at least 10 characters if provided',
    )
    .refine((val) => !val || val.length <= 800, 'Max 800 characters'),
  r2Keys: z.array(z.string()).max(3),
});

export type ReviewInput = z.infer<typeof ReviewSchema>;

// --- CuidParamSchema ---
// Used for validating route params in API endpoints and admin pages
export const CuidParamSchema = z.string().cuid('Invalid ID format');

// --- PresignSchema ---
// Used in: /app/api/upload/presign/route.ts
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const PresignSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(200)
    .refine(
      (name) => {
        const lower = name.toLowerCase();
        return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
      },
      { message: 'Only .jpg, .jpeg, .png, and .webp file extensions are allowed' },
    ),
  contentType: z.enum(ALLOWED_IMAGE_MIMES, {
    error: 'Only JPEG, PNG, and WebP image formats are allowed',
  }),
  context: z.enum(['listing', 'review']),
});

export type PresignInput = z.infer<typeof PresignSchema>;

// --- TelemetryEventSchema ---
// Used in: /app/api/telemetry/route.ts
export const TelemetryEventTypeEnum = z.enum([
  'PAGE_VIEW',
  'TIME_SPENT',
  'SEARCH_EXECUTE',
  'FILTER_TOGGLE',
  'WHATSAPP_REVEAL',
  'WHATSAPP_OPEN',
  'REVIEW_BUTTON_CLICK',
  'REVIEW_SUBMIT_SUCCESS',
  'ADD_LISTING_SUCCESS',
  'LISTING_SUBMITTED',
  'REVIEW_SUBMITTED',
  'PAGE_EXIT',
]);

export const TelemetryEventSchema = z.object({
  sessionId: z.string().min(1).max(128),
  eventType: TelemetryEventTypeEnum,
  pathname: z.string().max(250).default('/'),
  searchQuery: z.string().max(150).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  listingId: z.string().max(50).optional().nullable(),
  listingSlug: z.string().max(150).optional().nullable(),
  ctaName: z.string().max(80).optional().nullable(),
  filterName: z.string().max(80).optional().nullable(),
  filterValue: z.string().max(80).optional().nullable(),
  durationSec: z.number().int().min(0).max(86400).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  deviceType: z.string().max(30).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
});

export type TelemetryEventInput = z.infer<typeof TelemetryEventSchema>;

// --- SearchSchema ---
// Used in: /app/(public)/search/page.tsx
export const SearchSchema = z.object({
  city: z.string().min(1, 'City is required'),
  q: z.string().optional(),
  meal: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']).optional(),
  veg: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
});

// --- AdminRejectSchema ---
// Used in: /app/api/listings/[id]/reject/route.ts
export const AdminRejectSchema = z.object({
  adminNote: z.string().min(1, 'A rejection reason is required').max(800),
});

// --- AdminEditSchema ---
// Used in: /app/api/listings/[id]/route.ts (PATCH)
export const AdminEditSchema = AddListingSchema.partial().omit({
  honeypot: true,
  r2Keys: true,
}).extend({
  adminNote: z.string().max(800).optional(),
});
