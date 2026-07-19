# Middleware Architecture

**Date:** 2026-07-10
**Applies to:** Next.js 16.2.9 App Router

---

## Overview

The app uses two middleware files that execute in sequence on matching routes:

| File | Purpose | Matcher |
|------|---------|---------|
| `src/middleware.ts` | next-intl locale negotiation | `/((?!_next\|_vercel\|api\|admin).*)` |
| `src/proxy.ts` | NextAuth auth guard | `/admin/:path*`, `/api/admin/:path*` |

---

## Execution Order

In Next.js, middleware files are executed bottom-up by their position in the `src/` directory. Custom files in `src/` run after the built-in `next-intl/middleware` wrapper:

1. Request arrives at the server
2. `src/middleware.ts` (next-intl) runs first — sets locale on request
3. `src/proxy.ts` (NextAuth) runs next — checks authentication
4. Route handler or page component renders

---

## Route Flow

### Public pages (`/`, `/products`, `/about`, `/contact`, `/faq`, etc.)

```
Request → middleware.ts (next-intl: sets locale, cookie, redirects) → Page renders
```

- Only `middleware.ts` runs
- Locale is resolved via cookie → default (`'en'`)
- `proxy.ts` does NOT match these routes

### Admin pages (`/admin/login`, `/admin/dashboard`, etc.)

```
Request → proxy.ts (NextAuth: checks session, redirects if unauthenticated) → Page renders
```

- Only `proxy.ts` runs
- `/admin` excluded from `middleware.ts` matcher since admin UI is English-only
- No locale negotiation needed for admin pages

### Admin API routes (`/api/admin/products`, etc.)

```
Request → proxy.ts (NextAuth: returns 401 if unauthenticated) → Route handler
```

- Only `proxy.ts` runs
- `/api/*` excluded from `middleware.ts` matcher
- Auth guard returns JSON 401 for unauthorized requests

### Public API routes (`/api/public/contact`, etc.)

```
Request → Route handler
```

- Neither middleware runs (excluded from both matchers)
- Rate limiting and validation handled in route handler

---

## Locale Resolution Flow

Defined in `src/i18n/request.ts`:

```
1. requestLocale (from middleware, browser Accept-Language)
   → Currently disabled (localeDetection: false)
2. NEXT_LOCALE cookie (explicit user choice via LanguageSwitcher)
3. Default: 'en'
```

### Priority After localeDetection Enabled

```
1. NEXT_LOCALE cookie (explicit user choice — highest priority)
2. Accept-Language header (browser preference, matched against supported locales)
3. Default: 'en'
```

---

## Key Design Decisions

### Why exclude `/admin` from next-intl middleware?

- Admin pages render in English — no translation needed
- Avoids unnecessary cookie reads/writes on admin requests
- Prevents potential locale conflicts with admin API routes
- One less middleware hop per admin page load

### Why use `localePrefix: 'never'`?

- Clean URLs without locale prefixes (e.g., `/products`, not `/en/products`)
- SEO-friendly — each page has exactly one canonical URL
- Locale is stored in cookie, not URL path

### Why use a separate proxy file for auth (not middleware.ts)?

- next-intl and NextAuth middleware have different concerns
- Separating them keeps each file focused and testable
- NextAuth v5 proxy pattern (`src/proxy.ts`) is recommended by the library

---

## Request Flow Diagram

```
┌─────────────┐
│  Request     │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Public page?     ┌──────────────┐
│ middleware.ts│ ──── yes ─────────► │ Set locale    │
│ (next-intl)  │                     │ Set cookie    │
└──────┬──────┘     Admin page?     └──────┬───────┘
       │              (no match)          │
       ▼                                   │
┌─────────────┐                           │
│  proxy.ts   │ ──── authenticated? ─────►│
│ (NextAuth)  │        │                  │
└──────┬──────┘        │ no               │
       │               ▼                  │
       │          ┌──────────┐            │
       │          │ Redirect │            │
       │          │ to login │            │
       │          └──────────┘            │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Route/Page   │                    │ Rendered    │
│ Handler      │                    │ Response    │
└─────────────┘                    └─────────────┘
```

---

## Verification Checklist

- [x] `/` → middleware.ts only → correct locale
- [x] `/products` → middleware.ts only → translated content
- [x] `/admin/login` → proxy.ts only → login form
- [x] `/admin/dashboard` → proxy.ts only → JWT session check
- [ ] `/api/admin/products` → proxy.ts only → JWT check, JSON response
- [ ] `/api/public/contact` → neither middleware → rate-limited endpoint
