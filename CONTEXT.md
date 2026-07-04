# Calendula Herbs — Project Context
Last updated: 2026-06-11 | Current chunk: **8 (Public-Facing Frontend — next up)**

## Stack
Next.js 16.2.9 (App Router) + TypeScript + Tailwind CSS v4 + Radix UI
+ Prisma 6 + Supabase (PostgreSQL) + Cloudinary + NextAuth.js v5 (beta)
+ Upstash Redis + Framer Motion + Zustand + RHF + Zod

## Repo
Location: `e:\Calendula Herbs Website Project\calendula-herbs\`
Branches: main (prod) | develop (staging)
Domain: calendulaherbs.com

## Services
- Supabase: Working properly via IPv4 pooler (`aws-0-eu-west-3.pooler.supabase.com:6543`)
- Cloudinary: REPLACE_ME (not yet configured)
- Resend: REPLACE_ME (not yet configured)
- Upstash Redis: REPLACE_ME (not yet configured)

## DB Schema version
Prisma schema: `prisma/schema.prisma` (all models defined)
Migration status: ✅ **Migrated** (`20260611013013_init`)
Seed status: ✅ **Seeded** (`nour.elebiary448@gmail.com` / from `secrets.json`)

## Conventions
- All admin API routes: /api/admin/* (JWT protected via middleware)
- All public API routes: /api/public/* (read-only, rate limited)
- Zod validation on every API endpoint input
- Cloudinary signed uploads only (server generates signature)
- Images served via next/image with Cloudinary loader
- All colors via CSS variables (defined in globals.css, overridable from DB)
- Route groups: (admin-auth) for login/OTP, admin/ for dashboard
- Fonts: Inter (body via `--font-body`), Playfair Display (headings via `--font-heading`)

## Completed chunks
- [x] Chunk 0 — Skeleton (deployed to Vercel, DB migrated)
- [x] Chunk 1 — Auth Foundation (middleware, NextAuth, login IP/UA capture, session invalidation)
- [x] Chunk 2 — OTP + Account (forgot password, OTP generation via email, admin dashboard wrapper)

## Completed chunks (continued)
- [x] Chunk 3 — Cloudinary Media System
  - [x] `lib/cloudinary.ts`, `MediaUploader.tsx`, `ImageCropper.tsx`, `MediaPicker.tsx`
  - [x] `POST /api/admin/media/sign`, `POST /api/admin/media`, `GET /api/admin/media`, `DELETE /api/admin/media/[id]`, `PATCH /api/admin/media/[id]` (rename)
  - [x] `/admin/dashboard/media` — grid, filter, rename, delete, copy URL, storage bar, pagination
- [x] Chunk 4 — Gallery & Certificates Managers
  - [x] `POST/GET/PATCH /api/admin/gallery` + `GET/PATCH/DELETE /api/admin/gallery/[id]`
  - [x] `POST/PATCH /api/admin/gallery/[id]/items`, `PATCH/DELETE /api/admin/gallery/[id]/items/[itemId]`
  - [x] `POST/GET/PATCH /api/admin/certificates`, `PATCH/DELETE /api/admin/certificates/[id]`
  - [x] `/admin/dashboard/galleries` — dnd-kit list, create, rename, delete
  - [x] `/admin/dashboard/galleries/[id]` — grid items, add (media/YouTube/Drive), drag-reorder
  - [x] `/admin/dashboard/certificates` — dnd-kit list, create/edit dialog with MediaPicker
- [x] Chunk 5 — Products Manager
  - [x] `POST/GET /api/admin/products`, `GET/PATCH/DELETE /api/admin/products/[id]`
  - [x] `POST/GET/PATCH /api/admin/products/[id]/images`, `PATCH/DELETE /api/admin/products/[id]/images/[imageId]`
  - [x] `POST/GET/PATCH/DELETE /api/admin/categories` + `PATCH/DELETE /api/admin/categories/[id]`
  - [x] `/admin/dashboard/products` — table, search/filter, status/featured toggles, pagination
  - [x] `/admin/dashboard/products/[id]` — full product editor, dnd images, category checkboxes
  - [x] `/admin/dashboard/products/categories` — dnd list, inline create/rename/delete
- [x] Chunk 6 — Team & Board Manager
  - [x] `POST/GET /api/admin/team`, `GET/PATCH/DELETE /api/admin/team/[id]`, `POST /api/admin/team/reorder`
  - [x] `/admin/dashboard/team` — dnd list, TEAM/BOARD tabs, create, delete
  - [x] `/admin/dashboard/team/[id]` — full editor: name, title, bio, photo, contacts, active toggle
- [x] Chunk 7 — Site Settings & Inquiries
  - [x] `GET/PATCH /api/admin/settings` — key-value SiteSetting store
  - [x] `GET/PATCH /api/admin/contact-settings` — single ContactSetting record
  - [x] `GET/POST/PATCH /api/admin/plugins`, `PATCH/DELETE /api/admin/plugins/[id]`
  - [x] `GET /api/admin/inquiries/contact`, `PATCH/DELETE /api/admin/inquiries/contact/[id]`
  - [x] `GET /api/admin/inquiries/cart`, `PATCH/DELETE /api/admin/inquiries/cart/[id]`
  - [x] `GET /api/admin/inquiries/samples`, `PATCH/DELETE /api/admin/inquiries/samples/[id]`
  - [x] `/admin/dashboard/settings` — General / Contact / Plugins tabs
  - [x] `/admin/dashboard/inquiries` — Contact / Cart / Samples tabs with expandable cards
- [x] Chunk 8: Public-Facing Frontend Components and Layout
- [x] Chunk 9: Final Polishing, Performance Optimization, and Testing

## Key file locations
- Admin login: `src/app/(admin-auth)/admin/login/page.tsx`
- Auth config: `src/lib/auth.ts`
- DB client: `src/lib/db.ts`
- Security utils: `src/lib/security.ts`
- Rate limits: `src/lib/rate-limit.ts`
- Middleware: `src/middleware.ts`
- Globals CSS: `src/app/globals.css`
- Media API: `src/app/api/admin/media/route.ts`
- OTP API: `src/app/api/otp/send/route.ts`

## Next Steps for Production Deployment (Pending .env.local configuration)
The project codebase is completely finished. Before deploying to production, the following environment variables must be populated in `.env.local` or your hosting provider's dashboard (e.g., Vercel):

### Upstash Redis (Rate Limiting)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
*(Without these, rate limiters on public forms and logins will throw errors).*

### Cloudinary (Media Storage)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
*(Without these, media uploads and image rendering will fail).*

### Resend (Email Provider)
- `RESEND_API_KEY`
*(Without this, OTP emails for password reset will fail).*
