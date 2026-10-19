import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Lang } from '../../i18n/config';
import { t } from '../../i18n/ui';
import { MessageBubble } from './MessageBubble';
import type {
  ChatIslandProps,
  ChatMessage,
  ChatMode,
  ChatSource,
  ChatTriage,
} from './types';

const STORAGE_KEY = 'askoptsam.chat.session.v1';
const MAX_MESSAGE = 2000;

interface StoredChat {
  messages: ChatMessage[];
  conversationId: string | null;
  saving: boolean;
  mode: ChatMode;
  modeDetail: string;
}

interface MetaEvent {
  type: 'meta';
  mode: ChatMode;
  providerLabel: string;
  demoReasonText: string;
  remaining?: number;
}

interface DoneEvent {
  type: 'done';
  text: string;
  sources: ChatSource[];
  usedSourceIndexes: number[];
  followUps: string[];
  cautionApplied: boolean;
  mode: ChatMode;
  providerLabel: string;
  triage: ChatTriage | null;
  truncated?: boolean;
  conversationId?: string | null;
  saved?: boolean;
  persistenceWarning?: string | null;
}

interface ErrorEvent {
  type: 'error';
  code: string;
  message: string;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isValidSource(value: unknown): value is ChatSource {
  if (!value || typeof value !== 'object') return false;
  const source = value as Record<string, unknown>;
  return (
    typeof source.id === 'string' &&
    typeof source.title === 'string' &&
    typeof source.publisher === 'string' &&
    typeof source.url === 'string' &&
    /^https?:\/\//.test(source.url)
  );
}

function readStored(): StoredChat | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const messages = Array.isArray(parsed.messages)
      ? parsed.messages
          .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
          .filter(
            (item) =>
              (item.role === 'user' || item.role === 'assistant') &&
              typeof item.content === 'string' &&
              typeof item.id === 'string',
          )
          .map((item) => ({
            id: String(item.id),
            role: item.role as 'user' | 'assistant',
            content: String(item.content).slice(0, 8000),
            mode:
              item.mode === 'live' || item.mode === 'demo' || item.mode === 'safety'
                ? (item.mode as ChatMode)
                : undefined,
            providerLabel: typeof item.providerLabel === 'string' ? item.providerLabel : undefined,
            demoReasonText:
              typeof item.demoReasonText === 'string' ? item.demoReasonText : undefined,
            sources: Array.isArray(item.sources)
              ? item.sources.filter(isValidSource)
              : undefined,
            usedSourceIndexes: Array.isArray(item.usedSourceIndexes)
              ? item.usedSourceIndexes.filter((index): index is number => Number.isInteger(index))
              : undefined,
            followUps: Array.isArray(item.followUps)
              ? item.followUps.filter((followUp): followUp is string => typeof followUp === 'string')
              : undefined,
            triage:
              item.triage && typeof item.triage === 'object'
                ? (item.triage as ChatTriage)
                : null,
            truncated: item.truncated === true,
          }))
      : [];
    if (messages.length === 0) return null;
    return {
      messages,
      conversationId:
        typeof parsed.conversationId === 'string' ? parsed.conversationId : null,
      saving: parsed.saving === true,
      mode: parsed.mode === 'demo' || parsed.mode === 'safety' ? parsed.mode : 'live',
      modeDetail: typeof parsed.modeDetail === 'string' ? parsed.modeDetail : '',
    };
  } catch {
    return null;
  }
}

function parseFrame(frame: string): { event: string; data: unknown } | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) return null;
  const raw = dataLines.join('\n');
  try {
    return { event, data: JSON.parse(raw) as unknown };
  } catch {
    return null;
  }
}

