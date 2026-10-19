import { useState } from 'preact/hooks';
import type { Lang } from '../i18n/config';
import { languages } from '../i18n/config';
import { t } from '../i18n/ui';

interface Props {
  lang: Lang;
  email: string;
  preferredLang: Lang;
  saveHistoryDefault: boolean;
  deletionAvailable: boolean;
}

export default function AccountPanel({
  lang,
  email,
  preferredLang,
  saveHistoryDefault,
  deletionAvailable,
}: Props) {
  const [language, setLanguage] = useState<Lang>(preferredLang);
  const [saveDefault, setSaveDefault] = useState(saveHistoryDefault);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phrase, setPhrase] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  async function savePreferences(event: Event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          preferredLang: language,
          saveHistoryDefault: saveDefault,
        }),
      });
      if (!response.ok) {
        setError(t(lang, 'account.saveError'));
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(t(lang, 'account.saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (phrase !== t(lang, 'account.deletePhrase')) {
      setError(t(lang, 'account.deleteConfirmRequired'));
      return;
    }
    if (!window.confirm(t(lang, 'account.deleteWarning'))) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      if (!response.ok) {
        let code = '';
        try {
          const payload = (await response.json()) as { error?: { code?: string } };
          code = payload.error?.code ?? '';
        } catch {
          // Ignore malformed error bodies.
        }
        setError(
          code === 'service_role_missing'
            ? t(lang, 'account.deleteUnavailable')
            : t(lang, 'account.deleteError'),
        );
        return;
      }
      setDeleteSuccess(true);
      window.setTimeout(() => window.location.assign('/'), 1400);
    } catch {
      setError(t(lang, 'account.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  if (deleteSuccess) {
    return (
      <div class="card panel">
        <h2>{t(lang, 'account.deleteTitle')}</h2>
        <p class="form-success" role="status">
          {t(lang, 'account.deleteSuccess')}
        </p>
      </div>
    );
  }

  return (
    <div class="stack">
      <section class="card panel" aria-labelledby="preferences-title">
        <h2 id="preferences-title">{t(lang, 'account.title')}</h2>
        <p class="muted">{t(lang, 'account.sub')}</p>

        <dl class="cluster">
          <dt class="field-label">{t(lang, 'account.email')}</dt>
          <dd>{email}</dd>
        </dl>

        <form class="form" onSubmit={savePreferences}>
          <div class="field">
            <label for="account-language">{t(lang, 'account.language')}</label>
            <select
              class="select"
              id="account-language"
              value={language}
              onChange={(event) => setLanguage(event.currentTarget.value as Lang)}
            >
              {Object.entries(languages).map(([code, value]) => (
                <option key={code} value={code}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <label class="checkbox">
            <input
              type="checkbox"
              checked={saveDefault}
              onChange={(event) => setSaveDefault(event.currentTarget.checked)}
            />
            <span>
              <strong>{t(lang, 'account.saveHistory')}</strong>
              <br />
              <span class="muted">{t(lang, 'account.saveHistoryHint')}</span>
            </span>
          </label>

          {error && (
            <p class="form-error" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p class="form-success" role="status">
              {t(lang, 'account.saved')}
            </p>
          )}

          <div class="cluster">
            <button class="button button--primary" type="submit" disabled={saving}>
              {saving ? t(lang, 'common.saving') : t(lang, 'common.save')}
            </button>
            <a class="button button--ghost" href="/history">
              {t(lang, 'nav.history')}
            </a>
          </div>
        </form>

        <form method="post" action="/api/auth/signout">
          <button class="button button--secondary" type="submit">
            {t(lang, 'account.signOut')}
          </button>
        </form>
      </section>

      <section class="card panel" aria-labelledby="data-title">
        <h2 id="data-title">{t(lang, 'account.dataTitle')}</h2>
        <p>{t(lang, 'account.dataBody')}</p>
        <h3>{t(lang, 'account.consentHistoryTitle')}</h3>
        <p>{t(lang, 'account.consentHistoryBody')}</p>
      </section>

      <section class="card panel" aria-labelledby="delete-title">
        <h2 id="delete-title">{t(lang, 'account.deleteTitle')}</h2>
        <p>{t(lang, 'account.deleteBody')}</p>
        <p class="form-error">{t(lang, 'account.deleteWarning')}</p>
        {!deletionAvailable && (
          <p class="notice notice--error">{t(lang, 'account.deleteUnavailable')}</p>
        )}
        <div class="field">
          <label for="delete-confirm">{t(lang, 'account.deleteConfirmLabel')}</label>
          <input
            class="input"
            id="delete-confirm"
            value={phrase}
            autocomplete="off"
            onInput={(event) => setPhrase(event.currentTarget.value)}
            placeholder={t(lang, 'account.deletePhrase')}
          />
        </div>
        <button
          class="button button--danger"
          type="button"
          onClick={deleteAccount}
          disabled={deleting || !deletionAvailable}
        >
          {deleting ? t(lang, 'common.deleting') : t(lang, 'account.deleteButton')}
        </button>
      </section>
    </div>
  );
}
