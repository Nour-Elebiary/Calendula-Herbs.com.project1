# Calendula Herbs — Design System & Brand Guideline
> **Antigravity / OpenCode IDE — Master File**
> **Client:** Calendula Herbs For Import & Export (`calendula-herbs.com`)
> **Visual language:** Botanical Light Glass — Calendula Dawn Edition — derived from the brand identity of a 45-year Egyptian herbs-and-spices exporter: sunlit farm fields, warm ivory parchment, frosted glass over botanical photography, and the signature orange-gold of the Calendula flower.
> **Every rule here is non-negotiable** unless the client explicitly overrides it in writing.

---

## 0 · How to Use This File

When OpenCode or any AI agent starts work on this project, it MUST:

1. Read this **entire** document before touching any code.
2. Replace any conflicting CSS variables, Tailwind config, or theme files with the tokens in §2.
3. Refactor existing components to match the patterns in §3–12.
4. Never introduce colors, fonts, or spacing values not derived from §2.
5. Apply all business rules from §20–21 to every page and component.
6. Before marking any task done, run the full audit in §13.
7. The brand is **B2B export-focused** — no pricing, no payment terms, no conversion tricks. Every page builds trust with international buyers and guides them toward contacting the company.

---

## 0.5 · Brand Identity — Calendula Herbs Group

### Company at a Glance

| Field | Value |
|-------|-------|
| **Legal name** | Calendula Herbs For Import & Export |
| **Trading name** | Calendula Herbs Group |
| **Founded** | 1980 (farming) → 2000 (manufacturing) → 2014 (exporting company established) |
| **Heritage** | 45 years as farmers · 25 years as manufacturers · 11 years as exporters |
| **Location** | New Seat St., Ibshway, Fayoum, Egypt — ZIP 63611 |
| **Primary business** | Export of dried herbs, spices, herbal tea, seeds, medicinal & aromatic plants |
| **Supply chain** | Own farms + contracted certified farms + own factories |
| **Market** | Global export (not import-focused); long-term B2B relationships |
| **Phone** | +201120238857 / +201127703323 |
| **Email** | info@calendula-herbs.com |

### Social & Messaging Channels

| Platform | Handle / Link |
|----------|--------------|
| Facebook | facebook.com/calendulaherbs |
| Instagram | instagram.com/calendulaherbs |
| YouTube | youtube.com/@calendulaherbs |
| LinkedIn | eg.linkedin.com/company/calendula-herbs-import-export |
| WhatsApp | wa.me/201120238857 |
| Telegram | t.me/EL_EBIARY |
| Viber | 201120238857 |
| WeChat | (link on website) |
| Skype | dr.nehadelebiary |

### Certifications (display exactly these names)

```
ISO 9001 · ISO 22000 · EU Organic · SEDEX / Semeta · HALAL · KOSHER
USDA NOP · FDA Approval · BRCGS · NFSA Whitelist · AHK Council Member
```

### Key Business Rules (hardcoded into this system)

| Rule | Detail |
|------|--------|
| **No pricing on site** | Prices discussed after contact only |
| **No payment terms on site** | Discussed after contact only |
| **MOQ** | 500–1,000 KG per product (always shown on product pages) |
| **Free samples** | Samples are free; customer pays shipping cost |
| **External analysis** | Available; customer pays |
| **Sterilization** | Steam or freeze via certified external parties; customer pays |
| **Custom services** | Cut sizing, labeling, private labeling available |
| **Expos** | BIOFACH participant for 4+ consecutive years |

### Brand Tagline Options (use one consistently per page)

- *"From Fayoum's Farms to the World's Tables"*
- *"Rooted in Egypt. Trusted by the World."*
- *"45 Years of Growing. 11 Years of Exporting Excellence."*
- *"Specialists of Exporting Dried Herbs, Spices, Herbal Tea and Seeds"* ← (official)

---

## 1 · Design Philosophy

This system lives at the intersection of four aesthetic axes, all of which reflect Calendula Herbs' identity:

| Axis | What it means for Calendula |
|------|-----------------------------|
| **Atmosphere** | Every screen feels like stepping into a Fayoum herb field at dawn — warm morning light catching the dew, clean air off the oasis, and the quiet confidence of land that has been farmed for 45 years. |
| **Material** | Surfaces are frosted white glass over botanical photography — translucent, airy, and refined. The light glassmorphism mirrors the careful processing and clean packaging of Calendula's products. |
| **Typography** | Display headings carry the gravitas of a 45-year heritage. Body copy is precise and professional, never flowery — this is a B2B brand. |
| **Restraint** | One signature element per view. Certifications and trust signals are always present but never shouted. The products and the farm are the heroes. |

The aesthetic risk worth taking: **light before darkness**. Resist the urge to add heavy dark overlays or near-black backgrounds. The warm ivory and botanical green IS the brand — it echoes the sun-lit herb fields of Fayoum at morning, the clean processing rooms where botanicals are carefully dried and packaged, and the quiet credibility of a company trusted by buyers across 5 continents. Brightness should feel like open fields, not sterile white — always warm, always grounded, always botanical.

---

## 2 · Token System

### 2.1 Color Palette

Paste these as CSS custom properties in your root `:root {}` or as a Tailwind `theme.extend.colors` block.

```css
:root {
  /* ── Backgrounds ── */
  --color-bg-void:       #FAFAF6;   /* warmest lightest — page canvas, parchment tint */
  --color-bg-base:       #F2EFE7;   /* primary section background, warm ivory */
  --color-bg-elevated:   #E8E3D9;   /* cards, panels one step up */
  --color-bg-surface:    #DDD8CC;   /* hover states, inputs */
  --color-bg-overlay:    rgba(242, 239, 231, 0.90); /* modal/drawer backdrop */

  /* ── Glass Layer (frosted white glassmorphism) ── */
  --color-glass-fill:    rgba(255, 253, 248, 0.68);  /* frosted warm white */
  --color-glass-border:  rgba(255, 255, 255, 0.82);
  --color-glass-glow:    rgba(224, 136, 32, 0.07);   /* soft Calendula bloom */
  --color-glass-shadow:  rgba(50, 70, 45, 0.10);

  /* ── Greens (botanical, fresh — primary palette) ── */
  --color-green-900:     #1A3520;
  --color-green-800:     #274D2E;
  --color-green-700:     #3A6B40;
  --color-green-600:     #4D8554;
  --color-green-500:     #5E9E66;   /* primary interactive */
  --color-green-400:     #7AB882;   /* hover */
  --color-green-300:     #9CCDA6;   /* focus ring, active */
  --color-green-200:     #C2E5C8;   /* subtle highlights, text on dark photo bg */
  --color-green-100:     #E4F5E6;   /* near-white tints */

  /* ── Sage / Muted Green (secondary palette for section alternation) ── */
  --color-sage-700:      #4A6350;
  --color-sage-500:      #6E8F75;
  --color-sage-300:      #A8C4AE;
  --color-sage-100:      #E0EDE2;

  /* ── Earthy Warmth (Calendula brand orange / gold — signature accent) ── */
  --color-amber-700:     #8C540A;
  --color-amber-500:     #C47820;
  --color-amber-400:     #DC9840;
  --color-amber-300:     #EDB870;
  --color-calendula-600: #C4680A;   /* Calendula flower deep orange */
  --color-calendula-500: #DC7E18;   /* Calendula flower orange — brand accent */
  --color-calendula-400: #EE9C38;   /* Calendula petal highlight */
  --color-calendula-300: #F5BC62;   /* soft gold, trust signals */
  --color-cream-100:     #F2EFE7;   /* warm ivory — also used as bg-base */
  --color-cream-200:     #E8E3D9;
  --color-cream-muted:   #9A9288;   /* secondary/muted text */
  --color-cream-dim:     #6A6460;   /* placeholder, captions */

  /* ── Semantic ── */
  --color-text-primary:  #1C2E1E;   /* deep botanical green-black */
  --color-text-secondary:#4A5E4B;   /* medium botanical green-gray */
  --color-text-tertiary: #7A8E7B;   /* light green-gray */
  --color-text-accent:   var(--color-green-700);
  --color-text-warm:     var(--color-calendula-600);
  --color-text-inverse:  #FAFAF6;   /* light text — for use on photo backgrounds */

  --color-border-subtle: rgba(50, 70, 45, 0.08);
  --color-border-default:rgba(50, 70, 45, 0.14);
  --color-border-strong: rgba(50, 70, 45, 0.28);
  --color-border-accent: rgba(94, 158, 102, 0.42);

  --color-focus-ring:    rgba(94, 158, 102, 0.48);
  --color-error:         #B83232;
  --color-success:       var(--color-green-600);
  --color-warning:       var(--color-amber-400);
}
```

