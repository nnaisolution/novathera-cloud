import { generateDtsBundle } from 'dts-bundle-generator';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const outputPath = join(process.cwd(), 'generated/trpc/app-router.d.ts');

mkdirSync(dirname(outputPath), { recursive: true });

const bundle = generateDtsBundle([
  {
    filePath: './src/trpc/app.router.ts',
    output: {
      exportReferencedTypes: true,
      noBanner: true,
    },
  },
]);

writeFileSync(outputPath, bundle[0]);
console.log(`Wrote ${outputPath}`);
