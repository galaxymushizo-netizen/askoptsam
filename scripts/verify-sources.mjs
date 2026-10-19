/**
 * Source registry integrity check.
 *
 * Usage:
 *   npm run verify:sources             # structural checks only
 *   npm run verify:sources -- --network # also fetch every URL
 *
 * This verifies link availability and registry bookkeeping. It does not verify
 * clinical accuracy and does not replace editorial or clinical review.
 */
import { readFile } from 'node:fs/promises';

const registryPath = new URL('../src/lib/sources/registry.ts', import.meta.url);
const articlesPath = new URL('../src/data/articles.ts', import.meta.url);
const source = await readFile(registryPath, 'utf8');
const articles = await readFile(articlesPath, 'utf8');

const blockPattern =
  /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']*)',\s*publisher:\s*'([^']*)',\s*url:\s*'([^']+)',\s*topics:\s*\[([^\]]*)\],\s*languages:\s*\[([^\]]*)\],\s*lastVerified:\s*'([^']+)',\s*reviewStatus:\s*'([^']+)',\s*keyPoints:\s*\[([\s\S]*?)\],\s*\}/g;

const entries = [...source.matchAll(blockPattern)].map((match) => ({
  id: match[1],
  title: match[2],
  publisher: match[3],
  url: match[4],
  topics: match[5].split(',').map((value) => value.trim().replace(/'/g, '')).filter(Boolean),
  languages: match[6].split(',').map((value) => value.trim().replace(/'/g, '')).filter(Boolean),
  lastVerified: match[7],
  reviewStatus: match[8],
  keyPointCount: (match[9].match(/'/g) ?? []).length / 2,
}));

const errors = [];
const warnings = [];

if (entries.length === 0) errors.push('No sources parsed from registry.ts.');

const ids = new Set();
const urls = new Set();
for (const entry of entries) {
  if (ids.has(entry.id)) errors.push(`Duplicate source id: ${entry.id}`);
  ids.add(entry.id);
  if (urls.has(entry.url)) errors.push(`Duplicate source URL: ${entry.url}`);
  urls.add(entry.url);
  if (!entry.url.startsWith('https://')) errors.push(`${entry.id}: URL is not https`);
  if (!entry.title.trim() || !entry.publisher.trim()) {
    errors.push(`${entry.id}: empty title or publisher`);
  }
  if (entry.topics.length === 0) errors.push(`${entry.id}: no topics`);
  if (entry.languages.length === 0) errors.push(`${entry.id}: no languages`);
  if (!['verified', 'pending-review', 'retired'].includes(entry.reviewStatus)) {
    errors.push(`${entry.id}: invalid reviewStatus ${entry.reviewStatus}`);
  }
  if (Number.isNaN(Date.parse(entry.lastVerified))) {
    errors.push(`${entry.id}: invalid lastVerified date`);
  } else {
    const ageDays = (Date.now() - Date.parse(entry.lastVerified)) / 86_400_000;
    if (ageDays > 365) warnings.push(`${entry.id}: last verified ${Math.round(ageDays)} days ago`);
  }
  if (entry.keyPointCount < 1) warnings.push(`${entry.id}: no key points`);
}

const articleSourceIds = [...articles.matchAll(/sourceIds:\s*\[([^\]]*)\]/g)].flatMap((match) =>
  match[1]
    .split(',')
    .map((value) => value.trim().replace(/'/g, ''))
    .filter(Boolean),
);
for (const id of new Set(articleSourceIds)) {
  if (!ids.has(id)) errors.push(`Article references unknown source id: ${id}`);
}

console.log(`Parsed ${entries.length} sources and ${articleSourceIds.length} article references.`);
for (const warning of warnings) console.warn(`WARN  ${warning}`);

if (process.argv.includes('--network')) {
  console.log('\nChecking URLs (HEAD, then GET fallback)...');
  const queue = [...entries];
  const failures = [];
  const worker = async () => {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) return;
      let result = '';
      for (const method of ['HEAD', 'GET']) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20_000);
          const response = await fetch(entry.url, {
            method,
            redirect: 'follow',
            signal: controller.signal,
            headers: {
              'user-agent':
                'AskOptsam link checker (+https://github.com/askoptsam; editorial verification)',
            },
          });
          clearTimeout(timeout);
          result = `${method} ${response.status}`;
          if (response.ok) break;
        } catch (error) {
          result = `${method} ${error instanceof Error ? error.message : String(error)}`;
        }
      }
      if (!result.includes(' 200') && !result.includes(' 30')) {
        failures.push(`${entry.id}: ${entry.url} — ${result}`);
        console.error(`FAIL  ${entry.id} — ${result}`);
      } else {
        console.log(`OK    ${entry.id} — ${result}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  if (failures.length > 0) errors.push(`${failures.length} URL check(s) failed`);
}

if (errors.length > 0) {
  console.error('\nSource registry errors:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nSource registry is structurally valid.');
}
