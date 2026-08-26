# Comprehensive Test Plan — Calendula Herbs

> **Goal:** Professional-grade quality through comprehensive testing across unit, integration, E2E, security, visual regression, load, accessibility, and SEO dimensions.
> **Live URL:** https://calendula-herbscomproject1-production.up.railway.app/ (Railway free plan)
> **Current baseline:** 14 test files · 10 in `src/__tests__/` + 4 orphaned in `src/test/` · 72 passing unit tests · 8 E2E smoke tests · coverage disabled
> **Stack context:** Next.js 16.2.9 · TypeScript strict · Vitest + Testing Library · Playwright · MSW v2 · pnpm workspaces

> [!IMPORTANT]
> **NEVER run load tests or aggressive HTTP requests against the live Railway URL.**
> The free plan may throttle, suspend, or rate-limit the container if hammered.
> All load tests must target `localhost:3000` only.

---

## Required Skills (by Phase)

| Skill | Phase | Purpose |
|-------|-------|---------|
| `api-test-suite-builder` | A | Integration tests for all 47 API routes |
| `tdd-guide` | B | Unit test expansion + coverage enforcement |
| `playwright-pro` | C | E2E test expansion (35+ tests across all journeys) |
| `security-pen-testing` | G | OWASP surface checks, auth bypass, header verification |
| `performance-profiler` | D | Lighthouse CI + bundle analysis + Prisma query profiling |
| `fixing-accessibility` | E | WCAG 2.2 AA automated + manual audit |
| `schema-markup` | E | JSON-LD structured data implementation and validation |
| `fixing-metadata` | E | OG tags, meta descriptions, canonical URLs audit |
| `dependency-auditor` | F | CVE audit + make CI blocking |

---

## Phase A: API Integration Tests

**Skill:** `api-test-suite-builder`
**Duration:** ~6-8 hours
**Priority:** 🔴 Critical
**Current state:** 1 of 47 routes tested (`contact-route.test.ts`)

### Approach

- MSW v2 is already in `devDependencies` — use it to mock Prisma client, Resend, Cloudinary, and Upstash Redis
- **Also mock `http://ip-api.com`** via MSW — `src/lib/auth.ts` calls this external service on every login; failing to mock it causes tests to make real external HTTP calls and introduces flakiness
- Group tests by route category: public forms → auth/OTP → admin CRUD → public read
- Each route needs a minimum of 3 test cases (up to 5 for form routes):
  - `200`: happy path with valid data
  - `400`: invalid Zod schema → structured validation error response
  - `401`: missing/invalid JWT (admin routes only)
  - `404`: requesting non-existent resource
  - `429`: rate limit boundary (public routes)
- Tests must run in CI without a real database, Redis, or email provider
- Reference `src/__tests__/contact-route.test.ts` as the style template

### MSW Setup for `ip-api.com`

Add to `src/__tests__/setup.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const mswServer = setupServer(
  // Mock ip-api.com geolocation — returns a fixed country for all auth tests
  http.get('http://ip-api.com/json/*', () => {
    return HttpResponse.json({ country: 'Test Country' });
  }),
  // ... other handlers
);

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => mswServer.resetHandlers());
afterAll(() => mswServer.close());
```

### A1: Public Form Routes (4 routes × 5 tests = 20 tests)

- [x] Task 11: Setup MSW and write `/api/public/contact` tests.
- [x] Task 12: Write `/api/public/sample` and `/api/public/product-request` tests.
- [x] Task 13: Write `/api/public/cart` tests.

| Route | Test Cases |
|-------|-----------|
| `POST /api/public/contact` | ✓ Valid submission → 200 + DB record created<br>✓ Missing required fields → 400 with field errors<br>✓ Invalid email format → 400<br>✓ Rate limited after N requests → 429<br>✓ XSS attempt `<script>alert(1)</script>` in name field → 200, value sanitised in stored record |
| `POST /api/public/sample` | ✓ Valid sample request → 200<br>✓ Missing product selection → 400<br>✓ Invalid phone format → 400<br>✓ Rate limited → 429<br>✓ Duplicate submission (same IP+email within window) → handled gracefully |
| `POST /api/public/product-request` | ✓ Valid request → 200<br>✓ Missing product details → 400<br>✓ Unusual Unicode characters → sanitised correctly<br>✓ Rate limited → 429<br>✓ Sender metadata (IP, UA, country) attached to admin notification |
| `POST /api/public/cart` | ✓ Valid cart items → 200<br>✓ Empty cart → 400<br>✓ Invalid quantity (negative/zero) → 400<br>✓ Rate limited → 429<br>✓ Extremely large payload → 413 or 400 handled |

### A2: Auth Routes (5 routes × 4-5 tests = 22 tests)

| Route | Test Cases |
|-------|-----------|
| `POST /api/auth/[...nextauth]` (credentials) | ✓ Valid credentials → 200 + session<br>✓ Wrong password → 401<br>✓ Account locked after 5 attempts → 429/LOCKED<br>✓ Non-existent email → 401 (response identical to wrong-password — no user enumeration)<br>✓ `ip-api.com` timeout → login still succeeds with `country = 'Unknown'` |
| `POST /api/otp/send` | ✓ Valid admin email → 200 + OTP sent (Resend mocked)<br>✓ Rate limited → 429<br>✓ Invalid email format → 400<br>✓ Non-admin email → 404 |
| `POST /api/otp/verify` | ✓ Correct OTP → 200<br>✓ Wrong OTP → 400<br>✓ Expired OTP (simulate expiry) → 410<br>✓ Tampered/malformed OTP token → 400 |
| `POST /api/otp/reset-password` | ✓ Valid reset → 200 + password updated<br>✓ Weak password (< min length) → 400<br>✓ Missing token → 400<br>✓ Previously-used OTP (replay attack) → 410 |
| Admin session revocation | ✓ Request with `sessionId` that has `revokedAt` set → JWT callback returns `{ error: 'Revoked' }` → proxy redirects to login |

