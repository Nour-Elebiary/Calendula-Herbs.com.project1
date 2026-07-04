"""Scout the Google Drive folder to understand page structure."""
import asyncio, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from playwright.async_api import async_playwright

FOLDER_URL = "https://drive.google.com/drive/folders/19BvDnb6iGSiH2iNCawRGpdtEi-ApA7JP"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        print("Navigating to Drive folder...")
        await page.goto(FOLDER_URL, wait_until="networkidle", timeout=60000)
        await asyncio.sleep(5)  # Let Drive JS fully render
        
        # Take screenshot
        await page.screenshot(path="drive_folder.png", full_page=True)
        print("Screenshot saved: drive_folder.png")
        
        # Try to get all file row elements
        # Drive uses different structures - try common patterns
        selectors_to_try = [
            "[data-id]",                          # Drive's data attribute
            "[data-target='doc']",                 # Another common pattern
            "div[role='listitem']",                # ARIA list items
            "div[data-lh] a[aria-label]",          # Link with aria-label
            "div[data-docs-metrics-id]",           # Another data attribute
        ]
        
        for sel in selectors_to_try:
            elements = await page.query_selector_all(sel)
            print(f"Selector '{sel}': found {len(elements)} elements")
            if elements:
                for el in elements[:3]:
                    outer = await el.evaluate("e => e.outerHTML.substring(0, 300)")
                    safe = outer.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
                    print(f"  Sample: {safe}")
        
        # Also try dumping all anchor tags with download or file links
        links = await page.evaluate("""
            () => Array.from(document.querySelectorAll('a[href*="drive.google.com/file/d/"]'))
                .map(a => ({ href: a.href, text: a.textContent.trim().substring(0, 100) }))
        """)
        print(f"\nFound {len(links)} direct file links")
        for l in links[:10]:
            print(f"  href={l['href'][:100]}, text={l['text'][:80]}")
        
        # Also check for file names in the page
        file_titles = await page.evaluate("""
            () => Array.from(document.querySelectorAll('[data-tooltip*=".mp4"], [data-tooltip*=".ts"], [aria-label*=".mp4"], [aria-label*=".ts"]'))
                .map(el => el.getAttribute('data-tooltip') || el.getAttribute('aria-label') || '').filter(Boolean)
        """)
        print(f"\nFile tooltips found: {len(file_titles)}")
        for t in file_titles:
            safe = t.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
            print(f"  {safe}")
        
        input("\nPress Enter to close browser...")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
