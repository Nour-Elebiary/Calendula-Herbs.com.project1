import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calendula-herbs.com'

  return {
    rules: [
      // ── Default: all public crawlers (Google, Bing, DuckDuckGo, Ecosia, Qwant, etc.)
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ── Baidu (百度蜘蛛) — explicit allow; Baidu sometimes ignores wildcard rules
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      // Baidu mobile crawler
      {
        userAgent: 'Baiduspider-mobile',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ── Yandex (Russia / CIS)
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ── Naver (South Korea)
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ── Seznam (Czechia)
      {
        userAgent: 'SeznamBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ── 360 Search / Haosou (China)
      {
        userAgent: 'HaosouSpider',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ── Sogou (China)
      {
        userAgent: 'Sogou web spider',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },

      // ══════════════════════════════════════════════════════════
      // AI training crawlers — BLOCKED (content stays exclusive
      // to real search engines, not used as free training data)
      // ══════════════════════════════════════════════════════════
      { userAgent: 'GPTBot',          disallow: ['/'] },
      { userAgent: 'ChatGPT-User',    disallow: ['/'] },
      { userAgent: 'CCBot',           disallow: ['/'] },
      { userAgent: 'anthropic-ai',    disallow: ['/'] },
      { userAgent: 'Claude-Web',      disallow: ['/'] },
      { userAgent: 'ClaudeBot',       disallow: ['/'] },
      { userAgent: 'Omgilibot',       disallow: ['/'] },
      { userAgent: 'FacebookBot',     disallow: ['/'] },
      { userAgent: 'Bytespider',      disallow: ['/'] },
      { userAgent: 'cohere-ai',       disallow: ['/'] },
      { userAgent: 'PerplexityBot',   disallow: ['/'] },
      { userAgent: 'ImagesiftBot',    disallow: ['/'] },
      { userAgent: 'Google-Extended', disallow: ['/'] },
    ],

    // Primary sitemap
    sitemap: `${baseUrl}/sitemap.xml`,

    // Yandex-specific: canonical preferred host
    // (prevents Yandex from treating www vs non-www as duplicate sites)
    host: baseUrl,
  }
}
