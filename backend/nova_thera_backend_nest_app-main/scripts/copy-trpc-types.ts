import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve(__dirname, '../generated/trpc/app-router.d.ts');
const targets = [
  resolve(__dirname, '../../../web/types/trpc'),
  resolve(__dirname, '../../../mobile/src/types/trpc'),
];

for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  const dest = resolve(dir, 'app-router.d.ts');
  copyFileSync(source, dest);
  console.log(`Copied app-router.d.ts -> ${dest}`);
}
