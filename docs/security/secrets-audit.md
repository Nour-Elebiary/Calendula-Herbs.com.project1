# Secrets Audit Report

**Date:** 2026-07-10
**Scope:** Calendula Herbs project repository
**Status:** Findings documented — remediation deferred

---

## 1. Git History Secret Leak

### Finding 🔴

Live credentials were committed to git history in the following commits:

| Commit | Secrets Found |
|--------|---------------|
| `7d46fa8` | `CLOUDINARY_API_SECRET` |
| `dd25c61` | `RESEND_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `DATABASE_URL`, `NEXTAUTH_SECRET` |
| `a9f3714` | `CLOUDINARY_API_SECRET` |

### Impact

Any actor with access to the repository's full git history (including clones, forks, or CI caches) can extract these credentials.

### Remediation Required

1. **Rotate all exposed credentials** via their respective dashboards:
   - Cloudinary: regenerate API Secret
   - Resend: regenerate API Key
   - Upstash: regenerate REST Token
   - Supabase: rotate database password
   - Generate a new `NEXTAUTH_SECRET`
2. **Purge from git history** using BFG Repo-Cleaner or `git filter-repo`
3. **Force-push** the rewritten history to remote
4. **Invalidate** all CI caches that may contain the old commits
5. **Notify** any collaborators to re-clone from the cleaned history

### Current Status

- `.env` is correctly gitignored (confirmed: `git ls-files .env` returns empty)
- `.gitignore` pattern `.env*` protects against future leaks ✅
- Credential rotation and history purge **deferred** — see comebacks-plan.md Phase 1

---

## 2. Runtime Env Var Validation

### Changes Made ✅

- Created `src/lib/env.ts` with `getRequiredEnvVar()` and `getOptionalEnvVar()`
- Updated `src/lib/rate-limit.ts` — replaces `!` assertions with `getRequiredEnvVar`
- Updated `src/lib/email.ts` — validates `RESEND_API_KEY` on first access
- Updated `src/lib/cloudinary.ts` — validates `CLOUDINARY_API_SECRET` at module init

### Files Not Yet Updated

- `src/lib/auth.ts` — uses `process.env.AUTH_SECRET`, `process.env.NEXTAUTH_URL` (via NextAuth internals — validated by NextAuth)
- `src/app/api/admin/media/sign/route.ts` — uses `process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (public var, safe)
- `src/app/(public)/faq/page.tsx` — uses `NEXT_PUBLIC_SITE_URL` (public var, safe)
- `src/app/robots.ts` — uses `NEXT_PUBLIC_APP_URL` (public var, safe)
- `src/app/sitemap.ts` — uses `NEXT_PUBLIC_APP_URL` (public var, safe)

---

## 3. CSP Hardening

### Changes Made ⚠️

- Added `TODO` comment noting that full nonce-based CSP requires middleware-level implementation
- Kept `'unsafe-inline'` for production as Next.js needs it for runtime chunk loading
- Existing CSP covers:
  - `default-src 'self'` ✅
  - `style-src` with `'unsafe-inline'` + Google Fonts ✅
  - `img-src` whitelisting Cloudinary, Supabase, YouTube ✅
  - `frame-src` whitelisting YouTube, Google Drive, Facebook ✅
  - `connect-src` whitelisting Supabase, Resend, Cloudinary, Upstash ✅
  - `form-action 'self'` ✅
  - `frame-ancestors 'none'` ✅
  - `base-uri 'self'` ✅

### Future Work

Implement nonce-based CSP via middleware:
1. Generate a nonce per-request in middleware
2. Pass nonce to all `<script>` tags via `dangerouslySetInnerHTML`
3. Use `next/script` with `nonce` prop for Next.js scripts
4. Remove `'unsafe-inline'` from production CSP

---

## 4. Security Headers Audit

| Header | Value | Status |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ 2-year HSTS |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `X-XSS-Protection` | `1; mode=block` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |
| `Content-Security-Policy` | See section 3 | ⚠️ Partial |

---

## 5. Admin Auth Hardening

| Control | Status |
|---------|--------|
| Rate-limited login (5 attempts → 15 min lockout) | ✅ |
| JWT with 8h expiry | ✅ |
| Per-session revocation via `AdminSession` table | ✅ |
| IP/UA/geo capture on login | ✅ |
| Proxy-based auth guard (`src/proxy.ts`) | ✅ |
| Server-side auth check in API routes (`requireAdmin()`) | ✅ |
| CSP form-action self | ✅ |

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| 🔴 Critical | 1 | Git history purge + credential rotation (deferred) |
| 🟡 High | 0 | — |
| 🟢 Moderate | 1 | CSP nonce implementation (future) |
