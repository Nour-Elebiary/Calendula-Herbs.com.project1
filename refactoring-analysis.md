# Refactoring Analysis — Calendula Herbs

> **Project:** Calendula Herbs (`calendula-herbs.com`)
> **Stack:** Next.js 16.2.9 App Router · TypeScript (strict) · Tailwind CSS v4 · Prisma 6 · Supabase PostgreSQL · NextAuth v5 (beta) · Upstash Redis · Cloudinary · Resend · Framer Motion · GSAP · Three.js
> **Size:** ~17 K LOC · 169 source files · 24 Prisma models · 47 API routes · 25 pages · 17 locales
> **Live URL:** https://calendula-herbscomproject1-production.up.railway.app/
> **Hosting:** Railway free plan
> **Status:** Live in production — no major errors, no JS console errors observed in live inspection (2026-07-20)

---

## Executive Summary

**Does the project need refactoring?** Yes — **targeted cleanup and hardening, not a ground-up rewrite.**

The codebase is architecturally sound: strict TypeScript, centralised auth guard (`proxy.ts`), Zod on every route, 9 Upstash rate limiters, and a 2,095-line design system. The gaps are entirely in **testing coverage, live content bugs, stale artefacts, route boilerplate, security edge cases, and SEO structured data** — not broken logic.

---

## Live Inspection Findings (Railway Production — 2026-07-20)

These issues were confirmed by directly loading the deployed site at the Railway URL:

| # | Finding | Severity | Notes |
|---|---------|----------|-------|
| L1 | **FAQ page title duplication** | 🔴 Critical (SEO) | `<title>` renders as `FAQ \| Calendula Herbs \| Calendula Herbs` — brand suffix doubled |
| L2 | **Client-side hydration flash** | 🟡 High (UX/Perf) | Products, About, Contact pages show "Loading page…" spinner for 1–2 s after navigation |
| L3 | **Year inconsistency in OG metadata** | 🟡 High (Brand) | Hero text: "since 2014"; OG `description` meta: "since 2005" |
| L4 | **Cookie banner overlaps hero CTA on mobile** | 🟡 High (UX) | At 375 px viewport the consent banner sits on top of the primary CTA button |
| L5 | **No JSON-LD structured data** | 🟢 Moderate (SEO) | Confirmed absent on all 5 live-inspected pages |
| L6 | **`sitemap.xml` output untested** | 🟢 Moderate (SEO) | `sitemap.ts` exists but its rendered output on the live URL is unverified |

---

## What Is Already Clean

| Aspect | Evidence |
|--------|----------|
| No tech-debt markers | Zero TODO / FIXME / HACK across all 169 source files |
| No hardcoded secrets | `.env*` and `secrets.json` in `.gitignore`; all values via `process.env` |
| Security headers | CSP, HSTS, X-Frame-Options, Permissions-Policy in `next.config.ts` |
| Auth guard | Single `proxy.ts` — clean, no scattered `middleware.ts` |
| Rate limiting | 9 Upstash Redis limiters in `src/lib/rate-limit.ts` |
| Input validation | Zod v4 on every API route before any Prisma write |
| Form architecture | 4 public forms: Zod → rate limit → Prisma → `Promise.allSettled([confirm, notify])` |
| CI pipeline | 9-step workflow (lint → tsc → test → locale check → env check → audit → build) |
| TypeScript strict | `strict: true` in `tsconfig.json` |
| Design system | 2,095-line `DESIGN_SYSTEM.md`; CSS variables driven from DB |
| i18n | 17 locales, server-side detection, no URL rewriting |
| Mobile layout | Responsive at 375 px; hamburger menu functions correctly |
| Session revocation | `AdminSession` DB record checked on every JWT callback; `revokedAt` field exists |
| robots.ts / sitemap.ts | Both present in root app directory |

---

## Refactoring Targets

### 1. Test Coverage Gap (🔴 Critical)

**Finding:** Coverage defined in `vitest.config.ts` at thresholds 50/40/40/50 but `enabled: false`. Only 10 files in `src/__tests__/` plus 4 orphaned in `src/test/`. Only 1 of 47 API routes has integration tests.

**Action:**
- Set `enabled: true` in `vitest.config.ts`
- Add `"test:coverage": "vitest run --coverage"` to `package.json` scripts
- Run baseline coverage report before writing new tests
- Write tests in dependency order: `src/lib/*` → `src/components/ui/*` → page-level components
- Target: ≥ 50% statement coverage, enforced in CI

---

### 2. Dual Test Directories (🔴 Critical — corrupts coverage baseline)