#### Tailwind Config Equivalent

```js
// tailwind.config.js  – extend this, do not replace base
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          void:     '#FAFAF6',
          base:     '#F2EFE7',
          elevated: '#E8E3D9',
          surface:  '#DDD8CC',
        },
        green: {
          900:'#1A3520', 800:'#274D2E', 700:'#3A6B40',
          600:'#4D8554', 500:'#5E9E66', 400:'#7AB882',
          300:'#9CCDA6', 200:'#C2E5C8', 100:'#E4F5E6',
        },
        sage: {
          700:'#4A6350', 500:'#6E8F75', 300:'#A8C4AE', 100:'#E0EDE2',
        },
        amber: {
          700:'#8C540A', 500:'#C47820', 400:'#DC9840', 300:'#EDB870',
        },
        calendula: {
          600:'#C4680A', 500:'#DC7E18', 400:'#EE9C38', 300:'#F5BC62',
        },
        cream: {
          100:'#F2EFE7', 200:'#E8E3D9',
          muted:'#9A9288', dim:'#6A6460',
        },
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
}
```

---

### 2.2 Typography

**Do not use system fonts or Google Fonts defaults.** Load these via `<link>` or `@import`.

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| **Display** | `Cormorant Garamond` | 400, 500, 600 | Hero headings, section titles, brand name |
| **Script** | `Dancing Script` | 600, 700 | Signature one-liners, decorative overlays, card labels |
| **Body** | `DM Sans` | 300, 400, 500 | Body copy, nav links, UI labels |
| **Data / Mono** | `JetBrains Mono` | 400 | Counters, technical values, badges |

```html
<!-- Paste in <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Dancing+Script:wght@600;700&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-script:  'Dancing Script', cursive;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Type Scale */
  --text-xs:   0.75rem;    /* 12px – captions, eyebrows */
  --text-sm:   0.875rem;   /* 14px – small labels */
  --text-base: 1rem;       /* 16px – body */
  --text-lg:   1.125rem;   /* 18px – lead paragraph */
  --text-xl:   1.25rem;    /* 20px – card titles */
  --text-2xl:  1.5rem;     /* 24px – section sub-heads */
  --text-3xl:  2rem;       /* 32px – section headings */
  --text-4xl:  2.75rem;    /* 44px – hero sub-headline */
  --text-5xl:  3.75rem;    /* 60px – hero headline */
  --text-6xl:  5rem;       /* 80px – display / splash */

  --leading-tight:  1.15;
  --leading-snug:   1.35;
  --leading-normal: 1.6;
  --leading-loose:  1.85;

  --tracking-tight:  -0.03em;
  --tracking-normal:  0em;
  --tracking-wide:    0.06em;
  --tracking-widest:  0.18em;  /* eyebrows, uppercase labels */
}
```

**Typography rules:**
- Display headings: `font-family: var(--font-display); font-weight: 500; letter-spacing: var(--tracking-tight);`
- Hero headline: size `--text-5xl` or larger, color `var(--color-text-inverse)` (it sits on a photo bg), `font-weight: 400`
- Script accents: used **maximum once per view**, never for navigation or labels
- All-caps labels: `font-family: var(--font-body); letter-spacing: var(--tracking-widest); font-size: var(--text-xs); font-weight: 500;`
- Mono counter: `font-family: var(--font-mono); color: var(--color-text-warm);`

---

### 2.3 Spacing

```css
:root {
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */

  /* Section padding */
  --section-y: clamp(var(--space-16), 8vw, var(--space-32));
  --section-x: clamp(var(--space-6), 5vw, var(--space-20));

  /* Container */
  --container-max:   1280px;
  --container-wide:  1440px;
  --container-tight: 960px;
}
```

---

### 2.4 Border Radius

```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   20px;   /* standard card */
  --radius-xl:   28px;   /* hero cards, feature panels */
  --radius-2xl:  40px;   /* large modals */
  --radius-full: 9999px; /* pills, badges, icon buttons */
}
```

---

### 2.5 Elevation / Shadow

In the light theme, shadows are soft, warm, and botanically tinted — never heavy or dark.

```css
:root {
  /* Glass card shadow — light botanical, warm-tinted */
  --shadow-glass:
    0 4px 20px rgba(50,70,45,0.08),
    inset 0 1px 0 rgba(255,255,255,0.90),
    inset 0 0 24px rgba(224,136,32,0.04);

  /* Floating elements (modals, dropdowns) */
  --shadow-float:
    0 12px 48px rgba(50,70,45,0.14),
    0 4px 16px rgba(50,70,45,0.07);

  /* Glow accent (active states, featured items) */
  --shadow-glow-green:
    0 0 24px rgba(94,158,102,0.22),
    0 0 60px rgba(77,133,84,0.10);

  --shadow-glow-amber:
    0 0 20px rgba(238,156,56,0.28),
    0 0 50px rgba(196,120,32,0.12);

  --shadow-glow-sage:
    0 0 24px rgba(168,196,174,0.25),
    0 0 60px rgba(110,143,117,0.12);

  /* Pressed / inset */
  --shadow-inset:
    inset 0 2px 8px rgba(50,70,45,0.10);
}
```

---

### 2.6 Motion

```css
:root {
  --ease-out:       cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:    cubic-bezier(0.45, 0, 0.55, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);  /* subtle bounce for reveals */
  --ease-smooth:    cubic-bezier(0.25, 0.46, 0.45, 0.94);

  --duration-fast:   120ms;
  --duration-normal: 250ms;
  --duration-slow:   450ms;
  --duration-reveal: 700ms;  /* scroll-triggered entrances */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3 · The Glass Card — Core Component

This is the **signature component** of this system. Every card, panel, or surface is a variant of this. In the light theme, glass cards are frosted white — like a pane of oiled parchment catching the morning sun.

```css
/* ─── Base Glass Card ─────────────────────────────────── */
.card-glass {
  background:       var(--color-glass-fill);
  backdrop-filter:  blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border:           1px solid var(--color-glass-border);
  border-radius:    var(--radius-lg);
  box-shadow:       var(--shadow-glass);
  overflow:         hidden;
  position:         relative;
  transition:
    transform   var(--duration-normal) var(--ease-out),
    box-shadow  var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.card-glass::before {
  /* Top-edge highlight — frosted glass refraction */
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.75) 40%,
    rgba(255,255,255,0.25) 100%
  );
  pointer-events: none;
}

.card-glass:hover {
  transform:    translateY(-3px);
  box-shadow:   var(--shadow-glass), var(--shadow-glow-green);
  border-color: var(--color-border-accent);
}

/* ─── Product Card Variant ────────────────────────────── */
.card-product {
  display:        flex;
  flex-direction: column;
  padding:        var(--space-4);
}

.card-product__stage {
  position:     relative;
  width:        100%;
  aspect-ratio: 1 / 1;
  display:      flex;
  align-items:  flex-end;
  justify-content: center;
  padding-bottom: var(--space-3);
}

