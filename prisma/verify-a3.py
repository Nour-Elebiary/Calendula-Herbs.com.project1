import json
import os
import re

msgs_dir = 'src/messages'
files = [f for f in os.listdir(msgs_dir) if f.endswith('.json')]
files.sort()

print('=== A3.1 — Key Count Check ===')
ref_keys = None
ref_file = None
all_match = True
for fname in files:
    path = os.path.join(msgs_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Count leaf keys recursively
    def count_leaves(obj):
        if isinstance(obj, dict):
            return sum(count_leaves(v) for v in obj.values())
        elif isinstance(obj, list):
            return sum(count_leaves(item) for item in obj)
        else:
            return 1
    kc = count_leaves(data)
    if ref_keys is None:
        ref_keys = kc
        ref_file = fname
    match = 'OK' if kc == ref_keys else 'MISMATCH'
    if match == 'MISMATCH':
        all_match = False
    print(f'  {fname}: {kc} keys [{match}]')

print(f'\nAll files match en.json ({ref_keys} keys): {all_match}')

print('\n=== A3.2 — Check for English Residue in Non-English Files ===')
non_en = [f for f in files if f != 'en.json']

# Check for long English phrases in non-English files
# Heuristic: look for ASCII text sequences > 30 chars (excluding JSON syntax, numbers, HTML)
eng_pattern = re.compile(r'[A-Z][a-z]{2,}(?:\s+[A-Za-z]{2,}){2,}')
html_pattern = re.compile(r'<[^>]+>')
var_pattern = re.compile(r'\{[^}]+\}')

total_issues = 0
for fname in non_en:
    path = os.path.join(msgs_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all string values in the JSON
    # Simple approach: find quoted strings that aren't keys
    strings = re.findall(r'"(?:[^"\\]|\\.)*"', content)
    
    issues = []
    for s in strings:
        val = s[1:-1]  # remove quotes
        # Skip if already has non-ASCII chars (translated)
        if any(ord(c) > 127 for c in val):
            continue
        # Skip pure HTML/URLs/variables
        if html_pattern.fullmatch(val) or var_pattern.fullmatch(val):
            continue
        # Check if it looks like an English sentence
        if eng_pattern.search(val) and len(val) > 20:
            # Check if it's a proper noun / cert name / scientific name
            skip_words = ['Calendula Herbs', 'BIOFACH', 'MOSH', 'MOAH', 'GAP', 'GHP',
                         'ISO', 'HACCP', 'GMP', 'B2B', 'DHL', 'FedEx', 'Cairo',
                         'Matricaria chamomilla', 'Cymbopogon citratus']
            if any(w in val for w in skip_words):
                continue
            # Skip if it's a scientific name pattern
            if re.match(r'^[A-Z][a-z]+ [a-z]+$', val):
                continue
            issues.append(val[:80])

    if issues:
        total_issues += len(issues)
        print(f'  {fname}: {len(issues)} possible English strings')
        for iss in issues[:5]:
            print(f'    -> "{iss}"')

print(f'\nTotal possible English residue strings: {total_issues}')

print('\n=== A3.3 — Specific High-Risk File Checks ===')
for fname in ['hi.json', 'ja.json', 'zh-CN.json']:
    path = os.path.join(msgs_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check for completely ASCII values longer than 30 chars
    def find_ascii_strings(obj, path=''):
        results = []
        if isinstance(obj, dict):
            for k, v in obj.items():
                results.extend(find_ascii_strings(v, f'{path}.{k}'))
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                results.extend(find_ascii_strings(item, f'{path}[{i}]'))
        elif isinstance(obj, str):
            if obj and all(ord(c) < 128 for c in obj) and len(obj) > 30:
                # Skip HTML, variables, URLs
                if not html_pattern.fullmatch(obj) and not var_pattern.fullmatch(obj):
                    # Skip known proper nouns
                    known = ['Calendula Herbs', 'For Import', 'Export', 'BIOFACH', 'DHL', 'FedEx']
                    if not any(k in obj for k in known):
                        results.append((path, obj[:80]))
        return results
    
    ascii_strings = find_ascii_strings(data)
    if ascii_strings:
        print(f'  {fname}: {len(ascii_strings)} ASCII-only long strings (possible untranslated)')
        for p, s in ascii_strings[:10]:
            print(f'    {p}: "{s}"')
    else:
        print(f'  {fname}: No untranslated English strings found ✓')

print('\nA3 verification complete.')
