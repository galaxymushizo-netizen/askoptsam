import type { Lang } from '../../i18n/config';
import { t } from '../../i18n/ui';
import type { ChatSource } from './types';

interface Props {
  lang: Lang;
  sources: ChatSource[];
  indexes: number[];
}

export function SourceList({ lang, sources, indexes }: Props) {
  const selected = indexes
    .map((index) => sources[index - 1])
    .filter((source): source is ChatSource => Boolean(source));

  if (selected.length === 0) return null;

  return (
    <div class="sources">
      <h4>{t(lang, 'chat.sources')}</h4>
      <ul class="source-list">
        {selected.map((source, position) => (
          <li key={`${source.id}-${position}`}>
            <a
              class="source-link"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="source-index">S{indexes[position]}</span>
              <span>
                {source.title} <span class="source-publisher">— {source.publisher}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
