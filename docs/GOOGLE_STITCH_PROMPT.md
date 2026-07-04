# Calendula Herbs — Complete Website Blueprint

> A comprehensive prompt for Google Stitch AI to understand, design, build, and maintain the Calendula Herbs B2B wholesale herbal ingredients platform.

---

## 1. Project Identity

**Brand:** Calendula Herbs — an Egyptian B2B exporter of premium organic herbal ingredients (herbs, spices, seeds, flowers, leaves, and botanicals).

**Target Audience:** International buyers (manufacturers, pharma, food/beverage, cosmetics, tea blenders) looking for certified organic bulk ingredients.

**Core Ethos:** "Nature's Finest, Delivered Globally" — transparency, sustainability, and certification rigor.

**B2B Convention:** The site NEVER uses "Buy Now" or "Add to Cart". All interaction terms are: "Request a Quote", "Get a Sample", "Contact Us", "Submit Inquiry". No pricing is displayed. All transactions are inquiry-based.

**Business Model:** Minimum order 500kg per product. Products are bulk agricultural ingredients sold by metric ton.

---

## 2. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.2.9 |
| Language | TypeScript | ^5.7 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) + CSS custom properties | — |
| UI Primitives | Radix UI (dialog, dropdown-menu, select, checkbox, switch) | ^2.0 |
| Animation | Framer Motion (LazyMotion + domAnimation) | ^12.6 |
| 3D Rendering | Procedural Canvas2D (no WebGL/Three.js for hero scene) | — |
| Database ORM | Prisma | ^6.6 |
| Database | PostgreSQL (Supabase) | — |
| Auth | NextAuth.js v5 beta (Credentials provider, JWT strategy, 8h expiry) | — |
| File Upload | Cloudinary (signed uploads via server-side signature) | Cloudinary v2 |
| Email | Resend (transactional: confirmation + notification) | — |
| Rate Limiting | Upstash Redis (9 named limiters) | — |
| Forms/Validation | React Hook Form + Zod v4 | — |
| Maps | Leaflet + React-Leaflet (dynamic import, SSR disabled) | — |
| Image Cropping | react-image-crop | — |
| Maps | Leaflet + OpenStreetMap tiles | — |
| Icons | Lucide React | ^0.510 |
| Package Manager | pnpm | — |
| Test Framework | Vitest 4 + React Testing Library + jsdom | — |

---

## 3. Design System — "Botanical Light Glass — Calendula Dawn Edition"

### 3.1 Brand Color Palette

**Primary Brand Colors:**

| Token | Value | Usage |
|---|---|---|
| `--color-calendula-500` | `#DC7E18` | Primary accent, buttons, links, active states |
| `--color-sage-500` | `#5E9E66` | Secondary accent, organic badges, success states |
| `--color-cream` | `#FFF8F0` | Warm off-white page background |

