# AGENTS.md — Calendula Herbs

Next.js 16.2.9 App Router + TypeScript + Tailwind v4 (`@tailwindcss/postcss`) + Radix UI + Framer Motion.
Prisma 6 + Supabase PostgreSQL + Cloudinary + NextAuth.js v5 beta.
Upstash Redis (rate limits) + React Hook Form + Zod v4.
**Test framework:** Vitest 4 + React Testing Library + jsdom. Test files in `src/test/` (new) or `src/__tests__/` (existing). Run with `pnpm test` or `pnpm test:watch`. Config: `vitest.config.ts`. Setup: `src/__tests__/setup.ts`. `@/` maps to `src/`. **Package manager: pnpm.**

## Commands
```
pnpm dev                    # next dev (port 3000)
pnpm build                  # fails without prisma generate first
pnpm lint                   # ESLint v9 flat config (pre-existing warnings — ignore)
pnpm tsc                    # typecheck (noEmit in tsconfig — --noEmit not needed)
pnpm start                  # next start

pnpm prisma generate        # required after schema changes, before build
pnpm prisma migrate dev     # create + apply migration with a name
pnpm prisma db push         # quick schema sync (no migration file)
pnpm prisma studio          # DB browser
pnpm tsx prisma/seed.ts     # creates admin + default SiteSetting + ContactSetting
pnpm tsx scripts/generate-secret.mjs  # generates secrets.json with random adminInitialKey
```
Build order: `prisma generate` → `next build`.

## Auth & security
- NextAuth v5 credentials, JWT strategy, 8h expiry. `AdminSession` table for per-session revocation.
- Auth guard at `src/proxy.ts` (Next.js 16 proxy pattern, not `middleware.ts`). Matcher: `/admin/:path*`, `/api/admin/:path*`.
  Checks `session?.user?.email` — empty = revoked JWT → 401 for API, redirect to login for pages.
- Sign out in `AdminSidebar.tsx`: `signOut({ redirect: false })` + `window.location.href = '/admin/login'`.
- Admin login: 5-attempt lockout (15 min) via `loginRateLimit`. IP/UA/geo captured on login.
- Cloudinary signed uploads: `POST /api/admin/media/sign` generates server-side signature.
- 9 rate limiters in `src/lib/rate-limit.ts` (login, OTP send/verify, contact, cart, sample, product-request, search, generic API).
- `next.config.ts` redirects `/admin` → `/admin/login` (non-permanent).
- CSP whitelists: Cloudinary, Resend, Upstash, Tawk.to, Google Fonts, YouTube embeds, ip-api.com.

## Database
- 21 models, 8 enums in `prisma/schema.prisma`.
- Prisma v6 dual-connection: `DATABASE_URL` (Supabase pooler, port 6543) for queries, `DIRECT_URL` (port 5432) for migrations.
- Zod v4 validates all API inputs before Prisma writes.
- Seed: `tsx prisma/seed.ts` reads `ADMIN_EMAIL` from `.env`, password from `secrets.json` (`adminInitialKey`).
- Gallery items have a `section` field (`GallerySection` enum) grouping by `EVENTS`, `INTERVIEWS_TV`, `FACTORY`, `FARMS`, `SHIPMENTS`.