.card-product__stage::after {
  /* Disc pedestal — soft green-tinted on light bg */
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 65%;
  height: 8px;
  background: radial-gradient(
    ellipse at center,
    rgba(94,158,102,0.30) 0%,
    transparent 75%
  );
  border-radius: var(--radius-full);
  filter: blur(3px);
}

.card-product__image {
  width:      80%;
  height:     80%;
  object-fit: contain;
  filter:
    drop-shadow(0 8px 20px rgba(50,70,45,0.18))
    drop-shadow(0 2px 4px rgba(50,70,45,0.10));
  transition: transform var(--duration-slow) var(--ease-spring);
}

.card-product:hover .card-product__image {
  transform: translateY(-6px) scale(1.04);
}

.card-product__body {
  padding: var(--space-3) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.card-product__label {
  font-family:    var(--font-body);
  font-size:      var(--text-xs);
  font-weight:    500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color:          var(--color-text-tertiary);
}

.card-product__name {
  font-family: var(--font-display);
  font-size:   var(--text-xl);
  font-weight: 500;
  color:       var(--color-text-primary);
  line-height: var(--leading-snug);
}

.card-product__cuts {
  font-size:   var(--text-xs);
  color:       var(--color-text-tertiary);
  line-height: var(--leading-normal);
}

.card-product__footer {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  margin-top:      var(--space-3);
}

/* ─── Feature / Hero Card Variant ─────────────────────── */
.card-feature {
  border-radius: var(--radius-xl);
  overflow:      hidden;
  position:      relative;
}

.card-feature__image-wrap {
  position:    relative;
  overflow:    hidden;
  aspect-ratio: 4 / 5;
}

.card-feature__image-wrap img {
  width:       100%;
  height:      100%;
  object-fit:  cover;
  transition:  transform var(--duration-reveal) var(--ease-smooth);
}

.card-feature:hover .card-feature__image-wrap img {
  transform: scale(1.06);
}

.card-feature__overlay {
  /* Gradient overlay for text legibility — darker at bottom */
  position:   absolute;
  inset:      0;
  background: linear-gradient(
    to top,
    rgba(25,40,25,0.88) 0%,
    rgba(35,50,30,0.30) 52%,
    transparent 100%
  );
}

.card-feature__content {
  position:  absolute;
  bottom:    0;
  left:      0;
  right:     0;
  padding:   var(--space-6);
}
```

---

## 4 · Layout System

### 4.1 Page Structure

```html
<!-- Required page wrapper -->
<div class="page-root">
  <nav   class="nav-primary">…</nav>
  <main  class="page-content">
    <section class="hero">…</section>
    <section class="section">…</section>
    <!-- … -->
  </main>
  <footer class="footer-primary">…</footer>
</div>
```

```css
.page-root {
  background-color: var(--color-bg-void);
  min-height:       100vh;
  color:            var(--color-text-primary);
  font-family:      var(--font-body);
  font-size:        var(--text-base);
  line-height:      var(--leading-normal);
  overflow-x:       hidden;
}

/* Full-bleed atmospheric light background wash */
.page-root::before {
  content:    '';
  position:   fixed;
  inset:      0;
  pointer-events: none;
  z-index:    0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%,
      rgba(94,158,102,0.10) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 80% 80%,
      rgba(224,136,32,0.07) 0%, transparent 60%);
}

.page-content {
  position:  relative;
  z-index:   1;
}

.container {
  width:     100%;
  max-width: var(--container-max);
  margin:    0 auto;
  padding:   0 var(--section-x);
}

.section {
  padding: var(--section-y) var(--section-x);
}

/* Alternate section tint — use on every other section for visual rhythm */
.section--tint {
  background: var(--color-bg-base);
}
```

### 4.2 Grids

```css
/* Product grid */
.grid-products {
  display:               grid;
  grid-template-columns: repeat(3, 1fr);
  gap:                   var(--space-4);
}

@media (max-width: 640px) {
  .grid-products {
    grid-template-columns: repeat(2, 1fr);
    gap:                   var(--space-3);
  }
}

@media (max-width: 380px) {
  .grid-products {
    grid-template-columns: 1fr;
  }
}

/* Feature grid — 2 cols, asymmetric */
.grid-feature {
  display:               grid;
  grid-template-columns: 1fr 1fr;
  gap:                   var(--space-8);
  align-items:           center;
}

@media (max-width: 768px) {
  .grid-feature {
    grid-template-columns: 1fr;
  }
}

/* Gallery — 4 cols equal */
.grid-gallery {
  display:               grid;
  grid-template-columns: repeat(4, 1fr);
  gap:                   var(--space-3);
}

