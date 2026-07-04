"""Extract file IDs and names from the Drive folder."""
import asyncio, sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from playwright.async_api import async_playwright

FOLDER_URL = "https://drive.google.com/drive/folders/19BvDnb6iGSiH2iNCawRGpdtEi-ApA7JP"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1400, "height": 900})
        
        print("Navigating to Drive folder...", flush=True)
        await page.goto(FOLDER_URL, wait_until="networkidle", timeout=60000)
        await asyncio.sleep(5)
        
        files = await page.evaluate("""
            () => {
                const rows = document.querySelectorAll('tr[data-target="doc"]');
                return Array.from(rows).map(tr => {
                    const id = tr.getAttribute('data-id');
                    // Use the ARIA label for the name (typically in the label attribute or text)
                    const nameEl = tr.querySelector('[data-tooltip]');
                    const name = nameEl ? nameEl.getAttribute('data-tooltip') : '';
                    return { id, name };
                }).filter(f => f.id && f.name);
            }
        """)
        
        print(f"\nFound {len(files)} files:\n")
        for i, f in enumerate(files, 1):
            safe_name = f['name'].encode('utf-8', errors='replace').decode('utf-8', errors='replace')
            print(f"  {i:2d}. [{f['id']}] {safe_name}")
        
        # Save to JSON for use by the viewing script
        with open('drive_files.json', 'w', encoding='utf-8') as fp:
            json.dump(files, fp, ensure_ascii=False, indent=2)
        print(f"\nSaved to drive_files.json")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
