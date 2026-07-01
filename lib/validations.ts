import { z } from 'zod';

// --- Reusable field validators ---

const e164Phone = z
  .string()
  .regex(/^\d{10}$/, 'Must be a valid 10-digit phone number (e.g. 9876543210)');

const indianCities = [
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
  mealSizes: z.array(z.enum(['FULL', 'HALF'])),
  mealComponents: z.array(z.enum(['ROTI', 'SABJI', 'RICE', 'DAL', 'SALAD', 'DESSERT', 'OTHER'])),
  spiceLevel: z.enum(['MILD', 'MEDIUM', 'SPICY']).optional(),
  containerType: z.enum(['STEEL', 'DISPOSABLE']).optional(),
  requiresTiffinWash: z.boolean().optional(),
  operationalDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])),
  pricePerMeal: z.number().int().positive().optional(),
  pricePerMonth: z.number().int().positive().optional(),
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

// --- PresignSchema ---
// Used in: /app/api/upload/presign/route.ts
export const PresignSchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().regex(/^image\//, 'Only image files are allowed'),
  context: z.enum(['listing', 'review']),
});

export type PresignInput = z.infer<typeof PresignSchema>;

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
});