async function consumeSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: string, data: unknown) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const drain = () => {
    let match = buffer.match(/\r?\n\r?\n/);
    while (match && match.index !== undefined) {
      const index = match.index;
      const frame = buffer.slice(0, index);
      buffer = buffer.slice(index + match[0].length);
      const parsed = parseFrame(frame);
      if (parsed) onEvent(parsed.event, parsed.data);
      match = buffer.match(/\r?\n\r?\n/);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      drain();
    }
    buffer += decoder.decode();
    drain();
    if (buffer.trim()) {
      const parsed = parseFrame(buffer);
      if (parsed) onEvent(parsed.event, parsed.data);
    }
  } finally {
    reader.releaseLock();
  }
}

function modeLabel(lang: Lang, mode: ChatMode): string {
  if (mode === 'live') return t(lang, 'chat.modeLive');
  if (mode === 'safety') return t(lang, 'chat.modeSafety');
  return t(lang, 'chat.modeDemo');
}

function modePillClass(mode: ChatMode): string {
  if (mode === 'live') return 'pill pill--live';
  if (mode === 'safety') return 'pill pill--safety';
  return 'pill pill--demo';
}

function explainMode(lang: Lang, mode: ChatMode, detail: string): string {
  if (mode === 'safety') return t(lang, 'chat.modeSafetyExplain');
  if (mode === 'demo') {
    return detail ? `${t(lang, 'chat.modeDemoExplain')} ${detail}` : t(lang, 'chat.modeDemoExplain');
  }
  return '';
}

