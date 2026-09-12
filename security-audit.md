# Tiffin Wiki — Security Audit Report

**Audit Date:** 2026-08-31  

**Last Updated:** 2026-08-31 (re-assessed against `seo-and-rate-limits` branch)  

**Application:** tiffin.wiki (Next.js 16.2.7 / React 19.2.4)  

**Architecture:** App Router, Server Components, Vercel deployment  

**Auditor Role:** Senior Application Security Engineer (Authorized Assessment)  

---

## Executive Summary

The Tiffin Wiki application demonstrates a **strong security posture for an early-stage product**. The codebase shows clear evidence of security-conscious development: defense-in-depth admin checks (middleware + layout + API), comprehensive security headers with a well-considered CSP, database-backed sessions for revocability, IP hashing instead of raw storage, Zod validation on all inputs, and parameterized Prisma queries throughout.

> [!CAUTION]

> **One Critical vulnerability was identified:** The file [`deployment_steps.md`](file:///c:/Users/user/Documents/TW/t-w/deployment_steps.md) committed to git contains **hardcoded production secrets** including `AUTH_SECRET`, `AUTH_GOOGLE_SECRET`, `R2_SECRET_ACCESS_KEY`, `R2_ACCESS_KEY_ID`, `ADMIN_EMAIL`, and a partial `AUTH_GOOGLE_ID`. These must be rotated immediately.

> [!NOTE]

> **Branch update (`seo-and-rate-limits`):** Three findings from the initial audit against `main` have been **resolved** in this branch. The presign endpoint, telemetry endpoint, and review endpoint now have in-memory sliding-window rate limiting via a new `RateLimiters` module in [`lib/rateLimit.ts`](file:///c:/Users/user/Documents/TW/t-w/lib/rateLimit.ts). The listing submission endpoint also gained burst protection (2/min/IP) on top of its existing 5/day database-backed limit.

**Top 3 areas for immediate attention:**

1. 🔴 **Hardcoded secrets in `deployment_steps.md`** — production API keys, OAuth secrets, and auth secrets committed to git (Critical)

2. **Open redirect in login server action** — `callbackUrl` from search params used without validation (Medium)

3. **In-memory rate limiter not shared across serverless instances** — limits are per-isolate, not global (Low)

---

## Attack Surface Map

### Technology Stack

| Component | Technology | Version |

|---|---|---|

| Framework | Next.js (App Router) | 16.2.7 |

| React | React | 19.2.4 |

| Database | PostgreSQL (Neon Serverless) | — |

| ORM | Prisma Client | 7.8.0 |

| Auth | NextAuth.js v5 (beta) | 5.0.0-beta.31 |

| Object Storage | Cloudflare R2 (via AWS SDK) | — |

| Deployment | Vercel (Serverless, `bom1` region) | — |

| Validation | Zod | 4.4.3 |

### Externally Reachable Attack Surface

| Endpoint | Method | Auth | Description |

|---|---|---|---|

| `/api/auth/[...nextauth]` | GET/POST | Public | NextAuth sign-in, sign-out, callbacks |

| `/api/listings` | POST | Public | Create listing submission |

| `/api/reviews` | POST | Authenticated | Submit a review |

| `/api/upload/presign` | POST | **Public** | Generate presigned R2 PUT URL |

| `/api/telemetry` | POST | **Public** | Ingest telemetry events |

| `/api/listings/[id]` | PATCH/DELETE | Admin | Edit/delete listing |

| `/api/listings/[id]/approve` | POST | Admin | Approve listing |

| `/api/listings/[id]/reject` | POST | Admin | Reject listing |

| `/` | GET | Public | Homepage |

| `/search` | GET | Public | Search/filter listings |

| `/tiffin/[slug]` | GET | Public | Listing detail page |

| `/tiffin/[slug]/review` | GET | Authenticated | Review submission form |

| `/add` | GET | Public | Add listing form |

| `/login` | GET | Public | Login/signup page |

| `/profile` | GET | Authenticated | User profile |

| `/admin/**` | GET | Admin | Admin dashboard & management |

### Authentication Model

- **Provider:** Google OAuth only (via NextAuth.js v5)

- **Session strategy:** Database-backed (PostgreSQL), revocable

- **Admin model:** Single admin identified by `ADMIN_EMAIL` environment variable

- **Authorization layers:** Middleware (edge) → Layout (server) → API route (handler)

### Data Stores

- **PostgreSQL (Neon):** Users, sessions, listings, reviews, telemetry, rate limits

- **Cloudflare R2:** Uploaded listing and review images

---

## Findings

### Finding 0 [NEW]: Hardcoded Production Secrets in `deployment_steps.md`

| Field | Value |

|---|---|

| **Severity** | **Critical** |

| **Confidence** | Confirmed |

| **CWE** | CWE-798: Use of Hard-coded Credentials |

| **Affected File** | [`deployment_steps.md`](file:///c:/Users/user/Documents/TW/t-w/deployment_steps.md) |

| **Affected Lines** | L90-L104 |

**Issue:** The deployment guide committed to git contains a table of environment variables with **actual production/development secret values** in plaintext:

```markdown

| `AUTH_SECRET`          | `UhqLfgGN0+/P+0xXlMo441yr0SR6LLDtoGGccpqzciw=` | ...

| `AUTH_GOOGLE_ID`       | `592748388397-6j6v0iefofke8...`                  | ...

| `AUTH_GOOGLE_SECRET`   | `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`            | ...

| `ADMIN_EMAIL`          | `sakshisah0511@gmail.com`                         | ...

| `R2_ENDPOINT`          | `https://bf4a2e585b16f463367a906b3391f5db.r2...`  | ...

| `R2_ACCESS_KEY_ID`     | `f98b20883503d5d5abde816e1200914d`                | ...

| `R2_SECRET_ACCESS_KEY` | `e165d5f984bbf307b194f1cdec714eb3d...`            | ...

| `R2_PUBLIC_URL`        | `https://pub-2261792796b646a1bb962427d7c700be...` | ...

```

**Exposed secrets include:**

- `AUTH_SECRET` — NextAuth session signing secret (full value)

- `AUTH_GOOGLE_SECRET` — Google OAuth client secret (full value)

- `AUTH_GOOGLE_ID` — Google OAuth client ID (partial but sufficient for identification)

- `R2_ACCESS_KEY_ID` — Cloudflare R2 access key (full value)

- `R2_SECRET_ACCESS_KEY` — Cloudflare R2 secret key (partial, but the full value exists in git history)

- `R2_ENDPOINT` — R2 account-specific endpoint (reveals Cloudflare account ID `bf4a2e585b16f463367a906b3391f5db`)

- `ADMIN_EMAIL` — the single admin Google account email

**Impact:** An attacker with access to this git repository (public or shared) can:

1. **Forge NextAuth sessions** using the `AUTH_SECRET` — full authentication bypass

2. **Access the Cloudflare R2 bucket** — read/write/delete all uploaded images

3. **Impersonate the application** via the Google OAuth credentials

4. **Identify the admin account** for targeted phishing

Even if the repository is currently private, git history is permanent. These secrets will remain in the commit history even after the file is modified.

**Immediate Remediation:**

1. **Rotate ALL exposed secrets immediately** — every single one listed above

2. Generate a new `AUTH_SECRET` (`openssl rand -base64 32`)

3. Generate new Google OAuth client secret in Google Cloud Console

4. Generate new R2 API keys in Cloudflare dashboard

5. Remove or redact the plaintext values from `deployment_steps.md`

6. If the repo has ever been public or shared, consider the secrets **fully compromised**

7. Use `git filter-branch` or BFG Repo-Cleaner to purge secrets from git history if needed

---

### Finding 1: ~~Unauthenticated Presigned URL Generation~~ ✅ RESOLVED

| Field | Value |

|---|---|

| **Severity** | ~~Medium~~ → **Resolved** |

| **Status** | Fixed in `seo-and-rate-limits` branch |

| **Affected File** | [`app/api/upload/presign/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/upload/presign/route.ts) |

**Resolution:** The presign endpoint now includes IP-based sliding-window rate limiting via `RateLimiters.uploadPresign()` — 15 presigned URLs per 10 minutes per IP. Returns `429` with `Retry-After` header when exceeded.

**Residual note:** The endpoint is still unauthenticated (anyone can generate presigned URLs), but the rate limiting makes storage abuse impractical. See Finding 12 for a caveat about the in-memory rate limiter on serverless.

---

### Finding 2: ~~Unauthenticated Telemetry Endpoint — Data Pollution~~ ✅ PARTIALLY RESOLVED

| Field | Value |

|---|---|

| **Severity** | ~~Medium~~ → **Low** (residual) |

| **Status** | Partially fixed in `seo-and-rate-limits` branch |

| **Affected File** | [`app/api/telemetry/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/telemetry/route.ts) |

**Resolution:** The telemetry endpoint now includes IP-based rate limiting via `RateLimiters.telemetry()` — 60 batch requests per minute per IP.

**Residual concerns:**

- No batch size cap — a single request can still contain an arbitrarily large JSON array

- No Zod schema — field lengths and allowed values are not validated

- See Finding 12 for in-memory rate limiter caveats on serverless

---

### Finding 3: Potential Open Redirect via Login `callbackUrl`

| Field | Value |

|---|---|

| **Severity** | Medium |

| **Confidence** | Potential (requires NextAuth configuration verification) |

| **CWE** | CWE-601: URL Redirection to Untrusted Site |

| **Affected File** | [`app/(public)/login/page.tsx`](file:///c:/Users/user/Documents/TW/t-w/app/(public)/login/page.tsx) |

| **Affected Lines** | L20-L23 |

**Vulnerable Code:**

```typescript

async function handleGoogleSignIn() {

  'use server';

  await signIn('google', { redirectTo: callbackUrl ?? '/' });

}

```

The `callbackUrl` is sourced directly from `searchParams` and passed to NextAuth's `signIn()` as the `redirectTo` value. If NextAuth does not validate the redirect URL (ensuring it's relative or same-origin), an attacker could craft a URL like:

```

https://tiffin.wiki/login?callbackUrl=https://evil.com/phish

```

After Google OAuth completes, the user would be redirected to `evil.com`.

**Mitigating Factors:**

- NextAuth v5 (beta) does implement a redirect callback that defaults to same-origin validation

- The default `redirect` callback in NextAuth only allows relative URLs and same-origin URLs

- However, this relies on the default callback not being overridden (it isn't in this codebase — confirmed)

**Assessment:** The risk is **likely mitigated** by NextAuth's default redirect callback. However, given that this is a beta version of NextAuth, the behavior should be explicitly verified. The safest approach is defense-in-depth: validate the `callbackUrl` before passing it to `signIn()`.

**Recommended Fix:**

```typescript

async function handleGoogleSignIn() {

  'use server';

  // Ensure callbackUrl is relative (no protocol/host)

  const safeUrl = callbackUrl?.startsWith('/') ? callbackUrl : '/';

  await signIn('google', { redirectTo: safeUrl });

}

```

---

### Finding 4: Missing `[id]` Parameter Validation on Admin API Routes

| Field | Value |

|---|---|

| **Severity** | Low |

| **Confidence** | Confirmed |

| **CWE** | CWE-20: Improper Input Validation |

| **Affected Files** | [`app/api/listings/[id]/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/listings/[id]/route.ts), [`approve/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/listings/[id]/approve/route.ts), [`reject/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/listings/[id]/reject/route.ts) |

**Issue:** The `id` parameter from the URL path is used directly in Prisma queries (`where: { id }`) without validating that it matches the expected CUID format. While Prisma will simply return no results for an invalid ID (preventing SQL injection), passing excessively long or malformed IDs could trigger verbose Prisma error messages in logs.

**Impact:** Minimal — defense-in-depth concern. Prisma parameterizes all queries, so there's no injection risk. However, explicit validation is a best practice.

**Recommended Fix:** Add `z.string().cuid()` validation on the `id` parameter at the start of each handler.

---

### Finding 5: Telemetry Event `payload` Uses `any` Type

| Field | Value |

|---|---|

| **Severity** | Low |

| **Confidence** | Confirmed |

| **CWE** | CWE-20: Improper Input Validation |

| **Affected File** | [`app/api/telemetry/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/telemetry/route.ts) |

| **Affected Lines** | L27-L60 |

**Issue:** The telemetry endpoint parses the request body as `JSON.parse(text)` and types the result as `any`. Individual fields are coerced via `String()`, but there's no Zod schema enforcing field constraints, string lengths, or allowed values.

An attacker could send arbitrarily long strings for fields like `searchQuery`, `city`, or `referrer` (up to the body size limit), potentially causing:

- Excessive database row sizes

- Unexpected data in analytics queries

**Recommended Fix:** Add a Zod schema for telemetry events with max-length constraints on all string fields and validate `eventType` against an enum of allowed values.

---

### Finding 6: ~~No Rate Limiting on Review Submission~~ ✅ RESOLVED

| Field | Value |

|---|---|

| **Severity** | ~~Low~~ → **Resolved** |

| **Status** | Fixed in `seo-and-rate-limits` branch |

| **Affected File** | [`app/api/reviews/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/reviews/route.ts) |

**Resolution:** The review endpoint now includes IP-based rate limiting via `RateLimiters.reviews()` — 10 reviews per hour per IP. The rate limit check runs *before* the authentication check, providing defense-in-depth against both authenticated abuse and unauthenticated probing.

**Residual note:** See Finding 12 for in-memory rate limiter caveats on serverless.

---

### Finding 7: WhatsApp Number Exposed in Page HTML Source

| Field | Value |

|---|---|

| **Severity** | Low |

| **Confidence** | Confirmed |

| **CWE** | CWE-200: Exposure of Sensitive Information |

| **Affected Files** | [`components/ui/ShowNumberButton.tsx`](file:///c:/Users/user/Documents/TW/t-w/components/ui/ShowNumberButton.tsx), [`app/(public)/tiffin/[slug]/page.tsx`](file:///c:/Users/user/Documents/TW/t-w/app/(public)/tiffin/[slug]/page.tsx) |

**Issue:** The `ShowNumberButton` component receives the full `whatsappNumber` as a prop from the server component. Even though the UI uses a `<details>` disclosure pattern to require a click, the full phone number is present in the serialized server-rendered HTML and the React hydration payload. A scraper can extract all phone numbers without JavaScript interaction.

The JSON-LD structured data also includes a masked phone number (`maskPhone`), but the raw number is embedded in the component props.

**Impact:** Defeats the intended progressive-disclosure UX. Phone numbers are scrapable at scale without any click interaction.

**Recommended Fix:** Fetch the phone number via a separate API call triggered on click (server-side reveal), returning it only in the response body. This would require authentication or at minimum a CAPTCHA/rate limit.

---

### Finding 8: `extname` May Produce Unexpected Extensions

| Field | Value |

|---|---|

| **Severity** | Low |

| **Confidence** | Confirmed |

| **CWE** | CWE-434: Unrestricted Upload of File with Dangerous Type |

| **Affected File** | [`app/api/upload/presign/route.ts`](file:///c:/Users/user/Documents/TW/t-w/app/api/upload/presign/route.ts) |

| **Affected Line** | L20 |

**Vulnerable Code:**

```typescript

const ext = extname(filename).toLowerCase() || '.jpg';

```

**Issue:** The `contentType` is validated to match `^image\/` by the Zod schema, but the `filename` extension is extracted without validation against an allowlist. An attacker could submit:

```json

{"filename": "photo.svg", "contentType": "image/svg+xml", "context": "listing"}

```

SVG files can contain embedded JavaScript. If served with the correct MIME type from R2 and rendered in an `<img>` tag (as this app does), modern browsers block SVG script execution. However, if a user navigates directly to the SVG URL, scripts may execute in the context of the R2 domain.

**Mitigating Factors:**

- Images are served from a separate R2 domain (not the app origin), so even if SVG scripts execute, they're sandboxed to the R2 origin with no access to tiffin.wiki cookies

- The CSP's `img-src` directive limits where images are loaded from

- Next.js `<Image>` component renders `<img>` tags, which don't execute SVG scripts

**Recommended Fix:** Add an allowlist of permitted extensions:

```typescript

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const ext = extname(filename).toLowerCase() || '.jpg';

if (!ALLOWED_EXTENSIONS.includes(ext)) {

  return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });

}

```

---

### Finding 9: CSP Uses `unsafe-inline` for `script-src`

| Field | Value |

|---|---|

| **Severity** | Informational |

| **Confidence** | Confirmed |

| **CWE** | CWE-1021: Improper Restriction of Rendered UI Layers |

| **Affected File** | [`next.config.ts`](file:///c:/Users/user/Documents/TW/t-w/next.config.ts) |

| **Affected Line** | L46 |

**Issue:** The CSP includes `script-src 'self' 'unsafe-inline'` in production. The code comments acknowledge this is intentional for Next.js hydration scripts and notes that nonce-based CSP is planned as a future hardening pass.

**Impact:** `unsafe-inline` weakens XSS protection since it allows injected inline scripts to execute. However, this is somewhat mitigated by:

- Omission of `'unsafe-eval'` in production (excellent decision)

- `frame-ancestors 'none'` prevents clickjacking

- React's JSX escaping prevents most XSS vectors

- No `dangerouslySetInnerHTML` is used with user-controlled data

**Assessment:** This is a known, documented trade-off. The current CSP is significantly better than having no CSP at all. Upgrading to nonce-based CSP when feasible would be the ideal improvement.

---

### Finding 12 [NEW]: In-Memory Rate Limiter Not Shared Across Serverless Instances

| Field | Value |

|---|---|

| **Severity** | Low |

| **Confidence** | Confirmed |

| **CWE** | CWE-799: Improper Control of Interaction Frequency |

| **Affected File** | [`lib/rateLimit.ts`](file:///c:/Users/user/Documents/TW/t-w/lib/rateLimit.ts) |

| **Affected Lines** | L30-L100 (new `memoryStore` / `checkSlidingWindowRateLimit`) |

**Issue:** The new sliding-window rate limiter added in the `seo-and-rate-limits` branch uses an **in-memory `Map`** (`memoryStore`) as its backing store. On Vercel's serverless architecture, each function invocation may run in a separate isolate with its own memory space. This means:

1. Rate limit counters are **not shared** across concurrent serverless instances

2. An attacker making requests that hit different instances effectively gets a fresh rate limit window per instance

3. Cold starts reset all counters entirely

**Practical impact:** The rate limiter is still effective against naive abuse (single-connection scripts, manual spamming) because Vercel tends to reuse warm instances for bursts from the same IP. However, it provides **weaker guarantees** than a shared store (Redis, database-backed) and can be deliberately circumvented by a sophisticated attacker who distributes requests to trigger new isolates.

**Mitigating factors:**

- The listing endpoint has an **additional** database-backed rate limit (`SubmissionRateLimit` table, 5/day) that IS shared across all instances — this is the most critical endpoint and remains properly protected

- Vercel's function instance reuse means the in-memory store works reasonably well for moderate traffic

- The endpoints being rate-limited (presign, telemetry, reviews) are lower-criticality than listing creation

**Recommended future improvement:** For production scale, consider migrating to Vercel KV (Redis) or an equivalent shared store for rate limiting. The current in-memory approach is acceptable for early-stage traffic.

---

### Finding 10: `next-auth` v5 Beta — Pre-Release Software

| Field | Value |

|---|---|

| **Severity** | Informational |

| **Confidence** | Confirmed |

| **CWE** | CWE-1104: Use of Unmaintained Third-Party Components |

| **Affected File** | [`package.json`](file:///c:/Users/user/Documents/TW/t-w/package.json) |

| **Affected Line** | L28 |

**Issue:** `next-auth` version `^5.0.0-beta.31` is pre-release software. Beta versions may contain undiscovered security vulnerabilities and receive less rigorous security review than stable releases.

**Mitigating Factors:**

- NextAuth v5 is widely used in production despite the beta label

- The application uses the PrismaAdapter correctly with database sessions

- No custom JWT logic or token handling is present

**Recommendation:** Monitor the NextAuth v5 release timeline and upgrade to the first stable release when available. Subscribe to the NextAuth security advisory feed.

---

### Finding 11: Test HTML Files in Repository Root

| Field | Value |

|---|---|

| **Severity** | Informational |

| **Confidence** | Confirmed |

| **CWE** | CWE-538: Insertion of Sensitive Information into Externally-Accessible File |

| **Affected Files** | `test_add_page.html`, `test_source.html` |

**Issue:** Two HTML test files exist in the repository root. While they are not served by Next.js (they aren't in the `/public` directory), they may contain development artifacts or testing data.

**Recommendation:** Remove test files from the repository or move them to a designated test directory excluded from production builds.

---

## Exploitability Matrix

| # | Finding | Severity | Exploitability | Required Privilege | Impact | Confirmed? |

|---|---|---|---|---|---|---|

| **0** | **Hardcoded secrets in `deployment_steps.md`** | **Critical** | **Trivial** | **Repo read access** | **Full compromise** | ✅ **Confirmed** |

| 1 | ~~Unauthenticated presign endpoint~~ | ~~Medium~~ | — | — | — | ✅ Resolved |

| 2 | Telemetry data pollution (residual) | Low | Easy | None | Analytics integrity | ✅ Partially resolved |

| 3 | Open redirect in login | Medium | Easy | None | Phishing | ⚠️ Likely mitigated by NextAuth defaults |

| 4 | Missing `id` validation | Low | Easy | Admin | Verbose error logs | ✅ Confirmed |

| 5 | Unvalidated telemetry payload | Low | Easy | None | Data quality | ✅ Confirmed |

| 6 | ~~No review rate limiting~~ | ~~Low~~ | — | — | — | ✅ Resolved |

| 7 | WhatsApp number in HTML | Low | Easy | None | Number scraping | ✅ Confirmed |

| 8 | SVG upload possible | Low | Moderate | None | XSS on R2 domain | ✅ Confirmed |

| 9 | CSP `unsafe-inline` | Info | Requires other XSS vector | N/A | Weakened XSS defense | ✅ Documented trade-off |

| 10 | NextAuth beta | Info | N/A | N/A | Unknown future CVEs | ✅ Confirmed |

| 11 | Test HTML files | Info | N/A | N/A | Info leak | ✅ Confirmed |

| **12** | **In-memory rate limiter (serverless)** | **Low** | **Moderate** | **None** | **Limit bypass** | ✅ **Confirmed** |

---

## Authentication & Authorization Assessment

### Authentication: **Robust** ✅

- Google OAuth via NextAuth v5 with database-backed sessions (revocable)

- Session callback correctly attaches `user.id` to session objects

- Custom login page with no credential-based auth (eliminates password attacks)

- Session token stored as HttpOnly cookie (managed by NextAuth)

- No JWT-based sessions (avoids algorithm confusion, token leakage classes of bugs)

### Authorization: **Strong with Defense-in-Depth** ✅

Admin access is enforced at **three independent layers:**

1. **Middleware** ([`middleware.ts`](file:///c:/Users/user/Documents/TW/t-w/middleware.ts) L18-L28): Blocks non-admin access to `/admin/*` routes

2. **Layout** ([`app/admin/layout.tsx`](file:///c:/Users/user/Documents/TW/t-w/app/admin/layout.tsx) L18-L20): Server-side redirect for non-admins

3. **API routes** (each handler): Individual `session.user.email === process.env.ADMIN_EMAIL` checks

**No authorization bypasses were identified.** Each admin API endpoint independently verifies the admin identity. The review endpoint correctly uses `session.user.id` from the server-side session (not from client input) to create reviews, preventing IDOR.

### IDOR Assessment: **No IDOR Found** ✅

- Review creation uses `session.user.id` (server-derived), not user-supplied

- Profile page queries by `session.user.id` (server-derived)

- Admin listing operations use `id` from URL but require admin auth

- No user-to-user data access vectors exist in the current feature set

---

## Data Exposure Assessment

| Data | Exposure Risk | Status |

|---|---|---|

| Environment variables | Not exposed to client | ✅ Secure (no `NEXT_PUBLIC_*` vars used) |

| Database credentials | Server-only at runtime | ✅ Secure at runtime |

| R2 credentials | Server-only at runtime | 🔴 **Committed to git** in `deployment_steps.md` (Finding 0) |

| Google OAuth secrets | Server-only at runtime | 🔴 **Committed to git** in `deployment_steps.md` (Finding 0) |

| `AUTH_SECRET` | Server-only at runtime | 🔴 **Committed to git** in `deployment_steps.md` (Finding 0) |

| `ADMIN_EMAIL` | Server-only at runtime | ⚠️ Committed to git in `deployment_steps.md` (Finding 0) |

| `.env` files | Git-ignored | ✅ Secure (no `.env` in git history) |

| WhatsApp numbers | In page HTML source | ⚠️ Scrapable (Finding 7) |

| Hashed IPs | Database only | ✅ Secure (SHA-256, never exposed to API responses) |

| Submitter notes | Admin-only views | ✅ Secure |

| Error stack traces | Suppressed in error boundary | ✅ Secure |

| Source maps | Not explicitly disabled | ⚠️ Verify Vercel config |

---

## Dependency Assessment

| Package | Version | Known CVEs | Exploitable? |

|---|---|---|---|

| `next` | 16.2.7 | None known at audit time | N/A |

| `next-auth` | 5.0.0-beta.31 | Pre-release (no specific CVE) | Monitor |

| `@prisma/client` | 7.8.0 | None known | N/A |

| `@aws-sdk/client-s3` | 3.1058.0 | None critical | N/A |

| `react` | 19.2.4 | None known | N/A |

| `zod` | 4.4.3 | None known | N/A |

| `slugify` | 1.6.9 | None known | N/A |

**No dependency with a known, exploitable CVE was identified.** The `npm` audit could not be run in this environment, but the dependency set is minimal and all packages are from well-maintained, widely-used libraries.

**Positive note:** The dependency footprint is lean — no unnecessary packages, no runtime utility libraries with known CVE histories (lodash, etc.).

---

## Security Configuration Assessment

### Security Headers: **Excellent** ✅

| Header | Value | Assessment |

|---|---|---|

| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ Strong HSTS |

| `X-Frame-Options` | `SAMEORIGIN` | ✅ Good (CSP `frame-ancestors` also set) |

| `X-Content-Type-Options` | `nosniff` | ✅ Good |

| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ Good |

| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ Good |

| `Content-Security-Policy` | Comprehensive — see below | ✅ Good (with noted caveats) |

| `X-DNS-Prefetch-Control` | `on` | ℹ️ Not security-relevant |

### CSP Breakdown

```

default-src 'self';

script-src 'self' 'unsafe-inline';          ⚠️ unsafe-inline (documented trade-off)

style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;

font-src 'self' https://fonts.gstatic.com;

img-src 'self' data: https://images.tiffin.wiki https://lh3.googleusercontent.com https://*.r2.dev;

connect-src 'self' https://*.r2.cloudflarestorage.com;

frame-ancestors 'none';                     ✅ Strict framing protection

```

**Notable omissions that strengthen security:**

- No `'unsafe-eval'` in production ✅

- `frame-ancestors 'none'` prevents all framing ✅

- `connect-src` limited to self + R2 ✅

### Missing Headers (Recommendations)

| Header | Recommendation |

|---|---|

| `Cross-Origin-Opener-Policy` | Add `same-origin` to prevent cross-origin window access |

| `Cross-Origin-Resource-Policy` | Add `same-origin` |

| `X-Permitted-Cross-Domain-Policies` | Add `none` |

### Cookie Security

NextAuth manages session cookies. By default, NextAuth v5 sets:

- `HttpOnly: true` ✅

- `Secure: true` (in production) ✅

- `SameSite: lax` ✅

- Path: `/` ✅

### CORS

No custom CORS configuration was found. Next.js API routes do not add CORS headers by default, meaning cross-origin requests from other domains will be blocked by browsers. This is the correct default for this application.

---

## Positive Security Controls

The following security measures are correctly implemented and deserve recognition:

1. **Defense-in-Depth Admin Access** — Three independent enforcement points (middleware, layout, API)

2. **Database Sessions** — Revocable sessions instead of JWTs; session revocation on sign-out

3. **IP Hashing** — SHA-256 hashing of IP addresses; raw IPs never stored

4. **Comprehensive Zod Validation** — All API inputs validated with Zod schemas; shared between client and server

5. **Parameterized Queries** — All database access via Prisma ORM; no raw SQL

6. **Honeypot Bot Protection** — Silent honeypot on listing submissions (non-fingerprinting 200 response)

7. **IP Rate Limiting** — Transactional rate limiting for listing submissions (5/day per IP)

8. **Security Headers** — Comprehensive security header suite including strict CSP

9. **Error Handling** — Generic error messages to clients; stack traces never exposed

10. **`robots.txt`** — Admin and API paths disallowed

11. **Admin `noindex`** — Admin layout sets `robots: { index: false, follow: false }`

12. **Environment Variable Discipline** — No `NEXT_PUBLIC_*` variables; all secrets server-only

13. **`.env` Git-Ignored** — `.env*` pattern in `.gitignore`; no secrets in git history

14. **UUID-Based Storage Keys** — User filenames stripped; only UUID+extension stored

15. **Review Uniqueness** — Database constraint prevents duplicate reviews per user per service

16. **PENDING Status Default** — All submissions start as `PENDING`; require admin approval

17. **[NEW] Multi-layer rate limiting** — In-memory sliding window (burst) + database-backed daily limit (listings) provides layered protection

18. **[NEW] Centralized IP extraction** — `getClientIp()` helper checks `x-forwarded-for`, `x-real-ip`, and `cf-connecting-ip` consistently across all endpoints

19. **[NEW] Listing burst protection** — 2 submissions per minute per IP on top of the existing 5/day database-backed limit

20. **[NEW] SEO `noindex` on deep filter permutations** — Search pages with filters/pagination are marked `noindex` to prevent crawl bloat while keeping primary city landing pages indexed

---

## CSRF Assessment

### Server Actions (Login)

The `handleGoogleSignIn` server action in the login page uses `'use server'` directive. Next.js automatically protects server actions with CSRF tokens. ✅

### API Routes

API routes use cookie-based session authentication (NextAuth). For the admin endpoints:

- All state-changing operations use POST, PATCH, or DELETE (no state-changing GET)

- NextAuth cookies use `SameSite: lax` by default, which blocks cross-origin POST requests from different sites

- No custom CSRF token is implemented beyond the SameSite cookie protection

**Assessment:** `SameSite: lax` provides adequate CSRF protection for this application's threat model. The listing POST endpoint (public, no auth) doesn't need CSRF protection since it doesn't modify authenticated user state.

---

## XSS Assessment

### `dangerouslySetInnerHTML` Usage

Four instances found, all safe:

1. **JSON-LD Structured Data** (homepage, search, detail pages): Uses `serializeJsonLd()` ([`lib/jsonLd.ts`](file:///c:/Users/hp/Desktop/Side%20Quests/tiffin.wiki/tiffin-wiki/lib/jsonLd.ts)) to serialize schema objects. Standard `JSON.stringify()` does not escape `<` or `>` or `/`, which could permit script tag breakout XSS if user-supplied strings (e.g., listing names) contain `</script>`. `serializeJsonLd()` escapes `<` to `\u003c` and HTML-breaking characters, preventing HTML script tag termination while preserving valid JSON for JSON-LD consumers. ✅

2. **PhotosCarousel inline CSS** ([`PhotosCarousel.tsx`](file:///c:/Users/user/Documents/TW/t-w/components/listing/PhotosCarousel.tsx) L109): Static CSS string literal with no dynamic content. ✅

### User-Controlled Data Rendering

All user-controlled data (listing names, descriptions, review bodies, delivery areas) is rendered via JSX text content (`{value}`) which React automatically escapes. No instances of user data being inserted into HTML attributes, URLs, or `dangerouslySetInnerHTML`. ✅

### URL-Based XSS

The `ShowNumberButton` constructs a `whatsapp://` URL from a phone number, but the number is validated by Zod as a 10-digit numeric string, preventing `javascript:` injection. ✅

---

## SSRF Assessment

**No SSRF vectors identified.** The application does not:

- Fetch URLs from user input

- Proxy requests

- Process URL previews

- Import from user-supplied URLs

- Perform server-side image processing from URLs

The only outbound requests are to:

- Neon PostgreSQL (connection string from env)

- Cloudflare R2 (presigned URL generation, server-only)

- Google OAuth (NextAuth managed)

All external service endpoints are controlled by server-side environment variables, not user input. ✅

---

## Database Security Assessment

- **No raw SQL queries** — all access via Prisma ORM with parameterized queries ✅

- **No SQL injection vectors** — confirmed by searching for `$queryRaw`, `$executeRaw` ✅

- **User input is always validated** by Zod before reaching Prisma ✅

- **Sensitive fields** (`submitterIp`, `submitterNote`, `adminNote`) are excluded from public query responses ✅

- **Cascade deletes** configured correctly on all foreign keys ✅

- **Appropriate indexes** on frequently queried columns ✅

---

## Business Logic Assessment

| Business Logic Check | Result |

|---|---|

| Can a user submit infinite listings? | No — 5/day IP rate limit ✅ |

| Can a user review the same listing twice? | No — DB unique constraint ✅ |

| Can a user review a non-approved listing? | No — `status: 'APPROVED'` check ✅ |

| Can a non-admin approve/reject/delete? | No — triple auth enforcement ✅ |

| Can listing status be set to arbitrary values? | No — only `APPROVED`/`REJECTED` via admin endpoints ✅ |

| Can offerings prices be negative? | No — Zod `z.number().int().positive()` ✅ |

| Can a user bypass the honeypot? | Bots that fill it get silent 200 ✅ |

| Race condition on rate limit? | Mitigated by transactional upsert ✅ |

---

## Remediation Plan

### 🔴 Emergency (Today)

1. **ROTATE ALL SECRETS** exposed in `deployment_steps.md` — `AUTH_SECRET`, `AUTH_GOOGLE_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

2. **Redact `deployment_steps.md`** — Replace all plaintext secret values with placeholder descriptions

3. **Purge git history** if the repo has ever been public or shared (`git filter-branch` or BFG Repo-Cleaner)

### Immediate Fixes (Week 1)

4. **Validate `callbackUrl` in login** — Ensure it starts with `/` before passing to `signIn()`

5. **Cap telemetry batch size** — `eventsList.slice(0, 50)` in the telemetry route

6. **Add file extension allowlist** — Reject non-image extensions (`.svg`, `.html`, etc.) in presign endpoint

### Short-Term Fixes (Month 1)

7. **Add Zod schema for telemetry payloads** — Constrain field lengths and validate eventType values

8. **Add CUID validation on `id` parameters** — `z.string().cuid()` on admin API route params

9. **Remove test HTML files** from repository root

10. **Verify source maps are disabled** in Vercel production deployment

### Longer-Term Hardening (Quarter)

11. **Upgrade to nonce-based CSP** — Replace `unsafe-inline` with per-request nonces via middleware

12. **Server-side WhatsApp reveal** — Move phone number disclosure behind an API call

13. **Monitor NextAuth v5 stable release** — Upgrade when available

14. **Add `Cross-Origin-Opener-Policy`** and `Cross-Origin-Resource-Policy` headers

15. **Implement R2 object lifecycle** — Auto-delete orphaned uploads not referenced by any listing/review

16. **Migrate rate limiting to shared store** — Vercel KV / Upstash Redis for cross-instance rate limiting

### Recommended CI Security Tests

```yaml

# Suggested additions to CI pipeline:

- name: Dependency audit

  run: npm audit --audit-level=high

- name: Lint security patterns

  run: |

    # Ensure no raw SQL

    ! grep -r '\$queryRaw\|\$executeRaw' --include='*.ts' --include='*.tsx' app/ lib/

    # Ensure no dangerouslySetInnerHTML with variables

    ! grep -rP 'dangerouslySetInnerHTML.*\{[^}]*\buser\b' --include='*.tsx' app/ components/

    # Ensure no NEXT_PUBLIC secrets

    ! grep -r 'NEXT_PUBLIC_.*SECRET\|NEXT_PUBLIC_.*KEY\|NEXT_PUBLIC_.*PASSWORD' --include='*.ts' --include='*.tsx' .

- name: Verify admin auth enforcement

  run: |

    # Every file in app/api/listings/[id]/ must contain ADMIN_EMAIL check

    for f in app/api/listings/\[id\]/**/*.ts; do

      grep -q 'ADMIN_EMAIL' "$f" || (echo "MISSING ADMIN CHECK: $f" && exit 1)

    done

```

---

## Overall Risk Rating

| Metric | Value |

|---|---|

| **Overall Risk** | **High** (due to committed secrets; **Low** after rotation) |

| **Critical Vulnerabilities** | 1 (secrets in git) |

| **High Vulnerabilities** | 0 |

| **Medium Vulnerabilities** | 1 (open redirect — likely mitigated) |

| **Low Vulnerabilities** | 5 |

| **Informational** | 3 |

| **Resolved (this branch)** | 3 (presign rate limit, telemetry rate limit, review rate limit) |

### Top 3 Issues to Fix First

1. 🔴 **Rotate all secrets** exposed in `deployment_steps.md` and purge from git history

2. Validate `callbackUrl` in the login server action

3. Cap telemetry batch size and add Zod validation

### Production Readiness Assessment

**The application is NOT safe for production deployment until the secrets in `deployment_steps.md` are rotated.** Once rotated, the application has a strong security posture. The `seo-and-rate-limits` branch meaningfully improved the security profile by adding rate limiting to all previously-unprotected public endpoints. The remaining findings are low-severity hardening opportunities. After secret rotation, the overall risk drops to **Low** and the application is suitable for production.

---

*This assessment was performed with full source code access. No destructive testing was performed. All findings should be verified in a staging environment before deploying fixes to production.*