import json
import re

with open('prisma/db-translations-audit.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

eng_pattern = re.compile(r'[A-Z][a-z]{3,}\s[a-z]')

print('=== PRODUCT TRANSLATIONS WITH ENGLISH IN HINDI ===')
for p in data['products']:
    if p['locale'] != 'hi':
        continue
    for field in ['name', 'commonName', 'description', 'shortDescription']:
        val = p.get(field, '')
        if val and eng_pattern.search(val) and '\u0900' in val:
            # Find the English part
            matches = eng_pattern.findall(val)
            print(f'  Product {p["productId"]}, field={field}, english_parts={matches[:3]}')

print('\n=== PRODUCT TRANSLATIONS WITH LATIN-ONLY TEXT IN HINDI ===')
for p in data['products']:
    if p['locale'] != 'hi':
        continue
    for field in ['name', 'commonName', 'description', 'shortDescription']:
        val = p.get(field, '')
        if val and not any('\u0900' <= c <= '\u097F' for c in val):
            print(f'  LATIN-ONLY! Product {p["productId"]}, field={field}, val={val[:80]}')

print('\n=== SAMPLE HINDI PRODUCT RECORDS ===')
hi_products = [p for p in data['products'] if p['locale'] == 'hi']
for p in hi_products:
    print(f'\nProduct {p["productId"]}:')
    print(f'  name: {repr(p["name"][:60])}')
    print(f'  commonName: {repr(p.get("commonName","")[:60])}')
    print(f'  scientificName: {p.get("scientificName","")}')
    
print('\n=== SPOT-CHECK OTHER LANGUAGES ===')
for locale in ['de', 'fr', 'ja', 'ar']:
    locale_products = [p for p in data['products'] if p['locale'] == locale]
    if locale_products:
        p = locale_products[0]
        print(f'\n{locale} first product:')
        print(f'  name (repr): {repr(p["name"][:60])}')
        print(f'  desc starts with: {repr(p.get("description","")[:80])}')

print('\nDone.')