### A3: Admin CRUD Routes (~96 tests — 3 per endpoint)

For every admin entity group, test the 3-case pattern:
- `✓ 401 without Bearer token (or with invalid/revoked token)`
- `✓ 200 with valid request body and valid token (mock Prisma return value)`
- `✓ 404 for non-existent resource ID`

| Entity | Routes |
|--------|--------|
| Products | `GET /api/admin/products`, `POST /api/admin/products`, `GET/PATCH/DELETE /api/admin/products/[id]`, image routes |
| Categories | `GET/POST /api/admin/categories`, `GET/PATCH/DELETE /api/admin/categories/[id]` |
| Media | `GET/POST /api/admin/media`, `DELETE /api/admin/media/[id]`, `POST /api/admin/media/sign` |
| Certificates | `GET/POST /api/admin/certificates`, `GET/PATCH/DELETE /api/admin/certificates/[id]` |
| Gallery | `GET/POST /api/admin/gallery`, `GET/PATCH/DELETE /api/admin/gallery/[id]`, gallery item routes |
| Team | `GET/POST /api/admin/team`, `GET/PATCH/DELETE /api/admin/team/[id]`, `POST /api/admin/team/reorder` |
| Inquiries | Contact, sample, product-request, cart (GET list + GET/PATCH/DELETE `[id]`), unread-count |
| Settings | `GET/PATCH /api/admin/settings`, `GET/PATCH /api/admin/contact-settings`, plugins CRUD |
| Profile | `PATCH /api/admin/profile/change-email`, `PATCH /api/admin/profile/change-password`, recovery-emails |

### A4: Public Read Routes (6 routes × 3 tests = 18 tests)

| Route | Test Cases |
|-------|-----------|
| `GET /api/public/products` | ✓ Returns product list<br>✓ Filters by `?category=slug` correctly<br>✓ Returns empty array for non-existent category (not 404) |
| `GET /api/public/products/[slug]` | ✓ Existing slug → 200 + product data<br>✓ Non-existent slug → 404<br>✓ Slug with special characters → 400 |
| `GET /api/public/certificates` | ✓ Returns list<br>✓ Filters by type param<br>✓ Returns empty for unknown type |
| `GET /api/public/contact` | ✓ Returns contact info object (if route exists) |

### A: Success Criteria

- [ ] 150+ API integration tests total
- [ ] Every route has ≥ 3 test cases
- [ ] `ip-api.com` mocked in MSW setup; no real external HTTP calls in any test
- [ ] Auth enumeration test: wrong-email and wrong-password produce identical response shape/timing
- [ ] Rate limit tests verify Upstash Redis throttling (mocked) at correct thresholds
- [ ] 401 tests exist for every admin route, including revoked-session scenario
- [ ] Tests pass in CI without a real database, Redis, or email provider

---

## Phase B: Unit Test Expansion

**Skill:** `tdd-guide`
**Duration:** ~5-7 hours
**Priority:** 🔴 Critical
**Current state:** 72 passing tests, 14 files, coverage disabled

### Approach

- Enable coverage first: set `enabled: true` in `vitest.config.ts`
- Run `pnpm test:coverage` to establish baseline before writing new tests
- Write tests in dependency order: lib modules → UI primitives → hooks → page components
- Test behaviour, not implementation
- No test should use TypeScript `any`

### B1: Library Modules — 17 files, target ~34 tests

| File | Test Scenarios |
|------|---------------|
| `src/lib/env.ts` | ✓ Returns correct env var value<br>✓ Throws on missing required var<br>✓ Returns default for optional var |
| `src/lib/db.ts` | ✓ Returns Prisma singleton<br>✓ Same instance on repeated calls |
| `src/lib/auth.ts` | ✓ Password hashing produces bcrypt hash<br>✓ Password comparison: correct → true, wrong → false<br>✓ `ip-api.com` timeout → login succeeds with `country = 'Unknown'` |
| `src/lib/admin-auth.ts` | ✓ Admin lookup by email<br>✓ Failed login increments attempt counter<br>✓ Lockout after 5 failed attempts (15-min lockout window) |
| `src/lib/email.ts` | ✓ Builds correct Resend payload for each of the 4 form types<br>✓ Handles missing `RESEND_API_KEY` gracefully<br>✓ All template functions produce valid HTML structure |
| `src/lib/rate-limit.ts` | ✓ Returns limiter function for each of the 9 named limiters<br>✓ Each limiter has correct config (window, max requests)<br>✓ Handles Redis failure gracefully |
| `src/lib/otp.ts` | ✓ Generates 6-digit numeric code<br>✓ Verifies code: correct → true, wrong → false<br>✓ Expired OTP (past TTL) → false |
| `src/lib/security.ts` | ✓ Strips `<script>` tags<br>✓ Strips disallowed HTML attributes<br>✓ Allows configured safe tags (`<b>`, `<em>`) |
| `src/lib/settings.ts` | ✓ Returns typed settings object<br>✓ Caches correctly (same ref on second call)<br>✓ Returns defaults for missing keys |
| `src/lib/utils.ts` | ✓ Slug generation: "Hello World" → "hello-world"<br>✓ Handles special characters in slug |
| `src/lib/sender-meta.ts` | ✓ Extracts IP from `x-forwarded-for` header<br>✓ Extracts User-Agent<br>✓ Returns `'unknown'` for missing headers |
| `src/lib/animations.ts` | ✓ Returns correct animation variant object<br>✓ `prefers-reduced-motion` → instant/no-op variant |
| `src/lib/cloudinary.ts` | ✓ Generates correct signed upload URL<br>✓ Throws if Cloudinary credentials missing |
| `src/lib/contact-links.ts` | ✓ Returns correct link string per platform<br>✓ Handles empty value gracefully |
| `src/lib/image-url.ts` | ✓ Produces valid Cloudinary URL from public ID<br>✓ Returns placeholder for undefined input |
| `src/lib/theme-config.ts` | ✓ Returns correct CSS variable names<br>✓ Returns complete config with all expected keys |
| `src/lib/icon-map.ts` | ✓ Returns React component for known icon name<br>✓ Returns fallback for unknown name |

