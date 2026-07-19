# Calendula Herbs — Full-Spectrum Enhancement Plan

**Date:** 18 July 2026
**Project:** Calendula Herbs For Import & Export (calendula-herbs)
**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma ORM, PostgreSQL (Supabase), NextAuth v5, next-intl (17 locales), Cloudinary, Resend, Upstash Redis

---

## Table of Contents

1. [Scope & Principles](#1-scope--principles)
2. [Phase 0 — Change Traceability](#2-phase-0--change-traceability)
3. [Phase 1 — Critical Security & Secrets](#3-phase-1--critical-security--secrets)
4. [Phase 2 — API Validation Hardening](#4-phase-2--api-validation-hardening)
5. [Phase 3 — Quality Infrastructure (tsconfig, Prettier, Hooks)](#5-phase-3--quality-infrastructure-tsconfig-prettier-hooks)
6. [Phase 4 — Database Schema Optimization (Indexes + Types)](#6-phase-4--database-schema-optimization-indexes--types)
7. [Phase 5 — Accessibility (WCAG 2.2 AA)](#7-phase-5--accessibility-wcag-22-aa)
8. [Phase 6 — i18n Completeness & RTL Fixes](#8-phase-6--i18n-completeness--rtl-fixes)
9. [Phase 7 — Testing Expansion](#9-phase-7--testing-expansion)
10. [Phase 8 — CI/CD & Polish](#10-phase-8--cicd--polish)
11. [Skills Used](#11-skills-used)
12. [Full File Inventory](#12-full-file-inventory)
13. [Appendices](#13-appendices)

---

## 1. Scope & Principles

### Principles
1. **Every change is reversible** — Phase 0 ensures full traceability.
2. **No regressions** — Existing functionality must be preserved.
3. **Consistency** — Codebase patterns (Zod, Prisma, Radix, i18n) must be followed, not reinvented.
4. **Security-first** — Secrets, validation, and auth are non-negotiable.
5. **Measurable quality** — Each phase has a verification step.

### What We Already Fixed (18-7-2026.md execution)
- Removed eager `.include({ translations: true })` from team queries (layout.tsx, contact/page.tsx)
- Guarded video URLs against `<Image>` in all 4 carousels
- Added `sizes="110px"` to cert logo Image in Footer
- Created `CertPreviewImage.tsx` client component with onError fallback
- Fixed product section spacing (`pb-16`) and line-clamp (2→3)
- Internationalized ProductDetailModal (15+ fixes: RTL, CSS vars, translation keys)
- Created `prisma/seed-translations.ts` for auto-translating products/categories via LibreTranslate

### Project Analysis Summary

| Dimension | Current State |
|-----------|---------------|
| API routes | 46 files, 60.9% use Zod validation, 13 PATCH routes unvalidated |
| i18n | 17 locales, 20 namespaces consistent, 10 Arabic keys missing |
| Prisma schema | 24 models, 9 enums, **zero indexes** on foreign keys |
| Tests | 14 files (7 __tests__, 4 src/test, e2e/ exists but not in CI) |
| TypeScript | `strict: true` but missing `noUncheckedIndexedAccess` |
| ESLint | v9 flat config — minimal, no extra plugins |
| Prettier | **Not configured** |
| Husky | **Not configured** |
| CSP | `'unsafe-inline'` in script-src — TODO noted |
| a11y | Radix components good; Template1Carousel has zero keyboard access; focus traps missing; focus-visible gated behind reduced-motion |
| CI | lint + tsc + test + build runs; E2E **not** in CI |
| `.env` | **Tracked in git** with live secrets — HIGH severity |
| TODO/FIXME markers | **78** in source |

---

## 2. Phase 0 — Change Traceability

**Goal:** Every modification is reversible. Any file can be restored to its pre-initiative state with a single command.

### Setup Commands

```bash
# 0a — Tag pre-initiative state
git tag quality-init-baseline

# 0b — Create manifest directory + initial state
mkdir -p .quality-manifest
git rev-parse HEAD > .quality-manifest/HEAD-before.txt
git diff --stat HEAD~1 HEAD > .quality-manifest/last-change.txt

# 0c — Create the JSONL log file
echo "[]" > .quality-manifest/changes.jsonl
```

### Per-Edit Logging Procedure

Every edit throughout Phases 1-8 MUST append to `.quality-manifest/changes.jsonl`:

```json
{
  "ts": "2026-07-18T10:30:00Z",
  "phase": "1",
  "file": "src/app/api/admin/categories/route.ts",
  "reason": "Add Zod validation for PATCH reorder endpoint",
  "before_hash": "<sha before edit>",
  "after_hash": "<sha after edit>"
}
```

### Phase Completion Tags

| After Phase | Tag |
|-------------|-----|
| Phase 0 | `git tag quality-phase-0-done` |
| Phase 1 | `git tag quality-phase-1-done` |
| Phase 2 | `git tag quality-phase-2-done` |
| Phase 3 | `git tag quality-phase-3-done` |
| Phase 4 | `git tag quality-phase-4-done` |
| Phase 5 | `git tag quality-phase-5-done` |
| Phase 6 | `git tag quality-phase-6-done` |
| Phase 7 | `git tag quality-phase-7-done` |
| Phase 8 | `git tag quality-phase-8-done` |

### Retrieval Commands

| Action | Command |
|--------|---------|
| Restore single file to baseline | `git checkout quality-init-baseline -- <file>` |
| List all changed files | `git log quality-init-baseline..HEAD --name-only --oneline` |
| Export full diff | `git diff quality-init-baseline..HEAD > full-diff.diff` |
| Revert everything | `git checkout quality-init-baseline` |
| Revert single phase | `git revert quality-phase-N-done..quality-phase-N+1-done --no-commit` |

### `.quality-manifest/revert-to.sh`

```bash
#!/usr/bin/env bash
case $1 in
  baseline) git checkout quality-init-baseline ;;
  phase-[0-8]) git checkout "quality-$1-done" ;;
  *) echo "Usage: $0 {baseline|phase-0|phase-1|...|phase-8}" ;;
esac
```

### Verification
```bash
git tag -l "quality-*"
# Should list all 10 tags
```

---

## 3. Phase 1 — Critical Security & Secrets

**Goal:** Remove committed secrets, harden deployment safety.

### 1a — Move `.env` to `.gitignore`

**Files to touch:**
- `E:\Calendula Herbs Website Project\calendula-herbs\.gitignore`

**Change:**
- Add explicit `# Environment files` section that ignores `.env` but keeps `.env.example`
- Ensure `.env.local`, `.env.production`, etc. are also covered

`.gitignore` change:
```
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
```

**Action:**
1. Copy `.env` contents to `.env.local` (which is already gitignored)
2. Remove `.env` from git tracking: `git rm --cached .env`
3. Verify `.env` no longer appears in `git status`
4. Commit with message: `chore(security): gitignore .env with live secrets, move to .env.local`

### 1b — Add `.env.example` completeness check

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\.env.example`

**Change:** Ensure ALL environment variables used in the project are documented with placeholder values.

Check against usage in:
- `next.config.ts`
- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `src/lib/cloudinary.ts`
- `src/lib/resend.ts`
- `src/lib/redis.ts`
- `src/proxy.ts`
- `prisma/seed.ts`

### 1c — Verify no other secrets tracked

```bash
# Check for accidental secrets in committed files
git grep -l "sk_live\|sk_test\|SECRET\|PASSWORD\|api_key\|API_KEY" -- ':(exclude)*.example*' ':(exclude)*.md' ':(exclude).gitignore'
```

### Files Touched
- `.gitignore`
- `.env` (removed from git tracking)
- `.env.local` (created with real values)

### Verification
```bash
git status                  # .env should not appear
git log --oneline -1        # Should show the commit
```

---

## 4. Phase 2 — API Validation Hardening

**Goal:** Add Zod schema validation to all 13 unvalidated PATCH endpoints.

### Unvalidated Routes Inventory

| # | File | Method | Unvalidated Fields | Risk |
|---|------|--------|-------------------|------|
| 1 | `src/app/api/admin/categories/route.ts` | PATCH | `{ ids }` | Medium |
| 2 | `src/app/api/admin/gallery/route.ts` | PATCH | `{ ids }` | Medium |
| 3 | `src/app/api/admin/certificates/route.ts` | PATCH | `{ ids }` | Medium |
| 4 | `src/app/api/admin/plugins/route.ts` | PATCH | `{ ids }` | Medium |
| 5 | `src/app/api/admin/products/[id]/images/route.ts` | PATCH | `{ ids }` | Medium |
| 6 | `src/app/api/admin/gallery/[id]/items/route.ts` | PATCH | `{ ids }` | Medium |
| 7 | `src/app/api/admin/gallery/[id]/items/[itemId]/route.ts` | PATCH | `{ title, caption, isActive, section }` | Low |
| 8 | `src/app/api/admin/products/[id]/images/[imageId]/route.ts` | PATCH | (no body validation at all) | Low |
| 9 | `src/app/api/admin/media/[id]/route.ts` | PATCH | `{ name }` — manual typeof check | Low |
| 10 | `src/app/api/admin/inquiries/contact/[id]/route.ts` | PATCH | `{ isRead }` | Low |
| 11 | `src/app/api/admin/inquiries/cart/[id]/route.ts` | PATCH | `{ isRead }` | Low |
| 12 | `src/app/api/admin/inquiries/samples/[id]/route.ts` | PATCH | `{ isRead }` | Low |
| 13 | `src/app/api/admin/inquiries/product-requests/[id]/route.ts` | PATCH | `{ isRead }` | Low |

### Approach

For all 13 endpoints, add a Zod schema before the request handler and use `.parse()` — matching the existing pattern used in the other 28 routes.

#### Schema templates

```typescript
// Reorder schema (items 1-6)
import { z } from 'zod';

const reorderSchema = z.object({
  ids: z.array(z.string().min(1, 'ID is required')).min(1, 'At least one ID required'),
});

// Gallery item update schema (item 7)
const galleryItemUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  caption: z.string().optional(),
  isActive: z.boolean().optional(),
  section: z.nativeEnum(GallerySection).optional(),
});

// Inquiry status schema (items 10-13)
const inquiryStatusSchema = z.object({
  isRead: z.boolean({ required_error: 'isRead is required' }),
});

// Media rename schema (item 9)
const mediaRenameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});
```

#### Pattern for each file

```typescript
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { ids } = reorderSchema.parse(body);
    // ... existing logic
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Files Touched
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/gallery/route.ts`
- `src/app/api/admin/certificates/route.ts`
- `src/app/api/admin/plugins/route.ts`
- `src/app/api/admin/products/[id]/images/route.ts`
- `src/app/api/admin/gallery/[id]/items/route.ts`
- `src/app/api/admin/gallery/[id]/items/[itemId]/route.ts`
- `src/app/api/admin/products/[id]/images/[imageId]/route.ts`
- `src/app/api/admin/media/[id]/route.ts`
- `src/app/api/admin/inquiries/contact/[id]/route.ts`
- `src/app/api/admin/inquiries/cart/[id]/route.ts`
- `src/app/api/admin/inquiries/samples/[id]/route.ts`
- `src/app/api/admin/inquiries/product-requests/[id]/route.ts`

### Verification
```bash
# Type-check all route files
pnpm tsc --noEmit

# Build check
pnpm build
```

---

## 5. Phase 3 — Quality Infrastructure (tsconfig, Prettier, Hooks)

**Goal:** Enforce code quality at the tooling level before it reaches PR.

### 3a — Harden `tsconfig.json`

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\tsconfig.json`

**Changes:**
```json
{
  "compilerOptions": {
    // ... existing ...
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Note:** `noUncheckedIndexedAccess` will likely flag existing code. Fix those issues or use `// @ts-ignore` with a TODO on each. `noUnusedLocals`/`noUnusedParameters` — may need to prefix unused params with `_`.

### 3b — Add Prettier

**New file:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

**New file:** `.prettierignore`

```
node_modules
.next
out
build
coverage
pnpm-lock.yaml
.gitignore
.env*
```

**Install:**
```bash
pnpm add -D prettier eslint-config-prettier
```

**Update `eslint.config.mjs`** to add `eslint-config-prettier` at the end of the config array.

### 3c — Add Husky + lint-staged

```bash
pnpm add -D husky lint-staged
pnpm husky init
```

**.husky/pre-commit:**
```bash
pnpm lint-staged
```

**`package.json` addition:**
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### 3d — Add `.editorconfig`

**New file:** `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### 3e — Add `eslint-plugin-testing-library` + `eslint-plugin-vitest`

```bash
pnpm add -D eslint-plugin-testing-library eslint-plugin-vitest
```

Update `eslint.config.mjs` to add these plugins.

### Files Touched/Created
- `tsconfig.json`
- `.prettierrc`
- `.prettierignore`
- `.husky/pre-commit`
- `.husky/_/` (auto-generated by `pnpm husky init`)
- `.editorconfig`
- `eslint.config.mjs`
- `package.json`

### Verification
```bash
pnpm lint
pnpm tsc --noEmit
pnpm prettier --check src/
```

---

## 6. Phase 4 — Database Schema Optimization (Indexes + Types)

**Goal:** Add missing indexes, convert string-stored JSON to native PostgreSQL JSONB, convert free-text strings to enums.

### 4a — Add `@@index` directives

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\prisma\schema.prisma`

**Indexes to add:**

| Model | Index | Reason |
|-------|-------|--------|
| `AdminSession` | `@@index([adminId])` | Lookup sessions by admin |
| `AdminAuditLog` | `@@index([adminId])` | Filter audit trail |
| `GalleryItem` | `@@index([galleryId])` | Load items per gallery |
| `GalleryItem` | `@@index([galleryId, order])` | Ordered items query |
| `GalleryItem` | `@@index([section])` | Section-filtered queries |
| `Category` | `@@index([parentId])` | Tree hierarchy queries |
| `Category` | `@@index([imageId])` | Join to media |
| `ProductImage` | `@@index([productId])` | Load images per product |
| `ProductImage` | `@@index([productId, isPrimary])` | Find primary image |
| `ProductImage` | `@@index([mediaFileId])` | Join to media |
| `TeamMember` | `@@index([photoId])` | Join to media |
| `TeamContact` | `@@index([memberId])` | Load contacts per member |
| `Certificate` | `@@index([fileId])` | Join to media |
| `Certificate` | `@@index([logoFileId])` | Join to media |
| `OtpCode` | `@@index([identifier, type])` | OTP lookup by email/phone + type |
| `ContactSubmission` | `@@index([isRead])` | Unread count queries |
| `CartInquiry` | `@@index([isRead])` | Unread count queries |
| `SampleRequest` | `@@index([isRead])` | Unread count queries |
| `ProductRequest` | `@@index([isRead])` | Unread count queries |
| `Product` | `@@index([isActive, isFeatured, order])` | Product listing queries |
| `CategoryTranslation` | `@@index([locale])` | Query by locale alone |
| `ProductTranslation` | `@@index([locale])` | Query by locale alone |
| `CertificateTranslation` | `@@index([locale])` | Query by locale alone |

### 4b — Convert string-stored JSON to Prisma `Json`

| Model | Field | Current Type | New Type |
|-------|-------|-------------|----------|
| `AdminAuditLog` | `detail` | `String?` | `Json?` |
| `SiteSetting` | `value` | `String` | `Json` (update seed + references) |
| `ContactSetting` | `businessHours` | `String?` | `Json?` |
| `CartInquiry` | `itemsJson` | `String` | `Json` |

**Impact on code:**
- `AdminAuditLog.detail` — stored as JSON string, can use `Json?` directly
- `SiteSetting.value` — accessed in settings routes, need to update getters/setters
- `ContactSetting.businessHours` — check usage in contact settings
- `CartInquiry.itemsJson` — parse/stringify calls can be replaced with direct JSON access

### 4c — Convert free-text strings to enums

**New Prisma enums:**

```prisma
enum OrganicType {
  EU
  NOP
  COR
  JAS
  BIO_SUISSE
}

enum ConventionalType {
  NORMAL
  EU_LIMITS
}

enum ShippingMethod {
  BUYER
  CALENDULA
}
```

**Field changes:**
| Model | Field | Current Type | New Type |
|-------|-------|-------------|----------|
| `Product` | `organicType` | `String?` | `OrganicType?` |
| `Product` | `conventionalType` | `String?` | `ConventionalType?` |
| `SampleRequest` | `shippingBy` | `String` | `ShippingMethod` |

**Impact on code:**
- Admin product form (create/update) — need to update form fields to use enum values
- Sample request form — update to use enum
- Seed files — update to use enum values

### 4d — Generate Prisma migration

```bash
pnpm prisma generate
pnpm prisma migrate dev --name add_indexes_json_types_enums
```

### Files Touched
- `prisma/schema.prisma`
- `prisma/seed.ts` (if fields changed)
- Code that reads/writes affected fields

### Verification
```bash
pnpm prisma validate
pnpm tsc --noEmit
pnpm build
```

---

## 7. Phase 5 — Accessibility (WCAG 2.2 AA)

**Goal:** Fix all WCAG violations found in audit, improve keyboard navigation and screen reader support.

### 5a — Un-gate focus-visible outlines (globals.css)

**File:** `src/app/globals.css`

**Current (lines ~2120-2127):**
```css
@media (prefers-reduced-motion: no-preference) {
  a:focus-visible,
  button:focus-visible,
  [role="button"]:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }
}
```

**Change:** Remove the `prefers-reduced-motion` wrapper. Focus indicators must ALWAYS render. Only the transition/animation of the outline should respect reduced motion.

```css
a:focus-visible,
button:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

### 5b — Fix Template1Carousel keyboard access

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\components\public\carousels\Template1Carousel.tsx`

**Changes:**
1. Add `tabIndex={0}` and `role="button"` to each carousel card
2. Add `onKeyDown` handler for `Enter` and `Space` to trigger click
3. Add `aria-label` to the carousel container
4. Add arrow key navigation (Left/Right) on the carousel

```tsx
// Per card element
<div
  tabIndex={0}
  role="button"
  aria-label={item.title || `Slide ${index + 1}`}
  onClick={() => handleCardClick(item)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(item);
    }
  }}
>
```

### 5c — Add focus traps to overlays

**Files:**
- Mobile menu (Header.tsx)
- CartDrawer.tsx
- Lightbox (GalleryCarousel.tsx)
- ProductDetailModal.tsx

**Approach:** Use `@radix-ui/react-focus-scope` (already available via Radix) or implement a lightweight focus trap.

```bash
# Check if already available
pnpm ls @radix-ui/react-focus-scope
# If not:
pnpm add @radix-ui/react-focus-scope
```

**Pattern:**
```tsx
import { FocusScope } from '@radix-ui/react-focus-scope';

<FocusScope trapped loop>
  <div role="dialog" aria-modal="true">
    {/* overlay content */}
  </div>
</FocusScope>
```

### 5d — Add dialog roles to CartDrawer

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\__tests__\CartDrawer.tsx`

Wait — the source component. Let me find it:

**File:** `src/components/public/shared/CartDrawer.tsx` (or similar location)

**Change:** Add `role="dialog"`, `aria-modal="true"`, and `aria-label` to the drawer panel.

### 5e — Improve alt text fallback in GalleryCarousel

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\components\public\carousels\GalleryCarousel.tsx`

**Change:** Replace `item.title || 'Gallery image'` with a more descriptive fallback, or use `aria-labelledby` pointing to the title element.

### 5f — Other fixes

| Location | Fix |
|----------|-----|
| Header.tsx | Add `aria-current="page"` to active nav link |
| ProductDetailModal.tsx | Add `aria-label="Breadcrumb"` to `<nav>` |
| ThemeToggle.tsx | Replace hydration placeholder `<div>` with rendered button + `aria-hidden` |
| useCardTilt.ts | Add `prefers-reduced-motion: reduce` check; add touch event support; throttle mousemove |
| LanguageSwitcher.tsx | Add `aria-label` to each locale menu item |

### Files Touched
- `src/app/globals.css`
- `src/components/public/carousels/Template1Carousel.tsx`
- `src/components/public/Header.tsx`
- `src/components/public/shared/CartDrawer.tsx`
- `src/components/public/carousels/GalleryCarousel.tsx`
- `src/components/public/ProductDetailModal.tsx`
- `src/components/public/LanguageSwitcher.tsx`
- `src/components/public/ThemeToggle.tsx`
- `src/hooks/useCardTilt.ts`

### Verification
```bash
# Build check
pnpm build

# Manual testing: keyboard navigation through all overlays
# Manual testing: screen reader (NVDA/VoiceOver) on carousels and forms
# Manual testing: prefers-reduced-motion + focus-visible
```

---

## 8. Phase 6 — i18n Completeness & RTL Fixes

**Goal:** Close all translation gaps, fix RTL handling consistency, improve locale switching.

### 6a — Add missing Arabic keys

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\messages\ar.json`

**Missing keys (10 total):**
```json
{
  "productDetail": {
    "cutForm": {
      "whole": "كامل",
      "cutSifted": "مقطع ومنخل",
      "powder": "مسحوق",
      "teaCut": "مقطع للشاي",
      "granulated": "محبب"
    },
    "cert": {
      "eu_organic": "عضوي أوروبي",
      "usda": "عضوي أمريكي (USDA)",
      "iso22000": "آيزو 22000",
      "haccp": "نظام الهاسب",
      "gmp": "ممارسات التصنيع الجيدة"
    }
  }
}
```

### 6b — Fix RTL check in Header.tsx

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\components\public\Header.tsx`

**Change (line ~19):**
```tsx
// Before:
const isRtl = locale === 'ar';
// After:
import { isRtlLocale } from '@/i18n/routing';
const isRtl = isRtlLocale(locale as Locale);
```

### 6c — Improve locale switching (soft navigation)

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\components\public\LanguageSwitcher.tsx`

**Current:** `window.location.reload()` — hard reload, loses client state.

**Proposed approach:**
- Wrap with `NextIntlClientProvider` at the app level (already done in root layout)
- Use `useRouter()` from `next-intl` + state management to avoid full reload
- Or keep cookie + reload but save/restore scroll position

### 6d — Audit remaining locales for completeness

```bash
# Run the existing locale consistency check
node scripts/check-locale-consistency.mjs
```

### Files Touched
- `src/messages/ar.json`
- `src/components/public/Header.tsx`
- `src/components/public/LanguageSwitcher.tsx` (optional)

### Verification
```bash
node scripts/check-locale-consistency.mjs
# Should report 0 missing keys
pnpm build
```

---

## 9. Phase 7 — Testing Expansion

**Goal:** Add API integration tests, increase component coverage, add E2E tests for critical flows.

### 7a — Add Vitest config for API tests

**File:** `vitest.config.ts` — add `supertest` for API route testing.

```bash
pnpm add -D supertest @types/supertest
```

Create `src/__tests__/api/` directory with test files mirroring the API structure.

### 7b — Critical API test cases

| Test | File | What It Covers |
|------|------|----------------|
| Public contact form | `src/__tests__/api/public/contact.test.ts` | Validation, rate limiting, submission |
| Public product listing | `src/__tests__/api/public/products.test.ts` | Pagination, filtering, locale |
| Admin auth guard | `src/__tests__/api/admin/auth-guard.test.ts` | 401 when unauthenticated |
| Admin CRUD — products | `src/__tests__/api/admin/products.test.ts` | Create, update, Zod validation |
| Admin reorder validation | `src/__tests__/api/admin/reorder-validation.test.ts` | Tests the new Zod schemas for reorder endpoints |

### 7c — Add component tests for untested components

| Component | Location |
|-----------|----------|
| Template1Carousel | (keyboard a11y tested) |
| Footer | (i18n + image rendering) |
| ProductDetailModal | (i18n, RTL, modal behavior) |
| GalleryCarousel | (lightbox, video/image switching) |

### 7d — Add Playwright E2E tests to CI

**File:** `.github/workflows/ci.yml` — add E2E job:

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm prisma generate
    - run: cd e2e && npx playwright install --with-deps chromium
    - run: cd e2e && npx playwright test
```

### Files Touched/Created
- `vitest.config.ts` (may need updated includes)
- `src/__tests__/api/` (new directory + test files)
- `.github/workflows/ci.yml`
- Various component test files

### Verification
```bash
pnpm test           # Vitest
cd e2e && npx playwright test && cd ..
```

---

## 10. Phase 8 — CI/CD & Polish

**Goal:** Final hardening, CSP improvements, documentation.

### 8a — Implement nonce-based CSP

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\next.config.ts`

**Current (noted as TODO):** `'unsafe-inline'` in `script-src`.

**Approach:**
1. Add `crypto` module to generate nonce per request
2. Update `async headers()` to compute nonce and set `script-src 'nonce-{nonce}'`
3. Pass nonce to components via React context or as prop to root layout
4. Update any inline scripts to use `nonce={nonce}`

### 8b — Narrow proxy matcher

**File:** `E:\Calendula Herbs Website Project\calendula-herbs\src\proxy.ts`

**Current:** Broad matcher catches all routes including static files.

**Change:** Export a `config.matcher` to exclude static assets:

```typescript
export const config = {
  matcher: ['/((?!_next/static|_vercel|static|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js)$).*)'],
};
```

### 8c — Enable coverage reporting

**File:** `vitest.config.ts`

```typescript
coverage: {
  enabled: true,
  reporter: ['text', 'lcov', 'html'],
  // ... existing thresholds
}
```

Add Codecov or Coveralls step to CI.

### 8d — Classify/resolve 78 TODO/FIXME markers

Run a sweep of all `TODO|FIXME|HACK|XXX` markers in `src/` and classify:

| Type | Action |
|------|--------|
| Stale/completed TODOs | Remove |
| Valid feature TODOs | Keep, possibly link to GitHub issue |
| Security TODOs | Prioritize |
| Performance TODOs | Assess and address or defer |

### 8e — Add `.npmrc`

**New file:** `.npmrc`

```
auto-install-peers=true
strict-peer-dependencies=false
```

### 8f — Final verification sweep

```bash
pnpm lint
pnpm tsc --noEmit
pnpm test
cd e2e && npx playwright test && cd ..
pnpm build
```

### Files Touched
- `next.config.ts`
- `src/proxy.ts`
- `vitest.config.ts`
- `.github/workflows/ci.yml`
- `.npmrc` (new)
- Various source files (TODO cleanup)

---

## 11. Skills Used

This plan exercises skills from the Antigravity IDE ecosystem:

| Skill | Phase | How Used |
|-------|-------|----------|
| `clean-code-guard` | All | Review every edit before commit |
| `database-schema-validator` | 4 | Validate schema changes, index recommendations |
| `fixing-accessibility` | 5 | Audit + fix WCAG violations |
| `fixing-metadata` | 5 | aria attributes, SEO implications |
| `fixing-motion-performance` | 5 | Reduced-motion fixes, useCardTilt optimization |
| `senior-qa` / `tdd-guide` | 7 | Generate API and component tests |
| `ci-cd-pipeline-builder` | 8 | Update CI workflow for E2E |
| `performance-profiler` | 4 | Index impact analysis |
| `env-secrets-manager` | 1 | `.env` security audit |
| `dependency-auditor` | 3 | Prettier/Husky dependency additions |
| `code-reviewer` | All | Final review pass |
| `api-design-reviewer` | 2 | Validate Zod schema patterns |

---

## 12. Full File Inventory

### Files Created
- `.quality-manifest/HEAD-before.txt`
- `.quality-manifest/last-change.txt`
- `.quality-manifest/changes.jsonl`
- `.quality-manifest/revert-to.sh`
- `.quality-manifest/phase-summary-*.md`
- `.prettierrc`
- `.prettierignore`
- `.husky/pre-commit`
- `.editorconfig`
- `.npmrc`
- `prisma/migrations/*_add_indexes_json_types_enums/` (auto-generated)
- `src/__tests__/api/public/contact.test.ts`
- `src/__tests__/api/public/products.test.ts`
- `src/__tests__/api/admin/auth-guard.test.ts`
- `src/__tests__/api/admin/products.test.ts`
- `src/__tests__/api/admin/reorder-validation.test.ts`

### Files Modified
- `.gitignore`
- `.env` (removed from tracking)
- `tsconfig.json`
- `eslint.config.mjs`
- `package.json`
- `prisma/schema.prisma`
- `prisma/seed.ts` (if needed)
- `next.config.ts`
- `src/proxy.ts`
- `vitest.config.ts`
- `.github/workflows/ci.yml`
- `src/app/globals.css`
- `src/components/public/Header.tsx`
- `src/components/public/shared/CartDrawer.tsx`
- `src/components/public/ProductDetailModal.tsx`
- `src/components/public/LanguageSwitcher.tsx`
- `src/components/public/ThemeToggle.tsx`
- `src/components/public/carousels/Template1Carousel.tsx`
- `src/components/public/carousels/GalleryCarousel.tsx`
- `src/hooks/useCardTilt.ts`
- `src/messages/ar.json`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/gallery/route.ts`
- `src/app/api/admin/certificates/route.ts`
- `src/app/api/admin/plugins/route.ts`
- `src/app/api/admin/products/[id]/images/route.ts`
- `src/app/api/admin/gallery/[id]/items/route.ts`
- `src/app/api/admin/gallery/[id]/items/[itemId]/route.ts`
- `src/app/api/admin/products/[id]/images/[imageId]/route.ts`
- `src/app/api/admin/media/[id]/route.ts`
- `src/app/api/admin/inquiries/contact/[id]/route.ts`
- `src/app/api/admin/inquiries/cart/[id]/route.ts`
- `src/app/api/admin/inquiries/samples/[id]/route.ts`
- `src/app/api/admin/inquiries/product-requests/[id]/route.ts`

---

## 13. Appendices

### A. Quick Verification Commands

```bash
# Run after any phase
pnpm lint              # ESLint
pnpm tsc --noEmit      # TypeScript check
pnpm test              # Vitest
pnpm build             # Production build
```

### B. Emergency Rollback

```bash
# Not working? Undo everything.
git checkout quality-init-baseline
git branch -f main
```

### C. Change Log Format (changes.jsonl)

```json
{
  "ts": "2026-07-18T10:30:00Z",
  "phase": "1",
  "file": "src/app/api/admin/categories/route.ts",
  "reason": "Add Zod validation for PATCH reorder endpoint",
  "before_hash": "abc123",
  "after_hash": "def456"
}
```

### D. Estimated Effort

| Phase | Description | Est. Files | Est. Time |
|-------|-------------|-----------|-----------|
| 0 | Traceability setup | 3 | 10 min |
| 1 | Secrets & security | 3 | 20 min |
| 2 | API validation (13 routes) | 13 | 60 min |
| 3 | Quality infra | 8 | 45 min |
| 4 | Schema optimization | 2 + migration | 90 min |
| 5 | Accessibility | 10 | 120 min |
| 6 | i18n & RTL | 3 | 30 min |
| 7 | Testing expansion | 10+ | 120 min |
| 8 | CI/CD & polish | 6 | 60 min |
| **Total** | | **~58** | **~9 hrs** |
