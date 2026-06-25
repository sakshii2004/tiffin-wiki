# Tiffin Wiki — Developer Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20.x | Required by Next.js 16 |
| npm | ≥ 10.x | Bundled with Node |
| Git | any | — |

> **pnpm** is referenced in `package.json` scripts. If you prefer pnpm, install it with `npm install -g pnpm` and use `pnpm run <script>` instead of `npm run <script>`. Both work identically for this project.

---

## First-time Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd tiffin-wiki
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in every value. All 12 variables are required at runtime; see the [Environment Variables Reference](#environment-variables-reference) section below.

### 3. Generate Prisma Client

```bash
npm run db:push      # quick schema sync for local dev (no migration file)
# — OR —
npm run db:migrate   # proper migration (see Database Migrations section)
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Migrations

This project uses [Neon](https://neon.tech) with **two connection strings** and Prisma 7.

| Variable | Purpose | Used by |
|---|---|---|
| `DATABASE_URL` | Pooled via PgBouncer — used by the Neon driver adapter at runtime | Application (`lib/prisma.ts`) |
| `DIRECT_URL` | Direct (non-pooled) — used by Prisma CLI for migrations | `prisma.config.ts` → `npx prisma migrate dev` |

### Why two URLs?

Prisma's migration engine opens long-lived schema-introspection connections that are incompatible with PgBouncer connection pooling. `prisma.config.ts` therefore reads `DIRECT_URL` for all CLI commands. At runtime, `lib/prisma.ts` uses `@prisma/adapter-neon` with the pooled `DATABASE_URL`.

### Running a migration

1. Ensure `DIRECT_URL` is set in `.env.local` (it always should be — see `.env.local.example`).
2. Run the migration:
   ```bash
   npm run db:migrate
   # Enter a migration name when prompted, e.g. "init"
   ```
   `prisma.config.ts` automatically routes CLI commands to `DIRECT_URL`, so no manual URL swap is needed.

> **Note for Windows PowerShell**: The inline `DATABASE_URL=$DIRECT_URL` pattern (bash) does not work. This project avoids it — `prisma.config.ts` handles URL selection automatically.

---

## Cloudflare R2 Setup

1. Create an R2 bucket named `tiffin-wiki-images` in your Cloudflare account.
2. Create an API token with **Object Read & Write** permissions on that bucket.
3. Note the `Account ID` from the Cloudflare dashboard (used in `R2_ENDPOINT`).
4. Configure a custom domain (`images.tiffin.wiki`) under the bucket's **Settings → Public access → Custom domain** tab.
5. Fill in the four `R2_*` variables in `.env.local`.

### How uploads work

Client code calls `POST /api/upload/presign` → server returns a presigned S3-compatible PUT URL → client uploads the file directly to R2 (no data passes through the Next.js server) → client stores the public URL returned by `getPublicUrl(key)`.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Pooled Neon PostgreSQL URL (used at runtime) |
| `DIRECT_URL` | ✅ | Direct Neon PostgreSQL URL (used for migrations only) |
| `AUTH_SECRET` | ✅ | Random 32-byte secret for NextAuth.js session signing. Generate: `openssl rand -base64 32` |
| `AUTH_URL` | ✅ | Full base URL of the deployment, e.g. `http://localhost:3000` or `https://tiffin.wiki` |
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth Client ID (from Google Cloud Console) |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth Client Secret |
| `ADMIN_EMAIL` | ✅ | Email of the single admin user. Any signed-in user with this email receives admin privileges. No database table is needed. |
| `R2_ENDPOINT` | ✅ | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | ✅ | Cloudflare R2 API access key |
| `R2_SECRET_ACCESS_KEY` | ✅ | Cloudflare R2 API secret key |
| `R2_BUCKET_NAME` | ✅ | R2 bucket name, e.g. `tiffin-wiki-images` |
| `R2_PUBLIC_URL` | ✅ | Public base URL for stored objects, e.g. `https://images.tiffin.wiki` |

---

## Package Scripts Reference

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start local development server (hot reload) |
| `build` | `prisma generate && next build` | Generate Prisma Client then compile for production |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Run ESLint across all source files |
| `db:migrate` | `prisma migrate dev` | Create and apply a new migration (requires direct URL — see above) |
| `db:push` | `prisma db push` | Push schema to DB without a migration file (dev convenience) |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI at http://localhost:5555 |
| `db:seed` | `ts-node prisma/seed.ts` | Run the seed script (create `prisma/seed.ts` first) |

---

## Project Structure

```
tiffin-wiki/
├── app/
│   ├── (public)/           # Public-facing routes (SiteHeader + SiteFooter)
│   │   ├── layout.tsx      # Owns <main id="main-content">
│   │   ├── page.tsx        # Home (redirects to search)
│   │   ├── tiffin/[slug]/  # Listing detail
│   │   │   └── review/     # Review submission
│   │   ├── search/         # Browse / filter listings
│   │   └── add/            # Submit a new listing
│   │       └── submitted/  # Post-submission confirmation
│   ├── admin/              # Admin-only routes
│   │   ├── layout.tsx      # Admin shell (no <main>, uses <div>)
│   │   └── listings/[id]/  # Approve / reject a listing
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth.js route handler
│   │   ├── listings/            # CRUD + moderation endpoints
│   │   │   └── [id]/approve|reject/
│   │   ├── reviews/             # Review submission
│   │   └── upload/presign/      # Generate R2 presigned PUT URL
│   ├── layout.tsx          # Root layout — NO <main>, just skip-link + {children}
│   └── globals.css         # Tailwind v4 imports + @theme tokens + .skip-link
├── auth.ts                 # NextAuth.js v5 config (handlers, auth, signIn, signOut)
├── components/
│   ├── layout/             # SiteHeader, SiteFooter
│   ├── listing/            # Listing cards, detail sections (Stage 2+)
│   ├── forms/              # react-hook-form components (Stage 3+)
│   ├── admin/              # Admin UI components (Stage 4+)
│   ├── ui/                 # Shared primitives (buttons, inputs …)
│   └── providers/          # React context providers (Stage 2+)
├── lib/
│   ├── prisma.ts           # Singleton Prisma Client with hot-reload guard
│   ├── r2.ts               # Cloudflare R2 client + presign helpers
│   └── slugify.ts          # generateSlug(name, city) → kebab-case + 4-hex suffix
├── messages/
│   └── en.json             # i18n strings (empty scaffold)
├── prisma/
│   ├── schema.prisma       # Full schema: 7 enums, 9 models
│   └── migrations/         # Auto-generated by prisma migrate dev
├── types/
│   └── index.ts            # Re-exported Prisma types + custom types
├── .env.local.example      # All 12 required env vars with comments
├── next.config.ts          # Image remotePatterns (R2 + Google avatars)
└── package.json            # Scripts: dev, build, db:migrate, db:push, db:studio, db:seed
```

---

## Design System

Tailwind CSS **v4** is used with CSS-first configuration. Custom brand tokens are defined in `app/globals.css`:

```css
@theme {
  --color-brand-peridot: #6aa337;  /* primary accent / action — leafy green */
  --color-brand-maroon:  #6e2020;  /* secondary accent / highlight — muted red */
  --color-cream:         #fffdf7;  /* base background canvas — warm cream */
  --color-body:          #111111;  /* primary text & dark elements */
}
```

These generate standard Tailwind utility classes: `text-brand-peridot`, `bg-brand-peridot`, `text-brand-maroon`, `bg-cream`, `text-body`, `bg-body`, `border-brand-peridot`, etc.

> **Note**: There is no `tailwind.config.js`. Tailwind v4 reads configuration from `@theme` blocks in CSS.

### Prisma 7 Notes

- Connection URLs live in `prisma.config.ts`, **not** in `prisma/schema.prisma`.
- The datasource block in the schema only declares `provider = "postgresql"`.
- The runtime client (`lib/prisma.ts`) uses `@prisma/adapter-neon` — a serverless HTTP-based driver that is compatible with Vercel's serverless functions.
- `@prisma/client` is still the import path (`import { PrismaClient } from "@prisma/client"`).

---

## Accessibility

- A skip-to-content link (`.skip-link`) is placed as the first child of `<body>` in the root layout. It becomes visible on `:focus` and jumps to `#main-content`.
- The `#main-content` id is owned by `app/(public)/layout.tsx` (`<main>`) and `app/admin/layout.tsx` (`<div>`). The root layout intentionally renders no `<main>` landmark to avoid duplicate landmarks across route groups.

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set all 12 environment variables in **Project Settings → Environment Variables**.
3. In `vercel.json` (or project settings), set the deployment region to `sin1` (Singapore) — the closest available Neon region to South Asia. Neon does not offer an AP South (Mumbai) region; available options are US East/West, AP Singapore, AP Sydney, EU Frankfurt/London, and SA São Paulo.
4. First deploy: Vercel runs `npm run build` → `prisma generate && next build`.
5. Run the initial migration manually (see [Database Migrations](#database-migrations)) against the production Neon direct URL before the first traffic hits the app.