**Finding:** Tests exist in both `src/__tests__/` (10 files + setup) and `src/test/` (4 files + orphaned 1-line `setup.ts`). The `src/test/setup.ts` is not referenced in `vitest.config.ts` — dead code. Coverage will be inaccurate until unified.

**Action:**
- Move all 4 `src/test/*.test.*` files into `src/__tests__/`
- Delete `src/test/setup.ts`
- Remove the empty `src/test/` directory
- Run `pnpm test` to confirm zero regressions

---

### 3. FAQ Page Title Duplication — Live Bug (🔴 Critical — SEO)

**Finding:** Title tag renders as `FAQ | Calendula Herbs | Calendula Herbs`. Google truncates duplicated titles and treats them as low-quality signals.

**Action:**
- Locate the `metadata` export in `src/app/(public)/faq/page.tsx`
- Fix title to: `FAQ | Calendula Herbs` — verify root layout title template is not double-appending the brand name
- Audit all 25 page `metadata` exports for the same pattern
- Add CI check or E2E assertion: `page.title()` must not match `/\| .+ \| .+/`

---

### 4. `ip-api.com` HTTP Call in Auth Critical Path (🔴 Critical — Security + Reliability)

**Finding:** `src/lib/auth.ts` line 83 calls `http://ip-api.com/json/${ip}` (plain HTTP, not HTTPS) on every single admin login attempt. This creates three problems:

1. **Plain HTTP** — the geolocation response can be intercepted and tampered with via MITM (attacker substitutes a country value)
2. **Auth latency** — every login adds an external HTTP round-trip in the critical auth path; if `ip-api.com` is slow or down, login becomes slow or broken (despite the `try/catch`, the await still blocks)
3. **Untested failure mode** — the `try/catch` silently ignores failures, so a complete `ip-api.com` outage would set `country = 'Unknown'` on all logins with no alerting
4. **Not mocked in tests** — auth integration tests currently make real HTTP calls to `ip-api.com` unless explicitly mocked

**Action:**
- Change `http://ip-api.com` → `https://ip-api.com` immediately (free plan supports HTTPS)
- Mock `ip-api.com` in `src/__tests__/setup.ts` via MSW so auth tests don't make real external calls
- Consider moving geolocation lookup to a background job (queue it after returning the session) to remove it from the auth critical path
- Add a unit test: simulate `ip-api.com` timeout → assert login still succeeds with `country = 'Unknown'`

---

### 5. OG Metadata Year Inconsistency — Live Bug (🟡 High)

**Finding:** Hero text: "since 2014". OG `og:description` meta: "since 2005".

**Action:**
- Confirm correct founding year with the site owner
- Update the incorrect value
- Extract year to a single constant in `src/lib/constants.ts` (create if needed); reference from both the hero component and metadata export
- Add a unit test asserting both values are equal

---

### 6. Client-Side Hydration Flash — Live Bug (🟡 High)

**Finding:** Products, About, and Contact pages display a "Loading page…" spinner for 1–2 s post-navigation. Amplified by Railway free-plan cold-start latency.

**Root cause:** Likely `useEffect(() => { fetch('/api/...') }, [])` inside `'use client'` components causing a client-side waterfall.

**Action:**
- Audit pages for `'use client'` + `useEffect(() => fetch(...))` patterns
- Convert data fetching to Next.js Server Components (`async function Page()`) where possible
- For client-interactive components: fetch in parent Server Component, pass data as props
- Ensure each route segment has a `loading.tsx` so the loading skeleton is server-rendered
- Railway cold-starts: add a `/api/health` endpoint and a free cron warm-up (cron-job.org, every 4 min) to prevent container sleep

---

### 7. Cookie Consent Overlaps Hero CTA on Mobile (🟡 High)

**Finding:** At 375 px viewport, cookie banner overlaps the hero primary CTA button.

**Action:**
- Fix banner: `position: fixed; bottom: 0` with z-index below modal dialogs but above content
- Add bottom padding to hero section equal to banner height on mobile
- E2E test: at 375 px, assert bounding rects of CTA button and banner do not intersect
- **Also test functionally:** Accept → consent cookie is set; Decline → cookie NOT set; page reload → banner does not reappear after accepting

---

### 8. E2E Coverage Gap (🟡 High)

**Finding:** One spec file (`e2e/tests/smoke.spec.ts`), 8 page-load-only tests. No form submissions, admin flows, session lifecycle tests, or language switching. Chromium only.

