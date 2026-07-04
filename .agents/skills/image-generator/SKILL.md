---
name: image-generator
description: >-
  Generate AI product photos and marketing images for free using Pollinations.ai (primary, no API key needed).
  Use this skill whenever the user asks to create product images, generate photos for products, add images to catalog items,
  make marketing visuals, or batch-generate images for database records. Also use when the user mentions needing free AI image
  generation, product photography, or white-background product shots. This skill generates images, uploads to Cloudinary,
  and creates MediaFile + ProductImage records in the database. NOT for design/illustration work (use canvas-design for that).
---

# Image Generator

Free AI image generation for product photos and marketing visuals.
Providers: **Pollinations.ai** (primary, no API key), **OpenRouter** (fallback), **Puter.js** (fallback).

## Quick Start — Single Image

```bash
node .agents/skills/image-generator/scripts/generate-image.mjs \
  --prompt "dried chamomile flowers, white background, studio lighting" \
  --output "chamomile.png"
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--prompt` | (required) | Image description |
| `--output` | `./output-{ts}.png` | Output file path |
| `--provider` | `pollinations` | `pollinations`, `openrouter`, or `puter` |
| `--width` | `1024` | Image width |
| `--height` | `1024` | Image height |

## Prompt Templates

### Product Photography (white background)

```
High-quality commercial product photo of {NAME} ({SCIENTIFIC_NAME}),
isolated on pure white background, studio lighting, professional
commercial photography, sharp focus, 4K resolution, top-down angle
```

### Hero / Marketing

```
Beautiful professional photograph of {NAME}, soft natural lighting,
organic farm setting, shallow depth of field, warm earthy tones,
8K resolution, editorial style
```

### Ingredient Close-up

```
Macro photography of dried {NAME}, rich textures visible,
dark rustic wooden surface, dramatic side lighting,
ultra-detailed, 4K resolution
```

## Mode 1: Generate & Save Locally

Run the script above. The image is saved as a `.png` file.

## Mode 2: Batch Generate for Products

Use this workflow when generating images for database products:

```javascript
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { v2 as cloudinary } from 'cloudinary'

// Step 1: Script path
const SCRIPT = '.agents/skills/image-generator/scripts/generate-image.mjs'

// Step 2: For each product, build a prompt and generate
const products = await getProductsWithoutImages()
for (const product of products) {
  const prompt = buildProductPrompt(product)
  const output = `/tmp/${product.slug}.png`
  execSync(`node ${SCRIPT} --prompt "${prompt}" --output "${output}"`, { timeout: 120000 })
  
  // Step 3: Upload to Cloudinary
  const result = await cloudinary.uploader.upload(output, {
    folder: 'calendula-herbs/products'
  })
  
  // Step 4: Create DB records
  const media = await prisma.mediaFile.create({
    data: {
      name: product.name,
      type: 'IMAGE',
      url: result.secure_url,
      cloudinaryId: result.public_id,
      mimeType: 'image/png',
      sizeBytes: result.bytes,
      width: result.width,
      height: result.height,
    }
  })
  await prisma.productImage.create({
    data: { productId: product.id, mediaFileId: media.id, isPrimary: true, order: 0 }
  })
}
```

## Mode 3: Custom Prompt

For non-product images (marketing, social media, banners):

```bash
node .agents/skills/image-generator/scripts/generate-image.mjs \
  --prompt "Your custom description here" \
  --output "marketing-image.png"
```

## What to Do When Providers Fail

1. **Pollinations.ai fails**: Usually rate/temp issues — wait 10s and retry. Never requires an API key.
2. **Pollinations.ai bad quality**: Add `--model flux` (default) or try `--model turbo`. Adjust prompt for more realism.
3. **OpenRouter 402/insufficient credits**: Use `--provider pollinations` instead (no credits needed).
4. **Puter.js insufficient credits**: Use `--provider pollinations` instead (no credits needed).
5. **All fail**: Review the prompt — simplify it, remove special characters, keep it under 400 chars.

## Bundled Resources

- `scripts/generate-image.mjs` — Standalone image generator script (3 providers: pollinations, openrouter, puter)
- `scripts/seed-product-images-ai.mjs` (in project root) — Batch seed: reads products without images, generates via Pollinations.ai, uploads to Cloudinary, creates MediaFile + ProductImage records
