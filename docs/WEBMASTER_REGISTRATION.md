# Webmaster Registration Guide — calendula-herbs.com

Complete step-by-step instructions for registering with every major search engine.  
After completing each engine, set the corresponding environment variable in **Vercel → Project Settings → Environment Variables** and redeploy.

---

## Prerequisites

Before starting:
- [ ] Your site is deployed and accessible at `https://calendula-herbs.com`
- [ ] Sitemap is live at `https://calendula-herbs.com/sitemap.xml`
- [ ] `robots.txt` is live at `https://calendula-herbs.com/robots.txt`

---

## 1. Google Search Console (Priority 1)

**Portal:** https://search.google.com/search-console  
**Env var:** `GOOGLE_SITE_VERIFICATION`  
**Covers:** Google Search, Google Images, Google Shopping, Google Discover, Google Lens

### Steps
1. Log in with your Google account → **Add property**
2. Enter `https://calendula-herbs.com` (URL-prefix property type)
3. Choose **HTML tag** verification method
4. Copy the `content="…"` value only (e.g. `abc123XYZ`)
5. Set `GOOGLE_SITE_VERIFICATION=abc123XYZ` in Vercel → redeploy
6. Click **Verify** in GSC

### After verification
- **Sitemaps** → Add `https://calendula-herbs.com/sitemap.xml`
- **URL Inspection** → Test your homepage and a few product pages
- **Coverage** → Monitor for crawl errors (the 429 errors should be gone after domain fix)
- Enable **Email alerts** for coverage drops

### Pro tip for AEO
Enable **Search Appearance → Rich results** notifications. The FAQPage schema added to your layout will make you eligible for FAQ accordions in Google results.

---

## 2. Bing Webmaster Tools (Priority 1)

**Portal:** https://www.bing.com/webmasters/  
**Env var:** `BING_SITE_VERIFICATION`  
**Covers:** Bing, Microsoft Copilot (AI answers), DuckDuckGo, Ecosia, Qwant, Yahoo

> DuckDuckGo, Ecosia, Qwant, and Yahoo all use Bing's index. By registering with Bing you automatically cover all of them.

### Steps
1. Sign in with Microsoft account → **Add a site**
2. Enter `https://calendula-herbs.com`
3. Choose **XML file** method → the file is already at `/public/BingSiteAuth.xml`
4. Replace `REPLACE_WITH_BING_VERIFICATION_CODE` in the file with the code Bing gives you
5. Deploy → click **Verify**
6. Alternatively use **Meta tag** method: copy `content="…"` value → set `BING_SITE_VERIFICATION=…` in Vercel → redeploy → verify

