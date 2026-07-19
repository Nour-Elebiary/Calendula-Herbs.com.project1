# Bundle Analysis

## Findings

| Package | Status | Notes |
|---------|--------|-------|
| `three` / `@react-three/fiber` / `drei` | **Unused in source** | Listed in package.json but zero `import` statements in `src/`. Candidate for removal (save ~600KB+). |
| `gsap` | Used in 1 file | `Template3Carousel.tsx` imports `gsap` + `ScrollTrigger`. Keep — legitimate scroll animation use. |
| `framer-motion` | ✅ LazyMotion + domAnimation | Already optimized — only `domAnimation` features loaded, not the full library. |
| `leaflet` | **Unused in source** | No imports found in `src/`. Candidate for removal. |
| Three.js scene | — | The 3D hero/product viewer may be planned but not implemented. |

## Recommendations

1. **Remove unused deps** — `pnpm remove three @react-three/fiber @react-three/drei leaflet`
2. **Keep gsap** — legitimate use in carousel scroll-triggered animations
3. **Keep framer-motion** — used across all pages with correct LazyMotion pattern

## Font Optimization

| Font | Subset | Covers |
|------|--------|--------|
| DM Sans (body) | `latin` | Latin script — European locales |
| Cormorant Garamond (display) | `latin` | Headings |
| Noto Naskh Arabic | `arabic` | Arabic locale |
| Dancing Script | `latin` | Accent/script text |
| JetBrains Mono | `latin` | Code blocks |

Current font loading is appropriate for the 17 supported locales. Arabic has dedicated font. Cyrillic and Greek locales fallback to DM Sans latin glyphs (acceptable for B2B context).
