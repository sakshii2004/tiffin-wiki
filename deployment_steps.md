# Production Deployment Runbook: tiffin.wiki

> **Streamlined, actionable production runbook** tailored to your existing cloud setup. Focuses on what needs editing for production, how to isolate your Neon database, domain configuration, going live on Vercel, and managing zero-downtime migrations without losing data.

---

## Table of Contents

1. [Database Isolation: Can You Just Generate a New Key?](#1-database-isolation-can-you-just-generate-a-new-key)
2. [What to Edit in Your Existing `.env` & Cloud Services](#2-what-to-edit-in-your-existing-env--cloud-services)
   - [2.1 Google Cloud Console (Update Redirect URIs)](#21-google-cloud-console-update-redirect-uris)
   - [2.2 Cloudflare R2 (CORS & Public Domain)](#22-cloudflare-r2-cors--public-domain)
   - [2.3 Production Environment Variables Checklist](#23-production-environment-variables-checklist)
3. [Domain & DNS Configuration](#3-domain--dns-configuration)
4. [Initialize the Fresh Production Database](#4-initialize-the-fresh-production-database)
5. [Vercel Deployment & Going Live](#5-vercel-deployment--going-live)
6. [Future Schema Migrations Without Losing Production Data](#6-future-schema-migrations-without-losing-production-data)
7. [Post-Deployment Smoke Test](#7-post-deployment-smoke-test)
8. [Backups & Recovery](#8-backups--recovery)

---

## 1. Database Isolation: Can You Just Generate a New Key?

> [!IMPORTANT]
> **Short Answer**: Generating only a new **role / password / API key** inside the *same* database is **not enough**—it will still connect to the existing dev database and share the same tables and data.
>
> However, inside your existing Neon account, you do **NOT** need a new account. You have two simple ways to get a 100% separate, clean database:

### Option A: Create a New Project in Neon (Recommended)
1. In your [Neon Console](https://console.neon.tech/), click **New Project**.
2. Name it `tiffin-wiki-prod`.
3. Select region **AWS Asia Pacific (Mumbai) `ap-south-1`** (this matches Vercel's serverless region `bom1` for sub-30ms database latency).
4. Neon gives you a brand new, completely isolated database with its own pooled and direct connection strings.

### Option B: Create a New Branch or Database in Your Existing Neon Project
If you prefer staying in your current Neon project:
- **New Branch**: Go to **Branches** > **Create Branch** > name it `production` (empty).
- **OR New Database**: Go to **Databases** > **New Database** > name it `tiffin_wiki_prod`.
- Both options give you a distinct connection string that points to an empty database while keeping your dev data completely untouched.

---

## 2. What to Edit in Your Existing `.env` & Cloud Services

Since your services are already provisioned, here are the only configuration edits required before going live:

### 2.1 Google Cloud Console (Update Redirect URIs)
Your existing OAuth Client ID (`AUTH_GOOGLE_ID`) needs to permit your live production domain:
1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Click on your existing OAuth 2.0 Client ID.
3. Under **Authorized JavaScript origins**, add:
   - `https://tiffin.wiki`
   - `https://www.tiffin.wiki`
4. Under **Authorized redirect URIs**, add:
   - `https://tiffin.wiki/api/auth/callback/google`
   - `https://www.tiffin.wiki/api/auth/callback/google`
5. Click **Save**.

---

### 2.2 Cloudflare R2 (CORS & Public Domain)

1. **Verify CORS Settings**: In Cloudflare dashboard > **R2** > `tiffin-wiki-images` > **Settings** > **CORS Policy**, ensure `https://tiffin.wiki` is allowed:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://tiffin.wiki",
         "https://www.tiffin.wiki",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
2. **Public URL**:
   - **Option 1 (Default)**: Keep using your existing `R2_PUBLIC_URL="https://pub-2261792796b646a1bb962427d7c700be.r2.dev"` (already configured in `next.config.ts`).
   - **Option 2 (Custom Domain)**: Under bucket **Settings** > **Public Access** > **Connect Domain**, enter `images.tiffin.wiki` and change `R2_PUBLIC_URL` to `https://images.tiffin.wiki`.

---

### 2.3 Production Environment Variables Checklist

Set these values in the **Vercel Project Settings > Environment Variables** (select **Production** environment):

| Variable | Current Dev Value | Action Needed for Production |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...aoijbltn-pooler...` | **Update** with the new **Pooled** connection string from your fresh prod Neon DB. |
| `DIRECT_URL` | `postgresql://...aoijbltn...` | **Update** with the new **Direct** (non-pooled) connection string from your fresh prod Neon DB. |
| `AUTH_SECRET` | `UhqLfgGN0+/P+0xXlMo441yr0SR6LLDtoGGccpqzciw=` | **Keep as is** (or run `openssl rand -base64 32` if you prefer a separate prod secret). |
| `AUTH_URL` | `http://localhost:3000` | **Change to:** `https://tiffin.wiki` |
| `AUTH_GOOGLE_ID` | `592748388397-6j6v0iefofke8...` | **Keep as is** (after updating Redirect URIs in Google Console above). |
| `AUTH_GOOGLE_SECRET` | `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` | **Keep as is**. |
| `ADMIN_EMAIL` | `sakshisah0511@gmail.com` | **Keep as is** (Google account authorized to access `/admin`). |
| `R2_ENDPOINT` | `https://bf4a2e585b16f463367a906b3391f5db.r2.cloudflarestorage.com` | **Keep as is**. |
| `R2_ACCESS_KEY_ID` | `f98b20883503d5d5abde816e1200914d` | **Keep as is**. |
| `R2_SECRET_ACCESS_KEY` | `e165d5f984bbf307b194f1cdec714eb3d...` | **Keep as is**. |
| `R2_BUCKET_NAME` | `tiffin-wiki-images` | **Keep as is**. |
| `R2_PUBLIC_URL` | `https://pub-2261792796b646a1bb962427d7c700be.r2.dev` | **Keep as is** (or change to `https://images.tiffin.wiki` if you hooked up the custom domain). |
| `NODE_ENV` | *(Not set locally)* | **Set to:** `production` |

---

## 3. Domain & DNS Configuration

Once you purchase `tiffin.wiki` (from Cloudflare, Namecheap, Porkbun, etc.), configure your DNS records:

| Type | Name / Host | Value / Target | Notes |
| :--- | :--- | :--- | :--- |
| **A** | `@` (`tiffin.wiki`) | `76.76.21.21` | Points apex domain to Vercel |
| **CNAME** | `www` | `cname.vercel-dns.com` | Points www to Vercel (set to redirect to `@` in Vercel) |
| **CNAME** | `images` *(optional)* | `tiffin-wiki-images.<account_id>.r2.cloudflarestorage.com` | Required only if using custom domain `images.tiffin.wiki` |

*Note: In Cloudflare DNS, set the Proxy status for `@` and `www` to **DNS only (Gray Cloud)** initially so Vercel can issue the SSL certificate.*

---

## 4. Initialize the Fresh Production Database

Once you create the new prod Neon project/database, initialize the database schema.

### Step 1: Run Migrations Against Production Direct URL
Open your terminal (PowerShell or Bash) and execute:

```bash
# Set your new production DIRECT_URL temporarily in your terminal session
# Windows PowerShell:
$env:DIRECT_URL="postgresql://neondb_owner:<PASSWORD>@<NEW_PROD_HOST>/<DB_NAME>?sslmode=require"

# macOS/Linux Bash:
# export DIRECT_URL="postgresql://neondb_owner:<PASSWORD>@<NEW_PROD_HOST>/<DB_NAME>?sslmode=require"

# Apply all schema migrations
npx prisma migrate deploy
```

You will see:
```text
Applying migration `20260607142645_init`
Applying migration `20260607165518_align_with_spec`
All migrations have been successfully applied.
```

### Step 2: Fresh DB vs. Starter Data
- **Completely Fresh (0 listings)**: Do nothing further! The tables (`TiffinService`, `TiffinOffering`, `ServiceImage`, `Review`, `User`, `TelemetryEvent`, etc.) are now created and ready for real user submissions.
- **Optional Starter Data**: If you want the 3 seed listings in Mumbai, Pune, and Bangalore, run:
  ```bash
  $env:DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@<NEW_PROD_HOST_POOLER>/<DB_NAME>?sslmode=require"
  npm run db:seed
  ```

---

## 5. Vercel Deployment & Going Live

### Step 1: Import Project to Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2. Select your GitHub repository: `sakshii2004/tiffin-wiki`.
3. Framework Preset: **Next.js**.
4. Build Command: `prisma generate && next build` *(already configured in `package.json` and `vercel.json`)*.

### Step 2: Paste Environment Variables
Add all variables from the [Section 2.3 Checklist](#23-production-environment-variables-checklist).

### Step 3: Connect Domain
1. In Vercel Project Settings > **Domains**, add `tiffin.wiki`.
2. Add `www.tiffin.wiki` and configure it to redirect to `tiffin.wiki`.

### Step 4: Click Deploy
Vercel will build the application, generate Prisma client bindings, and deploy serverless functions to the Mumbai region (`bom1`).

---

## 6. Future Schema Migrations Without Losing Production Data

When updating your database schema in the future, follow this process:

### Development Step (Local Machine)
1. Edit `prisma/schema.prisma`.
2. Run `npm run db:migrate` (`prisma migrate dev`).
3. Prisma creates a new timestamped SQL file inside `prisma/migrations/`.
4. Commit the new migration folder to Git and push to GitHub.

### Production Step (Applying to Live DB)

> [!CAUTION]
> **NEVER** run `prisma migrate dev` or `prisma db push` on Production!
> Those commands are for development and can reset/drop tables.

To apply changes to production safely:

#### Method A: Automated via GitHub Actions (Recommended)
1. Add your production `DIRECT_URL` to GitHub Repository **Settings** > **Secrets and variables** > **Actions** > **Environment: `production`**.
2. Go to GitHub **Actions** > **Database Migration** > **Run workflow** (targets `production`).
3. The workflow executes `npx prisma migrate deploy`, applying only pending migrations within safe transactions.

#### Method B: Manual CLI
```bash
$env:DIRECT_URL="<PROD_DIRECT_URL>"
npx prisma migrate deploy
```

### Best Practices for Zero Data Loss
- **Adding new columns**: Always make new columns optional (`String?`) or provide a default value (`@default(...)`).
- **Adding new tables**: 100% safe to migrate before deploying application code.
- **Renaming columns**: Do not rename directly. Use Prisma `@map("old_name")` so data is preserved.

---

## 7. Post-Deployment Smoke Test

Once live at `https://tiffin.wiki`, check off these items:

1. [ ] **Homepage & Search**: Visit `https://tiffin.wiki` and verify listings/cities render. Test search filters (Veg, Lunch/Dinner).
2. [ ] **WhatsApp Button**: Open any listing (`/tiffin/<slug>`) and click "Show WhatsApp Number". Verify phone number reveals and links to `wa.me`.
3. [ ] **Submit Listing (`/add`)**: Submit a test listing and upload an image. Verify presigned upload to R2 succeeds.
4. [ ] **Admin Panel (`/admin`)**: Login with `sakshisah0511@gmail.com` via Google OAuth. Verify the pending listing appears and test Approve/Reject.
5. [ ] **SEO**: Verify `https://tiffin.wiki/robots.txt` and `https://tiffin.wiki/sitemap.xml` are accessible.

---

## 8. Backups & Recovery

1. **Automated Point-in-Time Recovery (PITR)**:
   Neon continuously backs up Write-Ahead Logs. In the Neon Console under **Branches**, you can restore your database to any second in history.
2. **Manual Snapshot (`pg_dump`)**:
   ```bash
   pg_dump "$DIRECT_URL" -F p -v -f "tiffin_wiki_backup.sql"
   ```
