import type { Lang } from '../../i18n/config';
import { t } from '../../i18n/ui';
import type { ChatTriage } from './types';

interface Props {
  lang: Lang;
  triage: ChatTriage;
}

export function TriageCard({ lang, triage }: Props) {
  return (
    <div class="triage-card">
      <div class="triage-head">
        <span class="pill">
          <span class="status-dot" aria-hidden="true"></span>
          {triage.label || t(lang, 'chat.urgentGuidance')}
        </span>
        <h3>{triage.title}</h3>
        <p>{triage.summary}</p>
      </div>
      <div class="triage-body">
        {triage.steps.length > 0 && (
          <>
            <h4>{t(lang, 'chat.actionsNow')}</h4>
            <ol>
              {triage.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </>
        )}
        {triage.doNot.length > 0 && (
          <>
            <h4>{t(lang, 'chat.doNot')}</h4>
            <ul>
              {triage.doNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {triage.serviceNote && <p class="triage-service">{triage.serviceNote}</p>}
        <p class="triage-note">{t(lang, 'chat.emergencyAiNote')}</p>
        <p class="triage-note">
          <a href="/warning-signs">{t(lang, 'chat.readWarningSigns')}</a>
        </p>
      </div>
    </div>
  );
}
