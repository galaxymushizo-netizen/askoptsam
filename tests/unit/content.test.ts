import { describe, expect, it } from 'vitest';
import { articleBySlug, articleTopics, articles, getArticle } from '../../src/data/articles';
import { suggestedQuestions } from '../../src/data/questions';
import { dictionary } from '../../src/i18n/ui';
import { sourceById } from '../../src/lib/sources/registry';

const placeholderPattern = /\{([a-zA-Z0-9_]+)\}/g;

function placeholders(value: string): string[] {
  return [...value.matchAll(placeholderPattern)].map((match) => match[1]!).sort();
}

describe('bilingual UI dictionary', () => {
  it('has identical keys and no empty strings in English and Kiswahili', () => {
    const enKeys = Object.keys(dictionary.en).sort();
    const swKeys = Object.keys(dictionary.sw).sort();
    expect(swKeys).toEqual(enKeys);
    for (const key of enKeys) {
      expect(dictionary.en[key as keyof typeof dictionary.en]?.trim()).not.toBe('');
      expect(dictionary.sw[key as keyof typeof dictionary.sw]?.trim()).not.toBe('');
    }
  });

  it('uses the same interpolation placeholders in both languages', () => {
    for (const key of Object.keys(dictionary.en) as Array<keyof typeof dictionary.en>) {
      expect(placeholders(dictionary.sw[key])).toEqual(placeholders(dictionary.en[key]));
    }
  });
});

describe('education library', () => {
  it('has a bilingual, source-linked article for every topic', () => {
    expect(articles.length).toBeGreaterThanOrEqual(10);
    const slugs = new Set<string>();
    const topics = new Set<string>();

    for (const article of articles) {
      expect(slugs.has(article.slug)).toBe(false);
      slugs.add(article.slug);
      topics.add(article.topic);

      expect(article.title.en.trim()).not.toBe('');
      expect(article.title.sw.trim()).not.toBe('');
      expect(article.summary.en.trim()).not.toBe('');
      expect(article.summary.sw.trim()).not.toBe('');
      expect(article.sections.length).toBeGreaterThan(0);
      expect(article.readingMinutes).toBeGreaterThan(0);
      expect(article.clinicalReview).toBe('pending');
      expect(Number.isNaN(Date.parse(article.reviewedAt))).toBe(false);

      for (const section of article.sections) {
        expect(section.heading.en.trim()).not.toBe('');
        expect(section.heading.sw.trim()).not.toBe('');
        expect(section.body.en.length).toBeGreaterThan(0);
        expect(section.body.sw.length).toBeGreaterThan(0);
        expect(section.body.en.every((line) => line.trim().length > 0)).toBe(true);
        expect(section.body.sw.every((line) => line.trim().length > 0)).toBe(true);
      }

      expect(article.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of article.sourceIds) {
        expect(sourceById.has(sourceId)).toBe(true);
      }

      for (const related of article.related) {
        expect(related).not.toBe(article.slug);
        expect(articleBySlug.has(related)).toBe(true);
      }
    }

    for (const topic of Object.keys(articleTopics)) {
      expect(topics.has(topic)).toBe(true);
    }
  });

  it('returns undefined for an unknown article', () => {
    expect(getArticle('does-not-exist')).toBeUndefined();
  });

  it('provides bilingual suggested questions', () => {
    expect(suggestedQuestions.length).toBeGreaterThan(0);
    for (const question of suggestedQuestions) {
      expect(question.en.trim()).not.toBe('');
      expect(question.sw.trim()).not.toBe('');
    }
  });
});