**Action:**
- Expand to 35+ tests (see `test-plan.md` Phase C for full list)
- Add `firefox` and `Mobile Chrome` to `playwright.config.ts`
- **Add admin session revocation E2E test:** login on session A → logout (revoke session) → assert that a request with the old JWT token returns 401/redirect (see `test-plan.md` Phase C2)
- Create dedicated `e2e.yml` GitHub Actions workflow (separate from `ci.yml`)

---

### 9. `@heyputer/puter.js` — Dead Production Dependency (🟡 High)

**Finding:** `package.json` lists `"@heyputer/puter.js": "^2.5.4"` in production `dependencies`. Searching all of `src/` returns **zero imports** — this package is never used in the codebase. It remains a ~200 KB bundle footprint and an unnecessary supply-chain attack surface.

**Action:**
- Run `pnpm remove @heyputer/puter.js`
- Run `ANALYZE=true pnpm build` before and after to confirm bundle size decrease
- Confirm no runtime errors after removal
- Check git history if curious why it was added; if it was intentional for a future feature, move it to a branch

---

### 10. Tawk.to in CSP but Never Implemented (🟡 High)

**Finding:** `next.config.ts` lines 25 and 29 allow `https://tawk.to` and `https://embed.tawk.to` in the `script-src` Content Security Policy directive. Searching all of `src/` returns **zero matches** for `tawk` — the live chat widget was never implemented. An unnecessary CSP `script-src` allowlist entry is a real security weakening: any future XSS that achieves script injection from `tawk.to` would bypass the policy.

**Action:**
- **If Tawk.to will never be used:** Remove both entries from the CSP in `next.config.ts` immediately
- **If Tawk.to will be implemented later:** Add the implementation now, or add a `# TODO: tawk.to` comment so it's tracked; do not leave ghost entries in the CSP
- Add a CI test that asserts `script-src` in the CSP does not contain domains not in a known allowlist

---

### 11. No Production Error Monitoring (🟡 High)

**Finding:** There is zero error monitoring in this project. When something fails on Railway — an unhandled exception in a Server Component, a Prisma connection pool exhaustion, a Resend API outage during a form submission — the error is completely invisible to the site owner unless a user reports it. For a B2B site where a failed contact form means a lost export lead, this is a real business risk.