### B2: UI Primitives — 11 Radix wrappers, target ~22 tests

| Component | Key Test Scenarios |
|-----------|-------------------|
| `button.tsx` | ✓ Renders children · ✓ Applies variant class · ✓ Disabled prevents click · ✓ Focus ring present |
| `input.tsx` | ✓ Renders with label · ✓ Shows error state · ✓ Disabled state · ✓ Forwards ref |
| `dialog.tsx` | ✓ Opens and closes · ✓ Traps focus · ✓ Escape key closes · ✓ Backdrop click closes |
| `select.tsx` | ✓ Renders options · ✓ Selects value on click · ✓ Disabled state |
| `checkbox.tsx` | ✓ Toggles on click · ✓ Indeterminate state · ✓ Disabled prevents toggle |
| `badge.tsx` | ✓ Correct variant class · ✓ Custom className applied |
| `dropdown-menu.tsx` | ✓ Opens on trigger click · ✓ Selects item · ✓ Closes after selection |
| `switch.tsx` | ✓ Toggles on click · ✓ Disabled state |
| `label.tsx` | ✓ Associates with input via `htmlFor` · ✓ Shows required indicator |
| `textarea.tsx` | ✓ Renders and accepts typed input · ✓ Max length respected |
| `icon-picker.tsx` | ✓ Renders icon grid · ✓ Selects icon on click · ✓ Search input filters results |

### B3: Admin Components — 4 files, target ~12 tests

| Component | Key Test Scenarios |
|-----------|-------------------|
| `AdminSidebar.tsx` | ✓ Renders all nav links · ✓ Active route highlighted · ✓ Collapses on mobile |
| `AdminHeader.tsx` | ✓ Shows admin display name · ✓ Logout button fires auth signOut |
| `MediaPicker.tsx` | ✓ Opens modal on trigger · ✓ Selects and returns image URL · ✓ Displays existing images |
| `MediaUploader.tsx` | ✓ Shows upload progress · ✓ Handles upload error · ✓ Rejects non-image file type |

### B4: Public Components — 9 untested files, target ~18 tests

| Component | Key Test Scenarios |
|-----------|-------------------|
| `Footer.tsx` | ✓ Renders company info · ✓ Nav links present · ✓ Social links have correct `href` |
| `CartProvider.tsx` | ✓ Adds item · ✓ Removes item · ✓ Clears cart · ✓ State persists in context |
| `GalleryCarousel.tsx` | ✓ Renders images · ✓ Next/prev buttons navigate · ✓ Loops at boundary |
| `GalleryLightbox.tsx` | ✓ Opens on click · ✓ Escape closes · ✓ Image caption rendered |
| `HeroSection.tsx` | ✓ Renders h1 heading · ✓ CTA buttons visible |
| `FeaturedProductsSection.tsx` | ✓ Renders product cards · ✓ Each card links to correct product route |
| `ProcessSection.tsx` | ✓ All process steps rendered · ✓ Steps in correct order |
| `StatsBar.tsx` | ✓ Stat numbers rendered · ✓ Animation class applied on mount |
| `BotanicalAboutSection.tsx` | ✓ Section content renders · ✓ Image has non-empty alt attribute |

### B: Success Criteria

- [ ] Coverage enabled and reporting in CI (`pnpm test:coverage`)
- [ ] ≥ 50% statement coverage enforced (CI fails below threshold)
- [ ] 100+ total unit tests (up from 72)
- [ ] Every `src/lib/*` module has ≥ 2 test cases
- [ ] Zero tests use TypeScript `any`

---

## Phase C: E2E Test Expansion

**Skill:** `playwright-pro`
**Duration:** ~6-10 hours
**Priority:** 🟡 High
**Current state:** 1 spec, 8 smoke tests, Chromium only

### Approach

- Use `page.route()` to mock API responses — avoid real DB dependency in E2E
- Add `firefox` and `Mobile Chrome` to `playwright.config.ts` projects
- Add dedicated `e2e.yml` GitHub Actions workflow
- Run E2E against the local dev server; never against the Railway URL
- Retry: 2 on CI, 0 locally; trace on first retry; video on failure

### C1: Public Journeys — target 22 tests

**File:** `e2e/tests/public-journeys.spec.ts`

