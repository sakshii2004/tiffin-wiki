# Stage 7: Accessibility Hardening, SEO Completion, i18n Scaffolding & Production Deployment

## Goal

Harden the application for production: achieve verified WCAG 2.1 AA compliance across all pages, complete the SEO strategy (noindex, canonical, OG images, structured data), scaffold the i18n infrastructure required by Section 15, configure security headers, set up CI/CD for database migrations via GitHub Actions, deploy to Vercel with all environment variables, and perform a final end-to-end production verification. By the end of this stage the application is fully production-ready and meets every requirement in the build specification.

---

## Prerequisites

- Stages 1–6 complete: all pages, API routes, and components implemented
- A GitHub repository connected to a Vercel project
- All environment variables from Section 3 available for the Vercel dashboard
- A Cloudflare custom domain `images.tiffin.wiki` configured to point to the R2 bucket

---

## Deliverables

1. All WCAG 2.1 AA requirements from Section 13 verified and fixed across every page
2. `next.config.ts` updated with HTTP security headers (CSP, X-Frame-Options, HSTS, etc.)
3. SEO: `robots: { index: false }` on all pages that must not be indexed; canonical URLs on all public pages; OG image tags everywhere
4. `messages/en.json` populated with all user-facing strings; zero hardcoded strings in components (i18n readiness for Section 15)
5. `.github/workflows/migrate.yml` — GitHub Actions workflow for safe database migrations
6. `vercel.json` — Vercel project configuration (build command, function regions)
7. `prisma/seed.ts` — seed script for local development with a representative dataset
8. Final `npm run build` passes with zero errors and zero warnings
9. Production deployment on `tiffin.wiki` verified end-to-end

---

## Tasks

### 7.1 Complete WCAG 2.1 AA Accessibility Audit

Audit every page against the checklist in Section 13. For each item, verify compliance and fix any gaps.

#### 7.1.1 Minimum font size — 16px body text

Verify `styles/globals.css` enforces `font-size: 1rem` on `body`. Audit all component files: no text should be styled smaller than `text-sm` (14px) for body copy. If any labels, hints, or form text uses `text-xs` (12px), increase to `text-sm` minimum.

#### 7.1.2 Colour contrast — peridot on white

