# Exact Changes & Variables Checklist (To Apply on Railway & Code)

This document contains **ONLY the strictly new and modified items** you need to add or update for this release.

---

## 1. Railway Environment Variables

Comparing your active Railway dashboard against the latest codebase:

### 1.1 Variables to ADD to Railway
Add these new variables in **Railway → Your Service → Variables**:

```env
# ── Search Engine Webmaster Verification (NEW) ──────────────
# (You can add them now as empty, or fill them as you register on each platform)
GOOGLE_SITE_VERIFICATION=
BING_SITE_VERIFICATION=
YANDEX_VERIFICATION=
BAIDU_SITE_VERIFICATION=
NAVER_SITE_VERIFICATION=
HAOSOU_SITE_VERIFICATION=
SOGOU_SITE_VERIFICATION=
SEZNAM_SITE_VERIFICATION=
PINTEREST_SITE_VERIFICATION=

# ── Sentry Error Monitoring (NEW) ───────────────────────────
NEXT_PUBLIC_SENTRY_DSN=https://27a7b9577764600f09945cc2fe66b2ea7@o4518243603087836.ingest.de.sentry.io/4518243670845456
SENTRY_DSN=https://27a7b9577764600f09945cc2fe66b2ea7@o4518243603087836.ingest.de.sentry.io/4518243670845456
SENTRY_ORG=calendula-herbs-spices-for-exp
SENTRY_PROJECT=calendula-herbs
SENTRY_AUTH_TOKEN=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
```

### 1.2 Variables to VERIFY on Railway (Confirm their values)
Make sure these 3 existing variables are set to the hyphenated production domain:
* `NEXT_PUBLIC_SITE_URL` = `https://calendula-herbs.com`
* `NEXT_PUBLIC_APP_URL` = `https://calendula-herbs.com`
* `NEXTAUTH_URL` = `https://calendula-herbs.com`

---

## 2. Code Files Modified / Created in This Update

Here is the exact list of files changed/created in this release:

### 2.1 SEO & Sitemaps (Fixes GSC Errors)
* **[`src/app/robots.ts`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/app/robots.ts)** *(MODIFIED)*:
  * Added crawl rules for **Googlebot**, **Baiduspider**, **YandexBot**, **Yeti (Naver)**, **SeznamBot**, **HaosouSpider (360)**, and **Sogou**.
  * Blocked 13 AI scraping bots (`GPTBot`, `CCBot`, `anthropic-ai`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc.).
  * Disallowed `/admin/` and `/api/`.
  * Added Yandex canonical `host: 'https://calendula-herbs.com'`.
* **[`src/app/sitemap.ts`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/app/sitemap.ts)** *(MODIFIED)*:
  * Uses canonical `https://calendula-herbs.com`.
  * Added multi-language `alternates` (`hreflang` for `en`, `ar`) across all routes.
  * Added product image URLs (`images: [imageUrl]`) for Google/Yandex/Baidu Images.
  * Corrected `changeFrequency` and priority weighting.
  * **Fixes the GSC HTTP 429 & HTML format errors**.

### 2.2 AEO (Answer Engine Optimization) & Verification Tags
* **[`src/app/layout.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/app/layout.tsx)** *(MODIFIED)*:
  * Injects all 9 search engine verification meta tags from environment variables via `metadata.verification`.
  * Added multilingual `Organization` JSON-LD schema (with Arabic & Chinese alternate names).
  * Added `FAQPage` JSON-LD schema (6 factual Q&As optimized for AI answer engines like ChatGPT, Gemini, Perplexity, Copilot).
  * Added `WebSite` JSON-LD schema.
* **[`src/components/shared/ProductJsonLd.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/shared/ProductJsonLd.tsx)** *(NEW)*: Reusable Schema.org Product structured data.
* **[`src/components/shared/BreadcrumbJsonLd.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/shared/BreadcrumbJsonLd.tsx)** *(NEW)*: Reusable breadcrumb structured data.

### 2.3 Security & Content Security Policy (CSP)
* **[`next.config.ts`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/next.config.ts)** *(MODIFIED)*:
  * Updated CSP `script-src` and `connect-src` to allowlist Yandex.Metrica (`https://mc.yandex.ru`, `https://mc.yandex.com`) and Baidu Tongji (`https://hm.baidu.com`, `https://sp1.baidu.com`).
  * All strict security headers (`frame-ancestors: 'none'`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`) remain active.

### 2.4 Public Verification Files
* **[`public/BingSiteAuth.xml`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/public/BingSiteAuth.xml)** *(NEW)*: XML verification file for Bing Webmaster Tools & Copilot.
* **[`public/baidu_verify_RENAME_ME.html`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/public/baidu_verify_RENAME_ME.html)** *(NEW)*: Baidu HTML verification file stub.

### 2.5 Health Check & Documentation
* **[`src/app/api/health/route.ts`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/app/api/health/route.ts)** *(NEW)*: Uptime check endpoint.
* **[`docs/WEBMASTER_REGISTRATION.md`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/docs/WEBMASTER_REGISTRATION.md)** *(NEW)*: Complete step-by-step registration manual for all search engine portals.

---

## 3. Post-Deployment Action in Google Search Console

1. After deploying, go to **Google Search Console → Sitemaps**.
2. Submit: `https://calendula-herbs.com/sitemap.xml`.
3. The previous **429** and **HTML format** errors will resolve as Google crawls the new canonical sitemap.
