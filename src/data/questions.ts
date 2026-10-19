import type { Lang } from '../i18n/config';

export interface SuggestedQuestion {
  id: string;
  en: string;
  sw: string;
}

export const suggestedQuestions: SuggestedQuestion[] = [
  {
    id: 'itchy',
    en: 'Why do my eyes feel itchy?',
    sw: 'Kwa nini macho yangu yanawasha?',
  },
  {
    id: 'blurry',
    en: 'What can cause blurry vision?',
    sw: 'Ni nini kinaweza kusababisha kuona ukungu?',
  },
  {
    id: 'light',
    en: 'Why are my eyes sensitive to light?',
    sw: 'Kwa nini macho yangu yanawasha na mwanga?',
  },
  {
    id: 'red',
    en: 'My eyes are red. What should I know?',
    sw: 'Macho yangu ni mekundu. Nijue nini?',
  },
  {
    id: 'chemical',
    en: 'What should I do if a chemical gets into my eye?',
    sw: 'Nifanye nini ikiwa kemikali imeingia jichoni?',
  },
  {
    id: 'screen',
    en: 'How can I reduce eye strain from screens?',
    sw: 'Ninawezaje kupunguza uchovu wa macho kutokana na skrini?',
  },
  {
    id: 'contacts',
    en: 'What are the safety rules for contact lenses?',
    sw: 'Ni kanuni gani za usalama kwa lenzi za mawasiliano?',
  },
  {
    id: 'child',
    en: 'What eye problems should I watch for in children?',
    sw: 'Ni matatizo gani ya macho niangalie kwa watoto?',
  },
];

export function suggestedForLang(lang: Lang): string[] {
  return suggestedQuestions.map((question) => question[lang]);
}