**Full Green Scale (product/earthy tones):**
`green-100` (#E8F5E9) through `green-900` (#1B5E20) — 12 levels used for backgrounds, borders, text variations

**Sage Tones (secondary palette):**
`sage-50` (#F2F8F3) → `sage-100` (#E8F3EA) → `sage-200` (#C1E0C5) → `sage-300` (#9BCD9E) → `sage-400` (#74B979) → `sage-500` (#5E9E66) → `sage-600` (#4A7E50) → `sage-700` (#365E3A) → `sage-800` (#223D25) → `sage-900` (#0E1D10)

**Amber/Calendula Golds:**
`amber-50` through `amber-900` — warm tones for CTAs, highlights, hover states, decorative elements

**Cream/Warm Neutrals:**
`cream-50` (#FFFDF9) → `cream-100` (#FFF8F0) → `cream-200` (#FFEFDB) → `cream-300` (#FFE3BF) — backgrounds, card surfaces, containers

### 3.2 Glassmorphism System

| Token | Value |
|---|---|
| `--glass-bg` | `rgba(255, 255, 255, 0.72)` |
| `--glass-bg-strong` | `rgba(255, 255, 255, 0.85)` |
| `--glass-bg-heavy` | `rgba(255, 248, 240, 0.95)` |
| `--glass-border` | `rgba(220, 126, 24, 0.12)` |
| `--glass-border-light` | `rgba(220, 126, 24, 0.06)` |
| `--glass-shadow` | `0 8px 32px rgba(220, 126, 24, 0.08)` |
| `--glass-blur` | `12px` |
| `--glass-blur-heavy` | `20px` |

### 3.3 Surface & Layout Tokens

| Token | Value |
|---|---|
| `--color-bg-base` | `var(--color-cream)` (#FFF8F0) |
| `--color-bg-elevated` | `#FFFFFF` |
| `--color-bg-void` | `#FAFAFA` |
| `--color-bg-overlay` | `rgba(0, 0, 0, 0.4)` |
| `--color-border-default` | `#E5E5E5` |
| `--color-border-subtle` | `rgba(220, 126, 24, 0.10)` |

### 3.4 Semantic Colors

| Token | Value |
|---|---|
| `--color-text-primary` | `#1A1A1A` |
| `--color-text-secondary` | `#4A4A4A` |
| `--color-text-tertiary` | `#8A8A8A` |
| `--color-text-on-primary` | `#FFFFFF` |
| `--color-error` | `#DC2626` |
| `--color-error-bg` | `#FEF2F2` |
| `--color-focus-ring` | `rgba(220, 126, 24, 0.3)` |

### 3.5 Component Tokens

**Buttons:** 7 variants (default/destructive/outline/secondary/ghost/link/accent), 4 sizes (default/sm/lg/icon). All `rounded-full`. Default: calendula-500 bg → hover darken. Accent: sage gradient border.

**Cards:** `--card-bg` (#FFFFFF), `--card-border` (rgba(220,126,24,0.10)), `--card-radius` (12px), `--card-shadow` (0 2px 8px rgba(0,0,0,0.04)), `--card-glass-bg` (rgba(255,255,255,0.85)), `--card-glass-border` (rgba(220,126,24,0.08)).

**Forms:** `--form-bg` (#FFFFFF), `--form-border` (#E5E5E5), `--form-ring` (rgba(220,126,24,0.3)), `--form-radius` (10px).

**Navigation:** `--nav-bg` (rgba(255,255,255,0.85)), `--nav-border` (rgba(220,126,24,0.08)), `--nav-link` (#1A1A1A), `--nav-link-active` (#DC7E18).

**Footer:** `--footer-bg` (rgba(255,248,240,0.95)), `--footer-border` (rgba(220,126,24,0.08)).

**Certificates:** `--cert-bg` (#FFFFFF), `--cert-border` (rgba(220,126,24,0.12)).

**Refills/Badges:** `--badge-organic-bg` (rgba(94,158,102,0.12)), `--badge-organic-text` (#4A7E50), `--badge-organic-border` (rgba(94,158,102,0.25)).

### 3.6 Typography

**Font Stack (4 Google Fonts):**

| Face | Variable | Usage | Weights |
|---|---|---|---|
| Playfair Display | — | Primary headings (h1-h3) | 300, 400, 500, 600 |
| Cormorant Garamond | `--font-display` | Display/elegant headings, admin title | 400, 500, 600 |
| DM Sans / Inter | `--font-body` | Body text, navigation, labels, cards | 300, 400, 500 |
| Dancing Script | `--font-script` | Accent script text, hero decorative | 600, 700 |
| JetBrains Mono | `--font-mono` | Code, technical details | 400 |

**Fluid Type Scale (clamp-based):**
```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem)
--text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)
--text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem)
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)
--text-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem)
--text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 3rem)
--text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 4rem)
--text-5xl: clamp(3rem, 2.25rem + 3.75vw, 6rem)
```

### 3.7 Spacing Scale

Fluid spacing via CSS custom properties: `--space-1` (4px) through `--space-20` (80px) with clamp() values. Used by utility classes like `section-padding` (py-16 sm:py-24 lg:py-32).

### 3.8 Breakpoints

| Breakpoint | Value |
|---|---|
| xs/sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

### 3.9 Keyframe Animations

| Name | Duration | Description |
|---|---|---|
| `leaf-float` | 8s | Gentle vertical bobbing with slight rotation |
| `leaf-drift` | 12-18s | Horizontal drift + vertical float (per leaf variant) |
| `fade-in` | 0.6s | Opacity 0→1 with translateY(10px→0) |
| `slide-up` | 0.5s | translateY(20px→0) + opacity |
| `scaleIn` | 0.4s | scale(0.95→1) + opacity |
| `spin-slow` | 8s | 360° constant rotation |
| `pulse-soft` | 3s | Gentle opacity pulse |
| `hero-float` | 4s | Eased vertical float for hero elements |

---

## 4. Site Architecture — Route Groups

### 4.1 Route Map

```
/                                       → home (public, SSR, dynamic)
/about                                  → about page (hero + team + story)
/products                               → product catalog (search + filter + detail)
/products/[slug]                        → redirects to /products?product=SLUG
/certificates                           → certificate grid with lightbox
/contact                                → contact form + map
/sample                                 → sample request form
/faq                                    → accordion FAQ (DB or default)
/galleries                              → 5-tab gallery browsing
/product-request                        → custom product request form
/privacy                                → privacy policy
/terms                                  → terms of service

/admin/login                            → admin login
/admin/forgot-password                  → password reset request
/admin/otp                              → OTP verification
/admin/email-changed                    → email change confirmation

/admin/dashboard                        → admin overview with stats
/admin/dashboard/products               → product CRUD table
/admin/dashboard/products/[id]          → product edit form
/admin/dashboard/products/categories    → category manager
/admin/dashboard/certificates           → certificate CRUD
/admin/dashboard/galleries              → gallery list
/admin/dashboard/galleries/[id]         → gallery item manager
/admin/dashboard/media                  → media library
/admin/dashboard/inquiries              → 4-tab inquiry viewer
/admin/dashboard/team                   → team & board list
/admin/dashboard/team/[id]              → team member edit
/admin/dashboard/profile                → admin profile
/admin/dashboard/settings               → site settings
/admin/dashboard/plugins                → plugin manager (future)

/api/public/contact                     → POST contact form
/api/public/cart                        → POST cart inquiry
/api/public/sample                      → POST sample request
/api/public/product-request             → POST product request
/api/public/certificates                → GET certificates
/api/public/products/[slug]             → GET single product

/api/auth/[...nextauth]                 → NextAuth handler

/api/otp/send                           → POST send OTP
/api/otp/verify                         → POST verify OTP
/api/otp/reset-password                 → POST reset password

/api/admin/{entity}                     → full CRUD for all entities
/api/admin/inquiries/unread-count       → GET unread tallies
/api/admin/media/sign                   → GET Cloudinary upload signature
/api/admin/plugins                      → CRUD for embedded plugins
/api/admin/settings                     → PATCH site settings
/api/admin/contact-settings             → PATCH contact configuration
/api/admin/profile/*                    → password/email/recovery changes
/api/admin/team/reorder                 → PATCH drag-and-drop order
```

### 4.2 Route Group Strategy

| Group | Layout | Auth | Rendering |
|---|---|---|---|
| `(public)` | Header + Footer + CartDrawer + CookieConsent + plugin injection | None | `force-dynamic`, SSR per request |
| `(admin-auth)` | Centered card layout, no nav | None (pre-login) | Client rendered |
| `(admin-panel)` | AdminSidebar + AdminHeader + `<SessionProvider>` | `proxy.ts` guard | Client rendered |

---

## 5. Component Architecture

### 5.1 Public Components

**Shared Primitives (components/ui/):**

| Component | File | Variants/Props |
|---|---|---|
| Button | `button.tsx` | 7 variants (default/destructive/outline/secondary/ghost/link/accent), 4 sizes, rounded-full |
| Badge | `badge.tsx` | 4 variants (default/secondary/destructive/outline), size |
| Dialog | `dialog.tsx` | Radix DialogContent with scale+fade animation, overlay |
| DropdownMenu | `dropdown-menu.tsx` | Full Radix submenus, checkboxes, radio items, separators |
| Select | `select.tsx` | Radix Select with scroll-up/down buttons |
| Input | `input.tsx` | Error state (red border), glass background, focus ring |
| Textarea | `textarea.tsx` | Error state, resize-none, min-h-[100px] |
| Checkbox | `checkbox.tsx` | Radix Checkbox |
| Switch | `switch.tsx` | Radix Switch |
| Label | `label.tsx` | Error state, required indicator (asterisk) |
| IconPicker | `icon-picker.tsx` | Searchable popover with categorized Lucide icons |

**Layout Components:**

| Component | Description |
|---|---|
| Header (`Header.tsx`) | Glass nav bar. Logo left, nav links center (Home/Products/About/Certificates/Contact), cart icon right with badge count. Mobile hamburger. Scroll detection for glass blur. Uses `nav-primary` utility class. |
| Footer (`Footer.tsx`) | 4-column glass footer. **Column 1:** Brand description + tagline. **Column 2:** Quick links. **Column 3:** Contact info (phones, email, address from DB `ContactSetting`). **Column 4:** Connect (social links + Leaflet map placeholder). Business hours from JSON. |
| CartDrawer (`CartDrawer.tsx`) | Slide-in panel from right. **Step 1:** Cart items (name/quantity/price placeholder) with +/- and remove. Cart total. "Proceed" button. **Step 2:** Contact form (name, email, phone, company, country, notes). Submit to `/api/public/cart`. Toast on success. Powered by `CartProvider` context. |
| CookieConsent (`CookieConsent.tsx`) | Bottom-fixed banner with "Accept" and "Decline". Stores `cookiesAccepted` in localStorage. Animates in/out. |

**Home Page Sections:**

| Section | Component | Description |
|---|---|---|
| Hero | `HeroSection.tsx` | Full-viewport hero with Canvas2D Calendula flower field background. Parallax scroll on content. Mouse-follow parallax via `useMotionValue`. 3D depth layers. Staggered text animation (heroStagger/heroChild). Floating leaf animations. Scroll-down chevron indicator. |
| Certs Banner | `CertsBanner.tsx` | Horizontal scroll of certification logos. Fetches from `/api/public/certificates`. Check-circle icons. |
| Featured Products | `FeaturedProductsSection.tsx` | Grid of up to 6 product cards. Staggered fade-in-up. Each card uses `Card3D` tilt wrapper. Organic badge. |
| Stats Bar | `StatsBar.tsx` | 4 stat items: 45+ Years Experience, 25+ Countries Served, 11+ Certified Products, 4 Global Certifications. Animated counters on scroll. |
| Botanical About | `BotanicalAboutSection.tsx` | 2-column layout: story text + decorative highlights with leaf dividers. "Learn More" CTA. |
| Process | `ProcessSection.tsx` | 4-step timeline: Cultivation, Harvest, Processing, Quality Control. Step icons, staggered reveal. |

**Product Components:**

| Component | Description |
|---|---|
| Card3D (`Card3D.tsx`) | Wrapper component. `perspective: 600px`, `transform-style: preserve-3d`. Mouse tilt via `useCardTilt` hook. On hover: `scale3d(1.02)`. Smooth transition. |
| ProductActions (`ProductActions.tsx`) | "Request a Quote" and "Get a Sample" buttons. Quote button opens `ProductDetailModal`. Sample button navigates to `/sample`. |
| ProductDetailModal (`ProductDetailModal.tsx`) | Full-screen modal on product card click. Fetches by slug. Image gallery with thumbnails + lightbox. Cut-form chips (organic certification, form, origin). Specs section (scientific name, MOQ, conventional type). Certification badges. |
| ProductGridClient (`ProductGridClient.tsx`) | Client component: search input + category sidebar filter + grid of `Card3D`-wrapped product cards. Detail modal via URL search param (`?product=SLUG`). |

**Form Components:**

| Component | Fields | Validation |
|---|---|---|
| ContactForm | Name, Email, Phone, Company, Country, Subject, Message + honeypot | Client-side (required, email format) + Server zod |
| SampleRequestForm | Product Name, Quantity, Name, Email, Company, Address, Shipping (radio: buyer/calendula), Notes + honeypot | react-hook-form + zod |
| ProductRequestForm | Product Name, Description, Quantity, Name, Email, Phone, Company, Country, Usage, Notes + honeypot | react-hook-form + zod |

**All forms use:** `sonner` toasts for feedback, honeypot anti-spam field, POST to `/api/public/*`.

**Other Public Components:**

| Component | Description |
|---|---|
| BotanicalDivider | Gold leaf SVG ornament divider (`#DC7E18`). Centered, max-width constrained, decorative. |
| FloatingLeaves | 10 animated SVG leaves with varied `leafDrift` durations/delays. Positioned absolutely. |
| ScrollReveal | Framer Motion wrapper: `fadeInUp` on scroll `whileInView`. `once: true`, `margin: "-80px"`. |
| SectionLabel | Gold uppercase label with leading `✦` prefix. Letter-spaced, font-display. |
| AboutHero | Full-width video player with fallback image. Controls prominent. |
| GalleryLightbox | Full-screen image/video lightbox overlay. Keyboard nav (arrows, Escape load). `overflow: hidden` on body. Grid of thumbnails. |
| MapEmbed | Leaflet map centered on Egypt. Marker at `mapLat/mapLng`. OpenStreetMap tiles, attribution. Rounded overflow. |
| MapEmbedWrapper | Dynamic import w/ SSR disabled. Pulse loading skeleton while loading. |
| HeroFieldScene | Procedural Canvas2D rendering — 50+ Calendula flowers with 3-layer petals (outer/inner/center). 350+ floating petals. Particle system. Day/night cycle (sun/moon arc + color shift). Rain effect. Wind oscillation. Morning dew. Mouse attraction radius. |

### 5.2 Admin Components

| Component | Description |
|---|---|
| AdminSidebar | Fixed left sidebar (w-64). Glass/white background. Calendula leaf logo at top. 8 nav links with active indicator (left gold bar + calendula color). Sign Out button at bottom. Uses `next-auth/react signOut`. |
| AdminHeader | Sticky top header. **Left:** Dynamic breadcrumbs (parses pathname → labels). **Right:** Notification bell (shows unread inquiry count, dropdown by type), User profile link (avatar + name + email). Fetches `/api/admin/inquiries/unread-count` on mount. |
| ChangeEmailModal | Radix Dialog. Two inputs: new email + current password (with show/hide toggle). PATCH to `/api/admin/profile/change-email`. On success → redirect to `/admin/email-changed`. Error display. |
| MediaUploader | Drag-and-drop zone + file picker. 4 file types (max sizes: IMAGE 10MB, VIDEO 200MB, AUDIO 50MB, PDF 20MB). Upload flow: (1) GET signature from `/api/admin/media/sign`, (2) XHR upload to Cloudinary with progress bar, (3) POST metadata to `/api/admin/media`. |
| MediaPicker | Modal dialog with search + paginated grid. Shows image thumbnails or type icons (film/music/file). Hover overlay with "Select" button. Confirms selection callback. |
| ImageCropper | Uses `react-image-crop` with adjustable aspect ratio. FileReader preview → crop → canvas export → File callback. Dialog wrapper. |

### 5.3 Admin Pages Structure

| Page | Key Features |
|---|---|
| Dashboard | Stats cards (products, certificates, media, inquiries) + recent inquiries table + quick action buttons |
| Products List | Data table with search, category filter, pagination. Toggle active/featured inline. Delete with confirmation. "Add Product" button. |
| Product Edit | Full form: name, slug, scientific name, description (textarea), short description, organic/conventional toggles, MOQ, categories multi-select, image picker (from MediaLibrary), image reorder, active/featured toggles. |
| Categories | Simple list with inline order editing. Add/edit with modal. |
| Certificates | Table with title, issuer, file (PDF/image preview), active toggle. Add/edit via modal. |
| Galleries | Card grid with gallery name, item count, active toggle. Create gallery modal. |
| Gallery Detail | List of items (images, YouTube, Drive, Facebook links) with reorder. Add via MediaPicker or URL. Section assignment (EVENTS/INTERVIEWS_TV/FACTORY/FARMS/SHIPMENTS). |
| Media | Grid view + upload area. Filter by type. Click to view details. Delete with cascade warning. |
| Inquiries | 4-tab layout: Contact, Cart, Samples, Product Requests. Each tab has a table (name, email, date, read/unread). Click row → detail panel with full message + reply actions. Unread badge per tab. |
| Team | Card grid split by TEAM/BOARD type. Add/edit via modal. Contact methods panel with 19 types. Inline photos from media library. |
| Team Member Edit | Name, title, bio, photo picker, type (TEAM/BOARD), contacts (dynamic add/remove rows with type+value+icon). |
| Profile | Read-only info + Change Email button (opens ChangeEmailModal) + Change Password form + Recovery Emails management. |
| Settings | Site settings key-value editor (logo URL, site name, description, social links). |
| Plugins | List of embeddable plugins with code, position (HEAD/BODY_END/FOOTER_FIXED/CHAT_WIDGET), active toggle. |

---

## 6. Data Models (Prisma Schema — 21 models, 8 enums)

### 6.1 Auth Models

- **Admin** — name, email (unique), passwordHash, phone, recoveryEmails[], recoveryPhones[], lastLoginIp/At/UserAgent/Country, failedAttempts, lockedUntil
- **AdminSession** — adminId, tokenHash (unique), ip, userAgent, expiresAt, revokedAt. Enables per-session JWT revocation.
- **OtpCode** — identifier, codeHash (bcrypt of 6-digit), type (EMAIL_RESET/PHONE_RESET/EMAIL_VERIFY), expiresAt, usedAt, attempts
- **AdminAuditLog** — adminId, action, target, detail (JSON), ip. Created but currently NOT written to by any routes.

### 6.2 Media & Gallery

- **MediaFile** — name, originalName, type (IMAGE/VIDEO/AUDIO/PDF), url (Cloudinary), cloudinaryId, thumbnailUrl, mimeType, sizeBytes, width, height, duration
- **Gallery** — name, slug (unique), description, isActive, order
- **GalleryItem** — galleryId, type (UPLOADED_IMAGE/UPLOADED_VIDEO/YOUTUBE/GOOGLE_DRIVE/FACEBOOK), section (EVENTS/INTERVIEWS_TV/FACTORY/FARMS/SHIPMENTS), mediaFileId, externalUrl, externalId, thumbnailUrl, title, caption, order, isActive

### 6.3 Products

- **Product** — name, scientificName, slug (unique), description (HTML), shortDescription, isOrganic, organicType (EU/NOP/COR/JAS/BIO_SUISSE), conventionalType (NORMAL/EU_LIMITS), minOrderKg (default 500), isActive, isFeatured, order
- **ProductImage** — productId, mediaFileId, isPrimary, order
- **Category** — name, slug (unique), order
- **ProductCategory** — composite key on [productId, categoryId]

### 6.4 Team

- **TeamMember** — name, title, bio, photoId, memberType (TEAM/BOARD), order, isActive
- **TeamContact** — memberId, type (19 contact types: EMAIL, PHONE, LINKEDIN, TWITTER, WHATSAPP, FACEBOOK, INSTAGRAM, TELEGRAM, VIBER, WECHAT, SIGNAL, MESSENGER, LINE, DISCORD, YOUTUBE, TIKTOK, SNAPCHAT, WEBSITE, OTHER), label, value, icon (Lucide name)

### 6.5 Certificates

- **Certificate** — title, issuer, fileId, fileType (PDF/IMAGE), order, isActive. Linked to MediaFile.

### 6.6 Site Management

- **SiteSetting** — key (unique, e.g. "site_name", "social_links"), value (JSON string)
- **Plugin** — name, code (raw HTML/script), position (HEAD/BODY_END/FOOTER_FIXED/CHAT_WIDGET), isActive, order

### 6.7 Contact & Inquiries

- **ContactSetting** — id="main", managingEmails[], mapAddress, mapLat, mapLng, phones[], publicEmails[], businessHours (JSON), autoReplySubject/Message, formEnabled, contactMethods (JSON array)
- **ContactSubmission** — name, email, phone, company, country, subject, message, isRead
- **CartInquiry** — name, email, phone, company, country, notes, itemsJson (JSON array), isRead
- **SampleRequest** — productName, quantity, name, email, company, address, shippingBy ("buyer"/"calendula"), notes, isRead
- **ProductRequest** — productName, productDescription, quantity, name, email, phone, company, country, usage, notes, isRead

---

## 7. API Endpoint Patterns

### 7.1 Public Form Endpoints (4 endpoints)

All follow identical architecture:

```
POST /api/public/{contact|cart|sample|product-request}
Request: JSON body matching form fields
Validation: Zod schema parse
Rate limit: Upstash Redis by IP (window-based)
Database: Prisma create record
Email: Promise.allSettled([confirmation to submitter, notification to ContactSetting.managingEmails])
Response: { success: true } or { error: string }
```

Sender metadata extracted server-side via `extractSenderMeta(req)`:
- IP address (x-forwarded-for or remoteAddress)
- User-Agent header
- Referer header
- Accept-Language header
- Country (enriched via ip-api.com geolocation)

Metadata appended to admin notification email — submitter has no control over this data.

### 7.2 Admin CRUD Pattern (all entities)

```
GET    /api/admin/{entity}        → paginated list (?page=N&search=S&type=T)
GET    /api/admin/{entity}/[id]   → single item
POST   /api/admin/{entity}        → create (Zod validation → Prisma create)
PATCH  /api/admin/{entity}/[id]   → update (Zod partial → Prisma update)
DELETE /api/admin/{entity}/[id]   → delete (with cascade safety)

Every route: try { await requireAdmin() } catch { return unauthorized() }
Error handling: ZodError → 400, other → 500 + console.error
```

### 7.3 Specialized Endpoints

- `GET /api/admin/inquiries/unread-count` → `{ contact: N, cart: N, samples: N, productRequests: N, total: N }`
- `GET /api/admin/media/sign?folder=X` → `{ signature, timestamp, apiKey, cloudName, folder }` for Cloudinary signed upload
- `PATCH /api/admin/settings` → Bulk upsert site settings key-value pairs
- `PATCH /api/admin/contact-settings` → Update contact configuration
- `POST /api/admin/profile/change-password` → Verify old password → hash new → update Admin
- `PATCH /api/admin/profile/change-email` → Verify current password → update Admin email → revoke all sessions
- `POST /api/admin/profile/recovery-emails` → Add/remove recovery email addresses
- `PATCH /api/admin/team/reorder` → Update order field for team members (drag-and-drop)
- `PATCH /api/admin/products/[id]/images` → Reorder or replace product images
- `DELETE /api/admin/products/[id]/images/[imageId]` → Remove image from product

### 7.4 OTP Flow

```
POST /api/otp/send            → Generate 6-digit code, bcrypt hash → store OtpCode → send via Resend
POST /api/otp/verify          → Find OtpCode by identifier → bcrypt compare → mark used
POST /api/otp/reset-password  → Verify valid OTP → hash new password → update Admin
```

Rate limited: send (3/15min per identifier), verify (5/15min per identifier).

---

## 8. Authentication & Security Architecture

### 8.1 Authentication Flow

1. **Login:** `/admin/login` → NextAuth `credentials` provider → verify password hash against `Admin` record → check `lockedUntil` (5 failed attempts → 15 min lockout) → create `AdminSession` → issue JWT (8h expiry) → update `lastLogin*` fields
2. **Guard:** `src/proxy.ts` (Next.js 16 proxy pattern) intercepts `/admin/:path*` and `/api/admin/:path*` → checks `session?.user?.email` exists (empty = revoked JWT) → 401 for API, redirect to login for pages
3. **Sign Out:** `signOut({ redirect: false })` + manual `window.location.href` redirect (AdminSidebar)
4. **Session Revocation:** `AdminSession.revokedAt` field — admin can revoke all sessions (changes email, forces re-login)

### 8.2 Rate Limiting (Upstash Redis — 9 limiters)

| Limiter | Window | Max |
|---|---|---|
| `loginRateLimit` | 15 min | 5 attempts |
| `otpSendRateLimit` | 15 min | 3 sends |
| `otpVerifyRateLimit` | 15 min | 5 verifications |
| `contactRateLimit` | 15 min | 3 submissions |
| `cartRateLimit` | 15 min | 3 submissions |
| `sampleRateLimit` | 60 min | 2 submissions |
| `productRequestRateLimit` | 60 min | 2 submissions |
| `searchRateLimit` | 1 min | 30 requests |
| `genericApiRateLimit` | 1 min | 60 requests |

### 8.3 Security Measures

- **Honeypot:** All 4 public forms include a hidden field (`_hp` or similar). If filled → silently discard submission (bot detection).
- **CSP:** whitelists Cloudinary, Resend, Upstash, Tawk.to (chat widget), Google Fonts, YouTube embeds, ip-api.com.
- **Zod validation:** Every API input validated server-side before Prisma operations.
- **No Middleware file:** Auth guard is `src/proxy.ts`, not `middleware.ts`.
- **Password storage:** bcryptjs.
- **Cloudinary uploads:** Server-side signed signatures only (client never has API secret).

---

## 9. Shared Form Submission Pattern

All 4 public forms follow identical architecture:

```
Client (React Hook Form + Zod schema)
  → Client validation
  → POST JSON to /api/public/*
  → Toast pending/loading
  → Server: Zod parse body
  → Server: Rate limit by IP
  → Server: Prisma create (save to DB)
  → Server (parallel): extractSenderMeta(req) → enrichWithCountry()
  → Server (parallel): Promise.allSettled([
      Resend.send(confirmation to submitter),
      Resend.send(notification to managingEmails + sender metadata)
    ])
  → Response: { success: true }
  → Client: Toast success → reset form
```

---

## 10. Animation System

### 10.1 Framer Motion Variants (src/lib/animations.ts)

| Variant | Type | Description |
|---|---|---|
| `fadeInUp` | `whileInView` | Opacity 0→1, y: 30→0, `once: true` |
| `fadeInLeft` | `whileInView` | Opacity 0→1, x: -30→0 |
| `fadeInRight` | `whileInView` | Opacity 0→1, x: 30→0 |
| `staggerContainer` | Parent | `staggerChildren: 0.1`, `delayChildren: 0.1` |
| `cardVariant` | Child | Scale 0.95→1 + opacity, with stagger |
| `heroStagger` | Parent | `staggerChildren: 0.15`, `delayChildren: 0.3` |
| `heroChild` | Child | Opacity 0→1, y: 40→0 |
| `scaleIn` | `whileInView` | Scale 0.8→1 + opacity |
| `sectionReveal3D` | `whileInView` | RotateX(5deg→0) + y shift + opacity |
| `cardReveal3D` | Child | Scale 0.9→1 + opacity, stagger parent |
| `quarterFadeInUp` | `whileInView` | Subtle: y: 15→0, shorter duration |

All variants respect `prefers-reduced-motion` media query. Public pages use `LazyMotion` + `domAnimation` to keep bundle size small.

### 10.2 Canvas2D Hero Scene (HeroFieldScene.tsx)

Procedural botanically-inspired art system:

- **Flowers:** ~50 Calendula flowers rendered on canvas. Each flower has 3 petal layers (outer ring → mid ring → center disc). Petal count, size, and color vary per flower.
- **Floating Petals:** ~350 individual petals drifting across the screen with varying wind speeds, rotation, and opacity.
- **Particle System:** Fine golden/white particles floating upward (dust/pollen effect).
- **Day/Night Cycle:** Sun arcs across sky during day → moon rises at night. Sky color gradient shifts warm → cool → dark throughout 120s cycle.
- **Rain Effect:** Periodic rain showers with varied droplet sizes.
- **Wind:** Gentle horizontal oscillation applied to all moving elements.
- **Mouse Interaction:** Flowers subtly lean toward mouse cursor within attraction radius. Floating petals react to mouse movement.
- **Morning Dew:** Condensation effect on lower portion of canvas.

### 10.3 CSS Animations

| Class | Animation |
|---|---|
| `.leaf-float` | 8s slow vertical bob |
| `.leaf-drift` | 12-18s horizontal + vertical drift (10 unique instances) |
| `.scroll-reveal` | Intersection Observer fade-up via ScrollReveal component |
| `.card-glass:hover` | lift transform + shadow deepen |
| `.nav-primary a:hover` | Color shift to calendula-500 |

---

## 11. Third-Party Integrations

| Service | Purpose | Integration Point |
|---|---|---|
| Supabase | PostgreSQL database | `DATABASE_URL` + `DIRECT_URL` (Prisma) |
| Cloudinary | Image/video hosting + CDN | Signed uploads via `/api/admin/media/sign`, served from `res.cloudinary.com` |
| Resend | Transactional email | `email.ts` — admin confirmation + notification emails |
| Upstash Redis | Rate limiting | `rate-limit.ts` — 9 named sliding window limiters |
| NextAuth.js | Admin authentication | Credentials provider, JWT strategy, AdminSession model |
| Leaflet + OSM | Interactive maps | Dynamic import (SSR disabled), MapEmbed + MapEmbedWrapper |
| Tawk.to | Live chat widget | Optional plugin via Plugin system (position: CHAT_WIDGET) |
| Google Fonts | Typography | 4 font families loaded via next/font |
| ip-api.com | IP geolocation | `sender-meta.ts` — enriches admin notifications with submitter country |
| react-hook-form | Form state management | All 4 public forms + admin forms |
| Zod | Schema validation | API inputs, form schemas, client + server |
| sonner | Toast notifications | Form feedback, action confirmations |
| react-image-crop | Image cropping | Media upload crop step |
| framer-motion | Animation library | Scroll reveals, staggered entries, page transitions |

---

## 12. Admin Panel CMS

Full CRUD admin panel at `/admin/dashboard/*` with:

- **Dashboard:** Overview stats (total products, certificates, media files, inquiries). Recent inquiries table. Quick action buttons (Add Product, Upload Media, View Inquiries).
- **Products Manager:** Full CRUD with search, category filter, pagination. Rich product editing with image gallery management (reorder, primary select, add from media library). Organic/conventional classification. Featured toggles.
- **Media Library:** Upload (drag-drop + file picker) with Cloudinary integration. Grid view with type filtering. Image cropping on upload. Delete with cascade warnings.
- **Galleries:** Gallery CRUD with 5-section item management (EVENTS/INTERVIEWS_TV/FACTORY/FARMS/SHIPMENTS). Mixed media: uploaded images/video + YouTube embeds + Google Drive links + Facebook posts. Item reorder.
- **Certificates:** Simple CRUD with file upload (PDF/Image) from media library. Active toggle for display control.
- **Inquiries:** 4-tab view (Contact/Cart/Samples/Product Requests). Unread counts with badge indicators. Read/unread toggle. Click-to-expand detail panel with full message.
- **Team & Board:** Dual-type management (TEAM/BOARD). Contact methods with 19 supported types (standard social + messaging apps). Photo assignment. Drag-and-drop reorder.
- **Profile:** Admin account management — change email (with password confirmation + session revocation), change password, manage recovery emails.
- **Settings:** Key-value site settings (logo, name, description, social links, etc.). Contact configuration (phones, emails, map coordinates, business hours, auto-reply templates, contact methods with auto/manual link modes).
- **Plugins:** Embedded HTML/script injector — 4 positions (HEAD, BODY_END, FOOTER_FIXED, CHAT_WIDGET). Used for analytics, chat widgets, custom scripts.

---

## 13. Plugin Injection System

Public layout injects DB-hosted plugins at 4 positions:

```
<HEAD> → <head> (analytics, meta tags)
<BODY_END> → before </body> (third-party scripts)
<FOOTER_FIXED> → fixed position overlay (announcement bars)
<CHAT_WIDGET> → floating chat button (Tawk.to, etc.)
```

Plugins are stored in the `Plugin` model with raw code HTML. Active plugins are fetched on each public page render and injected into the appropriate DOM position.

---

## 14. Visual Design Guidelines

### Layout Principles
- **Grid:** Responsive 12-column implied grid via Tailwind. Max content width 1280px.
- **Padding:** 16px mobile → 24px tablet → 32px desktop section padding.
- **Glass layers:** White/cream backgrounds with `backdrop-filter: blur(12px)` and subtle gold borders.
- **Rounded corners:** Small elements 8px (forms, inputs), medium elements 12px (cards), large elements 16px (modals), fully round (buttons, badges).
- **Shadows:** Subtle warm-toned shadows: `rgba(220, 126, 24, 0.08)` for glass, `rgba(0,0,0,0.04)` for cards.

### Typography Hierarchy
- **H1:** Playfair Display, `text-5xl` (fluid 3rem→6rem), tracking-tight
- **H2:** Playfair Display, `text-4xl` (fluid 2.25rem→4rem)
- **H3:** Playfair Display, `text-3xl` (fluid 1.875rem→3rem)
- **Body:** DM Sans/Inter, `text-base` (fluid 1rem→1.125rem), leading-relaxed
- **Small:** DM Sans, `text-sm`, text-tertiary for secondary info
- **Script accents:** Dancing Script for decorative hero text
- **Section labels:** Cormorant Garamond, uppercase, letter-spaced, gold

### Spacing
- **Section padding:** `py-16 sm:py-24 lg:py-32`
- **Card padding:** `p-6` (24px)
- **Content gap:** `gap-8` (32px) between sections, `gap-4` (16px) within cards
- **Container max:** `max-w-7xl` (1280px) centered with `mx-auto`

### Interactive States
- **Buttons:** Hover → darken/brighten. Active → scale(0.98). Focus → ring `rgba(220,126,24,0.3)`.
- **Links:** Calendula gold on hover, underline decoration.
- **Cards:** Hover → slight lift (`translateY(-2px)`), shadow deepen, border highlight.
- **Nav items:** Active → calendula color + left gold bar indicator (admin) or underline (public).

---

## 15. Deployment & CI/CD

- **Auto-deploy:** Vercel from `master` branch. `master` is production.
- **CI branches:** `main`, `develop` — push/PR triggers GitHub Actions.
- **Build order:** `prisma generate` → `next build`
- **Environment:** `.env` + `secrets.json` (gitignored). All secrets set as Vercel env vars.
- **CI Pipeline (`.github/workflows/ci.yml`):**
  - Node.js 20 + 22 matrix
  - `pnpm install --frozen-lockfile`
  - `prisma generate`
  - `lint` (ESLint v9 flat config)
  - `tsc` (typecheck, noEmit)
  - `test` (Vitest 4)
  - `build`
- **CodeQL:** Weekly security analysis (`.github/workflows/codeql.yml`)
- **Dependabot:** Weekly npm + GitHub Actions updates, grouped by ecosystem
- **Test config:** Vitest 4 + React Testing Library + jsdom. Config at `vitest.config.ts`. Setup at `src/__tests__/setup.ts`. Run: `pnpm test` or `pnpm test:watch`.

---

## 16. Code Conventions

- **File Naming:** PascalCase for components, camelCase for utilities/hooks, kebab-case for directories.
- **Components:** All client components start with `'use client'`. Server components are minimal.
- **Imports:** `@/` maps to `src/`. Path aliases: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/app/*`.
- **CSS:** All styling via Tailwind utility classes + CSS custom properties in `globals.css`. Utility classes defined in `globals.css` (`card-glass`, `btn`, `badge`, `nav-primary`, `product-card`, `leaf-float`, `scroll-reveal`, `cert-card`).
- **Error handling:** try/catch in API routes with ZodError→400, unknown→500. Toast on client.
- **Database:** Prisma singleton in `db.ts`. Direct imports across the app.
- **Forms:** React Hook Form + Zod schemas. Client validate → server validate. Honeypot on all public forms.
- **Animations:** Framer Motion `whileInView` with `LazyMotion` bundle-splitting. CSS animations for decorative elements.

---

*End of Blueprint — comprehensive technical specification for the Calendula Herbs website.*
