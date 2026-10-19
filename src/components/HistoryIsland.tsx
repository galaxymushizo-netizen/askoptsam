import { useState } from 'preact/hooks';
import type { Lang } from '../i18n/config';
import { t } from '../i18n/ui';

export interface HistoryConversation {
  id: string;
  title: string;
  lang: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface Props {
  lang: Lang;
  initialConversations: HistoryConversation[];
  loadError: boolean;
}

function formatDate(lang: Lang, value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(lang === 'sw' ? 'sw-TZ' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return value;
  }
}

export default function HistoryIsland({ lang, initialConversations, loadError }: Props) {
  const [conversations, setConversations] =
    useState<HistoryConversation[]>(initialConversations);
  const [error, setError] = useState<string | null>(
    loadError ? t(lang, 'history.loadError') : null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  async function renameConversation(id: string) {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ title: nextTitle }),
      });
      if (!response.ok) {
        setError(t(lang, 'history.loadError'));
        return;
      }
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === id ? { ...conversation, title: nextTitle } : conversation,
        ),
      );
      setEditingId(null);
      setTitle('');
    } catch {
      setError(t(lang, 'history.loadError'));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteConversation(id: string) {
    if (!window.confirm(t(lang, 'history.deleteConfirm'))) return;
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        setError(t(lang, 'history.loadError'));
        return;
      }
      setConversations((current) => current.filter((conversation) => conversation.id !== id));
      setStatus(t(lang, 'history.deleted'));
    } catch {
      setError(t(lang, 'history.loadError'));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAll() {
    if (!window.confirm(t(lang, 'history.deleteAllConfirm'))) return;
    setDeletingAll(true);
    setError(null);
    try {
      const response = await fetch('/api/conversations?all=true', {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        setError(t(lang, 'history.loadError'));
        return;
      }
      setConversations([]);
      setStatus(t(lang, 'history.deleteAllDone'));
    } catch {
      setError(t(lang, 'history.loadError'));
    } finally {
      setDeletingAll(false);
    }
  }

  if (conversations.length === 0) {
    return (
      <div class="stack">
        {error && (
          <p class="form-error" role="alert">
            {error}
          </p>
        )}
        {status && (
          <p class="form-success" role="status">
            {status}
          </p>
        )}
        <div class="empty-state">
          <h2>{t(lang, 'history.empty')}</h2>
          <p>{t(lang, 'history.emptyBody')}</p>
          <a class="button button--primary" href="/chat">
            {t(lang, 'nav.startChat')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="stack">
      {error && (
        <p class="form-error" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p class="form-success" role="status">
          {status}
        </p>
      )}

      <div class="split-heading">
        <p class="muted">
          {t(lang, 'history.sub')}
        </p>
        <button
          class="button button--secondary"
          type="button"
          onClick={deleteAll}
          disabled={deletingAll}
        >
          {deletingAll ? t(lang, 'common.deleting') : t(lang, 'history.deleteAll')}
        </button>
      </div>

      <div class="history-list">
        {conversations.map((conversation) => (
          <article class="history-item" key={conversation.id}>
            <div>
              <h3>{conversation.title}</h3>
              <p>
                {t(lang, 'history.count', { count: conversation.messageCount })}
                {' · '}
                {t(lang, 'history.updated', {
                  date: formatDate(lang, conversation.updatedAt),
                })}
              </p>
              {editingId === conversation.id && (
                <form
                  class="rename-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void renameConversation(conversation.id);
                  }}
                >
                  <label class="visually-hidden" for={`rename-${conversation.id}`}>
                    {t(lang, 'history.renameLabel')}
                  </label>
                  <input
                    id={`rename-${conversation.id}`}
                    value={title}
                    maxLength={80}
                    onInput={(event) => setTitle(event.currentTarget.value)}
                    autofocus
                  />
                  <button
                    class="button button--primary"
                    type="submit"
                    disabled={busyId === conversation.id}
                  >
                    {t(lang, 'history.saveRename')}
                  </button>
                  <button
                    class="button button--ghost"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setTitle('');
                    }}
                  >
                    {t(lang, 'common.cancel')}
                  </button>
                </form>
              )}
            </div>
            <div class="history-actions">
              <a class="button button--secondary" href={`/chat?conversation=${conversation.id}`}>
                {t(lang, 'history.open')}
              </a>
              <button
                class="button button--ghost"
                type="button"
                onClick={() => {
                  setEditingId(conversation.id);
                  setTitle(conversation.title);
                }}
              >
                {t(lang, 'history.rename')}
              </button>
              <button
                class="button button--ghost"
                type="button"
                onClick={() => void deleteConversation(conversation.id)}
                disabled={busyId === conversation.id}
              >
                {busyId === conversation.id ? t(lang, 'common.deleting') : t(lang, 'history.delete')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
