import fs from 'fs';
const certs = JSON.parse(fs.readFileSync('scratch/certs.json', 'utf8'));

const map = new Map();
certs.forEach(c => {
  const key = c.title.trim().toLowerCase();
  if(!map.has(key)) map.set(key, []);
  map.get(key).push(c);
});

for(const [key, list] of map.entries()) {
  if(list.length > 1) {
    console.log(`Duplicate: ${key}`);
    list.forEach(c => console.log(`  - ${c.id} / logo: ${c.logoFileId}`));
  }
}
