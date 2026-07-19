import fs from 'fs';
const certs = JSON.parse(fs.readFileSync('scratch/certs.json', 'utf8'));
const galleries = JSON.parse(fs.readFileSync('scratch/galleries.json', 'utf8'));

console.log('--- Cert Titles ---')
certs.forEach(c => console.log(`[${c.id}] ${c.title} (logo: ${c.logoFileId}, file: ${c.fileId})`));

console.log('\n--- Gallery Items ---')
galleries.forEach(g => console.log(`[${g.id}] ${g.title} (mediaId: ${g.mediaFileId}, external: ${g.externalUrl})`));
