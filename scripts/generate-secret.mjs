import crypto from 'crypto';
import fs from 'fs';

const key = crypto.randomBytes(16).toString('hex').toUpperCase();
const secrets = {
  adminInitialKey: key,
  generatedAt: new Date().toISOString(),
  note: "Delete this file after the admin first logs in and changes their password."
};

fs.writeFileSync('secrets.json', JSON.stringify(secrets, null, 2));
console.log(`✅ secrets.json generated. Initial key: ${key}`);
console.log('⚠️  This file is gitignored. Keep it safe.');