export default function ChatIsland(props: ChatIslandProps) {
  const {
    lang,
    initialMode,
    initialModeDetail,
    providerLabel,
    signedIn,
    accountsConfigured,
    initialQuestion,
    initialMessages,
    initialConversationId,
    initialSaving,
    suggested,
    loadError,
  } = props;

  const initialSaved = Boolean(initialConversationId && initialMessages.length > 0);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState(initialQuestion);
  const [consented, setConsented] = useState(initialMessages.length > 0);
  const [noticeChecked, setNoticeChecked] = useState(false);
  const [saveConsent, setSaveConsent] = useState(initialSaved);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [saving, setSaving] = useState(
    signedIn && (initialSaved || initialSaving),
  );
  const [savedConversation, setSavedConversation] = useState(initialSaved);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [mode, setMode] = useState<ChatMode>(initialMode);
  const [modeDetail, setModeDetail] = useState(initialModeDetail);
  const [sending, setSending] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [error, setError] = useState<string | null>(
    loadError ? t(lang, 'chat.conversationLoadError') : null,
  );
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const restoredRef = useRef(false);

  const notes = useMemo(
    () => explainMode(lang, mode, modeDetail),
    [lang, mode, modeDetail],
  );

  const empty = messages.length === 0;

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (initialMessages.length > 0 || initialQuestion) return;
    const stored = readStored();
    if (!stored) return;
    setMessages(stored.messages);
    setConversationId(stored.conversationId);
    setSaving(signedIn && stored.saving);
    setMode(stored.mode);
    setModeDetail(stored.modeDetail);
    setConsented(true);
    setSaveConsent(signedIn && stored.saving);
  }, [initialMessages.length, initialQuestion, signedIn]);

  useEffect(() => {
    if (!consented || savedConversation) return;
    try {
      if (messages.length === 0) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return;
      }
      const stored: StoredChat = {
        messages: messages
          .filter((message) => !message.pending && !message.error)
          .map((message) => ({ ...message, pending: false })),
        conversationId,
        saving,
        mode,
        modeDetail,
      };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // Session storage can be full or blocked. Chat still works.
    }
  }, [messages, conversationId, saving, mode, modeDetail, consented, savedConversation]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTop = log.scrollHeight;
  }, [messages]);

  function focusComposer() {
    window.setTimeout(() => textareaRef.current?.focus(), 20);
  }

  function updateAssistant(id: string, update: (message: ChatMessage) => ChatMessage) {
    setMessages((current) =>
      current.map((message) => (message.id === id ? update(message) : message)),
    );
  }

  async function submitMessage(
    raw: string,
    options: { appendUser?: boolean; allowUnconsented?: boolean } = {},
  ) {
    const text = raw.trim();
    if (text.length < 2 || sending) return;

    if (!consented && !options.allowUnconsented) {
      setPendingQuestion(text);
      setInput(text);
      setConsentError(t(lang, 'chat.consentRequired'));
      return;
    }
    if (saving && !saveConsent) {
      setError(t(lang, 'chat.saveConsentRequired'));
      return;
    }

    const history = messages
      .filter(
        (message) =>
          !message.pending &&
          !message.error &&
          message.content.trim().length > 0 &&
          (message.role === 'user' || message.role === 'assistant'),
      )
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 3000),
      }));

    const userMessage: ChatMessage = {
      id: newId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantId = newId();
    const placeholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      pending: true,
      mode,
      providerLabel,
      sources: [],
      usedSourceIndexes: [],
      followUps: [],
    };

    if (options.appendUser !== false) {
      setMessages((current) => [...current, userMessage, placeholder]);
    } else {
      setMessages((current) => [...current, placeholder]);
    }
    setInput('');
    setPendingQuestion(null);
    setError(null);
    setSaveMessage(null);
    setStopped(false);
    setSending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let receivedText = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          lang,
          consent: true,
          save: signedIn && saving,
          conversationId: conversationId ?? null,
          history,
        }),
      });

      if (!response.ok) {
        let code = 'request_failed';
        try {
          const payload = (await response.json()) as {
            error?: { code?: string };
          };
          if (payload.error?.code) code = payload.error.code;
        } catch {
          // Keep the generic code.
        }
        if (code === 'rate_limited') {
          setError(t(lang, 'chat.errorRate'));
        } else if (code === 'auth_required') {
          setError(t(lang, 'chat.signInToSave'));
        } else if (code === 'accounts_unavailable') {
          setError(t(lang, 'chat.errorUnavailable'));
        } else {
          setError(t(lang, 'chat.errorGeneric'));
        }
        updateAssistant(assistantId, (message) => ({
          ...message,
          pending: false,
          error: true,
        }));
        return;
      }

      if (!response.body) {
        setError(t(lang, 'chat.errorUnavailable'));
        updateAssistant(assistantId, (message) => ({
          ...message,
          pending: false,
          error: true,
        }));
        return;
      }

      await consumeSse(response.body, (event, data) => {
        if (event === 'meta') {
          const meta = data as MetaEvent;
          if (meta.mode) {
            setMode(meta.mode);
            setModeDetail(meta.demoReasonText || '');
          }
          if (typeof meta.remaining === 'number') setRemaining(meta.remaining);
          return;
        }

        if (event === 'triage') {
          updateAssistant(assistantId, (message) => ({
            ...message,
            triage: data as ChatTriage,
            mode: 'safety',
          }));
          return;
        }

        if (event === 'delta') {
          const chunk = typeof data === 'string' ? data : '';
          receivedText += chunk;
          updateAssistant(assistantId, (message) => ({
            ...message,
            content: message.content + chunk,
          }));
          return;
        }

        if (event === 'done') {
          const done = data as DoneEvent;
          receivedText = done.text;
          updateAssistant(assistantId, (message) => ({
            ...message,
            content: done.text,
            pending: false,
            mode: done.mode,
            providerLabel: done.providerLabel,
            sources: done.sources ?? [],
            usedSourceIndexes: done.usedSourceIndexes ?? [],
            followUps: done.followUps ?? [],
            triage: done.triage,
            cautionApplied: done.cautionApplied,
            truncated: done.truncated === true,
          }));
          setMode(done.mode);
          if (done.conversationId) setConversationId(done.conversationId);
          if (done.saved) {
            setSavedConversation(true);
            setSaving(true);
            setSaveConsent(true);
            setSaveMessage(t(lang, 'chat.historySaved'));
          }
          if (done.persistenceWarning) {
            setError(t(lang, 'chat.errorGeneric'));
          }
          return;
        }

        if (event === 'error') {
          const streamError = data as ErrorEvent;
          if (streamError.code === 'rate_limited') {
            setError(t(lang, 'chat.errorRate'));
          } else {
            setError(t(lang, 'chat.errorGeneric'));
          }
          updateAssistant(assistantId, (message) => ({
            ...message,
            pending: false,
            truncated: Boolean(message.content),
          }));
        }
      });

      if (!receivedText.trim()) {
        updateAssistant(assistantId, (message) =>
          message.content
            ? { ...message, pending: false }
            : {
                ...message,
                pending: false,
                error: true,
                content: t(lang, 'chat.errorGeneric'),
              },
        );
      }
    } catch (caught) {
      const aborted =
        caught instanceof DOMException
          ? caught.name === 'AbortError'
          : Boolean(
              caught &&
                typeof caught === 'object' &&
                'name' in caught &&
                (caught as { name?: string }).name === 'AbortError',
            );
      if (aborted) {
        setStopped(true);
        updateAssistant(assistantId, (message) => ({
          ...message,
          pending: false,
          truncated: true,
        }));
      } else {
        setError(t(lang, 'chat.errorNetwork'));
        updateAssistant(assistantId, (message) => ({
          ...message,
          pending: false,
          truncated: Boolean(message.content),
          error: !message.content,
          content: message.content || t(lang, 'chat.errorGeneric'),
        }));
      }
    } finally {
      abortRef.current = null;
      setSending(false);
    }
  }

  function acceptConsent() {
    if (!noticeChecked) {
      setConsentError(t(lang, 'chat.consentRequired'));
      return;
    }
    if (saving && !saveConsent) {
      setConsentError(t(lang, 'chat.saveConsentRequired'));
      return;
    }
    setConsentError(null);
    setConsented(true);
    const question = pendingQuestion || initialQuestion;
    if (question && messages.length === 0) {
      void submitMessage(question, { allowUnconsented: true });
    } else {
      focusComposer();
    }
  }

  function chooseSuggestion(question: string) {
    setInput(question);
    if (!consented) {
      setPendingQuestion(question);
      focusComposer();
      return;
    }
    void submitMessage(question);
  }

  function onSubmit(event: Event) {
    event.preventDefault();
    void submitMessage(input);
  }

  function stopResponse() {
    abortRef.current?.abort();
  }

  function clearChat() {
    if (messages.length > 0 && !window.confirm(t(lang, 'chat.clearConfirm'))) return;
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(null);
    setSavedConversation(false);
    setSaving(signedIn && initialSaving);
    setSaveConsent(signedIn && initialSaving);
    setMode(initialMode);
    setModeDetail(initialModeDetail);
    setError(null);
    setStopped(false);
    setSaveMessage(null);
    setRemaining(null);
    setInput('');
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
    focusComposer();
  }

  function retryLast() {
    const lastUser = [...messages].reverse().find((message) => message.role === 'user');
    if (!lastUser) return;
    const index = messages.findIndex((message) => message.id === lastUser.id);
    setMessages(messages.slice(0, index));
    setInput(lastUser.content);
    setError(null);
    setStopped(false);
    setSending(false);
    focusComposer();
  }

  async function deleteSaved() {
    if (!conversationId) return;
    if (!window.confirm(t(lang, 'chat.deleteConfirm'))) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        setError(t(lang, 'chat.errorGeneric'));
        return;
      }
      setMessages([]);
      setConversationId(null);
      setSavedConversation(false);
      setSaving(signedIn && initialSaving);
      setSaveConsent(signedIn && initialSaving);
      setSaveMessage(null);
      setMode(initialMode);
      setModeDetail(initialModeDetail);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage failures.
      }
    } catch {
      setError(t(lang, 'chat.errorNetwork'));
    } finally {
      setDeleting(false);
    }
  }

  function onComposerKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(input);
    }
  }

  const charCount = Math.min(input.length, MAX_MESSAGE);

  return (
    <div class="chat-shell">
      <div class="chat-head">
        <div class="chat-head-title">
          <h1>{t(lang, 'chat.title')}</h1>
          <span class={modePillClass(mode)}>
            <span class="status-dot" aria-hidden="true"></span>
            {modeLabel(lang, mode)}
          </span>
        </div>
        <div class="chat-head-actions">
          {savedConversation ? (
            <span class="pill pill--live">{t(lang, 'chat.savedBadge')}</span>
          ) : signedIn && saving ? (
            <span class="pill pill--muted">{t(lang, 'chat.savingBadge')}</span>
          ) : (
            <span class="pill pill--muted">{t(lang, 'chat.temporary')}</span>
          )}
          {savedConversation && conversationId && (
            <button
              class="button button--ghost"
              type="button"
              onClick={deleteSaved}
              disabled={deleting}
            >
              {deleting ? t(lang, 'common.deleting') : t(lang, 'chat.deleteConversation')}
            </button>
          )}
          <button class="button button--ghost" type="button" onClick={clearChat}>
            {t(lang, 'chat.newChat')}
          </button>
          <a class="button button--ghost" href="/status">
            {t(lang, 'chat.statusLink')}
          </a>
        </div>
      </div>

      <div
        class="chat-log"
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={t(lang, 'chat.title')}
      >
        {!empty && notes && (
          <div
            class={`notice ${mode === 'safety' ? 'notice--error' : 'notice--demo'}`}
            role="status"
          >
            <strong>{modeLabel(lang, mode)}:</strong> {notes}
          </div>
        )}

        {empty ? (
          <div class="chat-empty">
            <div class="chat-empty-inner">
              <div class="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none">
                  <path
                    d="M4 16c3.1-5.2 7.2-7.8 12-7.8S24.9 10.8 28 16c-3.1 5.2-7.2 7.8-12 7.8S7.1 21.2 4 16Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linejoin="round"
                  />
                  <circle cx="16" cy="16" r="4.1" stroke="currentColor" stroke-width="1.7" />
                  <circle cx="17.3" cy="14.7" r="1.1" fill="currentColor" />
                </svg>
              </div>
              <h2>{t(lang, 'chat.startTitle')}</h2>
              <p>{t(lang, 'chat.startBody')}</p>
              {!consented && initialQuestion && (
                <p class="notice notice--info">
                  <strong>{t(lang, 'chat.you')}:</strong> {initialQuestion}
                </p>
              )}
              <div class="chip-row">
                {suggested.slice(0, 4).map((question) => (
                  <button
                    key={question}
                    type="button"
                    class="chip"
                    onClick={() => chooseSuggestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
              <p class="tiny muted">
                <a href="/privacy">{t(lang, 'chat.privacyLink')}</a>
                {' · '}
                <a href="/warning-signs">{t(lang, 'nav.emergency')}</a>
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              lang={lang}
              message={message}
              onSuggestion={(question) => void submitMessage(question)}
            />
          ))
        )}
      </div>

      <div class="composer-area">
        {error && (
          <div class="composer-notices">
            <div class="notice notice--error" role="alert">
              {error}
              {!sending && messages.length > 0 && (
                <button class="button button--ghost" type="button" onClick={retryLast}>
                  {t(lang, 'chat.retry')}
                </button>
              )}
            </div>
          </div>
        )}

        {stopped && (
          <div class="composer-notices">
            <div class="notice" role="status">
              {t(lang, 'chat.stopped')}
            </div>
          </div>
        )}

        {saveMessage && (
          <div class="composer-notices">
            <div class="notice notice--info" role="status">
              {saveMessage}
            </div>
          </div>
        )}

        {!consented ? (
          <div class="consent-card">
            <h2>{t(lang, 'chat.consentTitle')}</h2>
            <p>{t(lang, 'chat.consentIntro')}</p>
            <p class="tiny muted">{t(lang, 'chat.privacyNotice')}</p>
            <label class="checkbox">
              <input
                type="checkbox"
                checked={noticeChecked}
                onChange={(event) => setNoticeChecked(event.currentTarget.checked)}
              />
              <span>{t(lang, 'chat.consentAi')}</span>
            </label>
            {signedIn && saving && (
              <label class="checkbox">
                <input
                  type="checkbox"
                  checked={saveConsent}
                  onChange={(event) => setSaveConsent(event.currentTarget.checked)}
                />
                <span>{t(lang, 'chat.savingConsent')}</span>
              </label>
            )}
            {consentError && (
              <p class="form-error" role="alert">
                {consentError}
              </p>
            )}
            <div class="cluster">
              <button class="button button--primary" type="button" onClick={acceptConsent}>
                {t(lang, 'chat.consentContinue')}
              </button>
              <a class="button button--ghost" href="/learn">
                {t(lang, 'home.learnCta')}
              </a>
            </div>
          </div>
        ) : (
          <>
            {saving && !saveConsent && (
              <div class="composer-notices">
                <label class="checkbox notice">
                  <input
                    type="checkbox"
                    checked={saveConsent}
                    onChange={(event) => setSaveConsent(event.currentTarget.checked)}
                  />
                  <span>{t(lang, 'chat.savingConsent')}</span>
                </label>
              </div>
            )}
            <form class="composer" onSubmit={onSubmit}>
              <div class="composer-box">
                <label class="visually-hidden" for="chat-input">
                  {t(lang, 'chat.placeholder')}
                </label>
                <textarea
                  id="chat-input"
                  ref={textareaRef}
                  value={input}
                  maxLength={MAX_MESSAGE}
                  rows={2}
                  placeholder={t(lang, 'chat.placeholder')}
                  onInput={(event) => setInput(event.currentTarget.value)}
                  onKeyDown={onComposerKeyDown}
                  disabled={sending}
                />
                {sending ? (
                  <button
                    class="composer-stop"
                    type="button"
                    onClick={stopResponse}
                    aria-label={t(lang, 'chat.stop')}
                  >
                    {t(lang, 'chat.stop')}
                  </button>
                ) : (
                  <button
                    class="composer-send"
                    type="submit"
                    disabled={input.trim().length < 2}
                    aria-label={t(lang, 'chat.send')}
                    title={t(lang, 'chat.send')}
                  >
                    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
                      <path
                        d="M4 12 20 4l-4 16-4.2-6.2L4 12Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M12 13.8 20 4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div class="composer-footer">
                <span class="privacy-inline">{t(lang, 'chat.privacyNotice')}</span>
                <span class="cluster">
                  {remaining !== null && remaining >= 0 && (
                    <span class="tiny">{t(lang, 'chat.questionsLeft', { count: remaining })}</span>
                  )}
                  {signedIn ? (
                    <label class="save-toggle">
                      <input
                        type="checkbox"
                        checked={saving}
                        disabled={savedConversation}
                        onChange={(event) => {
                          const next = event.currentTarget.checked;
                          setSaving(next);
                          if (!next) setSaveConsent(false);
                        }}
                      />
                      {saving ? t(lang, 'chat.savingOn') : t(lang, 'chat.savingOff')}
                    </label>
                  ) : accountsConfigured ? (
                    <a href="/signin?next=/chat" class="tiny">
                      {t(lang, 'chat.signInToSave')}
                    </a>
                  ) : (
                    <span class="tiny">{t(lang, 'chat.tempNotice')}</span>
                  )}
                  <span class="tiny">
                    {t(lang, 'chat.charCount', { count: charCount, max: MAX_MESSAGE })}
                  </span>
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