## Route groups
| Routes | Type |
|---|---|
| `/`, `/about`, `/products`, `/products/[slug]`, `/certificates`, `/contact`, `/sample`, `/faq`, `/galleries` | Public SSR (`force-dynamic` layout) |
| `/admin/login`, `/admin/forgot-password`, `/admin/otp` | Auth |
| `/admin/dashboard/{media,galleries,certificates,products,team,settings,inquiries,profile}` | Admin CMS |
| `/api/admin/*` | JWT-protected CRUD |
| `/api/public/{contact,sample,product-request,cart}` | Rate-limited form endpoints |
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/otp/*` | Forgot-password OTP flow |
| `/privacy`, `/terms`, `not-found.tsx`, `error.tsx`, `sitemap.ts`, `robots.ts` | Root-level |

## Public form submission pattern
All 4 public forms (contact, sample, product-request, cart) follow identical architecture:
1. **Client**: React Hook Form + Zod schema validation → `POST` JSON to `/api/public/*`
2. **Server route handler**: Zod parse → rate limit by IP → Prisma create → `Promise.allSettled([confirmation email, notification email])`
3. **Email**: Resend (`src/lib/email.ts`). Confirmation sent to submitter; notification to `ContactSetting.managingEmails`.
4. **Sender metadata**: Each route calls `extractSenderMeta(req)` + `await enrichWithCountry(meta)` from `src/lib/sender-meta.ts` before sending notifications. Metadata (IP, country, User-Agent, referrer, language) is appended to the admin notification email — sender has no control over this, it's extracted server-side from HTTP headers.

## Architecture notes
- `src/proxy.ts` is the auth guard — no `middleware.ts` file.
- Public layout `(public)/layout.tsx` is `force-dynamic` — all public pages are SSR, never static. Injects DB-hosted plugins (head, bodyEnd, footerFixed, chatWidget).
- Admin layout wraps `<SessionProvider>` — admin pages have `next-auth/react` context.
- Cart uses Zustand-like context via `CartProvider` at `src/components/public/CartProvider.tsx`.
- Key lib files: `db.ts` (Prisma singleton), `cloudinary.ts` (Cloudinary v2), `email.ts` (Resend), `rate-limit.ts` (Upstash), `sender-meta.ts` (IP/country/browser metadata).
- Image `remotePatterns` in `next.config.ts`: `res.cloudinary.com`, `*.supabase.co`, `img.youtube.com`, `i.ytimg.com`.
- `serverExternalPackages: ["@prisma/client", "bcryptjs"]`.
- Rate limited via Upstash Redis — env vars `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

## Design system
- **Theme**: light botanical (CSS vars in `globals.css`). Brand: calendula `#DC7E18`, sage `#5E9E66`.
- **Typography**: Cormorant Garamond (display), DM Sans (body), Dancing Script (script), JetBrains Mono (mono). Fluid `clamp()` scale.
- **Utility classes** in `globals.css`: `card-glass`, `btn`/`btn-primary`/`btn-accent`, `badge`/`badge-green`, `nav-primary`, `product-card`, `leaf-float`, `scroll-reveal`, `cert-card`.
- **B2B convention**: no "Buy Now" / "Add to Cart" — use "Request a Quote", "Get a Sample", "Contact Us".
- Shared animation variants in `src/lib/animations.ts`. Public pages use `LazyMotion` + `domAnimation` + `whileInView`. Respects `prefers-reduced-motion`.
- Full 2095-line brand guideline at `DESIGN_SYSTEM.md` — read before visual changes.

## CI & deployment
- CI: `.github/workflows/ci.yml` — push/PR to `main`, `develop`, or `master`. Node.js 20 + 22 matrix. Steps: `pnpm install --frozen-lockfile` → `prisma generate` → `lint` → `tsc` → `test` → `build`.
- CodeQL: `.github/workflows/codeql.yml` — weekly security analysis on push/PR to main/develop/master.
- PR labeler: `.github/workflows/label.yml` + `.github/labeler.yml` — auto-labels PRs by changed file patterns.
- Dependabot: `.github/dependabot.yml` — weekly npm + GitHub Actions updates, grouped by ecosystem (radix-ui, framer-motion, next, prisma).
- Auto-deploys to Vercel from **`master`** branch. `master` is production. `main`/`develop` are CI branches.
- `.env*` and `secrets.json` gitignored — set env vars in Vercel Dashboard.

## Stale files to ignore
- `CONTEXT.md`: references non-existent `middleware.ts`, says `main` is production (wrong — `master` is), tracks completed work. Do not rely on it.
