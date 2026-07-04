"""List all Drive video preview URLs."""
import asyncio, sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

with open('drive_files.json', 'r', encoding='utf-8') as f:
    files = json.load(f)

print(f"\n# Google Drive Videos — Preview URLs\n")
print(f"Open each URL in your browser, watch the video, then classify it.\n")

for i, v in enumerate(files, 1):
    url = f"https://drive.google.com/file/d/{v['id']}/view"
    safe = v['name'].encode('utf-8', errors='replace').decode('utf-8', errors='replace')
    print(f"**{i:2d}.** {safe}")
    print(f"     {url}")
    print()
