# Calendula Herbs - Premium Egyptian Herbs Export Platform

**Live Website:** https://calendulaherbs.com  
**Repository:** https://github.com/Nour-Elebiary/Calendula-Herbs.com.project  
**Main Branch:** `master`

---

## 🌿 About Calendula Herbs

Calendula Herbs For Import & Export is a premier supplier of Egyptian dried herbs, spices, herbal tea, and seeds. We specialize in exporting the finest botanical products directly from Egypt's fertile lands to importers and manufacturers worldwide.

---

## ✨ Project Features

### 🎨 Enhanced UI/UX
- Professional botanical design aesthetic
- Fully responsive across all devices (mobile, tablet, desktop)
- Smooth animations and transitions
- Accessible components meeting WCAG AA standards
- 44x44px minimum touch targets for mobile usability

### 🛒 E-Commerce Ready
- Product catalog with search and filtering
- Quote request system with two-step form
- Cart management for bulk orders
- Contact form with validation

### 📱 Responsive Design
- Mobile-first approach
- Desktop optimization
- Tablet support
- Touch-friendly buttons and inputs

### ♿ Accessibility
- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- High contrast color scheme
- Proper focus indicators

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm

### Installation

```bash
# Clone repository
git clone https://github.com/Nour-Elebiary/Calendula-Herbs.com.project.git
cd Calendula-Herbs.com.project

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.development.local

# Start dev server
pnpm run dev
```

Visit `http://localhost:3000`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages
│   │   ├── page.tsx       # Home page
│   │   ├── products/      # Products catalog
│   │   ├── about/         # About page
│   │   ├── contact/       # Contact page
│   │   └── certificates/  # Quality certificates
│   └── globals.css        # Global styles & design system
│
├── components/
│   ├── ui/                # UI components (Button, Input, etc.)
│   └── public/            # Public-facing components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── CartDrawer.tsx
│       ├── ContactForm.tsx
│       └── home/          # Home page sections
│
└── lib/
    ├── animations.ts      # Framer Motion animations
    └── utils.ts           # Utility functions
```

---

## 🎯 Key Components

### Button Component
- 8 variants: default, destructive, outline, secondary, ghost, link, accent, icon
- Responsive sizing (sm, default, lg)
- Full keyboard accessibility

### Input Component
- Enhanced with error states
- Proper focus rings
- Mobile-optimized height (44px)

### ContactForm
- Real-time validation
- Error and success states
- Email validation
- Honeypot spam prevention

### Header
- Responsive navigation
- Mobile menu with animations
- Shopping cart icon with badge
- Logo adaptable to screen size

### Footer
- Responsive grid layout
- Contact information
- Quick links
- Social media integration
- Business hours display

---

## 🎨 Design System

### Colors
```css
--color-green-600: #5E9E66    /* Primary */
--color-calendula-500: #E8A500 /* Accent */
--color-bg-void: #D6CFC2       /* Background */
--color-text-primary: #324627   /* Text */
```

### Typography
- **Display:** Playfair Display (headings)
- **Body:** Lora (body text)
- **Code:** Monospace

### Spacing
- Base unit: 4px
- Uses CSS custom properties for consistency
- Responsive padding using clamp()

---

## 📦 Build & Deploy

```bash
# Build for production
pnpm run build

# Start production server
pnpm run start

# Type check
pnpm exec tsc --noEmit

# Format code
pnpm run format
```

### Deployment to Vercel
```bash
# Already connected to Vercel
# Push to master branch to auto-deploy
git push origin master
```

---

## ✅ Quality Assurance

- [x] TypeScript strict mode enabled
- [x] ESLint configured
- [x] Responsive tested (320px to 4K)
- [x] Accessibility audited (WCAG AA)
- [x] Performance optimized
- [x] Mobile UX verified
- [x] Form validation working

---

## 🔧 Environment Variables

Required variables (see `.env.example`):
```
NEXTAUTH_URL
NEXTAUTH_SECRET
DATABASE_URL
RESEND_API_KEY
CLOUDINARY_CLOUD_NAME
UPSTASH_REDIS_REST_URL
```

---

## 📚 Documentation

- **[FINAL_PROJECT_REPORT.md](./FINAL_PROJECT_REPORT.md)** - Comprehensive project report
- **[UI_UX_IMPROVEMENTS_SUMMARY.md](./UI_UX_IMPROVEMENTS_SUMMARY.md)** - Feature improvements
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Implementation details

---

## 🤝 Contributing

This is a production website. For changes:
1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Review and test before merging to master

---

## 📧 Contact

**Email:** info@calendulaherbs.com  
**Phone:** +201000000000  
**Address:** Ibshaway, Fayoum, Egypt

---

## 📄 License

Proprietary - Calendula Herbs For Import & Export

---

## 🎉 Latest Updates

**Latest Release:** UI/UX Enhancement Complete
- ✅ All button spacing fixed and responsive
- ✅ Enhanced form validation with error states
- ✅ Mobile menu fully functional
- ✅ Responsive design perfected across all breakpoints
- ✅ Master branch established as primary production branch

---

**Status:** ✅ Production Ready - All systems operational