**Action:**
- Install Sentry (free tier: 50K errors/month): `pnpm add @sentry/nextjs`
- Run `npx @sentry/wizard@latest -i nextjs` to generate `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Add `SENTRY_DSN` to Railway environment variables
- Configure source maps upload in `next.config.ts` for readable stack traces
- Set up a Sentry alert rule: notify when error rate > 5/hour
- For Railway free plan: Sentry free tier is sufficient; no cost

---

### 12. API Route Handler Boilerplate (🟢 Moderate)

**Finding:** 47 routes each repeat: parse Zod → check auth → Prisma call → return response. No shared wrappers.

**Action:**
- Extract `withAuth(handler)` HOF for all admin routes
- Extract `withValidation(schema, handler)` HOF for Zod parsing
- Extract `dispatchFormNotification({ senderMeta, record, emailType })` shared helper for the 4 public form routes
- Target: ~40% reduction in per-route boilerplate

---

### 13. CSP + JSON-LD Nonce Compatibility (🟢 Moderate)

**Finding:** The plan calls for adding JSON-LD `<script type="application/ld+json">` tags to public pages (see refactoring target 14). These are inline scripts. Currently they will work because `'unsafe-inline'` is in the production CSP. However, the `next.config.ts` has a TODO comment explicitly noting that nonce-based CSP is the goal. **When nonces are eventually implemented and `'unsafe-inline'` is removed, all JSON-LD scripts will break with a CSP violation.**

**Action:**
- When implementing JSON-LD (target 14), build the `<script>` component so it accepts a `nonce` prop
- When nonce-based CSP is implemented (future task), pass the nonce from middleware to the JSON-LD component via React context or `headers()`
- Add a CSP integration test that will fail if `'unsafe-inline'` is ever removed without updating JSON-LD scripts
- Document this dependency explicitly in the JSON-LD implementation PR

---

### 14. No Performance Baseline (🟢 Moderate)

**Finding:** No Lighthouse CI, no bundle-size tracking, no performance budget. Three.js + Framer Motion + GSAP likely inflate initial JS bundle significantly.

**Action:**
- Install `@next/bundle-analyzer`; run `ANALYZE=true pnpm build`; identify top-5 largest chunks
- Lazy-load `@react-three/fiber` and `three` via `next/dynamic` (decorative only)
- Add Lighthouse CI to CI with budgets: LCP < 2.5 s, CLS < 0.1, Performance ≥ 85
- Set initial JS bundle budget: < 500 KB

---

### 15. Missing JSON-LD Structured Data (🟢 Moderate)

**Finding:** Zero JSON-LD confirmed on all live-inspected pages.

**Missing schemas:**

| Schema Type | Target Page | Required Properties |
|-------------|-------------|---------------------|
| `Organization` | Root layout (`src/app/layout.tsx`) | `name`, `url`, `logo` (Cloudinary URL), `contactPoint.telephone`, `sameAs` (all social links) |
| `Product` | `/products/[slug]` | `name`, `description`, `image`, `category.name`, `offers` (no price, B2B inquiry model) |
| `FAQPage` | `/faq` | `mainEntity[]` with `Question` / `acceptedAnswer` |
| `BreadcrumbList` | `/products`, `/products/[slug]` | `itemListElement` with `position`, `name`, `item` URL |
| `LocalBusiness` | `/contact` | `address`, `telephone`, `geo`, `openingHoursSpecification` |

**Action:** Add `<script type="application/ld+json">` components per page. Build them with a `nonce` prop from the start (see target 13). Validate via Google Rich Results Test after deployment.

---

### 16. pnpm Audit Non-Blocking (🟢 Moderate)

**Finding:** `ci.yml` line 63: `pnpm audit --audit-level=high || true` — failures silently swallowed.

**Action:**
- Run `pnpm audit --audit-level=high` manually first; resolve existing CVEs
- Remove `|| true` to make the step blocking
- Confirm Dependabot covers both root and `e2e/` workspaces

---

### 17. Stale Backup Directory (🟢 Low)

**Finding:** `src/messages-backup-20260719-182926/` committed to the repo.

**Action:** Delete the directory; add `messages-backup-*/` to `.gitignore`

---

### 18. Root-Level Log and Script Artefacts (🟢 Low)

**Finding:** Root contains: `dev-error.txt`, `dev-output.txt`, `dev-server.log`, `dev_server.log`, `dev_server2.log`, `devserver.log`, `fix-ko.cjs`, `drive_files.json`, `drive-videos-classification.md`, `drive_folder.png`, `scratch/`, and stale plan `.md` files.

**Action:**
- Add `*.log`, `dev-*.txt`, `scratch/` to `.gitignore`
- Delete `fix-ko.cjs`, `drive_files.json`, `drive-videos-classification.md`, `drive_folder.png`
- Move stale plan documents to `docs/archive/` or delete them

---

### 19. Stale Duplicate Page Routes (🟢 Low)

**Finding:** Root-level `src/app/privacy/page.tsx` and `src/app/terms/page.tsx` coexist with canonical `(public)/` versions. `src/app/admin/login/` is an empty directory.

**Action:**
- Grep for any references to root-level privacy/terms paths
- If no references, delete root-level duplicates and empty `src/app/admin/login/`
- Verify `/privacy` and `/terms` still resolve correctly after deletion

---

## Refactoring Execution Order

```
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║  # │ Task                                 │ Est.     │ Skill              ║
 ║────┼──────────────────────────────────────┼──────────┼────────────────────║
 ║  1 │ Fix FAQ title duplication            │ 15 min   │ fixing-metadata    ║
 ║  2 │ Fix OG year inconsistency            │ 15 min   │ fixing-metadata    ║
 ║  3 │ Fix ip-api.com HTTP → HTTPS          │ 5 min    │ security-guidance  ║
 ║  4 │ Remove @heyputer/puter.js            │ 10 min   │ dependency-auditor ║
 ║  5 │ Remove tawk.to from CSP              │ 10 min   │ security-guidance  ║
 ║  6 │ Fix cookie banner mobile             │ 0.5 hr   │ baseline-ui        ║
 ║  7 │ Consolidate test directories         │ 0.5 hr   │ senior-architect   ║
 ║  8 │ Delete stale artefacts/dirs          │ 0.5 hr   │ senior-architect   ║
 ║  9 │ Add Sentry error monitoring          │ 1 hr     │ observability-des  ║
 ║ 10 │ Fix hydration flash                  │ 2-4 hr   │ senior-frontend    ║
 ║ 11 │ API integration tests                │ 6-8 hr   │ api-test-suite-bld ║
 ║ 12 │ Unit test expansion                  │ 5-7 hr   │ tdd-guide          ║
 ║ 13 │ Enable + enforce coverage CI         │ 0.5 hr   │ tdd-guide          ║
 ║ 14 │ E2E test expansion                   │ 6-10 hr  │ playwright-pro     ║
 ║ 15 │ Extract route handler HOFs           │ 2-3 hr   │ clean-code-guard   ║
 ║ 16 │ Bundle analysis + lazy-load Three.js │ 1-2 hr   │ performance-prof   ║
 ║ 17 │ Lighthouse CI + perf budget          │ 2-3 hr   │ performance-prof   ║
 ║ 18 │ JSON-LD structured data              │ 1-2 hr   │ schema-markup      ║
 ║ 19 │ pnpm audit blocking                  │ 0.5 hr   │ dependency-auditor ║
 ╚════════════════════════════════════════════════════════════════════════════╝