### After verification
- **Sitemaps** → Submit `https://calendula-herbs.com/sitemap.xml`
- **URL submission** → Submit your top 10 product pages manually for faster indexing
- Enable **IndexNow** (Bing's instant indexing API) — ping on every new product

---

## 3. Yandex Webmaster (Priority 1 — Russia/CIS market)

**Portal:** https://webmaster.yandex.com  
**Env var:** `YANDEX_VERIFICATION`  
**Covers:** Yandex Search, Yandex Images, Yandex Market-adjacent results

> Russia, Ukraine, Belarus, Kazakhstan, and other CIS countries are significant buyers of Egyptian herbs and spices. Yandex dominates search in these markets.

### Steps
1. Create a Yandex account (or use existing) → go to **webmaster.yandex.com**
2. Click **Add site** → enter `https://calendula-herbs.com`
3. Choose **Meta tag** verification
4. Copy the `content="…"` value → set `YANDEX_VERIFICATION=…` in Vercel → redeploy
5. Click **Check** in Yandex Webmaster

### After verification
- **Sitemap files** → Add `https://calendula-herbs.com/sitemap.xml`
- The `host:` directive in `robots.txt` already tells Yandex your canonical host
- **Site geography** → Set to "Egypt" for better regional ranking
- **Search queries** → Monitor which Russian/CIS queries drive traffic

---

## 4. Baidu Ziyuan — 百度站长平台 (Priority 2 — China #1)

**Portal:** https://ziyuan.baidu.com  
**Env var:** `BAIDU_SITE_VERIFICATION`  
**Covers:** Baidu (70%+ of Chinese search market)

> Baidu requires a Chinese phone number for SMS OTP during registration. If you don't have one, use a Baidu-approved proxy verification service or ask a Chinese business contact.

### Steps
1. Create a Baidu account at https://passport.baidu.com/
2. Go to https://ziyuan.baidu.com/ → **用户中心** → **添加网站** (Add site)
3. Enter `https://calendula-herbs.com`
4. Choose **Meta tag verification** (HTML标签验证)
5. Copy the `content="…"` value → set `BAIDU_SITE_VERIFICATION=…` in Vercel → redeploy
6. Click **完成验证** (Complete verification)

### Alternatively — HTML file verification
1. Choose **HTML file verification** (HTML文件验证)
2. Baidu gives you a filename like `baidu_verify_XXXXXXXX.html`
3. Rename `/public/baidu_verify_RENAME_ME.html` to that exact filename
4. Replace the file content with what Baidu gives you → deploy

### After verification
Add a Baidu Auto Push plugin via admin panel → Plugins → Add HEAD plugin:
```html
<script>
(function(){
  var bp = document.createElement('script');
  var curProtocol = window.location.protocol.split(':')[0];
  if (curProtocol === 'https') { bp.src = 'https://zz.bdstatic.com/linksubmit/push.js'; }
  else { bp.src = 'http://push.zhanzhang.baidu.com/push.js'; }
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(bp, s);
})();
</script>
```
This auto-push script pings Baidu every time a user visits → faster indexing.

---

## 5. 360 Search / Haosou — 好搜 (Priority 2 — China #2)

**Portal:** https://zhanzhang.so.com  
**Env var:** `HAOSOU_SITE_VERIFICATION`  
**Covers:** 360 Browser Search (second largest in China after Baidu)

### Steps
1. Create a 360 (Qihoo) account → go to https://zhanzhang.so.com/
2. **添加网站** → enter `https://calendula-herbs.com`
3. Choose **Meta标签验证** (Meta tag verification)
4. Copy `content="…"` → set `HAOSOU_SITE_VERIFICATION=…` → redeploy → verify

After verification: submit sitemap in the dashboard.

---

## 6. Sogou Webmaster — 搜狗站长平台 (Priority 2 — China #3)

**Portal:** https://zhanzhang.sogou.com  
**Env var:** `SOGOU_SITE_VERIFICATION`  
**Covers:** Sogou Search (owned by Tencent, integrated with WeChat search)

> Good Sogou ranking = visibility in WeChat Search, which reaches 1.3B users.

### Steps
1. Log in with a Sogou or QQ account → **添加站点**
2. Enter `https://calendula-herbs.com`
3. Choose **Meta标签** verification
4. Copy `content="…"` → set `SOGOU_SITE_VERIFICATION=…` → redeploy → verify

---

## 7. Naver Search Advisor (Priority 2 — South Korea)

**Portal:** https://searchadvisor.naver.com  
**Env var:** `NAVER_SITE_VERIFICATION`  
**Covers:** Naver (~70% market share in South Korea)

> South Korea is a large buyer of organic herbs for cosmetics, tea, and food manufacturing.

### Steps
1. Create a Naver account → go to https://searchadvisor.naver.com/
2. **웹마스터 도구** → **사이트 추가** → enter `https://calendula-herbs.com`
3. Choose **HTML 태그** verification
4. Copy `content="…"` → set `NAVER_SITE_VERIFICATION=…` → redeploy → verify

After verification: submit sitemap. Consider adding an RSS feed for products.

---

## 8. Seznam Webmaster (Priority 3 — Czechia)

**Portal:** https://search.seznam.cz/webmaster  
**Env var:** `SEZNAM_SITE_VERIFICATION`  
**Covers:** Seznam.cz (~15% market share in Czech Republic)

### Steps
1. Create a Seznam account at https://www.seznam.cz/
2. Go to the webmaster tools → add your site
3. Choose meta tag verification → copy `content="…"` → set `SEZNAM_SITE_VERIFICATION=…` → redeploy → verify

---

## 9. Pinterest Domain Claim (Priority 3 — Visual Discovery)

**Portal:** https://business.pinterest.com  
**Env var:** `PINTEREST_SITE_VERIFICATION`  
**Covers:** Pinterest visual search — herb product images circulate heavily

### Steps
1. Upgrade to a Pinterest Business account (free)
2. **Settings** → **Claim** → **Claim website**
3. Choose **Add HTML tag** method
4. Copy `content="…"` → set `PINTEREST_SITE_VERIFICATION=…` → redeploy → verify

After verification: enable Rich Pins for products (Product schema is already deployed).

---

## Engines Covered Automatically (No Registration Needed)

| Engine | Why it's covered |
|--------|-----------------|
| **DuckDuckGo** | Uses Bing's index |
| **Ecosia** | Uses Bing's index |
| **Qwant** | Uses Bing's index |
| **Yahoo** | Uses Bing's index |
| **AOL Search** | Uses Bing's index |
| **Startpage** | Uses Google's index |
| **Swisscows** | Uses Bing's index |
| **Brave Search** | Independent crawler — robots.txt is set correctly |
| **Mojeek** | Independent crawler — robots.txt is set correctly |

---

## Analytics Tags via Admin Plugins

Once registered, add analytics tags through **Admin → Settings → Plugins → Add Plugin (position: HEAD)**.

### Yandex.Metrica
```html
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   var z = m[i],d=e.createElement(t),n=e.getElementsByTagName(t)[0],x=2147483648;
   z.l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(YOUR_COUNTER_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/YOUR_COUNTER_ID" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
```

### Baidu Tongji
```html
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?YOUR_BAIDU_TONGJI_ID";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

---

## Final Verification Checklist

```bash
# 1. Confirm robots.txt is correct
curl https://calendula-herbs.com/robots.txt

# 2. Confirm sitemap is valid XML
curl https://calendula-herbs.com/sitemap.xml | head -20

# 3. Confirm all meta verification tags appear in <head>
curl -s https://calendula-herbs.com | grep -i "verification\|msvalidate\|baidu\|naver\|seznam"

# 4. Test JSON-LD structured data
# → https://validator.schema.org/
# → https://search.google.com/test/rich-results
# → https://www.bing.com/webmaster/tools/markup-validator
```

## Sitemap Submission Summary

| Engine | How to submit |
|--------|--------------|
| Google | GSC → Sitemaps → `https://calendula-herbs.com/sitemap.xml` |
| Bing | Bing WMT → Sitemaps → same URL |
| Yandex | Yandex WM → Sitemap files → same URL |
| Baidu | Baidu Ziyuan → 提交链接 → Sitemap mode |
| 360 Search | Dashboard → submit sitemap |
| Sogou | Dashboard → submit sitemap |
| Naver | Search Advisor → submit sitemap |

---
*Last updated: 2026-08-26 | Domain: calendula-herbs.com*