| Test | Scenario |
|------|----------|
| Homepage loads — all sections | Hero, featured products, stats bar, process section, certificates banner all visible |
| Products page — category filter | Click category chip → product grid updates |
| Product detail modal | Click product card → modal with name, description, image |
| Contact form — successful submit | Fill all valid fields → submit → success toast visible |
| Contact form — client validation | Submit empty form → inline error messages on all required fields |
| Sample request form | Select product → fill → submit → success |
| Product request form | Fill details → submit → success |
| Cart / quote flow | Click "Request a Quote" → drawer → add item → fill → submit → success |
| FAQ page — accordion | Click question → answer expands; click again → collapses |
| Certificates page | Certificate cards render; clicking opens detail view |
| Galleries page | Gallery section visible; click image → lightbox opens |
| Lightbox navigation | Next → prev → Escape closes |
| Privacy / Terms pages | Content renders without error |
| 404 page | Navigate to unknown route → branded not-found page |
| Error boundary | Mock server error → `error.tsx` boundary renders |
| RTL layout — Arabic | Set `NEXT_LOCALE=ar` cookie → `dir="rtl"`, Arabic text rendered |
| Multi-language — French | Set `NEXT_LOCALE=fr` → French content |
| Mobile responsive | 375 px → hamburger visible, stacked layout, CTA not hidden by banner |
| SEO meta tags | Homepage: `<title>`, `<meta name="description">`, `og:title`, `og:image` all present |
| Cookie consent — accept | Click Accept → consent cookie set → reload → banner does not reappear |
| Cookie consent — decline | Click Decline → consent cookie NOT set → banner appears again on reload |
| Cookie banner no overlap | At 375 px: assert CTA button bounding rect and banner bounding rect do not intersect |

### C2: Admin Journeys — target 14 tests

**File:** `e2e/tests/admin-journeys.spec.ts`

| Test | Scenario |
|------|----------|
| Login page loads | Form visible, not redirected |
| Successful login | Valid credentials → redirected to `/admin/dashboard` |
| Failed login | Invalid password → error message visible; no redirect |
| Account lockout | 5 consecutive failed attempts → lockout message visible |
| Dashboard loads | Inquiry counts, product counts widgets visible |
| Create product | Fill product form → save → new product in list |
| Edit product | Click edit → change name → save → updated name on reload |
| Delete product | Click delete → confirm → product removed from list |
| Upload media | Upload test image → appears in media library |
| View contact inquiries | Navigate to inquiries → contact submissions listed |
| Update site settings | Change a value → save → reloaded page shows updated value |
| Logout | Click logout → redirected to admin login |
| **Session revocation** | Login (session A) → logout (revokes `AdminSession`) → attempt to use stale JWT → assert redirected to login (not granted dashboard access) |
| **Admin session expires** | Mock JWT `maxAge` expiry → attempt admin API request → assert 401 / redirect to login |

### C3: i18n Journeys — target 3 tests

**File:** `e2e/tests/i18n-journeys.spec.ts`

| Test | Scenario |
|------|----------|
| Cookie-based locale persistence | Set `NEXT_LOCALE=de` → homepage → German content rendered |
| Locale persists across navigation | Set `NEXT_LOCALE=ar` → click to Products → still Arabic |
| All 17 locales — no missing keys | Loop all locale codes; assert no `[key]` placeholder appears on homepage |

### C4: Visual Regression — target 6 snapshots

**File:** `e2e/tests/visual.spec.ts`

Uses Playwright's built-in `expect(page).toHaveScreenshot()`. On first run it generates baselines; subsequent runs compare against them. Store snapshots in `e2e/snapshots/`.

```typescript
// e2e/tests/visual.spec.ts
import { test, expect } from '@playwright/test';

test('homepage desktop — visual', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('homepage-desktop.png', { maxDiffPixels: 100 });
});

test('homepage mobile — visual', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('homepage-mobile.png', { maxDiffPixels: 100 });
});

test('products page — visual', async ({ page }) => {
  await page.goto('/products');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('products-desktop.png', { maxDiffPixels: 100 });
});

test('admin login page — visual', async ({ page }) => {
  await page.goto('/admin/login');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('admin-login.png', { maxDiffPixels: 100 });
});

test('contact page RTL — visual', async ({ page }) => {
  await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'ar', domain: 'localhost', path: '/' }]);
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('contact-ar-rtl.png', { maxDiffPixels: 100 });
});

test('FAQ page — visual', async ({ page }) => {
  await page.goto('/faq');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('faq-desktop.png', { maxDiffPixels: 100 });
});
```

> [!NOTE]
> Update snapshots intentionally with `npx playwright test --update-snapshots` after approved visual changes. Commit updated snapshots in the same PR as the CSS change.

### C: Success Criteria

- [ ] 45+ E2E tests across all spec files (public + admin + i18n + visual)
- [ ] Tests pass in CI on Chromium, Firefox, and Mobile Chrome
- [ ] All 8 original smoke tests still pass
- [ ] Visual regression baselines committed to `e2e/snapshots/`
- [ ] Session revocation test verifies stale JWT is rejected
- [ ] Cookie consent accept/decline functional behaviour verified
- [ ] No flaky tests: run locally 3× with `--repeat-each=3` before marking stable

---

## Phase D: Load & Performance Testing

**Skill:** `performance-profiler`
**Duration:** ~3-5 hours
**Priority:** 🟡 High
**Current state:** No load testing infrastructure

> [!CAUTION]
> **All load tests must target `http://localhost:3000` only.**
> Never point k6 or autocannon at the Railway URL.

### D1: Lighthouse CI (all 12 public pages)