```

**Ordering rationale:**
1. **Zero-risk live fixes** (1-3) — visible improvement, no codebase risk
2. **Dead code + CSP cleanup** (4-5) — security and bundle improvement in minutes
3. **UI + cleanup** (6-8) — quick wins before structural work
4. **Observability** (9) — Sentry added early so all subsequent work is monitored in production
5. **Hydration fix** (10) — biggest UX win before adding more tests
6. **Tests** (11-14) — safety net before structural refactoring
7. **Coverage enforcement** (13) — gating mechanism; done while writing tests
8. **Middleware extraction** (15) — safe with tests in place
9. **Performance + SEO** (16-18) — polish after structural integrity confirmed
10. **Dependency hardening** (19) — final gate

---

## Railway Free Plan Constraints (Affects Testing Strategy)

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| Container sleeps after ~5 min inactivity | Cold-start: 10–20 s on first request; worsens hydration flash | Server Component data fetching + warm-up cron at cron-job.org (free) |
| No persistent filesystem | Cannot use disk caching | Cloudinary + Supabase as sole state stores (already the case) |
| Limited RAM / CPU | Three.js + heavy animation libs may cause OOM | Lazy-load `three` / `@react-three/fiber` via `next/dynamic` |
| **NEVER load-test the live Railway URL** | Free plan may throttle or suspend on aggressive traffic | Run k6 / autocannon only against `localhost:3000` |
| Shared DB egress (Railway → Supabase) | Connection pool exhaustion under load | Keep `?pgbouncer=true` in `DATABASE_URL`; use Supabase IPv4 pooler URL |

---

## What NOT to Refactor

| Area | Reason to Skip |
|------|----------------|
| `DESIGN_SYSTEM.md` | 2,095 lines, recently finalised, comprehensive |
| UI component visuals | Enhancement report confirms these are complete |
| `proxy.ts` auth guard | Clean, correct, single-file |
| Prisma schema | 24 models with correct relations; no issues found |
| i18n architecture | Server-side cookie detection is correct for this use case |
| Rate limiting architecture | 9 limiters in one file is clean and testable |
| CI node matrix (20 + 22) | Correct; `cancel-in-progress` optimisation is fine |
| Session revocation architecture | `AdminSession` + JWT callback pattern is correct; just needs testing |

---

## Success Criteria

After all 19 tasks complete:

- [ ] FAQ title: `FAQ | Calendula Herbs` (no duplication) — verified by E2E assertion
- [ ] Homepage OG description year matches hero text — verified by unit test
- [ ] `ip-api.com` called via HTTPS; mocked in all auth integration tests; failure mode tested
- [ ] `@heyputer/puter.js` removed; bundle size decreased (verified by analyzer)
- [ ] Tawk.to removed from CSP `script-src` (or implemented if intentional)
- [ ] Zero hydration flash on Products, About, Contact — verified by Playwright `waitForSelector`
- [ ] Cookie banner: does not overlap CTA at 375 px; accept/decline behaviour functional
- [ ] Single test directory (`src/__tests__/`); `src/test/` deleted
- [ ] All stale logs, scripts, and backup directories removed or gitignored
- [ ] Sentry installed; first error captured and visible in Sentry dashboard
- [ ] Coverage enabled and enforced at ≥ 50% statements in CI
- [ ] 150+ API integration tests (every route: happy path + 400 + 401)
- [ ] 100+ unit tests (lib + UI + admin + public components)
- [ ] 35+ E2E tests (public + admin + i18n + session lifecycle + visual regression)
- [ ] Route handler boilerplate reduced ~40% via `withAuth` / `withValidation` HOFs
- [ ] Initial JS bundle < 500 KB (bundle analyzer verified)
- [ ] Performance budget in CI: LCP < 2.5 s, CLS < 0.1, Lighthouse ≥ 85
- [ ] JSON-LD on all relevant pages — Google Rich Results Test: 0 errors; nonce-prop included
- [ ] `pnpm audit` returns 0 high/critical CVEs; CI step is blocking
