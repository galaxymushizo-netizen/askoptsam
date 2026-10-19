/**
 * Text normalisation shared by the safety rules and source selection.
 * It intentionally preserves word boundaries and does not "correct" content
 * in a way that could hide a red flag.
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokens(input: string): string[] {
  return normalizeText(input).split(' ').filter(Boolean);
}

const NEGATIONS = new Set([
  'no',
  'not',
  'never',
  'without',
  'none',
  'nothing',
  'hakuna',
  'sina',
  'haina',
  'bila',
  'si',
  'sio',
  'hapana',
  "don't",
  "doesn't",
  "didn't",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
]);

/**
 * True when a negation appears shortly before or after a matched phrase.
 * Used only to reduce obvious false positives (e.g. "no pain").
 */
export function isNegated(
  text: string,
  matchIndex: number,
  matchLength: number,
  window = 4,
): boolean {
  const before = tokens(text.slice(Math.max(0, matchIndex - 60), matchIndex)).slice(-window);
  const after = tokens(text.slice(matchIndex + matchLength, matchIndex + matchLength + 45)).slice(
    0,
    window,
  );
  return [...before, ...after].some((token) => NEGATIONS.has(token));
}

export function hasAny(normalized: string, phrases: string[]): boolean {
  return phrases.some((phrase) => {
    const p = phrase.toLowerCase();
    if (p.includes(' ')) return normalized.includes(p);
    return new RegExp(`\\b${escapeRegExp(p)}\\b`, 'i').test(normalized);
  });
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Levenshtein distance with an early-exit cap, for small typo tolerance. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    let rowMin = curr[0]!;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      rowMin = Math.min(rowMin, curr[j]!);
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j]!;
  }
  return prev[b.length]!;
}

/**
 * Fuzzy token match for critical words such as "vision", "pain", "macho".
 * Short tokens are matched exactly to avoid nonsense matches.
 */
export function hasFuzzyToken(normalized: string, word: string, maxDistance = 1): boolean {
  if (word.length < 4) return hasAny(normalized, [word]);
  return tokens(normalized).some((token) => {
    if (token === word) return true;
    if (token.startsWith(word) || word.startsWith(token)) {
      return Math.abs(token.length - word.length) <= 2;
    }
    return editDistance(token, word, maxDistance) <= maxDistance;
  });
}
