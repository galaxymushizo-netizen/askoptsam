import type { Source } from '../sources/registry';

const CAUTION = {
  en: 'I cannot confirm or rule out a diagnosis from this conversation. If your symptoms persist, worsen, or worry you, please arrange a professional eye examination.',
  sw: 'Siwezi kuthibitisha au kuondoa utambuzi kupitia mazungumzo haya. Ikiwa dalili zinaendelea, zinazidi kuwa mbaya, au zinakuhangaisha, tafadhali panga uchunguzi wa macho na mtaalamu.',
} as const;

const SAFE_REPLACEMENT = {
  en: 'That statement cannot be confirmed from this conversation.',
  sw: 'Kauli hiyo haiwezi kuthibitishwa kupitia mazungumzo haya.',
} as const;

const BANNED_SENTENCE_PATTERNS: RegExp[] = [
  /\byou (definitely|certainly|clearly|obviously) have\b/i,
  /\bthis (means|proves|confirms) (that )?you have\b/i,
  /\b(it is|it's) (definitely|certainly|clearly) (a|an)\b/i,
  /\byou (do not|don't) have (a|an|any) (serious|eye) (condition|disease|problem)\b/i,
  /\bthere is nothing (wrong|serious)\b/i,
  /\bnothing to worry about\b/i,
  /\byou (do not|don't) need to (see|visit|contact) (a|an|the)?\s*(doctor|clinician|optometrist|ophthalmologist)\b/i,
  /\bno (need|reason) to (see|visit) (a|an|the)?\s*(doctor|clinician|optometrist|ophthalmologist)\b/i,
  /\byou (can|could|should) (just )?wait\b/i,
  /\bI can (diagnose|confirm|rule out)\b/i,
  /\bI (have )?diagnosed\b/i,
  /\bthe (photo|image|picture) (proves|confirms|shows that you have)\b/i,
  /\bI am (a|your) (doctor|optometrist|ophthalmologist|clinician)\b/i,
  /\buna (hakika|uhakika) (kwamba )?una\b/i,
  /\bhuna (tatizo|ugonjwa)\b/i,
  /\bhakuna haja ya (kuona|kutembelewa na|kutembelea) daktari\b/i,
  /\bpicha inaonyesha (kuwa )?una\b/i,
  /\bmimi ni daktari wako\b/i,
];

function stripDangerousMarkup(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^)]+\)/gi, '$1')
    .replace(/\b(?:https?:\/\/|www\.)[^\s)\]>]+/gi, '')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '')
    .replace(
      /\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|co|uk|gov|health|africa|tz|edu)(?:\/[^\s)\]>]*)?/gi,
      '',
    )
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/\*\*|__|`/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function sanitizeCitations(text: string, sources: Source[]): string {
  return text.replace(/\[([^\]]{0,40})\]/g, (whole, inner: string) => {
    const matches = [...inner.matchAll(/S\s*(\d+)/gi)];
    if (matches.length === 0) {
      // Remove source-like placeholders the model may invent.
      if (/source|chanzo|ref/i.test(inner)) return '';
      return whole;
    }
    const kept = matches
      .map((match) => Number(match[1]))
      .filter((index, position, array) => {
        return (
          Number.isInteger(index) &&
          index >= 1 &&
          index <= sources.length &&
          array.indexOf(index) === position
        );
      })
      .map((index) => `[S${index}]`);
    return kept.join('');
  });
}

interface SegmentResult {
  text: string;
  cautionApplied: boolean;
}

/**
 * Sanitizes one complete sentence or paragraph. Split out so that streaming and
 * full-response sanitisation use exactly the same rules.
 */
function sanitizeSegment(raw: string, sources: Source[], lang: 'en' | 'sw'): SegmentResult {
  const cleaned = sanitizeCitations(stripDangerousMarkup(raw), sources);
  let cautionApplied = false;

  const paragraphs = cleaned.split(/\n{2,}/);
  const result = paragraphs
    .map((paragraph) => {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      return sentences
        .map((sentence) => {
          if (BANNED_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence))) {
            cautionApplied = true;
            return SAFE_REPLACEMENT[lang];
          }
          return sentence;
        })
        .filter(Boolean)
        .join(' ');
    })
    .filter(Boolean)
    .join('\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return { text: result, cautionApplied };
}

function collectSourceIndexes(text: string, sources: Source[]): number[] {
  return [
    ...new Set(
      [...text.matchAll(/\[S(\d+)\]/g)]
        .map((match) => Number(match[1]))
        .filter((index) => Number.isInteger(index) && index >= 1 && index <= sources.length),
    ),
  ];
}

/**
 * Server-side final pass over model text. This cannot verify medical accuracy,
 * but it enforces the product's hard output rules: no URLs, no invented
 * citation IDs, no confident diagnosis, and no false reassurance.
 */
export function sanitizeModelText(
  raw: string,
  sources: Source[],
  lang: 'en' | 'sw',
  maxLength = 8000,
): { text: string; usedSourceIndexes: number[]; cautionApplied: boolean } {
  const { text: cleaned, cautionApplied } = sanitizeSegment(
    raw.slice(0, maxLength),
    sources,
    lang,
  );
  let text = cleaned;
  if (cautionApplied) text += `\n\n${CAUTION[lang]}`;
  return {
    text,
    usedSourceIndexes: collectSourceIndexes(text, sources),
    cautionApplied,
  };
}

/**
 * Streaming-safe sanitizer.
 *
 * Model chunks are buffered until a sentence or paragraph boundary, then the
 * complete segment is sanitized before any of it reaches the browser. This
 * prevents a URL, invented citation, or diagnostic claim from leaking simply
 * because it was split across network chunks. `finish()` returns the canonical
 * full text and the citations that survived validation.
 */
export class StreamingSanitizer {
  private buffer = '';
  private output = '';
  private cautionApplied = false;
  private finished = false;
  private acceptedChars = 0;

  constructor(
    private readonly sources: Source[],
    private readonly lang: 'en' | 'sw',
    private readonly maxLength = 8000,
  ) {}

  private sanitize(text: string): string {
    const result = sanitizeSegment(text, this.sources, this.lang);
    if (result.cautionApplied) this.cautionApplied = true;
    return result.text;
  }

  private append(text: string, separator: string): string {
    const cleaned = this.sanitize(text);
    if (!cleaned) return '';
    const addition = `${cleaned}${separator}`;
    this.output += addition;
    return addition;
  }

  push(chunk: string): string {
    if (this.finished) return '';
    const room = this.maxLength - this.acceptedChars;
    if (room <= 0) return '';
    const accepted = chunk.slice(0, room);
    this.acceptedChars += accepted.length;
    this.buffer += accepted;

    let emitted = '';
    while (true) {
      const match = this.buffer.match(/[.!?](?:["')\]]?)(?:\s+)/);
      const newline = this.buffer.indexOf('\n');
      if (match?.index === undefined && newline === -1) break;

      const sentenceEnd = match?.index === undefined ? Number.POSITIVE_INFINITY : match.index + 1;
      const newlineEnd = newline === -1 ? Number.POSITIVE_INFINITY : newline + 1;
      const end = Math.min(sentenceEnd, newlineEnd);
      const segment = this.buffer.slice(0, end);
      this.buffer = this.buffer.slice(end);
      const separator = newlineEnd <= sentenceEnd ? '\n' : ' ';
      emitted += this.append(segment, separator);
    }

    // Avoid holding a very long unpunctuated run. Cut at a word boundary and
    // keep the tail buffered so a partial word is never emitted.
    if (this.buffer.length > 700) {
      const cut = this.buffer.lastIndexOf(' ', 620);
      if (cut > 0) {
        const segment = this.buffer.slice(0, cut);
        this.buffer = this.buffer.slice(cut + 1);
        emitted += this.append(segment, ' ');
      }
    }

    return emitted;
  }

  finish(): {
    text: string;
    usedSourceIndexes: number[];
    cautionApplied: boolean;
  } {
    if (this.finished) {
      return {
        text: this.output.trim(),
        usedSourceIndexes: collectSourceIndexes(this.output, this.sources),
        cautionApplied: this.cautionApplied,
      };
    }
    this.finished = true;
    if (this.buffer) this.output += this.sanitize(this.buffer);

    let text = this.output
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    if (this.cautionApplied) text += `\n\n${CAUTION[this.lang]}`;
    return {
      text,
      usedSourceIndexes: collectSourceIndexes(text, this.sources),
      cautionApplied: this.cautionApplied,
    };
  }
}

export function citationsToSources(
  usedSourceIndexes: number[],
  sources: Source[],
): Source[] {
  return usedSourceIndexes
    .map((index) => sources[index - 1])
    .filter((source): source is Source => Boolean(source));
}

export { CAUTION };
