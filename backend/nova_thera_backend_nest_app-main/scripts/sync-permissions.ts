import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(__dirname, '../src/authentication/permissions.ts');
const dest = resolve(
  __dirname,
  '../../nova_thera_admin_next_app/lib/auth/permissions.ts',
);

const contents = readFileSync(source, 'utf8').replace(/;$/gm, '');
writeFileSync(dest, contents);
console.log(`Synced permissions.ts -> ${dest}`);