The peridot colour (#A8C256) has a contrast ratio of approximately 2.3:1 against white — this **fails** WCAG AA for normal text. Audit every usage of `text-brand-peridot`:

- The logo in `SiteHeader` is large bold text (24px bold = 18.67pt > 18pt threshold) — **passes** AA for large text
- Any button text on peridot background must use `text-body` (#1A1A1A) to ensure 6.7:1 contrast ratio — **passes** AA
- Never use `text-brand-peridot` for body copy or form labels — replace with `text-body` or `text-gray-700`

Fix: Audit and correct all instances where `text-brand-peridot` appears on small text.

#### 7.1.3 Form labels — no placeholder-only

Audit all form inputs across `AddListingForm`, `ReviewForm`, `SearchBar`, and admin forms. Every `<input>`, `<select>`, and `<textarea>` must have a visible `<label>` with matching `htmlFor`. Placeholder text may supplement but never replace a label.

#### 7.1.4 Form error messages — role="alert" + aria-describedby

Audit all error message rendering across the app. Every error must be:
- Rendered in `<p role="alert">`
- Linked to its input via `aria-describedby="${name}-error"`
- The input must have `aria-invalid="true"` when in error state

#### 7.1.5 Keyboard navigation — all interactive elements

Walk through every page using Tab/Shift-Tab/Enter/Space/Arrow keys:

- `<SiteHeader>` — logo and CTA button reachable, focus ring visible
- `<SearchBar>` — all inputs and submit button reachable
- `<ListingCard>` — entire card is one tabbable link
- `<ShowNumberButton>` — button reachable, activation reveals number
- `<AddListingForm>` — all fields reachable in DOM order; Next/Back buttons reachable; step navigation logical
- `<StarRating interactive>` — stars keyboard navigable with arrow keys
- `<TagInput>` — Enter adds, Backspace removes
- `<AdminActions>` — Approve/Reject buttons reachable; reject mode textarea reachable
- All `<a href>` links reachable and have visible focus rings

Focus ring style: enforce `focus-visible:ring-2 focus-visible:ring-brand-peridot focus-visible:ring-offset-2` on all interactive elements. Never suppress the focus ring (`outline: none` without `focus-visible` alternative is forbidden).

#### 7.1.6 Images — alt attributes

Final audit: every `<img>` and `<Image>` component in the app must have an `alt` attribute. Decorative images use `alt=""`. Review images use the `altText` from the database or fall back to the service name. User avatars use `alt="Avatar of {name}"`. Placeholder images use `alt=""` (decorative).

#### 7.1.7 Landmark regions — header, main, footer, nav

Verify every page has:
- `<header role="banner">` (provided by `SiteHeader`)
- `<main id="main-content">` (provided by root layout)
- `<footer role="contentinfo">` (provided by `SiteFooter`)
- `<nav aria-label="...">` for any navigation regions

#### 7.1.8 Skip link — first child of body

Verify the skip link `<a href="#main-content">Skip to main content</a>` is the first focusable element in the DOM on every page. The `id="main-content"` on `<main>` must be present on every page (it is set in the root layout).

#### 7.1.9 Mobile touch targets — minimum 44×44px

Audit all buttons and links for minimum 44×44px touch target size. Apply Tailwind `min-h-[44px] min-w-[44px]` where needed. Critical targets to check:
- "Add a Tiffin" header button
- "Find Tiffin" SearchBar submit
- Pagination links
- Admin "Review →" links
- Star rating buttons (interactive mode)
- Tag chip remove buttons

#### 7.1.10 Slow-network resilience

- All `<Image>` components have explicit `width` and `height` props (prevents CLS)
- Add `loading="lazy"` to below-the-fold images (listing grid, review images)
- Add a skeleton loading state for the search results page using Next.js App Router's built-in loading convention: create **`app/(public)/search/loading.tsx`** that exports a default component rendering CSS-animated skeleton cards (Tailwind `animate-pulse`). Next.js automatically shows this during the server render of `search/page.tsx` (which is `force-dynamic`). Do not add ad-hoc client-side spinners — the `loading.tsx` file is the canonical mechanism.

---

### 7.2 Security Headers in `next.config.ts`

> **Edit the existing `next.config.ts` — do NOT create a `next.config.js`.** The project already has a TypeScript config (`next.config.ts`) with an `images.remotePatterns` block (configured in earlier stages for `images.tiffin.wiki` and `lh3.googleusercontent.com`). **Preserve that existing `images` block** and add the `async headers()` function to it. Creating a parallel `.js` file would either be ignored or clobber the working image config.

Add HTTP security headers to prevent common web attacks (OWASP Top 10 mitigations). The full file looks like this (keep your existing `remotePatterns` entries — `port`/`pathname` included):

```ts
import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-inline' is required for Next.js's injected hydration/bootstrap
      // scripts. This CSP INTENTIONALLY OMITS 'unsafe-eval' — Next.js 16 App
      // Router does not require it. If the build/runtime fails due to eval usage
      // in a dependency, identify and address the specific package rather than
      // re-adding 'unsafe-eval' (which would materially weaken XSS protection).
      // A future hardening pass can replace 'unsafe-inline' with a nonce-based
      // CSP (Next.js supports per-request nonces via middleware) — out of scope
      // for the MVP.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://images.tiffin.wiki https://lh3.googleusercontent.com",
      "connect-src 'self' https://*.r2.cloudflarestorage.com", // R2 presigned PUT uploads
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Keep the existing images block from earlier stages.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.tiffin.wiki', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
```

> **Why no `'unsafe-eval'`:** the original draft of this spec included `'unsafe-eval'` "for Next.js inline scripts". That is inaccurate — Next.js 16 App Router does not need `eval`, and including it negates much of the XSS protection CSP provides. It is removed deliberately. Leave it out.

---

### 7.3 Complete SEO — noindex, canonical, OG images

#### 7.3.1 Pages that must NOT be indexed (Section 12)

Verify `robots: { index: false, follow: false }` is set in `generateMetadata` for:
- `/admin` and all `/admin/*` pages
- `/add/submitted`
- `/tiffin/[slug]/review`

#### 7.3.2 Canonical URLs on all public pages

Every public page must have `alternates: { canonical: 'https://tiffin.wiki/...' }` in its metadata. Audit:
- `/` — canonical: `https://tiffin.wiki`
- `/search?city={city}` — canonical includes city, excludes page number and other filters
- `/tiffin/{slug}` — canonical: `https://tiffin.wiki/tiffin/{slug}`
- `/add` — canonical: `https://tiffin.wiki/add`

> **Verify, don't re-add.** Stage 4's `search/page.tsx` `generateMetadata` already sets `alternates: { canonical: \`https://tiffin.wiki/search?city=${city}\` }` (city only, no `page`/`q`) — which is exactly correct. Confirm it is present; do **not** add a second canonical tag. The detail page (`tiffin/[slug]`) and home page likewise already set theirs in earlier stages — audit, don't duplicate.

#### 7.3.3 Open Graph image on all pages

Verify all public pages have `openGraph.images` pointing to either the static branded card (`/og-image.png`) or a dynamic OG image. For MVP, all pages use the static card.

#### 7.3.4 Sitemap

Create `app/sitemap.ts`:

```ts
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
```

#### 7.3.5 Robots.txt

Create `app/robots.ts`:

```ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: 'https://tiffin.wiki/sitemap.xml',
  };
}
```

---

### 7.4 i18n Infrastructure Scaffold (Section 15)

Section 15 explicitly states that no hardcoded strings should exist in components — a `messages/` directory must be in place from day one.

#### 7.4.1 Populate `messages/en.json`

Extract all user-visible strings into a structured JSON file:

```json
{
  "site": {
    "name": "tiffin.wiki",
    "tagline": "Find your next tiffin.",
    "description": "A community directory of home-style meal services."
  },
  "nav": {
    "addTiffin": "Add a Tiffin",
    "about": "About",
    "addListing": "Add listing",
    "privacy": "Privacy",
    "skipToMain": "Skip to main content"
  },
  "search": {
    "placeholder": "Service name, area...",
    "cityLabel": "City",
    "searchLabel": "Search",
    "submitLabel": "Find Tiffin",
    "resultsCount": "Showing {from}–{to} of {total} results in {city}",
    "emptyState": "No tiffin services found in {city}. Be the first to add one!"
  },
  "listing": {
    "showNumber": "Show WhatsApp Number",
    "openWhatsApp": "Open in WhatsApp",
    "writeReview": "Write a Review",
    "reviews": "Reviews",
    "noReviews": "No reviews yet. Be the first to review!"
  },
  "addListing": {
    "title": "Add a tiffin service",
    "subtitle": "Know a great tiffin service? List it for free. Our team reviews every submission.",
    "step1": "Basic Info",
    "step2": "Service Details",
    "step3": "Delivery & Images",
    "rateLimitError": "You've submitted 5 listings today. Try again tomorrow.",
    "noteToReviewer": "This is only seen by our team"
  },
  "submitted": {
    "headline": "Thank you! Your submission is under review.",
    "body": "We manually verify each listing to keep the directory reliable. Once verified, it will appear on tiffin.wiki. This usually takes 1–3 business days.",
    "addAnother": "Add another tiffin service",
    "backHome": "Back to home"
  },
  "errors": {
    "notFound": "Page not found",
    "notFoundBody": "We couldn't find what you were looking for.",
    "genericError": "Something went wrong",
    "genericBody": "We encountered an unexpected error. Please try again.",
    "backHome": "Go back home"
  }
}
```

**Important:** These strings are not yet wired through a translation library (that requires `next-intl`, deferred per Section 15). They serve as the single source of truth for English strings and enable seamless future migration. Components may import this file directly as a typed constant for now.

**Interim access pattern (no `next-intl`).** Do NOT install `next-intl` in this stage. Create a tiny typed re-export so components have one stable import path that a future `next-intl` migration can replace in one place:

```ts
// lib/messages.ts
import en from '@/messages/en.json';

// Single source of truth for English copy until next-intl is wired (Section 15).
// `as const`-style typing comes for free from the JSON import under
// "resolveJsonModule" (already enabled by Next.js's tsconfig).
export const t = en;
```

Usage in any Server or Client Component:

```tsx
import { t } from '@/lib/messages';

// e.g. <p>{t.site.tagline}</p>
//      <button>{t.listing.showNumber}</button>
```

Interpolated strings (e.g. `search.resultsCount` = `"Showing {from}–{to} of {total} results in {city}"`) are filled with a small local `.replace()` at the call site for now — do not pull in a formatting library:

```tsx
t.search.resultsCount
  .replace('{from}', String(from))
  .replace('{to}', String(to))
  .replace('{total}', String(total))
  .replace('{city}', city);
```

#### 7.4.2 Verify no hardcoded user-visible strings in components

Audit every component file. Any string that a user sees (labels, error messages, button text, headings, body copy) should either:
1. Already match a key in `messages/en.json`, OR
2. Be added to `messages/en.json`

The goal is that a future developer can enable Hindi (hi.json) purely by adding a translation file, with zero component changes.

---

### 7.5 Create `.github/workflows/migrate.yml`

Database migrations must NEVER run automatically during the Vercel build (Section 14). They run via a separate GitHub Actions workflow triggered manually or on specific conditions.

> **Package manager: npm.** This project uses **npm** (`package-lock.json` is committed; there is no `pnpm-lock.yaml`). The workflow below uses `npm ci` + `cache: 'npm'` + `npx prisma …`, which is correct. Do **not** switch this to pnpm.

```yaml
name: Database Migration

on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - production
          - preview

jobs:
  migrate:
    name: Run Prisma Migrations
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run migrations
        # Use DIRECT_URL (non-pooled) for migrations — Section 14
        env:
          DATABASE_URL: ${{ secrets.DIRECT_URL }}
        run: npx prisma migrate deploy
```

Store `DIRECT_URL` (the non-pooled Neon connection string) as a GitHub Actions secret, not `DATABASE_URL`.

---

### 7.6 Create `vercel.json`

```json
{
  "buildCommand": "prisma generate && next build",
  "regions": ["bom1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

Notes:
- `bom1` = Mumbai region — minimizes latency for Indian users
- **Ensure the Neon project is created in AWS `ap-south-1` (Mumbai)** to match the `bom1` Vercel region. A mismatched DB region adds ~100–200ms to every query (each request would cross regions).
- `buildCommand` matches the `build` script in `package.json` (Section 14)
- Migrations are NOT in the build command (Section 14)
- `maxDuration: 30` for API functions provides headroom for cold starts on Neon serverless

---

### 7.7 Write `prisma/seed.ts`

Create a seed script with a representative dataset for local development:

> **Runner: `tsx`, not `ts-node`.** This project's `tsconfig.json` uses Next.js defaults (`module: "esnext"`, `moduleResolution: "bundler"`), which `ts-node` cannot execute — it routes the `.ts` file through Node's ESM loader and fails with `ERR_UNKNOWN_FILE_EXTENSION`. Use the zero-config esbuild-based runner `tsx` instead. Install it as a dev dependency (`npm install -D tsx`) and set the script to `"db:seed": "tsx prisma/seed.ts"`.
>
> **Construct the client with the Neon adapter.** Prisma 7 in this project requires a driver adapter (see `lib/prisma.ts`); a bare `new PrismaClient()` throws `PrismaClientInitializationError`. A standalone script also doesn't load `.env` automatically, so import `dotenv/config` first.

```ts
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
```

---

### 7.8 Configure Vercel deployment

1. **Connect GitHub repo** to Vercel project. Set framework preset to Next.js.
2. **Set all runtime environment variables** in the Vercel dashboard (Production + Preview environments). **Use the exact names the code reads** — this project is built on **NextAuth v5**, whose native variable names are `AUTH_*` (not the v4 `NEXTAUTH_*` / `GOOGLE_CLIENT_*` names listed in the build_spec env table). `lib/auth.ts` reads `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, and `lib/r2.ts` reads `R2_ENDPOINT` (not `R2_ACCOUNT_ID`). See `.env.local.example` for the authoritative list. Set:
   - `DATABASE_URL` (pooled Neon URL)
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `AUTH_URL` (set to `https://tiffin.wiki` for Production)
   - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
   - `ADMIN_EMAIL`
   - `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

   > **`DIRECT_URL` is NOT a Vercel variable.** It is used only for migrations. Store it as a **GitHub Actions secret named `DIRECT_URL`** (Task 7.5) — do not add it to Vercel. The pooled `DATABASE_URL` is sufficient for all runtime operations.
3. **Add authorized redirect URIs** in Google Cloud Console for production: `https://tiffin.wiki/api/auth/callback/google`
4. **Set custom domain** in Vercel: `tiffin.wiki` and `www.tiffin.wiki`
5. **Configure Cloudflare DNS:**
   ```
   CNAME  @    cname.vercel-dns.com   (proxied OFF for Vercel domains)
   CNAME  www  cname.vercel-dns.com
   ```
6. **Set production branch** to `main`. Enable preview deployments on all PRs.

---

### 7.9 Run final production migration

Before going live, run the migration against the production database using the GitHub Actions workflow:

```
Trigger: Actions → "Database Migration" → Run workflow → environment: production
```

Verify all tables exist in the production Neon instance.

---

### 7.10 Production smoke test

After deployment, manually verify each critical path on `https://tiffin.wiki`:

| Test | Expected |
|---|---|
| Homepage loads | Stats display, recently added listings show |
| Search `?city=pune` | Returns APPROVED listings for Pune |
| Tiffin Detail page | All fields render, WhatsApp reveal works |
| Add Listing form | Steps advance, images upload, submission creates PENDING listing |
| Google sign-in | Works, session persists across page reloads |
| Write review | Auth gate, form submits, review appears on detail page |
| `/admin` (non-admin) | Redirects to `/` |
| `/admin` (admin) | Dashboard renders with correct counts |
| Admin approve | Listing appears in public search after approval |
| Admin reject | Listing does not appear in public search |
| `/sitemap.xml` | Returns valid XML with listing URLs |
| `/robots.txt` | Correct rules; `/admin/` and `/api/` disallowed |
| Security headers | X-Frame-Options, CSP, HSTS present in response headers |

> **Admin approve / reject visibility depends on Stage 6's `revalidatePath`.** The approve route (Stage 6, Task 6.8) calls `revalidatePath('/search')`, `revalidatePath('/')`, and `revalidatePath('/tiffin/{slug}')`, and `search/page.tsx` is `force-dynamic` — so an approved listing appears immediately. If a freshly approved listing does **not** appear, confirm those `revalidatePath` calls are present in the approve/reject routes before assuming an ISR-cache problem.

---

### 7.11 Final build validation

```bash
npm run build
```

Expected output:
- Zero TypeScript errors
- Zero ESLint errors
- All pages statically generated or marked as dynamic correctly
- No "missing alt" warnings from Next.js Image component
- Build passes `prisma generate` step without errors

---

## Files / Areas Affected

| File | Action |
|---|---|
| `next.config.ts` | Updated — security headers added (existing `images` block preserved) |
| `app/sitemap.ts` | Created — dynamic sitemap |
| `app/robots.ts` | Created — robots.txt |
| `app/(public)/search/loading.tsx` | Created — skeleton loading UI for search |
| `messages/en.json` | Updated — all user-visible strings |
| `lib/messages.ts` | Created — typed re-export of `en.json` (interim i18n access) |
| `.github/workflows/migrate.yml` | Created — migration workflow |
| `vercel.json` | Created — Vercel config |
| `prisma/seed.ts` | Created — development seed |
| All component files | Audited — accessibility fixes, no hardcoded strings |
| `app/(public)/page.tsx` | Audited — OG tags, canonical, JSON-LD |
| `app/(public)/search/page.tsx` | Audited — canonical, OG |
| `app/(public)/tiffin/[slug]/page.tsx` | Audited — canonical, OG, JSON-LD |
| All admin pages | Audited — `robots: { index: false }` |

---

## Acceptance Criteria

### Accessibility
- [ ] `npm run build` emits no accessibility warnings from Next.js
- [ ] Tab-through of every page reaches all interactive elements in logical DOM order
- [ ] Focus ring is visible on all interactive elements (keyboard test)
- [ ] No `text-brand-peridot` on small body text — contrast ratio verified
- [ ] All `<img>` elements have `alt` attributes across the entire app
- [ ] All form inputs have `<label>` elements; no placeholder-only patterns
- [ ] Error messages use `role="alert"` + `aria-describedby`
- [ ] Skip link is first focusable element; pressing Tab from it lands on the first main content element
- [ ] All touch targets are at minimum 44×44px

### SEO
- [ ] `/admin`, `/admin/*`, `/add/submitted`, `/tiffin/*/review` all return `X-Robots-Tag: noindex` or equivalent `<meta name="robots" content="noindex">`
- [ ] All public pages have canonical URL in `<head>`
- [ ] All public pages have `og:title`, `og:description`, `og:image` in `<head>`
- [ ] `/sitemap.xml` is valid and includes all APPROVED listing URLs
- [ ] `/robots.txt` disallows `/admin/` and `/api/`

### Security
- [ ] `X-Frame-Options: SAMEORIGIN` present in all responses
- [ ] `Content-Security-Policy` present and includes R2 domain in `connect-src`
- [ ] `Strict-Transport-Security` present on production
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] No secrets in the repository (run `git log --all -- .env.local` to confirm)

### i18n Readiness
- [ ] `messages/en.json` contains all user-visible strings
- [ ] No hardcoded user-visible strings exist in any component file

### CI/CD & Deployment
- [ ] `.github/workflows/migrate.yml` runs `prisma migrate deploy` successfully on manual trigger
- [ ] Vercel build uses `prisma generate && next build` as the build command
- [ ] All runtime environment variables are set in the Vercel dashboard using the **v5 `AUTH_*` names** the code reads (`AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `R2_ENDPOINT`, …); `DIRECT_URL` is set only as a GitHub Actions secret, not in Vercel
- [ ] Production URL `https://tiffin.wiki` resolves and serves the application
- [ ] Google OAuth works on the production domain
- [ ] R2 images load from `https://images.tiffin.wiki` on the production site

### Overall
- [ ] `npm run build` passes with zero errors and zero warnings
- [ ] `npm run db:seed` creates 3 seed listings without errors
- [ ] All 10 smoke test items in Task 7.10 pass on production

---

## Dependencies Introduced

No new runtime packages. All required packages were installed in Stage 1.

The following CI/CD infrastructure is new:
- **GitHub Actions** — `.github/workflows/migrate.yml` (no cost for public repos)
- **Vercel** — connected to the GitHub repository (no new package dependency)