```bash
pnpm add -D @lhci/cli

npx lhci autorun \
  --collect.url=http://localhost:3000 \
  --collect.url=http://localhost:3000/products \
  --collect.url=http://localhost:3000/about \
  --collect.url=http://localhost:3000/contact \
  --collect.url=http://localhost:3000/faq \
  --collect.url=http://localhost:3000/certificates \
  --collect.url=http://localhost:3000/galleries \
  --collect.url=http://localhost:3000/privacy \
  --collect.url=http://localhost:3000/terms \
  --collect.url=http://localhost:3000/sample \
  --collect.url=http://localhost:3000/product-request \
  --collect.url=http://localhost:3000/admin/login
```

**Performance Budgets:**

| Metric | Budget |
|--------|--------|
| LCP | < 2.5 s |
| CLS | < 0.1 |
| TTI | < 3.5 s |
| TBT | < 300 ms |
| Performance score | ≥ 85 |
| Initial JS bundle | < 500 KB |

### D2: k6 Load Testing (localhost only)

**Script:** `e2e/load/k6-scenarios.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

// IMPORTANT: localhost only — NEVER point this at the Railway URL
const BASE_URL = 'http://localhost:3000';

export const options = {
  scenarios: {
    homepage_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    api_public_spike: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '60s',
      preAllocatedVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res1 = http.get(`${BASE_URL}/`);
  check(res1, { 'homepage 200': (r) => r.status === 200 });
  sleep(1);

  const res2 = http.get(`${BASE_URL}/api/public/products`);
  check(res2, { 'products API 200': (r) => r.status === 200 });
  sleep(1);

  // Contact form — rate limit should activate (429), not crash (500)
  const res3 = http.post(`${BASE_URL}/api/public/contact`, JSON.stringify({
    name: 'Load Test', email: 'load@test.com', message: 'Test', subject: 'Test',
  }), { headers: { 'Content-Type': 'application/json' } });
  check(res3, {
    'contact form: 200 or 429 only': (r) => [200, 429].includes(r.status),
  });
  sleep(1);
}
```

**Load Test Scenarios:**

| Test | Config | Assert |
|------|--------|--------|
| Homepage ramp-up | 0 → 200 VUs over 8 min | p95 < 500 ms, error rate < 1% |
| Products API burst | 20 req/s for 60 s | No connection drops, no 500s |
| Contact form spam | 20 req/s POST for 60 s | 429s returned correctly; zero 500s |
| Admin login burst | 10 req/s for 30 s | Lockout message after 5 attempts; no 500s |

### D3: Bundle Analysis

```bash
pnpm add -D @next/bundle-analyzer
ANALYZE=true pnpm build
```

**Primary investigation targets:**
- `three` + `@react-three/fiber` + `@react-three/drei` — likely largest chunks; lazy-load with `next/dynamic({ ssr: false })`
- `framer-motion` — confirm tree-shaking is working
- `gsap` — confirm only used sub-plugins imported
- Any duplicate packages at multiple versions
- Dead client-side code that should be server-only

### D4: Prisma Query Profiling

- Enable `log: ['query']` in Prisma client for test environment
- Run all Phase A API integration tests with logging active
- Flag queries > 100 ms
- Flag N+1 patterns (multiple queries in a loop for list endpoints)
- Add `@@index` to frequently filtered fields

### D: Success Criteria

- [ ] Lighthouse scores ≥ 85 on all 12 public pages
- [ ] LCP < 2.5 s, CLS < 0.1 enforced in CI
- [ ] k6: p95 < 500 ms under 200 concurrent VUs (localhost); zero 500 errors under load
- [ ] Bundle analysis report generated; initial JS < 500 KB
- [ ] `three.js` lazy-loaded via `next/dynamic`
- [ ] No Prisma query > 100 ms in profiling logs

---

## Phase E: Accessibility & SEO

**Skills:** `fixing-accessibility` · `schema-markup` · `fixing-metadata`
**Duration:** ~2-4 hours
**Priority:** 🟢 Moderate

### E1: WCAG 2.2 AA Audit

Install: `pnpm add -D axe-playwright`

```typescript
// e2e/tests/accessibility.spec.ts
import { checkA11y } from 'axe-playwright';

const publicPages = ['/', '/products', '/about', '/contact', '/faq',
  '/certificates', '/galleries', '/privacy', '/terms',
  '/sample', '/product-request', '/admin/login'];

for (const url of publicPages) {
  test(`${url} passes WCAG 2.2 AA`, async ({ page }) => {
    await page.goto(url);
    await checkA11y(page, undefined, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] });
  });
}
```

**Manual checks:**

| Check | Flow |
|-------|------|
| Keyboard navigation | Tab through homepage, products, contact form, admin login — all elements reachable in logical order |
| Screen reader | Form labels announced; error messages announced on invalid submit |
| Focus visibility | Focus ring visible on all interactive elements |
| Motion sensitivity | `prefers-reduced-motion: reduce` → animations use instant/no-op variants |
| Cookie banner tab order | Banner is first focusable element; does not trap focus unexpectedly |

### E2: JSON-LD Structured Data

> [!IMPORTANT]
> **CSP Compatibility:** The current CSP uses `'unsafe-inline'` in `script-src`, which covers JSON-LD inline scripts for now. However, `next.config.ts` has a TODO to implement nonce-based CSP. **Build every JSON-LD `<script>` component with a `nonce` prop from the start**, so that when `'unsafe-inline'` is eventually removed, JSON-LD scripts simply need the nonce passed in — no refactor required.

