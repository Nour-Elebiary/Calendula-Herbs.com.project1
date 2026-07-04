"""
Google Drive Video Classifier
==============================
Opens each video in a headed browser so you can WATCH the content,
then asks you to classify it via a file-based prompt system.
Results saved incrementally to drive-videos-classification.json

Usage:  python scripts/classify_drive_videos.py
"""

import asyncio, sys, io, json, os, time
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from playwright.async_api import async_playwright

RESULTS_FILE = "drive-videos-classification.json"
PROMPT_FILE = "_classify_prompt.json"
FOLDER_URL = "https://drive.google.com/drive/folders/19BvDnb6iGSiH2iNCawRGpdtEi-ApA7JP"

SECTION_OPTIONS = [
    "INTERVIEWS_TV",
    "FACTORY",
    "FARMS",
    "EVENTS",
    "SHIPMENTS",
    "(new section)",
    "(skip)",
]

def load_results():
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_results(results):
    with open(RESULTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

def get_classified_ids(results):
    return {r['id'] for r in results if r['classification'] != 'SKIPPED'}

def wait_for_user_response():
    """Poll for the answer file to be written, then return the response."""
    while True:
        if os.path.exists(PROMPT_FILE):
            try:
                with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                os.remove(PROMPT_FILE)
                return data
            except (json.JSONDecodeError, OSError):
                pass
        time.sleep(1)

async def classify_video(page, video, results):
    vid = video['id']
    name = video['name']
    
    safe = repr(name)
    print(f"\n{'='*70}", flush=True)
    print(f"  Video #{len(results)+1}: {safe}", flush=True)
    print(f"  ID: {vid}", flush=True)
    print(f"{'='*70}", flush=True)
    
    preview_url = f"https://drive.google.com/file/d/{vid}/view"
    await page.goto(preview_url, wait_until="domcontentloaded", timeout=60000)
    await asyncio.sleep(5)
    
    # Build section list for prompt
    section_list = []
    for i, sec in enumerate(SECTION_OPTIONS):
        descs = {
            "INTERVIEWS_TV": "TV shows, interviews, media appearances",
            "FACTORY": "Processing facility, machinery, production",
            "FARMS": "Cultivation, fields, harvesting, plants",
            "EVENTS": "Exhibitions, trade shows, conferences",
            "SHIPMENTS": "Logistics, packaging, shipping products",
            "(new section)": "Create a new section",
            "(skip)": "Skip — not for website",
        }
        section_list.append({"num": i+1, "name": sec, "desc": descs.get(sec, "")})
    
    # Write prompt file
    prompt = {
        "video_id": vid,
        "filename": name,
        "preview_url": preview_url,
        "sections": section_list,
        "question": "Watch the video in the browser, then enter section number, 's' to skip, or 'q' to quit"
    }
    with open(PROMPT_FILE, 'w', encoding='utf-8') as f:
        json.dump(prompt, f, ensure_ascii=False, indent=2)
    
    print("\n  👁 WATCH the video in the browser window that just opened.", flush=True)
    print("  ⏸ Pause/replay as needed. Take your time.", flush=True)
    print(f"\n  📝 File '{PROMPT_FILE}' has been created with the options.", flush=True)
    print("  ✍️  To classify, I will now ask you in the chat below.", flush=True)
    print("  ⏳ Waiting for your response...", flush=True)
    
    # Wait for file-based response
    response = wait_for_user_response()
    
    choice = response.get("choice", "").strip().lower()
    
    if choice == 'q':
        return False
    
    if choice == 's' or response.get("section") == "SKIPPED":
        results.append({"id": vid, "name": name, "classification": "SKIPPED", "title": "", "caption": ""})
        save_results(results)
        print("  ⏭ Skipped.", flush=True)
        return True
    
    section = response.get("section", "")
    title = response.get("title", "")
    caption = response.get("caption", "")
    
    if section:
        entry = {
            "id": vid,
            "name": name,
            "classification": section,
            "title": title,
            "caption": caption,
        }
        results.append(entry)
        save_results(results)
        print(f"  ✅ Saved as {section}: {title}", flush=True)
        return True
    
    print("  ❌ No valid response received.", flush=True)
    return True

async def main():
    results = load_results()
    already_classified = get_classified_ids(results)
    print(f"Loaded {len(results)} previous results ({len(already_classified)} classified)", flush=True)
    
    if not os.path.exists('drive_files.json'):
        print("❌ drive_files.json not found. Run extract_files.py first.", flush=True)
        return
    
    with open('drive_files.json', 'r', encoding='utf-8') as f:
        files = json.load(f)
    
    remaining = [v for v in files if v['id'] not in already_classified]
    print(f"\nTotal: {len(files)}, Already done: {len(already_classified)}, Remaining: {len(remaining)}", flush=True)
    
    if not remaining:
        print("\n✅ ALL VIDEOS CLASSIFIED!", flush=True)
        generate_report(results)
        return
    
    print("\nOpening browser for you to watch videos...", flush=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--start-maximized"]
        )
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()
        
        await page.goto(FOLDER_URL, wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(3)
        
        for video in remaining:
            ok = await classify_video(page, video, results)
            if not ok:
                break
        
        await browser.close()
    
    generate_report(results)
    print(f"\n✅ Done! Results saved to {RESULTS_FILE}", flush=True)

def generate_report(results):
    classified = [r for r in results if r['classification'] != 'SKIPPED']
    skipped = [r for r in results if r['classification'] == 'SKIPPED']
    sections = {}
    for r in classified:
        sec = r['classification']
        sections.setdefault(sec, []).append(r)
    
    lines = ["# Drive Videos Classification\n", f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"]
    lines.append(f"**Total:** {len(results)} | **Classified:** {len(classified)} | **Skipped:** {len(skipped)}\n\n---\n\n")
    
    for sec, vids in sorted(sections.items()):
        lines.append(f"## {sec}\n| # | Filename | Title | Caption |\n|---|----------|-------|---------|\n")
        for i, v in enumerate(vids, 1):
            lines.append(f"| {i} | `{v['name']}` | {v.get('title','')} | {v.get('caption','')} |\n")
        lines.append("\n")
    
    if skipped:
        lines.append("## Skipped\n")
        for v in skipped:
            lines.append(f"- `{v['name']}`\n")
    
    with open('drive-videos-classification.md', 'w', encoding='utf-8') as f:
        f.write("".join(lines))
    print("\n📄 Report: drive-videos-classification.md", flush=True)
    
    print(f"\n{'='*50}", flush=True)
    print("SUMMARY:", flush=True)
    for sec, vids in sorted(sections.items()):
        print(f"  {sec}: {len(vids)} videos", flush=True)
    if skipped:
        print(f"  SKIPPED: {len(skipped)}", flush=True)
    print(f"{'='*50}", flush=True)

if __name__ == "__main__":
    print("="*60, flush=True)
    print("  Google Drive Video Classifier", flush=True)
    print("  A browser will open for each video.", flush=True)
    print("  I'll ask you to classify each one in the chat.", flush=True)
    print("="*60, flush=True)
    asyncio.run(main())
