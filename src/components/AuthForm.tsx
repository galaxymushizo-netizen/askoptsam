import type { Lang } from '../i18n/config';
import { t } from '../i18n/ui';

interface Props {
  lang: Lang;
  mode: 'signin' | 'signup';
  accountsConfigured: boolean;
  error?: string | null;
  notice?: string | null;
  next?: string;
}

function errorMessage(lang: Lang, code: string | null | undefined): string | null {
  if (!code) return null;
  if (code === 'credentials') return t(lang, 'auth.errorCredentials');
  if (code === 'rate_limited') return t(lang, 'auth.rateLimited');
  if (code === 'callback') return t(lang, 'auth.callbackError');
  return t(lang, 'auth.errorGeneric');
}

export default function AuthForm({
  lang,
  mode,
  accountsConfigured,
  error,
  notice,
  next = '/account',
}: Props) {
  const signup = mode === 'signup';
  const message = errorMessage(lang, error);
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';
  const switchHref = `${signup ? '/signin' : '/signup'}?next=${encodeURIComponent(safeNext)}`;

  if (!accountsConfigured) {
    return (
      <div class="card panel auth-card">
        <h2>{t(lang, 'auth.notConfigured')}</h2>
        <p>{t(lang, 'auth.notConfiguredBody')}</p>
        <div class="cluster">
          <a class="button button--primary" href="/chat">
            {t(lang, 'auth.continueWithout')}
          </a>
          <a class="button button--secondary" href="/learn">
            {t(lang, 'home.learnCta')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="card panel auth-card">
      <h2>{signup ? t(lang, 'auth.signUpTitle') : t(lang, 'auth.signInTitle')}</h2>
      <p class="muted">{signup ? t(lang, 'auth.signUpSub') : t(lang, 'auth.signInSub')}</p>

      {notice === 'check_email' && (
        <div class="form-success" role="status">
          <strong>{t(lang, 'auth.checkEmail')}</strong>
          <p>{t(lang, 'auth.checkEmailBody')}</p>
        </div>
      )}

      {message && (
        <p class="form-error" role="alert">
          {message}
        </p>
      )}

      <form
        class="form"
        method="post"
        action={signup ? '/api/auth/signup' : '/api/auth/signin'}
      >
        <input type="hidden" name="next" value={safeNext} />
        <div class="field">
          <label for={`${mode}-email`}>{t(lang, 'auth.email')}</label>
          <input
            class="input"
            id={`${mode}-email`}
            name="email"
            type="email"
            autocomplete="email"
            required
            maxlength={254}
            placeholder="name@example.com"
          />
        </div>
        <div class="field">
          <label for={`${mode}-password`}>{t(lang, 'auth.password')}</label>
          <input
            class="input"
            id={`${mode}-password`}
            name="password"
            type="password"
            autocomplete={signup ? 'new-password' : 'current-password'}
            required
            minlength={10}
            maxlength={200}
            aria-describedby={`${mode}-password-hint`}
          />
          <p class="hint" id={`${mode}-password-hint`}>
            {t(lang, 'auth.passwordHint')}
          </p>
        </div>

        {signup && (
          <label class="checkbox">
            <input type="checkbox" name="acceptTerms" value="on" required />
            <span>
              {t(lang, 'auth.acceptTerms')}{' '}
              <a href="/terms">{t(lang, 'footer.terms')}</a>{' '}
              <a href="/privacy">{t(lang, 'footer.privacy')}</a>.
            </span>
          </label>
        )}

        <button class="button button--primary button--wide" type="submit">
          {signup ? t(lang, 'auth.signUp') : t(lang, 'auth.signIn')}
        </button>
      </form>

      <div class="auth-links">
        <span>
          {signup ? t(lang, 'auth.haveAccount') : t(lang, 'auth.noAccount')}{' '}
          <a href={switchHref}>
            {signup ? t(lang, 'auth.signIn') : t(lang, 'auth.signUp')}
          </a>
        </span>
        <a href="/chat">{t(lang, 'auth.continueWithout')}</a>
      </div>
    </div>
  );
}