@media (max-width: 768px) {
  .grid-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 5 · Navigation

```css
/* ─── Primary Nav ─────────────────────────────────────── */
.nav-primary {
  position:         sticky;
  top:              0;
  z-index:          100;
  display:          flex;
  align-items:      center;
  justify-content:  space-between;
  padding:          var(--space-4) var(--section-x);
  background:       rgba(250, 250, 246, 0.84);
  backdrop-filter:  blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border-bottom:    1px solid var(--color-border-subtle);
  transition:       background var(--duration-normal) var(--ease-smooth),
                    box-shadow var(--duration-normal) var(--ease-smooth);
}

/* Subtle elevation when page has scrolled */
.nav-primary.is-scrolled {
  box-shadow: 0 2px 20px rgba(50,70,45,0.08);
}

.nav-logo {
  font-family:    var(--font-display);
  font-size:      var(--text-2xl);
  font-weight:    500;
  letter-spacing: var(--tracking-tight);
  color:          var(--color-text-primary);
  text-decoration: none;
}

/* Optional: Calendula orange accent on brand name */
.nav-logo span {
  color: var(--color-calendula-500);
}

.nav-links {
  display:    flex;
  align-items: center;
  gap:         var(--space-8);
  list-style:  none;
  margin:      0;
  padding:     0;
}

.nav-link {
  font-family:    var(--font-body);
  font-size:      var(--text-sm);
  font-weight:    400;
  letter-spacing: var(--tracking-wide);
  color:          var(--color-text-secondary);
  text-decoration: none;
  transition:     color var(--duration-fast) var(--ease-smooth);
  position:       relative;
}

.nav-link::after {
  content:    '';
  position:   absolute;
  bottom:     -2px; left: 0;
  width:      0; height: 1px;
  background: var(--color-green-600);
  transition: width var(--duration-normal) var(--ease-out);
}

.nav-link:hover {
  color: var(--color-text-primary);
}

.nav-link:hover::after {
  width: 100%;
}

/* Pill CTA in nav — Calendula green */
.nav-cta {
  padding:         var(--space-2) var(--space-5);
  background:      var(--color-green-600);
  color:           var(--color-text-inverse);
  font-family:     var(--font-body);
  font-size:       var(--text-sm);
  font-weight:     500;
  border:          none;
  border-radius:   var(--radius-full);
  cursor:          pointer;
  transition:
    background  var(--duration-fast) var(--ease-smooth),
    box-shadow  var(--duration-normal) var(--ease-smooth),
    transform   var(--duration-fast) var(--ease-spring);
}

.nav-cta:hover {
  background: var(--color-green-500);
  box-shadow: var(--shadow-glow-green);
  transform:  scale(1.03);
}

/* Mobile hamburger button */
.nav-hamburger {
  width:           38px;
  height:          38px;
  display:         flex;
  flex-direction:  column;
  justify-content: center;
  gap:             5px;
  background:      transparent;
  border:          none;
  cursor:          pointer;
  padding:         var(--space-2);
}

.nav-hamburger span {
  display:       block;
  width:         100%;
  height:        1px;
  background:    var(--color-text-primary);
  border-radius: var(--radius-full);
  transition:    transform var(--duration-normal) var(--ease-out),
                 opacity   var(--duration-normal) var(--ease-out);
}
```

---

## 6 · Button System

```css
/* ─── Base Button Reset ───────────────────────────────── */
.btn {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  gap:             var(--space-2);
  font-family:     var(--font-body);
  font-size:       var(--text-sm);
  font-weight:     500;
  letter-spacing:  var(--tracking-wide);
  text-decoration: none;
  border:          none;
  cursor:          pointer;
  transition:
    background   var(--duration-fast) var(--ease-smooth),
    color        var(--duration-fast) var(--ease-smooth),
    box-shadow   var(--duration-normal) var(--ease-smooth),
    transform    var(--duration-fast) var(--ease-spring);
  user-select: none;
  white-space: nowrap;
}

.btn:focus-visible {
  outline:        2px solid var(--color-focus-ring);
  outline-offset: 3px;
}

.btn:active {
  transform: scale(0.97);
}

/* ─── Variants ─────────────────────────────────────────── */
.btn-primary {
  padding:       var(--space-3) var(--space-8);
  background:    var(--color-green-600);
  color:         var(--color-text-inverse);
  border-radius: var(--radius-full);
}

.btn-primary:hover {
  background:  var(--color-green-500);
  box-shadow:  var(--shadow-glow-green);
}

.btn-secondary {
  padding:       var(--space-3) var(--space-8);
  background:    transparent;
  color:         var(--color-text-primary);
  border:        1px solid var(--color-border-default);
  border-radius: var(--radius-full);
}

.btn-secondary:hover {
  border-color: var(--color-border-accent);
  background:   rgba(94,158,102,0.08);
}

.btn-ghost {
  padding:       var(--space-3) var(--space-6);
  background:    transparent;
  color:         var(--color-text-secondary);
  border-radius: var(--radius-full);
}

.btn-ghost:hover {
  color:      var(--color-text-primary);
  background: rgba(50,70,45,0.06);
}

/* Calendula orange accent button — for secondary CTAs on landing sections */
.btn-accent {
  padding:       var(--space-3) var(--space-8);
  background:    var(--color-calendula-500);
  color:         var(--color-text-inverse);
  border-radius: var(--radius-full);
}

.btn-accent:hover {
  background:  var(--color-calendula-400);
  box-shadow:  var(--shadow-glow-amber);
}

/* Icon button */
.btn-icon {
  width:         36px;
  height:        36px;
  padding:       0;
  background:    rgba(255,253,248,0.72);
  color:         var(--color-text-secondary);
  border:        1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  backdrop-filter: blur(8px);
}

.btn-icon:hover {
  background:    rgba(94,158,102,0.14);
  color:         var(--color-green-700);
  border-color:  var(--color-border-accent);
}

/* Sizes */
.btn-sm { padding: var(--space-2) var(--space-5); font-size: var(--text-xs); }
.btn-lg { padding: var(--space-4) var(--space-10); font-size: var(--text-base); }
```

---

## 7 · Hero Section Patterns

### 7.1 Full-Bleed Atmospheric Hero

The hero uses a full-bleed photo. Text MUST use `--color-text-inverse` (light) since the photo is still partially darkened for legibility.

```css
.hero-atmospheric {
  position:     relative;
  min-height:   100svh;
  display:      flex;
  align-items:  center;
  overflow:     hidden;
}

.hero-atmospheric__bg {
  position:   absolute;
  inset:      0;
  z-index:    0;
}

.hero-atmospheric__bg img {
  width:       100%;
  height:      100%;
  object-fit:  cover;
  object-position: center;
  /* Lighter than before — fields at morning, not dusk */
  filter:      saturate(1.05) brightness(0.72);
}

/* Botanical leaf overlays (decorative, positioned absolutely) */
.hero-atmospheric__leaf {
  position:  absolute;
  pointer-events: none;
  z-index:   2;
  opacity:   0.55;
  filter:    saturate(0.85) brightness(1.05);
}

.hero-atmospheric__leaf--tl {
  top: -5%; left: -3%;
  width: 35%;
  transform: rotate(-15deg);
}

.hero-atmospheric__leaf--br {
  bottom: -8%; right: -2%;
  width: 28%;
  transform: rotate(170deg) scaleX(-1);
}

.hero-atmospheric__vignette {
  position:   absolute;
  inset:      0;
  z-index:    1;
  background: radial-gradient(
    ellipse 90% 80% at 50% 50%,
    transparent 30%,
    rgba(25,40,25,0.50) 100%
  );
}

/* Bottom gradient — helps reading headline on bright sky photos */
.hero-atmospheric__fade-bottom {
  position:   absolute;
  bottom:     0; left: 0; right: 0;
  height:     40%;
  z-index:    1;
  background: linear-gradient(
    to top,
    rgba(20,35,22,0.55) 0%,
    transparent 100%
  );
}

.hero-atmospheric__content {
  position:  relative;
  z-index:   3;
  padding:   var(--section-y) var(--section-x);
  max-width: 620px;
}

.hero-atmospheric__eyebrow {
  font-family:    var(--font-body);
  font-size:      var(--text-xs);
  font-weight:    500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  /* Light color — eyebrow always sits on photo bg */
  color:          var(--color-green-200);
  margin-bottom:  var(--space-4);
  display:        flex;
  align-items:    center;
  gap:            var(--space-3);
}

.hero-atmospheric__eyebrow::before,
.hero-atmospheric__eyebrow::after {
  content:  '✦';
  font-size: 0.6em;
  opacity:  0.7;
}

.hero-atmospheric__headline {
  font-family:    var(--font-display);
  font-size:      clamp(var(--text-4xl), 7vw, var(--text-6xl));
  font-weight:    400;
  line-height:    var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  /* Light text on photo bg */
  color:          var(--color-text-inverse);
  margin-bottom:  var(--space-6);
}

.hero-atmospheric__headline em {
  font-style: italic;
  color:      var(--color-calendula-300);
}

.hero-atmospheric__body {
  font-size:     var(--text-lg);
  color:         rgba(250, 250, 246, 0.75); /* explicit — always on photo bg */
  line-height:   var(--leading-loose);
  max-width:     480px;
  margin-bottom: var(--space-8);
}

.hero-atmospheric__actions {
  display:  flex;
  gap:      var(--space-4);
  flex-wrap: wrap;
}
```

### 7.2 Terrarium Feature Element

```css
/* Glass dome with light botanical feel */
.terrarium {
  position:       relative;
  display:        inline-flex;
  align-items:    flex-end;
  justify-content: center;
}

.terrarium__dome {
  position:       absolute;
  top:            0; left: 50%;
  transform:      translateX(-50%);
  width:          85%;
  height:         90%;
  border:         1px solid rgba(255,255,255,0.60);
  border-radius:  50% 50% 10% 10% / 55% 55% 10% 10%;
  background:     rgba(255,255,255,0.20);
  backdrop-filter: blur(8px);
  box-shadow:
    inset 0 0 40px rgba(255,255,255,0.25),
    0 0 30px rgba(50,70,45,0.08);
  pointer-events: none;
}

.terrarium__dome::before {
  content: '';
  position: absolute;
  top: 8%; left: 15%;
  width: 20%;
  height: 35%;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.40) 0%,
    transparent 60%
  );
  border-radius: 50%;
  filter: blur(4px);
}

.terrarium__base {
  width:         70%;
  height:        14px;
  background:    linear-gradient(
    180deg,
    rgba(94,158,102,0.45) 0%,
    rgba(50,75,55,0.35) 100%
  );
  border-radius: var(--radius-sm);
  box-shadow:    0 4px 16px rgba(50,70,45,0.15);
}

.terrarium__plant {
  position:  absolute;
  bottom:    14px;
  left:      50%;
  transform: translateX(-50%);
  z-index:   2;
}
```

---

## 8 · Botanical Decorative System

### 8.1 Floating Leaf Utility Classes

In the light theme, leaf accents are softer and slightly more saturated — they read well against the warm ivory canvas.

```css
.leaf-accent {
  position:       absolute;
  pointer-events: none;
  user-select:    none;
  opacity:        0.35;
  filter:         saturate(0.80) brightness(0.95);
  z-index:        0;
}

.leaf-accent--fade-in {
  animation: leafFadeIn 1.2s var(--ease-out) both;
}

@keyframes leafFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 0.35; transform: translateY(0); }
}
```

### 8.2 Section Divider

```css
.section-divider {
  width:   100%;
  height:  1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-border-default) 20%,
    var(--color-border-default) 80%,
    transparent 100%
  );
  margin: var(--space-16) 0;
  position: relative;
}

.section-divider::before {
  content:  '✦';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color:      var(--color-green-400);
  font-size:  var(--text-xs);
  background: var(--color-bg-void); /* light bg — matches page canvas */
  padding:    0 var(--space-3);
}
```

---

## 9 · Scroll Animation Patterns

Use `IntersectionObserver` to add `.is-visible` on scroll entry. CSS handles the reveal.

```css
/* Base hidden state */
[data-reveal] {
  opacity:   0;
  transform: translateY(28px);
  transition:
    opacity   var(--duration-reveal) var(--ease-out),
    transform var(--duration-reveal) var(--ease-out);
}

/* Delay variants — add data-reveal-delay="1|2|3" */
[data-reveal-delay="1"] { transition-delay: 100ms; }
[data-reveal-delay="2"] { transition-delay: 200ms; }
[data-reveal-delay="3"] { transition-delay: 320ms; }
[data-reveal-delay="4"] { transition-delay: 440ms; }

/* Visible state */
[data-reveal].is-visible {
  opacity:   1;
  transform: translateY(0);
}

/* Horizontal reveal (for feature grids) */
[data-reveal="left"]  { transform: translateX(-28px); }
[data-reveal="right"] { transform: translateX(28px); }
[data-reveal="left"].is-visible,
[data-reveal="right"].is-visible { transform: translateX(0); }
```

```js
// Paste in main.js — handles all [data-reveal] elements
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
```

---

## 10 · Form Elements

```css
.input {
  width:           100%;
  padding:         var(--space-3) var(--space-5);
  background:      rgba(255, 253, 248, 0.75);
  color:           var(--color-text-primary);
  font-family:     var(--font-body);
  font-size:       var(--text-sm);
  border:          1px solid var(--color-border-default);
  border-radius:   var(--radius-md);
  outline:         none;
  transition:
    border-color var(--duration-fast) var(--ease-smooth),
    box-shadow   var(--duration-fast) var(--ease-smooth),
    background   var(--duration-fast) var(--ease-smooth);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.input:focus {
  background:   rgba(255, 255, 255, 0.92);
  border-color: var(--color-green-500);
  box-shadow:   0 0 0 3px var(--color-focus-ring);
}

.label {
  display:        block;
  font-family:    var(--font-body);
  font-size:      var(--text-xs);
  font-weight:    500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color:          var(--color-text-tertiary);
  margin-bottom:  var(--space-2);
}
```

---

## 11 · Badge / Tag System

```css
.badge {
  display:         inline-flex;
  align-items:     center;
  gap:             var(--space-1);
  padding:         var(--space-1) var(--space-3);
  font-family:     var(--font-body);
  font-size:       var(--text-xs);
  font-weight:     500;
  letter-spacing:  var(--tracking-wide);
  border-radius:   var(--radius-full);
  white-space:     nowrap;
}

/* Light-mode badge variants */
.badge-green  {
  background: rgba(77,133,84,0.12);
  color:      var(--color-green-700);
  border:     1px solid rgba(77,133,84,0.25);
}
.badge-amber  {
  background: rgba(196,120,32,0.12);
  color:      var(--color-amber-700);
  border:     1px solid rgba(196,120,32,0.25);
}
.badge-calendula {
  background: rgba(220,126,24,0.12);
  color:      var(--color-calendula-600);
  border:     1px solid rgba(220,126,24,0.28);
}
.badge-sage   {
  background: rgba(110,143,117,0.12);
  color:      var(--color-sage-700);
  border:     1px solid rgba(110,143,117,0.25);
}
.badge-glass  {
  background: var(--color-glass-fill);
  color:      var(--color-text-secondary);
  border:     1px solid var(--color-glass-border);
  backdrop-filter: blur(8px);
}
```

---

## 12 · Footer Pattern

```css
.footer-primary {
  background:    var(--color-bg-elevated);
  border-top:    1px solid var(--color-border-subtle);
  padding:       var(--space-16) var(--section-x) var(--space-8);
}

.footer-grid {
  display:               grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap:                   var(--space-12);
  margin-bottom:         var(--space-12);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap:                   var(--space-8);
  }
}

.footer-brand {
  font-family:    var(--font-display);
  font-size:      var(--text-2xl);
  font-weight:    500;
  color:          var(--color-text-primary);
  margin-bottom:  var(--space-4);
}

.footer-tagline {
  font-size:   var(--text-sm);
  color:       var(--color-text-tertiary);
  line-height: var(--leading-loose);
  max-width:   280px;
}

.footer-heading {
  font-family:    var(--font-body);
  font-size:      var(--text-xs);
  font-weight:    500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color:          var(--color-text-tertiary);
  margin-bottom:  var(--space-5);
}

.footer-links {
  list-style:     none;
  padding:        0;
  margin:         0;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-3);
}

.footer-link {
  font-size:       var(--text-sm);
  color:           var(--color-text-secondary);
  text-decoration: none;
  transition:      color var(--duration-fast);
}

.footer-link:hover {
  color: var(--color-green-700);
}

.footer-bottom {
  padding-top:     var(--space-8);
  border-top:      1px solid var(--color-border-subtle);
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  flex-wrap:       wrap;
  gap:             var(--space-4);
}

.footer-copyright {
  font-size: var(--text-xs);
  color:     var(--color-text-tertiary);
}

.footer-socials {
  display:    flex;
  gap:        var(--space-3);
  align-items: center;
}
```

---

## 13 · Audit Checklist — Run Before Every Commit

OpenCode MUST verify these before marking any UI task complete:

### Visual Checks
```
[ ] All colors derive from CSS custom properties defined in §2.1
[ ] No hex codes appear inline in component CSS (only tokens)
[ ] Background is light: bg-void (#FAFAF6) or bg-base (#F2EFE7) — no dark canvas
[ ] At least one glass card uses backdrop-filter + correct frosted fill + border
[ ] Body font is DM Sans; display font is Cormorant Garamond
[ ] No inline `style` attributes that override token values
[ ] All images use object-fit: cover or contain — no stretching
[ ] Product images have the pedestal disc shadow effect
[ ] Focus states are visible (focus-visible with focus-ring token)
[ ] Reduced motion query is present in global CSS
[ ] No hardcoded pixel widths on text containers (use max-width + %)
[ ] Card hover states include translateY(-3px) lift
[ ] CTAs are rounded-full pills, NOT square or slightly rounded
[ ] Type scale uses clamp() for hero headline at minimum
[ ] Scroll reveal observer is attached on page init
[ ] No pure black (#000000) or near-black canvas backgrounds outside the hero photo overlay
[ ] Hero text uses --color-text-inverse (light) since it sits on a darkened photo
[ ] Botanical decorative elements have pointer-events: none
[ ] Footer uses the grid pattern from §12 with bg-elevated background
[ ] Calendula orange token (--color-calendula-500) used on at least one accent per page
[ ] Section divider center character background matches --color-bg-void (light)
```

### Business Integrity Checks
```
[ ] ZERO price mentions anywhere on any page
[ ] ZERO payment term mentions anywhere on any page
[ ] MOQ (500–1,000 KG) shown on every product page and catalog card
[ ] "Free samples / customer pays shipping" shown on product pages and contact page
[ ] At least one certification badge group visible above the fold or in the hero
[ ] Every product page has a "Request a Quote" or "Get a Sample" CTA
[ ] Contact page shows all channels: phone, email, WhatsApp, Telegram
[ ] Footer includes phone +201120238857 / +201127703323 and email info@calendula-herbs.com
[ ] No AI-sounding superlatives ("cutting-edge", "revolutionary", "state-of-the-art")
[ ] Company heritage stats present on About page: 45yr / 25yr / 11yr
[ ] BIOFACH participation mentioned in Achievements or About section
[ ] "Custom cut sizing and labeling available" stated at least once in product sections
[ ] Sterilization services (steam / freeze) mentioned in services or FAQ
[ ] No pricing CTAs ("Buy Now", "Add to Cart", "Shop") — only "Request Quote" / "Contact Us" / "Get a Sample"
```

---

## 14 · File Editing Instructions for OpenCode

When Antigravity / OpenCode processes an existing project using this guideline:

### Step 1 — Locate and replace CSS variables
Find any existing `:root {}` variable declarations. **Replace entirely** with the token block from §2.1. Do not merge — replace.

### Step 2 — Replace font imports
Find `<link rel="stylesheet">` font imports or `@import url()` font declarations. Replace with the four-family import from §2.2.

### Step 3 — Rewrite dark background colors
Find any `background-color: #000`, `background: #0*` (near-black dark backgrounds), or any `background: #1*` (dark greens). Replace with the appropriate light token (`--color-bg-void`, `--color-bg-base`, or `--color-bg-elevated`). **Exception:** hero photo overlays and feature card overlays intentionally remain dark for text legibility — do NOT lighten those.

### Step 4 — Refactor card components
For any existing `.card`, `.product-card`, `.item`, `.tile` classes, apply the `.card-glass` base pattern from §3. If the card contains an image, add the pedestal disc shadow from `.card-product__stage::after`.

### Step 5 — Upgrade buttons
Replace any button styles with variants from §6. Ensure all pill shapes use `border-radius: var(--radius-full)`. Replace all "Buy", "Add to Cart", "Shop" text with "Request Quote", "Get a Sample", or "Contact Us".

### Step 6 — Apply scroll reveals
Add `data-reveal` attributes to all `.section > *:first-child`, all product cards, and all `.card-feature` elements. Attach the observer from §9.

### Step 7 — Remove any pricing
Search for: `$`, `€`, `£`, `EGP`, `USD`, `/kg`, `/ton`, `price`, `Price`, `cost`, `Cost`. If found in user-facing HTML/JSX/templates — **delete the element entirely** and replace with a "Request Quote" CTA.

### Step 8 — Add MOQ to all product cards
Every product card must include: `<span class="badge badge-green">Min. Order: 500–1,000 KG</span>`

### Step 9 — Add certification strip
The `.cert-strip` component from §18 must appear: (a) in the hero or immediately below it on the homepage, and (b) on the About/Certifications page.

### Step 10 — Validate with audit checklist
Run every item in §13 (both Visual and Business Integrity). File is ready only when all boxes pass.

---

## 15 · Do Not

These patterns directly contradict the visual language of this system and must **never** appear:

- `background: #060D08` or any near-black canvas (this is a light-first theme)
- `background: #0D1F12` or similar dark forest-green backgrounds as page fill
- `border-radius: 0` or `border-radius: 4px` on cards
- `font-family: Arial, Helvetica, sans-serif` or Bootstrap defaults
- `box-shadow: none` on cards — shadow tokens are required for the glass effect
- Gradient from light to black/dark as a section background (hero overlays are excepted)
- High-saturation primary colors for CTA backgrounds (no red, no bright blue)
- Dense text blocks without line-height ≥ 1.6
- Product images without drop-shadow and pedestal
- Flat icon buttons (always frosted-glass `.btn-icon` style)
- Navigation without sticky + backdrop-blur behavior
- Multiple script font uses per view (max one per page)
- Decorative leaf/botanical assets without `pointer-events: none`
- Pure `#FFFFFF` white for backgrounds — always use the warm ivory tokens

---

*End of Botanical Light Glass Design System v1.0 — Calendula Dawn Edition*
*Maintained for use with Antigravity / OpenCode IDE*

---

## 16 · Site Architecture

### Required Pages & Navigation Order

```
Home
├── About
│   ├── Our Story (timeline: 1980 → 2000 → 2014)
│   └── Meet the Team
├── Products
│   ├── Herbs
│   ├── Spices
│   ├── Seeds
│   └── Herbal Tea
├── Certifications & Quality
├── Achievements (Expos, TV interviews, Facilities & Farms, Shipments)
└── Contact
```

### Navigation Rules

- Sticky nav with frosted white glass blur as defined in §5
- Primary CTA in nav: **"Get a Quote"** (green pill button, opens contact modal or goes to /contact)
- Secondary nav items: plain links, sentence case except brand name
- Mobile: hamburger → full-screen overlay menu with `--color-bg-void` background (light)
- Logo text: "Calendula Herbs" in `--font-display`, weight 500 — never use a generic wordmark unless the actual SVG logo is available

### Page Title Template

```
{Page Name} | Calendula Herbs For Import & Export
```

---

## 17 · Product Catalog Pattern

### Product Categories

| Category | Key Products (examples) |
|----------|------------------------|
| **Herbs** | Calendula Flowers, Chamomile, Hibiscus, Basil, Peppermint, Spearmint, Rosemary, Parsley, Dill, Marjoram, Lemon Grass, Henna |
| **Spices** | Coriander, Cumin, Cinnamon, Clove, Laurel, Turmeric, Black Pepper |
| **Seeds** | Fennel, Anise, Caraway, Fenugreek, Sesame (White/Golden), Sunflower, Flaxseed |
| **Herbal Tea** | Chamomile Tea, Hibiscus Tea, Mint Tea, Lemon Verbena Tea, Mixed Blends |

### Product Card HTML Pattern

Every product card MUST follow this exact structure:

```html
<article class="card-glass card-product" data-reveal>
  <div class="card-product__stage">
    <img
      src="[product-image]"
      alt="[Product Name] — dried herbs from Fayoum, Egypt"
      class="card-product__image"
      loading="lazy"
    />
  </div>
  <div class="card-product__body">
    <span class="card-product__label">[Category]</span>
    <h3 class="card-product__name">[Product Name]</h3>
    <p class="card-product__cuts">Available: Whole · Large Cut · Fine Cut · Powder</p>
    <div class="card-product__footer">
      <span class="badge badge-green moq-badge">Min. 500–1,000 KG</span>
      <a href="/contact?product=[slug]" class="btn btn-icon" aria-label="Request quote">
        <!-- arrow-right or mail icon SVG -->
      </a>
    </div>
  </div>
</article>
```

### Product Detail Page Pattern (ASCII wireframe)

```
┌─────────────────────────────────────────────────────┐
│  [Breadcrumb: Products > Herbs > Chamomile]         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Large product image — glass card style]           │
│                                                     │
│  ┌─────────────────────────────────┐                │
│  │  CHAMOMILE                      │                │
│  │  Egyptian Dried Chamomile Flower│                │
│  │                                 │                │
│  │  Origin: Fayoum, Egypt          │                │
│  │  Form: Whole · Large Cut · Fine │                │
│  │  Cut · Powder · T.B.C           │                │
│  │                                 │                │
│  │  [badge] EU Organic             │                │
│  │  [badge] ISO 22000              │                │
│  │  [badge] USDA NOP               │                │
│  │                                 │                │
│  │  Min. Order: 500 – 1,000 KG     │                │
│  │  ✓ Free samples available       │                │
│  │  ✓ Custom cut & labeling        │                │
│  │  ✓ Sterilization on request     │                │
│  │                                 │                │
│  │  [  Request a Quote  ] [Sample] │                │
│  └─────────────────────────────────┘                │
│                                                     │
│  ── ABOUT THIS PRODUCT ──────────────────────────── │
│  [Description paragraph]                            │
│                                                     │
│  ── RELATED PRODUCTS ───────────────────────────── │
│  [3-col product card grid]                          │
└─────────────────────────────────────────────────────┘
```

### Cut / Form Options (standard across products)

```
Whole · Large Cut (L.C.) · Fine Cut (F.C.) · Crushed · Ground / Powder · T.B.C (To Be Confirmed)
```

Display these as small pill badges or a comma-separated list below the product name. Never show as a price table.

---

## 18 · Certification System

### Certification Component

```css
/* ─── Certification Badge Strip ─────────────────── */
.cert-strip {
  display:         flex;
  flex-wrap:       wrap;
  gap:             var(--space-3);
  align-items:     center;
  padding:         var(--space-6) var(--space-8);
  background:      rgba(255, 253, 248, 0.72);
  backdrop-filter: blur(14px);
  border:          1px solid var(--color-border-subtle);
  border-radius:   var(--radius-lg);
  box-shadow:      0 2px 16px rgba(50,70,45,0.06);
}

.cert-badge {
  display:         inline-flex;
  align-items:     center;
  gap:             var(--space-2);
  padding:         var(--space-2) var(--space-4);
  background:      rgba(77,133,84,0.10);
  color:           var(--color-green-700);
  font-family:     var(--font-body);
  font-size:       var(--text-xs);
  font-weight:     500;
  letter-spacing:  var(--tracking-wide);
  border:          1px solid rgba(77,133,84,0.22);
  border-radius:   var(--radius-full);
  white-space:     nowrap;
  transition:      background var(--duration-fast), border-color var(--duration-fast);
}

.cert-badge:hover {
  background:    rgba(77,133,84,0.18);
  border-color:  rgba(94,158,102,0.42);
}

.cert-badge__icon {
  width:  14px;
  height: 14px;
  color:  var(--color-calendula-500);  /* Calendula orange checkmark */
}

/* ─── Large Certification Card (for Certifications page) ── */
.cert-card {
  padding:       var(--space-6);
  text-align:    center;
  display:       flex;
  flex-direction: column;
  align-items:   center;
  gap:           var(--space-3);
}

.cert-card__logo {
  width:  72px;
  height: 72px;
  object-fit: contain;
  filter: brightness(0.95) saturate(0.9);
}

.cert-card__name {
  font-family: var(--font-display);
  font-size:   var(--text-lg);
  font-weight: 500;
  color:       var(--color-text-primary);
}

.cert-card__desc {
  font-size:  var(--text-sm);
  color:      var(--color-text-secondary);
  max-width:  200px;
  text-align: center;
}
```

### The 11 Certifications — Exact Names & Short Descriptions

Use these exact names and copy on the Certifications page:

| Badge Label | Full Name | Short description |
|-------------|-----------|-------------------|
| ISO 9001 | ISO 9001:2015 | Quality Management System |
| ISO 22000 | ISO 22000:2018 | Food Safety Management |
| EU Organic | EU Organic Certification | Meets European organic standards |
| SEDEX / Semeta | SEDEX Member | Ethical trade & supply chain transparency |
| HALAL | HALAL Certified | Compliant with Islamic dietary law |
| KOSHER | KOSHER Certified | Compliant with Jewish dietary law |
| USDA NOP | USDA National Organic Program | USA organic standard compliance |
| FDA Approval | FDA Registered Facility | US Food & Drug Administration approved |
| BRCGS | BRCGS Food Safety | British Retail Consortium global standard |
| NFSA Whitelist | NFSA Approved Supplier | National Food Safety Authority whitelist |
| AHK Member | AHK Council Member | German-Arab Chamber of Commerce member |

### Placement Rules

- **Homepage**: cert-strip (compact badges) — below hero, above product categories
- **Product pages**: 3–5 relevant cert badges shown inline on each product card or detail page
- **About page**: full cert-card grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- **Footer**: small text list of 4–5 most notable certs (ISO 9001, EU Organic, HALAL, KOSHER, FDA)

---

## 19 · Quote Request & Contact Flow

### CTA Hierarchy (in order of priority on each page)

1. **"Get a Quote"** — primary pill button, `btn-primary` style, opens `/contact` or modal
2. **"Request a Sample"** — secondary pill button, `btn-secondary` style
3. **"WhatsApp Us"** — icon + text, `btn-ghost` style, `wa.me/201120238857`
4. **"Book a Call"** — text link, lighter weight, for more formal inquiries

### Contact Page Component

```html
<!-- Contact page — all channels displayed -->
<section class="section contact-hub">
  <div class="container">
    <div class="contact-hub__grid">

      <!-- Left: Form -->
      <div class="contact-hub__form card-glass">
        <h2>Request a Quote</h2>
        <p class="contact-hub__note">
          Pricing and payment terms are provided after we understand
          your requirements. Fill in the form or reach us directly.
        </p>
        <!-- Form fields: Name, Company, Country, Product of Interest,
             Estimated Quantity (KG), Message, Sample Request checkbox -->
        <!-- Submit button text: "Send Inquiry" NOT "Submit" -->
      </div>

      <!-- Right: Direct channels -->
      <div class="contact-hub__channels">
        <div class="channel-card card-glass">
          <span class="channel-card__icon">📞</span>
          <span class="channel-card__label">Phone / WhatsApp</span>
          <a href="tel:+201120238857" class="channel-card__value">+20 112 023 8857</a>
          <a href="tel:+201127703323" class="channel-card__value">+20 112 770 3323</a>
        </div>
        <div class="channel-card card-glass">
          <span class="channel-card__icon">✉️</span>
          <span class="channel-card__label">Email</span>
          <a href="mailto:info@calendula-herbs.com" class="channel-card__value">info@calendula-herbs.com</a>
        </div>
        <div class="channel-card card-glass">
          <span class="channel-card__icon">📍</span>
          <span class="channel-card__label">Address</span>
          <p class="channel-card__value">New Seat St., Ibshway<br>Fayoum, Egypt — ZIP 63611</p>
        </div>
        <!-- WhatsApp / Telegram / Viber quick-connect buttons row -->
      </div>

    </div>
  </div>
</section>
```

```css
.contact-hub__grid {
  display:               grid;
  grid-template-columns: 1.4fr 1fr;
  gap:                   var(--space-8);
  align-items:           start;
}

@media (max-width: 768px) {
  .contact-hub__grid { grid-template-columns: 1fr; }
}

.contact-hub__note {
  font-size:   var(--text-sm);
  color:       var(--color-text-secondary);
  margin:      var(--space-3) 0 var(--space-6);
  line-height: var(--leading-loose);
  padding:     var(--space-4);
  border-left: 2px solid var(--color-calendula-500);
  background:  rgba(220,126,24,0.06);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.channel-card {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2);
  padding:        var(--space-5) var(--space-6);
  margin-bottom:  var(--space-3);
}

.channel-card__label {
  font-size:      var(--text-xs);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color:          var(--color-text-tertiary);
}

.channel-card__value {
  font-size:       var(--text-base);
  color:           var(--color-text-primary);
  text-decoration: none;
  transition:      color var(--duration-fast);
}

.channel-card__value:hover {
  color: var(--color-green-700);
}
```

### Sample Request Policy (copy to use verbatim on site)

> **Free Samples Available**
> We offer complimentary product samples so you can assess quality before committing to an order. The samples themselves are free of charge — the customer is responsible for arranging and covering the shipping cost.

### External Analysis (copy to use)

> **Third-Party Analysis**
> External quality analysis can be arranged upon request. Laboratory and testing costs are covered by the customer.

### Sterilization (copy to use)

> **Sterilization Services**
> We offer steam sterilization and freeze sterilization through certified external facilities. Sterilization costs are covered by the customer.

---

## 20 · Copy Tone & Writing Rules

### Voice Characteristics

| Do | Don't |
|----|-------|
| Confident, grounded, professional | Salesy, pushy, over-hyped |
| Specific ("45 years", "ISO 22000") | Vague ("world-class quality") |
| Heritage-forward ("Family business since 1980") | Startup-speak ("disruptive", "innovative solution") |
| Partnership language ("together", "your requirements") | Transaction language ("buy now", "limited offer") |
| Passive trust ("trusted by importers for 20+ years") | Active selling ("the best herbs you'll ever find") |
| Egyptian pride without nationalism | No political statements |

### Forbidden Phrases (never use these)

```
"Buy Now"  |  "Add to Cart"  |  "Shop Now"  |  "Order Now"
"Best price"  |  "Cheapest"  |  "Discount"  |  "Special offer"
"Revolutionary"  |  "Cutting-edge"  |  "State-of-the-art"
"World-class"  |  "Industry-leading"  (unless quoting a cert body)
"Click here"  |  "Learn more" (as a standalone CTA — be specific instead)
Any mention of price, cost, or payment terms
```

### Approved CTA Phrases

```
"Request a Quote"        — primary inquiry CTA
"Get a Sample"           — sample inquiry CTA
"Contact Us"             — general contact
"Book a Call"            — call scheduling
"Send an Inquiry"        — form submit label
"Explore Our Products"   — product section
"View All [Category]"    — see more link
"Download Product Sheet" — if PDF is available
"Meet the Team"          — about/team link
```

### Hero Headline Formulas

These structures work for Calendula's positioning:

```
[Heritage claim]. [Scope statement].
→ "45 Years of Growing. Trusted Across 5 Continents."

[Place] to [destination].
→ "From Fayoum's Farms to the World's Tables."

[Adjective] [product] [for whom].
→ "Premium Egyptian Herbs for Discerning Global Buyers."

[Action] [product type] [standard].
→ "Exporting Organic Herbs That Meet Every International Standard."
```

### Company Description (standard short version)

> Calendula Herbs For Import & Export is a Fayoum-based company with 45 years of farming experience, 25 years of processing expertise, and 11 years as a direct exporter of dried herbs, spices, herbal teas, and seeds to buyers across the world. With our own farms, contracted certified farms, and fully equipped processing facilities, we deliver traceable, certified, and customizable botanical products at scale.

### Company Description (one-liner)

> Specialists in exporting premium Egyptian dried herbs, spices, herbal tea, and seeds — certified, traceable, and customizable from farm to shipment.

---

## 21 · Hard Business Rules — Never Violate

These rules are absolute. Any AI agent, model, or developer working on this site MUST NOT break them under any circumstances, regardless of what a template, CMS, or plugin might default to.

### Pricing & Commercial Terms
```
RULE 1: No prices on any public-facing page, component, or text node — ever.
RULE 2: No payment terms (Net 30, L/C, T/T, wire transfer, etc.) on site.
RULE 3: No discount badges, sale indicators, or promotional pricing.
RULE 4: If any e-commerce plugin or CMS auto-populates a price field, it MUST be hidden via CSS (display: none) or removed from the template entirely.
```

### Product Compliance
```
RULE 5: Every product page must show the MOQ: "Min. Order: 500–1,000 KG"
RULE 6: Every product page must show applicable certifications.
RULE 7: Every product page must show available cut forms.
RULE 8: Sample policy must appear on product detail pages.
```

### Contact & Conversion
```
RULE 9: The primary conversion action across the entire site is "contact the business" — never a checkout or purchase flow.
RULE 10: Every page must have at least one contact CTA visible without scrolling (in nav or hero).
RULE 11: Contact page must show all channels: phone, email, WhatsApp, Telegram, physical address.
```

### Trust & Credibility
```
RULE 12: Certifications must be visible on homepage, about page, and product pages.
RULE 13: Company timeline (1980 → 2000 → 2014) must appear on the About page.
RULE 14: BIOFACH participation (4+ years) must be mentioned in the Achievements section.
RULE 15: Customer testimonials/review videos should be featured if available (already on current site).
```

### Content
```
RULE 16: Product names must match the official catalog (no invented names).
RULE 17: Origin must always read "Ibshaway, Fayoum, Egypt" — not abbreviated.
RULE 18: Phone numbers must be formatted: +20 112 023 8857 / +20 112 770 3323
RULE 19: Email must link to: info@calendula-herbs.com
RULE 20: Footer copyright: "© [Year] Calendula Herbs For Import & Export. Ibshaway, Fayoum, Egypt."
```

---

## 22 · Homepage Section Order

This is the mandatory section sequence for the homepage. Sections may be expanded or enriched but must not be reordered or removed.

```
1.  NAV         — sticky frosted-white glass nav, "Get a Quote" CTA
2.  HERO        — full-bleed atmospheric, headline + tagline + 2 CTAs + hero image
3.  CERT STRIP  — compact certification badges (trust signal above fold)
4.  ABOUT INTRO — 3-stat row: "45 Years" / "11 Years Exporting" / "5 Continents"
5.  PRODUCTS    — 4 category cards (Herbs / Spices / Seeds / Herbal Tea)
6.  HOW IT WORKS— 4-step process: Inquiry → Sample → Order → Shipment
7.  SERVICES    — Custom cut · Custom labeling · Free samples · Sterilization
8.  BIOFACH     — Expo presence callout with image/video
9.  TESTIMONIALS— Customer review videos (from YouTube channel)
10. CONTACT CTA — Full-width section: headline + "Request a Quote" button
11. FOOTER      — 4-col grid, social links, cert list, address, copyright
```

---

## 23 · Component: Stat Counter Row

Used on homepage (§22 step 4) and About page.

```html
<div class="stat-row" data-reveal>
  <div class="stat-item">
    <span class="stat-item__number">45</span>
    <span class="stat-item__unit">Years</span>
    <span class="stat-item__label">As Farmers</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-item__number">25</span>
    <span class="stat-item__unit">Years</span>
    <span class="stat-item__label">Manufacturing</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-item__number">11</span>
    <span class="stat-item__unit">Years</span>
    <span class="stat-item__label">Direct Export</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <span class="stat-item__number">4+</span>
    <span class="stat-item__unit">Times</span>
    <span class="stat-item__label">at BIOFACH</span>
  </div>
</div>
```

```css
.stat-row {
  display:         flex;
  align-items:     stretch;
  justify-content: center;
  gap:             0;
  padding:         var(--space-10) var(--space-8);
  background:      rgba(255, 253, 248, 0.72);
  backdrop-filter: blur(14px);
  border:          1px solid var(--color-border-subtle);
  border-radius:   var(--radius-xl);
  box-shadow:      0 2px 16px rgba(50,70,45,0.06);
}

.stat-item {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            var(--space-1);
  padding:        var(--space-6) var(--space-10);
  flex:           1;
}

.stat-item__number {
  font-family:  var(--font-display);
  font-size:    clamp(var(--text-4xl), 5vw, var(--text-5xl));
  font-weight:  400;
  color:        var(--color-calendula-500);
  line-height:  1;
}

.stat-item__unit {
  font-family:    var(--font-body);
  font-size:      var(--text-sm);
  font-weight:    500;
  color:          var(--color-text-secondary);
  letter-spacing: var(--tracking-wide);
}

.stat-item__label {
  font-family:    var(--font-body);
  font-size:      var(--text-xs);
  color:          var(--color-text-tertiary);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  text-align:     center;
}

.stat-divider {
  width:        1px;
  background:   var(--color-border-subtle);
  align-self:   stretch;
  margin:       var(--space-4) 0;
}

@media (max-width: 640px) {
  .stat-row {
    flex-direction: column;
    gap:            var(--space-1);
  }
  .stat-divider {
    width:  60%;
    height: 1px;
    align-self: center;
    margin: 0;
  }
}
```

---

*End of Calendula Herbs Design System v2.0 — Botanical Light Glass, Calendula Dawn*
*Maintained for Antigravity / OpenCode IDE use*
*Client: Calendula Herbs For Import & Export, Ibshaway, Fayoum, Egypt*
*Updated: June 2026*
