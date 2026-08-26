# Comprehensive Changelog & Configuration Guide (Changes Since July 4th, 2026)

This document provides the complete record of all **features, environment variables, settings, database schemas, security configurations, and code modifications** added to **`calendula-herbs`** since **July 4th, 2026**.

---

## 1. Environment Variables & Keys (Railway Dashboard)

When updating your deployment on **Railway** (or `.env.local`), verify the following configuration variables:

### 1.1 Core Domain & Application Settings
| Variable | Value | Notes / When Added |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://calendula-herbs.com` | **Updated**: Ensures canonical URLs and sitemaps match your registered domain. |
| `NEXT_PUBLIC_APP_URL` | `https://calendula-herbs.com` | Base URL for server-side link generation. |
| `NEXTAUTH_URL` | `https://calendula-herbs.com` | NextAuth session URL. |
| `NEXTAUTH_SECRET` | *(32-byte secret)* | Session JWT encryption key. |

### 1.2 Multi-Search Engine Webmaster Verification (NEW)
*Injected into `<head>` via `src/app/layout.tsx` (never hard-coded in Git):*

| Variable | Target Platform | How to obtain |
| :--- | :--- | :--- |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console | GSC → Settings → Ownership → HTML tag method (copy `content="..."`) |
| `BING_SITE_VERIFICATION` | Bing & Microsoft Copilot | Bing WMT → Add site → HTML meta tag method |
| `YANDEX_VERIFICATION` | Yandex Webmaster (Russia/CIS) | Yandex WM → Site validation → Meta tag method |
| `BAIDU_SITE_VERIFICATION` | Baidu Ziyuan (百度站长平台) | Baidu Ziyuan → Site management → Meta tag method |
| `NAVER_SITE_VERIFICATION` | Naver Search Advisor (Korea) | Naver Search Advisor → Site verification → HTML tag |
| `HAOSOU_SITE_VERIFICATION` | 360 Search / Haosou (China #2) | 360 Zhanzhang → Meta tag verification |
| `SOGOU_SITE_VERIFICATION` | Sogou Search (China / WeChat) | Sogou Zhanzhang → Meta tag verification |
| `SEZNAM_SITE_VERIFICATION` | Seznam.cz (Czech Republic) | Seznam Webmaster → Verification meta tag |
| `PINTEREST_SITE_VERIFICATION` | Pinterest Business | Pinterest → Settings → Claim Website → HTML tag |

### 1.3 Error Monitoring & Telemetry (Sentry) (NEW)
| Variable | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://27a7b9577764600f09945cc2fe66b2ea7@o4518243603087836.ingest.de.sentry.io/4518243670845456` | Client-side error tracking. |
| `SENTRY_DSN` | `https://27a7b9577764600f09945cc2fe66b2ea7@o4518243603087836.ingest.de.sentry.io/4518243670845456` | Server-side error tracking. |
| `SENTRY_ORG` | `calendula-herbs-spices-for-exp` | Sentry organization slug. |
| `SENTRY_PROJECT` | `calendula-herbs` | Sentry project slug. |
| `SENTRY_AUTH_TOKEN` | `sntrys_...` | For automated sourcemap uploads during `next build`. |

### 1.4 Database, Cloudinary, Email & Rate Limiting
| Variable | Value / Notes |
| :--- | :--- |
| `DATABASE_URL` | Supabase IPv4 transaction pooler connection (port `6543`) with `pgbouncer=true`. |
| `DIRECT_URL` | Supabase direct connection (port `5432`) for Prisma migrations. |
| `CLOUDINARY_CLOUD_NAME` | `dcukpuftg` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `RESEND_API_KEY` | Resend transactional email API key |
| `RESEND_FROM_EMAIL` | `noreply@calendula-herbs.com` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |

---

## 2. Major Features & Systems Added Since July 4th, 2026

### 2.1 Multi-Lingual & Internationalization (i18n) System
* **Framework**: Integrated `next-intl` (request-based routing in `src/i18n/`).
* **17 Supported Locales**:
  * English (`en`), Arabic (`ar` - RTL), German (`de`), French (`fr`), Spanish (`es`), Italian (`it`), Dutch (`nl`), Portuguese (`pt-BR`), Russian (`ru`), Turkish (`tr`), Ukrainian (`uk`), Greek (`el`), Bulgarian (`bg`), Chinese (`zh-CN`), Japanese (`ja`), Korean (`ko`), Hindi (`hi`).
* **RTL Engine**: Automatic right-to-left layout and typography switching via `isRtlLocale()` and Arabic Google font (`Noto_Naskh_Arabic`).
* **Interactive Language Switcher**: Added [`src/components/public/LanguageSwitcher.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/public/LanguageSwitcher.tsx) with native language names and search.
* **Translation Dictionaries**: Added full message dictionaries in `src/messages/*.json` covering navigation, hero sections, product attributes, botanical specs, forms, terms, and privacy policies.

### 2.2 Dual Theme System (Dark Mode & Light Mode)
* **Design Token Overhaul**: Converted all colors in `src/app/globals.css` to CSS custom property tokens (`--color-bg-void`, `--color-bg-surface`, `--color-text-primary`, `--color-accent`, etc.).
* **Zero-Flicker Script**: Added inline head script in `layout.tsx` to detect system preference and load `calendula-theme` from `localStorage` before paint.
* **Theme Components**:
  * [`src/components/public/ThemeProvider.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/public/ThemeProvider.tsx)
  * [`src/components/public/ThemeToggle.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/public/ThemeToggle.tsx)

### 2.3 Interactive Media, Video & Watermark System
* **Hero & About YouTube Videos**: Replaced static SVG placeholders with responsive video players ([`src/components/public/home/HeroSection.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/public/home/HeroSection.tsx) & About page).
* **Watermark Opacity Controller**: Added configurable watermark background overlay in `src/app/(public)/layout.tsx` driven by `SiteSetting` (`watermark_enabled`, `watermark_logo_url`, `watermark_opacity`).
* **Interactive Map**: Updated map component with custom marker pin and responsive container styling.

### 2.4 Carousel & Lightbox Gallery System
* **Carousel Architecture**: Created 3 reusable template carousels:
  * `src/components/public/carousels/Template1Carousel.tsx`
  * `src/components/public/carousels/Template2Carousel.tsx`
  * `src/components/public/carousels/Template3Carousel.tsx`
  * `src/components/public/carousels/Lightbox.tsx`
* **Certificates**: Added interactive certificate grid with PDF preview dialog and fallback image handling ([`src/components/public/CertPreviewImage.tsx`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/src/components/public/CertPreviewImage.tsx)).

### 2.5 Google Search Console, Multi-Search Engine SEO & AEO (Added Today)
* **Sitemap Overhaul (`src/app/sitemap.ts`)**:
  * Rebuilt with canonical base URL `https://calendula-herbs.com`.
  * Multi-language `alternates` (`hreflang` for `en`, `ar`) across all routes.
  * Product image sitemaps (`images: [imageUrl]`) for Google/Yandex/Baidu Images.
  * Corrected `changeFrequency` and priority weighting.
  * **Fixes the GSC HTTP 429 & HTML response errors**.
* **Robots Configuration (`src/app/robots.ts`)**:
  * Per-engine rules for **Googlebot**, **Baiduspider**, **YandexBot**, **Yeti** (Naver), **SeznamBot**, **HaosouSpider** (360), **Sogou**.
  * Blocked 13 AI scraper bots (`GPTBot`, `CCBot`, `ClaudeBot`, `PerplexityBot`, etc.).
  * Disallowed `/admin/` and `/api/`.
  * Yandex canonical `host` directive.
* **AEO & Structured Data (`src/app/layout.tsx`)**:
  * Multilingual `Organization` Schema.
  * `WebSite` Schema with SearchAction.
  * `FAQPage` Schema with 6 factual Q&As optimized for AI answer engines (ChatGPT, Gemini, Perplexity, Copilot).
  * `ProductJsonLd.tsx` and `BreadcrumbJsonLd.tsx` reusable components.
* **Verification Files**:
  * `public/BingSiteAuth.xml`
  * `public/baidu_verify_RENAME_ME.html`
* **Documentation**:
  * `docs/WEBMASTER_REGISTRATION.md`: Complete step-by-step registration manual for all search engine portals.

### 2.6 Security, CSP & Monitoring
* **Content Security Policy (`next.config.ts`)**:
  * Added Yandex.Metrica (`https://mc.yandex.ru`, `https://mc.yandex.com`) and Baidu Tongji (`https://hm.baidu.com`, `https://sp1.baidu.com`) to `script-src` and `connect-src`.
  * Retained strict security headers (`Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `frame-ancestors: 'none'`).
* **API Validation & Helpers**:
  * `src/lib/route-helpers.ts`: Standardized error handling, Zod validation, and session auth guards across all admin and public API endpoints.
  * `src/app/api/health/route.ts`: Uptime check endpoint for monitoring.
* **Automated Testing**:
  * Expanded Vitest test suite with 45+ unit test files across components, authentication, rate-limiting, and API endpoints.

---

## 3. Quick Checklist for Updating Production / Railway

1. **Set Environment Variables in Railway**:
   - `NEXT_PUBLIC_SITE_URL=https://calendula-herbs.com`
   - `NEXTAUTH_URL=https://calendula-herbs.com`
   - Any webmaster verification codes obtained from search engines (`GOOGLE_SITE_VERIFICATION`, etc.).
2. **Review & Push Git Commits**:
   - Push your updated code to your GitHub repository connected to Railway.
3. **Verify Deployment**:
   - `https://calendula-herbs.com/robots.txt` loads properly with crawler rules.
   - `https://calendula-herbs.com/sitemap.xml` renders valid XML.
4. **Submit in Search Consoles**:
   - In Google Search Console, submit sitemap: `https://calendula-herbs.com/sitemap.xml`.
   - Complete other engine registrations via [`docs/WEBMASTER_REGISTRATION.md`](file:///e:/Calendula%20Herbs%20Website%20Project/calendula-herbs/docs/WEBMASTER_REGISTRATION.md).
