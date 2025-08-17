#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const FALLBACK_LOCALE = 'en';
const baseDir = path.join(process.cwd(), 'src/messages', FALLBACK_LOCALE);

function walk(obj, prefix, acc) {
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') walk(v, key, acc);
    else acc.push(key);
  });
  return acc;
}

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.json'));
const keys = new Set();

for (const file of files) {
  const content = JSON.parse(
    fs.readFileSync(path.join(baseDir, file), 'utf-8')
  );
  walk(content, file.replace(/\.json$/, ''), []).forEach(k => keys.add(k));
}

const out = `// AUTO-GENERATED. DO NOT EDIT.\ndeclare module 'i18n-keys' {\n  export type TranslationKey =\n${[
  ...keys,
]
  .sort()
  .map(k => `    | '${k}'`)
  .join('\n')};\n}\n`;

const target = path.join(process.cwd(), 'src/i18n/key-types.generated.d.ts');
fs.writeFileSync(target, out, 'utf-8');
console.log('Generated key-types at', target, 'Total keys:', keys.size);
