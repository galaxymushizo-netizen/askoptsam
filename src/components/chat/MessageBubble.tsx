import type { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import type { Lang } from '../../i18n/config';
import { t } from '../../i18n/ui';
import { SourceList } from './SourceList';
import { TriageCard } from './TriageCard';
import type { ChatMessage, ChatSource } from './types';

interface Props {
  lang: Lang;
  message: ChatMessage;
  onSuggestion: (question: string) => void;
}

function renderInline(text: string, sources: ChatSource[] | undefined): JSX.Element[] {
  const parts = text.split(/(\[S\d+\])/g);
  return parts.map((part, index) => {
    const match = /^\[S(\d+)\]$/.exec(part);
    if (!match) return <span key={index}>{part}</span>;
    const number = Number(match[1] ?? '');
    const source = sources?.[number - 1];
    if (!source) return <span key={index}>{part}</span>;
    return (
      <a
        key={index}
        class="citation"
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        title={`${source.title} — ${source.publisher}`}
      >
        S{number}
      </a>
    );
  });
}

function RenderedText({ text, sources }: { text: string; sources?: ChatSource[] }) {
  const paragraphs = text.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0);
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split('\n');
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {renderInline(line, sources)}
                {lineIndex < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function MessageBubble({ lang, message, onSuggestion }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef<number | null>(null);

  const isAssistant = message.role === 'assistant';
  const sources = message.sources ?? [];
  const used = message.usedSourceIndexes ?? [];
  const shownIndexes =
    message.mode === 'safety' && used.length === 0
      ? sources.map((_source, index) => index + 1)
      : used;
  const showCitationNote =
    isAssistant &&
    !message.pending &&
    !message.error &&
    message.mode !== 'safety' &&
    sources.length > 0 &&
    used.length === 0;

  async function copyResponse() {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyFailed(true);
    }
  }

  return (
    <div class={`message ${isAssistant ? 'message--assistant' : 'message--user'}`}>
      <div class="message-avatar" aria-hidden="true">
        {isAssistant ? 'AO' : t(lang, 'chat.you').slice(0, 1)}
      </div>
      <div class="message-content">
        <div class="message-bubble">
          {isAssistant && message.mode === 'demo' && (
            <span class="demo-label">{t(lang, 'chat.demoMessageLabel')}</span>
          )}
          {message.triage ? (
            <TriageCard lang={lang} triage={message.triage} />
          ) : message.pending && !message.content ? (
            <span class="typing" role="status">
              {t(lang, 'chat.typing')}
              <span class="typing-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </span>
          ) : (
            <div class="message-text">
              <RenderedText text={message.content} sources={message.sources} />
            </div>
          )}

          {message.truncated && (
            <div class="notice notice--error" role="status">
              {message.pending ? t(lang, 'chat.stopped') : t(lang, 'chat.partialWarning')}
            </div>
          )}

          {isAssistant && !message.triage && sources.length > 0 && (
            <SourceList lang={lang} sources={sources} indexes={shownIndexes} />
          )}

          {isAssistant && showCitationNote && (
            <p class="tiny muted" role="note">
              {t(lang, 'chat.noCitationNote')}
            </p>
          )}

          {isAssistant && !message.pending && (message.followUps?.length ?? 0) > 0 && (
            <div class="followups">
              <p>{t(lang, 'chat.followUps')}</p>
              <div class="chip-row">
                {message.followUps?.map((question) => (
                  <button
                    key={question}
                    type="button"
                    class="chip"
                    onClick={() => onSuggestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAssistant && !message.pending && message.content && !message.error && (
          <div class="message-actions">
            <button type="button" onClick={copyResponse} aria-live="polite">
              {copied ? t(lang, 'chat.copied') : t(lang, 'chat.copy')}
            </button>
            {message.providerLabel && message.mode !== 'safety' && (
              <span class="tiny muted">{message.providerLabel}</span>
            )}
          </div>
        )}
        {copyFailed && (
          <p class="tiny" role="alert">
            {t(lang, 'chat.copyFailed')}
          </p>
        )}
      </div>
    </div>
  );
}
