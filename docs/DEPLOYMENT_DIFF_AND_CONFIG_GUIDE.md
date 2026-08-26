# Production Deployment & Differences Guide (Local vs. Live GitHub)

This document gathers all **settings, environment variables, security headers, search engine keys, and code differences** between your current local version and the previous live/GitHub version.

---

## 1. Environment Variables & Keys (Railway Dashboard)

In **Railway Dashboard → Your App Service → Variables**, ensure the following variables are added or updated:

### 1.1 Core Domain & Auth (CRITICAL FOR SEO)
| Variable | Value to Set / Check | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://calendula-herbs.com` | **Changed from localhost / old domain**. Essential for canonical tags & sitemaps. |
| `NEXT_PUBLIC_APP_URL` | `https://calendula-herbs.com` | Match canonical production domain. |
| `NEXTAUTH_URL` | `https://calendula-herbs.com` | Prevents OAuth/session domain mismatches. |
| `NEXTAUTH_SECRET` | *(Existing 32-byte secret)* | Auth session encryption. |

### 1.2 Search Engine & Webmaster Verification (NEW)
*Fill these values in Railway as you register each platform (or leave empty until registered):*

| Variable | Source Webmaster Portal | Purpose |
| :--- | :--- | :--- |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console (HTML tag method) | Verifies ownership in Google Search Console |
| `BING_SITE_VERIFICATION` | Bing Webmaster Tools (HTML meta tag) | Verifies in Bing & Microsoft Copilot |
| `YANDEX_VERIFICATION` | Yandex Webmaster (Meta tag) | Verifies in Yandex (Russia/CIS) |
| `BAIDU_SITE_VERIFICATION` | Baidu Ziyuan (百度站长平台 - Meta tag) | Verifies in Baidu (China #1) |
| `NAVER_SITE_VERIFICATION` | Naver Search Advisor (HTML tag) | Verifies in Naver (South Korea) |
| `HAOSOU_SITE_VERIFICATION` | 360 Search / Haosou (Meta tag) | Verifies in 360 Search (China #2) |
| `SOGOU_SITE_VERIFICATION` | Sogou Webmaster (Meta tag) | Verifies in Sogou / WeChat Search (China #3) |
| `SEZNAM_SITE_VERIFICATION` | Seznam Webmaster (Meta tag) | Verifies in Seznam.cz (Czech Republic) |
| `PINTEREST_SITE_VERIFICATION` | Pinterest Business (Claim site tag) | Enables Rich Pins & site attribution |

### 1.3 Error Monitoring (Sentry)
| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://27a7b9577764600f09945cc2fe66b2ea7@o4518243603087836.ingest.de.sentry.io/4518243670845456` |
| `SENTRY_DSN` | `https://27a7b9577764600f09945cc2fe66b2ea7@o4518243603087836.ingest.de.sentry.io/4518243670845456` |
| `SENTRY_ORG` | `calendula-herbs-spices-for-exp` |
| `SENTRY_PROJECT` | `calendula-herbs` |
| `SENTRY_AUTH_TOKEN` | *(Organization token for source maps upload)* |

### 1.4 Database, Storage & Email Services
| Variable | Value / Status |
| :--- | :--- |
| `DATABASE_URL` | Supabase IPv4 pooler connection string (port `6543`) |
| `DIRECT_URL` | Supabase direct connection string (port `5432`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name (`dcukpuftg`) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `RESEND_API_KEY` | Resend transactional email API key |
| `RESEND_FROM_EMAIL` | `noreply@calendula-herbs.com` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token |

---

## 2. Code & Architecture Differences (Local vs GitHub Live)

### 2.1 Search Engine Optimization (SEO) & Sitemap Enhancements
* **`src/app/sitemap.ts`**:
  * **Canonical Domain**: Replaced fallback to `https://calendula-herbs.com`.
  * **Hreflang Alternates**: Added multi-language alternate URLs (`en`, `ar`) for all static pages, products, categories, and galleries.
  * **Image Sitemaps**: Added direct image URLs (`images: [imageUrl]`) to product sitemap nodes to enable Google/Yandex/Baidu image indexation.
  * **Priority Tuning**: Adjusted weights (Homepage: 1.0, Products: 0.9, Core Pages: 0.8, Categories/Certs: 0.7, Galleries: 0.6).
* **`src/app/robots.ts`**:
  * Added custom crawler rules for **Baidu** (`Baiduspider`), **Yandex** (`YandexBot`), **Naver** (`Yeti`), **Seznam** (`SeznamBot`), **360 Search** (`HaosouSpider`), and **Sogou** (`Sogou web spider`).
  * Explicitly disallowed `/admin/` and `/api/` from public crawling.
  * Blocked 13 AI scraping crawlers (`GPTBot`, `CCBot`, `anthropic-ai`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc.).
  * Added Yandex canonical host directive (`host: 'https://calendula-herbs.com'`).

### 2.2 Answer Engine Optimization (AEO) & Structured Data
* **`src/app/layout.tsx`**:
  * **Organization JSON-LD**: Added multilingual alternate names (`Calendula Herbs`, `كالنديولا هيربس للاستيراد والتصدير`, `金盏花草药进出口`), founding date, area served (`Worldwide`), `knowsAbout`, and offer catalog.
  * **FAQPage JSON-LD**: Added 6 structured Q&A entities (sourcing from Fayoum Egypt, global export capability, MOQ, organic certification, product range, samples) for AI assistants (Perplexity, ChatGPT, Copilot, Gemini).
  * **Verification Injection**: Added `metadata.verification` mapping dynamically to the 9 search engine environment variables.
* **`src/components/shared/ProductJsonLd.tsx`** *(NEW)*: Reusable Schema.org Product structured data.
* **`src/components/shared/BreadcrumbJsonLd.tsx`** *(NEW)*: Reusable BreadcrumbList structured data for SERP breadcrumb trails.

### 2.3 Security Headers & Content Security Policy (CSP)
* **`next.config.ts`**:
  * Updated `script-src` and `connect-src` to allowlist Yandex.Metrica (`https://mc.yandex.ru`, `https://mc.yandex.com`) and Baidu Tongji (`https://hm.baidu.com`, `https://sp1.baidu.com`).
  * Retained all strict security headers:
    * `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    * `X-Frame-Options: DENY`
    * `X-Content-Type-Options: nosniff`
    * `Referrer-Policy: strict-origin-when-cross-origin`
    * `frame-ancestors: 'none'`
    * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 2.4 New Public Verification Files
* **`public/BingSiteAuth.xml`** *(NEW)*: Verification file for Bing Webmaster Tools / Microsoft Copilot.
* **`public/baidu_verify_RENAME_ME.html`** *(NEW)*: Stub for Baidu HTML verification file.

### 2.5 Documentation Created
* **`docs/WEBMASTER_REGISTRATION.md`** *(NEW)*: Complete guide with links, step-by-step portal registration, and verification procedures for Google, Bing, Yandex, Baidu, 360, Sogou, Naver, Seznam, and Pinterest.
* **`docs/DEPLOYMENT_DIFF_AND_CONFIG_GUIDE.md`** *(NEW)*: This file.

### 2.6 Health Check & Monitoring
* **`src/app/api/health/route.ts`** *(NEW)*: Health check endpoint for Railway uptime monitors.
* **`sentry.client.config.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts`** *(NEW)*: Sentry error monitoring configurations with Turbopack compatibility.

---

## 3. Checklist of Actions When Updating on GitHub / Railway

- [ ] **Review local changes** (using `git status` / `git diff`).
- [ ] **Ensure Environment Variables are updated in Railway**:
  - `NEXT_PUBLIC_SITE_URL=https://calendula-herbs.com`
  - `NEXTAUTH_URL=https://calendula-herbs.com`
  - Webmaster verification variables (`GOOGLE_SITE_VERIFICATION`, etc.).
- [ ] **Commit & Push changes to your Git repository** when you are ready.
- [ ] **Verify in browser once deployed**:
  - `https://calendula-herbs.com/robots.txt` loads clean crawl rules.
  - `https://calendula-herbs.com/sitemap.xml` returns valid XML.
- [ ] **Re-submit Sitemap in Google Search Console**:
  - URL: `https://calendula-herbs.com/sitemap.xml`.
- [ ] **Register with other search engines** as outlined in `docs/WEBMASTER_REGISTRATION.md`.