```typescript
// Example nonce-ready JSON-LD component:
// src/components/shared/JsonLd.tsx
type JsonLdProps = { data: Record<string, unknown>; nonce?: string };
export function JsonLd({ data, nonce }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

| Schema | Page | Required Properties |
|--------|------|---------------------|
| `Organization` | Root layout | `name`, `url`, `logo`, `contactPoint.telephone`, `sameAs` (social links) |
| `Product` | `/products/[slug]` | `name`, `description`, `image`, `category.name`, `offers` |
| `FAQPage` | `/faq` | `mainEntity[]` with `Question` / `acceptedAnswer` |
| `BreadcrumbList` | `/products`, `/products/[slug]` | `itemListElement` with `position`, `name`, `item` URL |
| `LocalBusiness` | `/contact` | `address`, `telephone`, `geo`, `openingHoursSpecification` |

Validate via Google Rich Results Test after deployment.

### E3: Metadata Audit (all 12 public pages)

| Element | Requirement |
|---------|-------------|
| `<title>` | Unique per page; `[Page Name] \| Calendula Herbs`; no duplicate brand suffix |
| `<meta name="description">` | Unique; 120–160 characters |
| `<meta property="og:title">` | Present; matches `<title>` |
| `<meta property="og:description">` | Present; unique per page |
| `<meta property="og:image">` | Present; Cloudinary URL ≥ 1200×630 px |
| `<meta property="og:url">` | Present; canonical URL |
| `<meta name="twitter:card">` | `summary_large_image` |
| `<link rel="canonical">` | Present; consistent trailing-slash policy |
| `<meta name="robots">` | `index, follow` on public; `noindex, nofollow` on all `/admin/*` |

**Automated assertion in `e2e/tests/seo.spec.ts`:**

```typescript
test('homepage has required meta tags', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title).toMatch(/Calendula Herbs/);
  expect(title).not.toMatch(/\| .+ \| .+/); // No double brand suffix
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{120,}/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /cloudinary/);
});
```

### E: Success Criteria

- [ ] axe-core: 0 WCAG 2.2 AA violations on all 12 public pages
- [ ] Keyboard navigation reaches all interactive elements in logical tab order
- [ ] JSON-LD on all relevant pages; Google Rich Results Test: 0 errors
- [ ] JSON-LD components built with `nonce` prop for future CSP hardening
- [ ] All 12 public pages: unique `<title>` and `<meta name="description">`
- [ ] OG image uses Cloudinary URL ≥ 1200×630 px on all pages
- [ ] `prefers-reduced-motion` respected in animation unit tests
- [ ] `sitemap.xml` output verified; all public URLs included, no admin URLs

---

## Phase F: Dependency & Security Hardening

**Skill:** `dependency-auditor`
**Duration:** ~0.5-1 hour
**Priority:** 🟢 Moderate

| Action | Detail |
|--------|--------|
| Run `pnpm audit` | `pnpm audit --audit-level=high` — review all findings before making CI blocking |
| Fix or suppress CVEs | Update packages; add `pnpm.overrides` for transitive CVEs |
| Make CI blocking | Remove `\|\| true` from `pnpm audit` step in `.github/workflows/ci.yml` line 63 |
| Verify Dependabot | Check `dependabot.yml` covers both root and `e2e/` sub-workspace |
| `.gitignore` audit | Verify `secrets.json`, `.env.local`, `.env`, `*.log`, `scratch/` all ignored |

### F: Success Criteria

- [ ] `pnpm audit --audit-level=high` returns 0 high/critical vulnerabilities
- [ ] CI audit step is blocking (no `\|\| true`)
- [ ] Dependabot covers both workspaces
- [ ] No secrets in Git history

---

## Phase G: Security Testing

**Skill:** `security-pen-testing`
**Duration:** ~2-3 hours
**Priority:** 🔴 Critical (no security tests exist at all currently)

### Approach

This phase covers OWASP Top 10 surface checks specific to this application. It combines automated assertions (via Playwright and MSW), and targeted integration tests — not a full penetration test.

### G1: Security Header Verification

**File:** `e2e/tests/security-headers.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('security headers present on all page responses', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response!.headers();

  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['strict-transport-security']).toMatch(/max-age=\d+/);
  expect(headers['content-security-policy']).toBeTruthy();

  // Assert CSP does NOT contain unsafe-eval in production
  if (process.env.NODE_ENV === 'production') {
    expect(headers['content-security-policy']).not.toContain("'unsafe-eval'");
  }

  // Assert CSP only contains known script-src domains (no ghost entries)
  const csp = headers['content-security-policy'];
  const unknownDomains = ['tawk.to', 'embed.tawk.to'].filter(d => csp.includes(d));
  // Fail if tawk.to is in CSP but not actually implemented
  // (Update this list when legitimate third-party scripts are added)
});
```

### G2: XSS — Input Sanitisation (integration tests in Phase A)

Already covered in Phase A (A1 contact form test). Extend with:

**File:** Add to each form's integration test file:

| Attack Vector | Test |
|---------------|------|
| `<script>alert(1)</script>` in all text fields | Stored value in DB mock is sanitised (no `<script>` tag) |
| `<img src=x onerror=alert(1)>` in message field | Stripped by `isomorphic-dompurify` |
| `javascript:alert(1)` in URL-type fields | Rejected or stored as plain text |
| Admin notification HTML | Assert the rendered email HTML from `src/lib/email.ts` does not echo unsanitised user input |

### G3: Authentication Attack Surface

**File:** `src/__tests__/auth-security.test.ts`

| Attack | Test |
|--------|------|
| User enumeration | `POST /api/auth` with non-existent email vs wrong password → response body and status code must be identical |
| Brute force lockout | After 5 failed attempts → `lockedUntil` set to now + 15 min; 6th attempt with correct password is still rejected |
| JWT tampering | Mutate any byte of the JWT → `proxy.ts` rejects request with 401/redirect |
| Revoked session replay | Login → revoke `AdminSession` in DB → subsequent request with old JWT → `auth.ts` callback returns `{ error: 'Revoked' }` → redirected to login |
| OTP replay | Use OTP once successfully → attempt reuse → 410 Gone |
| Login with expired lockout | Set `lockedUntil` to past timestamp → login should succeed (lockout expired) |

### G4: `ip-api.com` Security Tests

**File:** `src/__tests__/auth.test.ts` (extend existing)

| Test | Assert |
|------|--------|
| `ip-api.com` returns malformed JSON | Login succeeds; `country` defaults to `'Unknown'`; no uncaught exception |
| `ip-api.com` returns 500 | Login succeeds; `country = 'Unknown'` |
| `ip-api.com` timeout (mock 5s delay) | Login completes in < 3 s total; geolocation skipped gracefully |
| `ip-api.com` called via HTTPS | Assert MSW handler for `https://ip-api.com` is hit (not `http://`) after the HTTP→HTTPS fix is applied |

### G5: Rate Limiter Boundary Tests

**File:** `src/__tests__/rate-limit-boundary.test.ts`

Verify each of the 9 Upstash rate limiters fires at exactly the configured threshold:

| Limiter | Window | Max | Test |
|---------|--------|-----|------|
| Login | configured | configured | ✓ Request N passes; request N+1 returns 429 |
| OTP send | configured | configured | Same pattern |
| Contact form | configured | configured | Same pattern |
| Sample form | configured | configured | Same pattern |
| Product request | configured | configured | Same pattern |
| Cart | configured | configured | Same pattern |
| Search | configured | configured | Same pattern |
| (remaining 2) | configured | configured | Same pattern |

For all: verify graceful degradation when Redis is unavailable (mock Redis failure → define policy: fail open or closed, assert consistent behaviour).

### G: Success Criteria

- [ ] Security header test passes on all page responses
- [ ] CSP does not contain `'unsafe-eval'` in production
- [ ] XSS payloads in all 4 public forms are sanitised before storage and before email template rendering
- [ ] User enumeration: non-existent email and wrong-password produce identical HTTP response
- [ ] Brute force lockout: 5 attempts → locked; 6th correct attempt rejected
- [ ] Revoked JWT → redirected to login (not granted access)
- [ ] OTP replay attack → 410 Gone
- [ ] `ip-api.com` failure modes all tested: timeout, 500, malformed JSON → login still succeeds
- [ ] All 9 rate limiters verified at their configured thresholds
- [ ] Redis failure mode defined and tested for all rate limiters

---

## Phase H: Post-Deployment Smoke Test (Railway)

**Duration:** ~30 minutes to set up
**Priority:** 🟡 High
**Current state:** CI never verifies the deployed site

### Approach

This is explicitly **not** a load test. It's a 5-request health check triggered after a successful Railway deployment to verify the deploy didn't break the live site. Run it in a `post-deploy.yml` workflow triggered by a `railway_deploy` webhook or by watching the Railway deploy status via their API.

**File:** `.github/workflows/post-deploy.yml`

```yaml
name: Post-Deploy Smoke Test

on:
  workflow_dispatch:
    inputs:
      environment_url:
        description: 'Live URL to smoke test'
        required: true
        default: 'https://calendula-herbscomproject1-production.up.railway.app'

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - name: Homepage returns 200
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${{ github.event.inputs.environment_url }}/")
          [ "$STATUS" = "200" ] || (echo "Homepage returned $STATUS" && exit 1)

      - name: Products API returns 200
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${{ github.event.inputs.environment_url }}/api/public/products")
          [ "$STATUS" = "200" ] || (echo "Products API returned $STATUS" && exit 1)

      - name: sitemap.xml returns 200 and is valid XML
        run: |
          BODY=$(curl -s "${{ github.event.inputs.environment_url }}/sitemap.xml")
          echo "$BODY" | grep -q '<urlset' || (echo "sitemap.xml missing <urlset" && exit 1)

      - name: robots.txt returns 200
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${{ github.event.inputs.environment_url }}/robots.txt")
          [ "$STATUS" = "200" ] || (echo "robots.txt returned $STATUS" && exit 1)

      - name: Admin login page returns 200 (not 500)
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${{ github.event.inputs.environment_url }}/admin/login")
          [ "$STATUS" = "200" ] || (echo "Admin login returned $STATUS" && exit 1)
```

> [!NOTE]
> This workflow uses `curl` with a 5-request limit. It is not a load test and does not risk triggering Railway throttling. Trigger it manually after each Railway deploy, or automate via Railway's deploy webhook calling the `workflow_dispatch` event.

### H: Success Criteria

- [ ] Post-deploy smoke test workflow created and tested manually
- [ ] All 5 endpoints return expected status codes after a real Railway deploy
- [ ] `sitemap.xml` body contains `<urlset` (valid XML structure)
- [ ] Workflow is documented as the standard post-deploy verification step

---

## Test Execution Matrix

```
Phase │ Type                │ Location               │ Count  │ Command                          │ CI
──────┼─────────────────────┼────────────────────────┼────────┼──────────────────────────────────┼────────────────
  A   │ API Integration     │ src/__tests__/         │ ~154   │ pnpm test                        │ Existing ci.yml
  B   │ Unit                │ src/__tests__/         │ ~100+  │ pnpm test                        │ Existing ci.yml
  C   │ E2E (journeys)      │ e2e/tests/             │ ~39    │ npx playwright test              │ New e2e.yml
  C   │ Visual Regression   │ e2e/tests/visual.spec  │ 6      │ npx playwright test visual       │ New e2e.yml
  D   │ Load (localhost)    │ e2e/load/              │ ~4     │ k6 run e2e/load/k6-scenarios.js  │ Manual only
  D   │ Lighthouse CI       │ All 12 public pages    │ 12     │ npx lhci autorun                 │ New step in ci.yml
  D   │ Bundle analysis     │ Build output           │ 1      │ ANALYZE=true pnpm build          │ Manual / on-demand
  E   │ Accessibility       │ e2e/tests/             │ 12     │ axe-playwright + Playwright      │ e2e.yml or new step
  E   │ SEO metadata        │ e2e/tests/seo.spec     │ 12     │ npx playwright test seo          │ e2e.yml
  F   │ Dependency audit    │ CLI                    │ 1      │ pnpm audit --audit-level=high    │ Existing ci.yml (blocking)
  G   │ Security headers    │ e2e/tests/security     │ ~8     │ npx playwright test security     │ e2e.yml
  G   │ Auth security       │ src/__tests__/         │ ~12    │ pnpm test                        │ Existing ci.yml
  G   │ Rate limiter bounds │ src/__tests__/         │ ~9     │ pnpm test                        │ Existing ci.yml
  H   │ Post-deploy smoke   │ .github/workflows/     │ 5      │ workflow_dispatch (manual)       │ New post-deploy.yml
```

---

## CI Integration Summary

### Changes to Existing `ci.yml`

```diff
  - name: Dependency audit (non-blocking)
-   run: pnpm audit --audit-level=high || true
+   run: pnpm audit --audit-level=high

+ - name: Coverage report
+   run: pnpm test:coverage

+ - name: Lighthouse CI
+   run: npx lhci autorun --config=lighthouserc.json
```

### New: `.github/workflows/e2e.yml`

```yaml
name: E2E Tests
on:
  push:
    branches: [main, develop, master]
  pull_request:
    branches: [main, develop, master]

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

jobs:
  e2e:
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: postgresql://placeholder:placeholder@localhost:5432/placeholder
      DIRECT_URL: postgresql://placeholder:placeholder@localhost:5432/placeholder
      NEXTAUTH_SECRET: placeholder-secret-min-32-chars-xxxx
      NEXTAUTH_URL: http://localhost:3000
      ADMIN_EMAIL: admin@example.com
      RESEND_API_KEY: placeholder
      CLOUDINARY_CLOUD_NAME: placeholder
      CLOUDINARY_API_KEY: placeholder
      CLOUDINARY_API_SECRET: placeholder
      UPSTASH_REDIS_REST_URL: https://placeholder.upstash.io
      UPSTASH_REDIS_REST_TOKEN: placeholder
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: placeholder
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: npx playwright install chromium firefox
      - run: npx playwright test
        working-directory: e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: e2e/playwright-report/
          retention-days: 7
```

### New: `.github/workflows/post-deploy.yml`

(See Phase H above for full content)

---

## Should We Use k6? — Final Answer

**Yes.** k6 is the right tool for this project.

| Tool | Pros | Cons | Verdict |
|------|------|------|---------|
| **k6** | JS scenarios, rich thresholds, excellent docs, open-source | Separate install | ✅ Recommended |
| Autocannon | Zero config, fast, Node.js native | No scenario stages, limited assertions | Only for quick spot checks |
| Artillery | YAML config, built-in scenarios | Heavier setup, less ergonomic | Overkill here |

**Hard rules for Railway free plan:**
1. `BASE_URL` in k6 scripts is always `http://localhost:3000` — never the Railway URL
2. Start with 0→50 VU ramp before going to 200 VU
3. Run k6 only with a local database (not mocked) for realistic numbers
4. Record the Railway cold-start latency separately (manual measurement): time first request after 5+ min idle

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Flaky E2E tests (timing) | Medium | High | CI retries (2); `waitForSelector` / `waitForResponse`; never `waitForTimeout` |
| MSW mock mismatches real API | Medium | Medium | Validate mocks against real API during setup; keep in sync with Zod schemas |
| `ip-api.com` not mocked → flaky auth tests | High | Medium | Add to MSW setup immediately; treat as blocking for Phase A |
| k6 accidentally targets Railway URL | Low | High | Hardcode `BASE_URL`; never allow env override to remote URL in k6 scripts |
| Visual snapshot diffs from font rendering | Medium | Low | Use `maxDiffPixels: 100` threshold; regenerate snapshots on font version changes |
| Coverage threshold blocks PRs too early | Medium | Medium | Start with `reporter: ['text']` only; graduate to `thresholds` enforcement after 2 weeks |
| Three.js OOM on Railway free plan | Low | High | Lazy-load via `next/dynamic` (Phase D); monitor Railway metrics after deploy |
| JSON-LD breaks when CSP nonce is added | Low | High | Build JSON-LD with `nonce` prop from the start (Phase E) |
| Sentry noise from test environment | Low | Low | Set `SENTRY_ENVIRONMENT=production` in Railway env only; test env uses `enabled: false` |
