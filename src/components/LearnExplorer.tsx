import { useMemo, useState } from 'preact/hooks';
import type { Lang } from '../i18n/config';
import { t } from '../i18n/ui';

export interface LearnArticleSummary {
  slug: string;
  topic: string;
  topicLabel: string;
  title: string;
  summary: string;
  readingMinutes: number;
  clinicalReview: 'pending' | 'complete';
  keywords: string[];
}

interface Props {
  lang: Lang;
  articles: LearnArticleSummary[];
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function LearnExplorer({ lang, articles }: Props) {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');

  const topics = useMemo(() => {
    const seen = new Map<string, string>();
    for (const article of articles) {
      if (!seen.has(article.topic)) seen.set(article.topic, article.topicLabel);
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [articles]);

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    return articles.filter((article) => {
      if (topic !== 'all' && article.topic !== topic) return false;
      if (!needle) return true;
      const haystack = normalize(
        [article.title, article.summary, article.topicLabel, ...article.keywords].join(' '),
      );
      return needle.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [articles, query, topic]);

  return (
    <div>
      <div class="learn-toolbar">
        <div class="search-field">
          <label class="visually-hidden" for="learn-search">
            {t(lang, 'learn.search')}
          </label>
          <input
            id="learn-search"
            type="search"
            value={query}
            placeholder={t(lang, 'learn.searchPlaceholder')}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
      </div>

      <div class="topic-filter" role="group" aria-label={t(lang, 'learn.filterLabel')}>
        <button
          class={`chip ${topic === 'all' ? 'chip--active' : ''}`}
          type="button"
          aria-pressed={topic === 'all'}
          onClick={() => setTopic('all')}
        >
          {t(lang, 'learn.all')}
        </button>
        {topics.map((entry) => (
          <button
            key={entry.value}
            class={`chip ${topic === entry.value ? 'chip--active' : ''}`}
            type="button"
            aria-pressed={topic === entry.value}
            onClick={() => setTopic(entry.value)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <p class="search-status" role="status">
        {t(lang, 'learn.searchStatus', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div class="empty-state">
          <h2>{t(lang, 'learn.noResults')}</h2>
          <button
            class="button button--secondary"
            type="button"
            onClick={() => {
              setQuery('');
              setTopic('all');
            }}
          >
            {t(lang, 'common.retry')}
          </button>
        </div>
      ) : (
        <div class="article-grid">
          {filtered.map((article) => (
            <article class="article-card" key={article.slug}>
              <span class="topic-tag">{article.topicLabel}</span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <div class="article-card-footer">
                <span>
                  {t(lang, 'learn.readingTime', { count: article.readingMinutes })}
                  {' · '}
                  {article.clinicalReview === 'pending'
                    ? t(lang, 'learn.clinicalPending')
                    : t(lang, 'common.reviewed')}
                </span>
                <a href={`/learn/${article.slug}`}>{t(lang, 'common.readArticle')} →</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
