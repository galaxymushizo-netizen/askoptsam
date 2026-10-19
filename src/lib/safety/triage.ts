import { getSources, type Source } from '../sources/registry';
import { hasFuzzyToken, isNegated, normalizeText } from '../text/normalize';
import type { Lang } from '../../i18n/config';

export type TriageSeverity = 'emergency' | 'urgent' | 'none';

export type TriageCategory =
  | 'chemical'
  | 'penetrating-injury'
  | 'sudden-vision-loss'
  | 'severe-pain'
  | 'retinal-warning'
  | 'painful-red-eye-vision-change'
  | 'acute-glaucoma-pattern'
  | 'contact-lens-infection'
  | 'eye-injury'
  | 'foreign-body'
  | 'light-sensitivity-pain'
  | 'sudden-vision-change'
  | 'newborn-red-eye';

export interface GuidanceContent {
  title: string;
  label: string;
  summary: string;
  steps: string[];
  doNot: string[];
  seekCare: string;
}

export interface EmergencyGuidance {
  severity: Exclude<TriageSeverity, 'none'>;
  category: TriageCategory;
  title: string;
  label: string;
  summary: string;
  steps: string[];
  doNot: string[];
  seekCare: string;
  serviceNote: string;
  sources: Source[];
}

export interface TriageResult {
  severity: TriageSeverity;
  categories: TriageCategory[];
  guidance: EmergencyGuidance | null;
  matchedRuleIds: string[];
}

interface Rule {
  id: string;
  category: TriageCategory;
  severity: 'emergency' | 'urgent';
  test: (text: string) => boolean;
}

const positive = (text: string, pattern: RegExp): boolean => {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const regex = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (!isNegated(text, match.index, match[0].length)) return true;
    if (match.index === regex.lastIndex) regex.lastIndex += 1;
  }
  return false;
};

const anyPositive = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => positive(text, pattern));

const anyRaw = (text: string, patterns: RegExp[]): boolean =>
  patterns.some((pattern) => pattern.test(text));

const eyeContext = (text: string): boolean =>
  anyRaw(text, [/\beye\b/, /\beyes\b/, /\bjicho\b/, /\bmacho\b/, /\bjichoni\b/, /\bmachoni\b/]);

const chemicalSubstance = (text: string): boolean =>
  anyRaw(text, [
    /\bchemical(s)?\b/,
    /\bacid\b/,
    /\bbleach\b/,
    /\bammonia\b/,
    /\blye\b/,
    /\bcaustic\b/,
    /\bdisinfectant\b/,
    /\bcleaning (product|fluid|liquid)s?\b/,
    /\bpaint thinner\b/,
    /\bpetrol\b/,
    /\bpetroleum\b/,
    /\bkemikali\b/,
    /\basidi\b/,
    /\bklorini\b/,
    /\bsoda\b/,
    /\bchokaa\b/,
    /\bdawa ya kusafisha\b/,
    /\bmaji ya moto\b/,
    /\bmafuta ya taa\b/,
  ]);

const injuryWords = (text: string): boolean =>
  anyRaw(text, [
    /\binjur(y|ed|ies)\b/,
    /\btrauma\b/,
    /\bhit\b/,
    /\bpunch(ed)?\b/,
    /\bpoked?\b/,
    /\bscratch(ed)?\b/,
    /\bjeraha\b/,
    /\bkujeruhi\b/,
    /\bkupigwa\b/,
    /\bkugongwa\b/,
    /\bkuchomwa\b/,
  ]);

const redEye = (text: string): boolean =>
  anyPositive(text, [
    /\bred eye(s)?\b/,
    /\bbloodshot\b/,
    /\bpink eye\b/,
    /\bjicho jekundu\b/,
    /\bmacho mekundu\b/,
    /\byamekuwa mekundu\b/,
    /\bvery red\b/,
  ]);

const visionChange = (text: string): boolean =>
  anyPositive(text, [
    /\b(change|changes|changed) (to|in) (my |the )?(vision|sight)\b/,
    /\bblurr?y (vision|sight)\b/,
    /\bvision (is |has )?(blurr?y|blurred|changed|worse)\b/,
    /\bkuona (ukungu|vibaya|kumebadilika)\b/,
    /\bsioni vizuri\b/,
    /\bkuona kumebadilika\b/,
  ]);

const pain = (text: string): boolean =>
  anyPositive(text, [
    /\bpain(ful)?\b/,
    /\bhurts?\b/,
    /\bsore\b/,
    /\bmaumivu\b/,
    /\binauma\b/,
    /\blinauma\b/,
    /\binanuma\b/,
    /\blinanuma\b/,
    /\bchungu\b/,
  ]);

const severePain = (text: string): boolean =>
  anyPositive(text, [
    /\b(severe|intense|extreme|unbearable|agoni[sz]ing|very bad|worst) (eye )?pain\b/,
    /\bpain (is )?(severe|intense|extreme|unbearable|very bad|the worst)\b/,
    /\bmaumivu (makali|makubwa|yasiyovumilika)\b/,
    /\bjicho linauma (sana|mno)\b/,
    /\blinauma (sana|mno)\b/,
    /\bmaumivu ya (sana|mno)\b/,
  ]);

const sudden = (text: string): boolean =>
  anyRaw(text, [
    /\bsudden(ly)?\b/,
    /\ball of a sudden\b/,
    /\bghafla\b/,
    /\bghafla\b/,
    /\bnimeamka (nikiona|nikisikia)\b/,
  ]);

const cannotSee = (text: string): boolean =>
  anyPositive(text, [
    /\b(can ?not|cant|can't) see\b/,
    /\b(cannot|cant|can't) see (anything|from|out of)\b/,
    /\bvision (is )?(gone|lost|black)\b/,
    /\blost (my )?(vision|sight)\b/,
    /\bsuddenly blind\b/,
    /\bsioni (kabisa|kitu|chochote)\b/,
    /\bnimepoteza (kuona|mwanga)\b/,
    /\bkuona kumepotea\b/,
    /\bupofu wa ghafla\b/,
  ]);

const flashesFloaters = (text: string): boolean =>
  anyPositive(text, [
    /\bfloaters?\b/,
    /\bflashes\b/,
    /\bflashing lights?\b/,
    /\b(black |dark )?(shadow|curtain) (across|over|in) (my |the )?(vision|eye)\b/,
    /\bcurtain (across|over) (my |the )?vision\b/,
    /\bmianga\b/,
    /\bmiali ya (nuru|mwanga)\b/,
    /\bvitu vinavyoelea\b/,
    /\bkivuli (kikubwa )?(kwenye|juu ya) (kuona|jicho)\b/,
    /\bpazia (juu ya|kwenye) kuona\b/,
  ]);

const lightSensitivity = (text: string): boolean =>
  anyPositive(text, [
    /\blight sensitivity\b/,
    /\bsensitive to light\b/,
    /\bphotophobia\b/,
    /\bhurts? to look at light\b/,
    /\bnuru (inauma|inaniuma|inawasha)\b/,
    /\bmwangaza (unauma|unaniuma|unawasha)\b/,
    /\bkuwasha (na|kwa) (mwanga|nuru)\b/,
    /\bsiwezi kuvumilia (mwanga|nuru)\b/,
  ]);

const recentOnset = (text: string): boolean =>
  anyRaw(text, [
    /\b(sudden|suddenly|new|today|this morning|last night|since yesterday)\b/,
    /\b(ghafla|leo|jana|asubuhi ya leo|usiku wa jana)\b/,
    /\b(started|start|began) (today|yesterday|suddenly)\b/,
    /\b(imeanza|imeanza|zimeanza) (leo|jana|ghafla)\b/,
  ]);

const increase = (text: string): boolean =>
  anyRaw(text, [
    /\b(sudden|suddenly) (increase|more|many|lots)\b/,
    /\b(more|many|lots of|increased) floaters?\b/,
    /\bfloaters? (increased|are worse|getting worse)\b/,
    /\b(vitu vinavyoelea) (vimeongezeka|vingi)\b/,
    /\bongezeko la (vitu vinavyoelea|mianga)\b/,
  ]);

const contactLensContext = (text: string): boolean =>
  anyRaw(text, [
    /\bcontact lens(es)?\b/,
    /\blens(es)?\b/,
    /\blenzi\b/,
    /\bcontact\b/,
  ]);

const redFlagRules: Rule[] = [
  {
    id: 'chemical-exposure',
    category: 'chemical',
    severity: 'emergency',
    test: (text) => chemicalSubstance(text) && (eyeContext(text) || anyRaw(text, [/\bsplash(ed)?\b/, /\bburn(ed|s)?\b/])),
  },
  {
    id: 'penetrating-injury',
    category: 'penetrating-injury',
    severity: 'emergency',
    test: (text) =>
      (injuryWords(text) || anyRaw(text, [/\bstuck\b/, /\bembedded\b/, /\bpenetrat/])) &&
      eyeContext(text) &&
      anyRaw(text, [
        /\b(stuck|embedded|pierced|penetrat|object|metal|glass|wood|stick|nail|debris)\b/,
        /\b(kitu|chuma|kioo|mti|msumari) (kimeingia|kimechoma|kimechomwa)\b/,
      ]),
  },
  {
    id: 'sudden-vision-loss',
    category: 'sudden-vision-loss',
    severity: 'emergency',
    test: (text) => cannotSee(text) || (sudden(text) && anyPositive(text, [/\bvision loss\b/, /\bsight loss\b/, /\bkuona kumepotea\b/])),
  },
  {
    id: 'severe-eye-pain',
    category: 'severe-pain',
    severity: 'emergency',
    test: (text) => severePain(text) && eyeContext(text),
  },
  {
    id: 'retinal-warning',
    category: 'retinal-warning',
    severity: 'emergency',
    test: (text) =>
      (flashesFloaters(text) &&
        (sudden(text) ||
          increase(text) ||
          recentOnset(text) ||
          anyRaw(text, [/\bcurtain\b/, /\bshadow\b/, /\bkivuli\b/, /\bpazia\b/]))) ||
      anyPositive(text, [/\bcurtain (across|over) (my |the )?vision\b/]),
  },
  {
    id: 'painful-red-eye-vision-change',
    category: 'painful-red-eye-vision-change',
    severity: 'emergency',
    test: (text) => redEye(text) && pain(text) && visionChange(text),
  },
  {
    id: 'acute-glaucoma-pattern',
    category: 'acute-glaucoma-pattern',
    severity: 'emergency',
    test: (text) =>
      eyeContext(text) &&
      (severePain(text) || anyRaw(text, [/\beye pain\b/, /\bmaumivu ya jicho\b/])) &&
      anyRaw(text, [/\b(headache|kichwa)\b/]) &&
      anyRaw(text, [/\b(nausea|vomit|sick|kichefuchefu|kutapika)\b/]),
  },
  {
    id: 'sudden-double-vision-head-injury',
    category: 'sudden-vision-change',
    severity: 'emergency',
    test: (text) =>
      anyRaw(text, [/\bdouble vision\b/, /\bkuona mara mbili\b/]) &&
      sudden(text) &&
      anyRaw(text, [/\bhead (injury|trauma)\b/, /\bkupigwa kichwa\b/, /\bjeraha la kichwa\b/]),
  },
];

const urgentRules: Rule[] = [
  {
    id: 'contact-lens-infection',
    category: 'contact-lens-infection',
    severity: 'urgent',
    test: (text) =>
      contactLensContext(text) &&
      (redEye(text) || pain(text) || lightSensitivity(text) || visionChange(text)),
  },
  {
    id: 'eye-injury',
    category: 'eye-injury',
    severity: 'urgent',
    test: (text) => injuryWords(text) && eyeContext(text),
  },
  {
    id: 'foreign-body',
    category: 'foreign-body',
    severity: 'urgent',
    test: (text) =>
      anyRaw(text, [
        /\bsomething (is )?(in|on) my eye\b/,
        /\b(dust|sand|grit|eyelash|insect|dirt) (in|on) my eye\b/,
        /\bkitu (kiko|kimeingia) jichoni\b/,
        /\bvumbi (kwenye|ndani ya) jicho\b/,
        /\bmchanga (kwenye|ndani ya) jicho\b/,
      ]),
  },
  {
    id: 'painful-red-eye',
    category: 'painful-red-eye-vision-change',
    severity: 'urgent',
    test: (text) => redEye(text) && pain(text),
  },
  {
    id: 'new-flashes',
    category: 'retinal-warning',
    severity: 'urgent',
    test: (text) =>
      anyPositive(text, [/\bflashes\b/, /\bflashing lights?\b/, /\bmianga\b/, /\bmiali ya (nuru|mwanga)\b/]),
  },
  {
    id: 'light-sensitivity-with-pain',
    category: 'light-sensitivity-pain',
    severity: 'urgent',
    test: (text) => lightSensitivity(text) && pain(text),
  },
  {
    id: 'sudden-vision-change',
    category: 'sudden-vision-change',
    severity: 'urgent',
    test: (text) => sudden(text) && visionChange(text) && !cannotSee(text),
  },
  {
    id: 'newborn-red-eye',
    category: 'newborn-red-eye',
    severity: 'urgent',
    test: (text) =>
      anyRaw(text, [/\bnewborn\b/, /\bbaby\b/, /\bmtoto mchanga\b/]) &&
      anyRaw(text, [/\bred eye/, /\bjicho jekundu\b/, /\bmacho mekundu\b/]),
  },
];

const templates: Record<TriageCategory, Record<Lang, GuidanceContent>> = {
  chemical: {
    en: {
      title: 'Rinse your eye now — get emergency help',
      label: 'Chemical exposure',
      summary:
        'A chemical in the eye can cause serious damage within minutes. Rinse first; do not wait for questions or an AI response.',
      steps: [
        'Start rinsing the affected eye immediately with clean, running water. Keep the eyelid open and let the water flow across the eye.',
        'Keep rinsing for at least 15–20 minutes. Remove contact lenses if they come out easily; do not force them.',
        'Call your local emergency number or go to the nearest emergency department while rinsing or immediately afterwards.',
        'If possible, take the chemical container or its name with you so clinicians know what was involved.',
      ],
      doNot: [
        'Do not try to neutralise the chemical with another substance.',
        'Do not rub the eye or use eye drops unless emergency staff tell you to.',
        'Do not delay rinsing to look for more information online.',
      ],
      seekCare:
        'This is an emergency. Continue rinsing until emergency staff take over, or until you reach care.',
    },
    sw: {
      title: 'Safisha jicho sasa — tafuta msaada wa dharura',
      label: 'Kemikali jichoni',
      summary:
        'Kemikali iliyoingia jichoni inaweza kusababisha madhara makubwa ndani ya dakika chache. Safisha kwanza; usisubiri maswali au jibu la AI.',
      steps: [
        'Anza kusafisha jicho lililoathirika mara moja kwa maji safi yanayotiririka. Fungua kope na acha maji yapite juu ya jicho.',
        'Endelea kusafisha kwa angalau dakika 15–20. Toa lenzi za mawasiliano ikiwa zinatoka kwa urahisi; usizilazimishe.',
        'Piga simu huduma ya dharura ya eneo lako au nenda moja kwa moja kwenye hospitali ya dharura wakati au mara baada ya kusafisha.',
        'Ikiwezekana, chukua chupa au jina la kemikali ili madaktari wajue ilikuwa nini.',
      ],
      doNot: [
        'Usijaribu kupunguza kemikali kwa dutu nyingine.',
        'Usisugue jicho wala usiweke matone ya macho bila maelekezo ya wataalamu wa dharura.',
        'Usicheleweshe kusafisha kwa kutafuta taarifa zaidi mtandaoni.',
      ],
      seekCare:
        'Hii ni dharura. Endelea kusafisha hadi wataalamu wachukue nafasi, au hadi ufike kwa huduma.',
    },
  },
  'penetrating-injury': {
    en: {
      title: 'Protect the eye and go to emergency care',
      label: 'Serious eye injury',
      summary:
        'A penetrating eye injury needs emergency assessment. Do not try to remove an object or press on the eye.',
      steps: [
        'Do not rub the eye or try to pull out anything that is stuck.',
        'Cover the eye lightly with a clean shield, cup, or sterile pad that does not press on the eye.',
        'Go to the nearest emergency department immediately. Ask someone else to drive if possible.',
        'Do not eat or drink in case surgery is needed, unless staff tell you otherwise.',
      ],
      doNot: [
        'Do not wash out an embedded object or apply pressure.',
        'Do not use eye drops or ointments unless emergency staff advise it.',
        'Do not delay care to wait for improvement.',
      ],
      seekCare: 'Go to emergency care now. Keep the eye protected while travelling.',
    },
    sw: {
      title: 'Linda jicho na nenda huduma ya dharura',
      label: 'Jeraha kubwa la jicho',
      summary:
        'Jeraha la jicho lililopenya linahitaji uchunguzi wa dharura. Usijaribu kutoa kitu wala kukandamiza jicho.',
      steps: [
        'Usisugue jicho wala usijaribu kuvuta kitu kilichokwama.',
        'Funika jicho kwa kifuniko safi, kikombe, au padi isiyokandamiza jicho.',
        'Nenda moja kwa moja kwenye hospitali ya dharura iliyo karibu. Omba mtu mwingine aendeshe ikiwezekana.',
        'Usile wala kunywa kwa sababu upasuaji unaweza kuhitajika, isipokuwa wataalamu wakuelekeze vinginevyo.',
      ],
      doNot: [
        'Usisafishe kitu kilichokwama wala usikandamize jicho.',
        'Usiweke matone au mafuta ya macho bila maelekezo ya wataalamu wa dharura.',
        'Usicheleweshe huduma kwa kusubiri ipone yenyewe.',
      ],
      seekCare: 'Nenda huduma ya dharura sasa. Linde jicho wakati wa safari.',
    },
  },
  'sudden-vision-loss': {
    en: {
      title: 'Sudden vision loss needs emergency care',
      label: 'Sudden vision change',
      summary:
        'A sudden loss or major reduction of vision can be a sight-threatening emergency. Do not wait to see whether it improves.',
      steps: [
        'Go to the nearest emergency department or eye emergency service now.',
        'Ask someone else to drive you; do not drive yourself if your vision is affected.',
        'Note the exact time symptoms started — this may help clinicians.',
        'If you have diabetes, a recent eye injury, or eye surgery, tell the clinical team.',
      ],
      doNot: [
        'Do not wait for a routine appointment or an online answer.',
        'Do not rub the eye or use unprescribed drops.',
        'Do not assume it is only tiredness or a migraine.',
      ],
      seekCare:
        'Call your local emergency number or go to emergency care immediately. This guidance cannot rule out a serious cause.',
    },
    sw: {
      title: 'Kupoteza kuona ghafla kunahitaji huduma ya dharura',
      label: 'Mabadiliko ya ghafla ya kuona',
      summary:
        'Kupoteza au kupungua sana kwa kuona ghafla kunaweza kuwa dharura inayotishia uwezo wa kuona. Usisubiri kuona kama kutapona.',
      steps: [
        'Nenda moja kwa moja kwenye hospitali ya dharura au huduma ya dharura ya macho iliyo karibu.',
        'Omba mtu mwingine aendeshe; usiendeshe mwenyewe ikiwa kuona kwako kumeathirika.',
        'Kumbuka muda halisi dalili zilipoanza — hii inaweza kuwasaidia wataalamu.',
        'Ikiwa una kisukari, jeraha la jicho la hivi karibuni, au upasuaji wa jicho, waambie wataalamu.',
      ],
      doNot: [
        'Usisubiri miadi ya kawaida au jibu la mtandaoni.',
        'Usisugue jicho wala kutumia matone yasiyoagizwa.',
        'Usidhani ni uchovu au kichwa kinachouma tu.',
      ],
      seekCare:
        'Piga simu huduma ya dharura ya eneo lako au nenda huduma ya dharura mara moja. Mwongozo huu hauwezi kuondoa sababu kubwa.',
    },
  },
  'severe-pain': {
    en: {
      title: 'Severe eye pain needs urgent assessment',
      label: 'Severe eye pain',
      summary:
        'Severe eye pain can have serious causes. Seek urgent professional eye care now rather than waiting for an AI response.',
      steps: [
        'Contact your local urgent care service, eye clinic, or emergency department now.',
        'Do not drive yourself if pain or vision changes make it unsafe.',
        'If you wear contact lenses, remove them if you can do so easily and bring the lens or case with you.',
        'Note any vision change, light sensitivity, headache, nausea, or injury and tell the clinician.',
      ],
      doNot: [
        'Do not use someone else’s eye drops or leftover prescription medicine.',
        'Do not rub or press the eye.',
        'Do not wait to see whether the pain settles on its own.',
      ],
      seekCare:
        'Seek urgent professional eye care or emergency care. Severe pain with vision changes needs immediate assessment.',
    },
    sw: {
      title: 'Maumivu makali ya jicho yanahitaji uchunguzi wa haraka',
      label: 'Maumivu makali ya jicho',
      summary:
        'Maumivu makali ya jicho yanaweza kuwa na sababu kubwa. Tafuta huduma ya macho ya haraka sasa badala ya kusubiri jibu la AI.',
      steps: [
        'Wasiliana na huduma ya dharura ya eneo lako, kliniki ya macho, au hospitali ya dharura sasa.',
        'Usiendeshe mwenyewe ikiwa maumivu au mabadiliko ya kuona hayafanyi iwe salama.',
        'Ikiwa umevaa lenzi za mawasiliano, ziondoe ikiwa zinatoka kwa urahisi na chukua lenzi au kasha lake.',
        'Kumbuka mabadiliko yoyote ya kuona, mwanga kuwasha, kichwa kuuma, kichefuchefu, au jeraha na uwaeleze wataalamu.',
      ],
      doNot: [
        'Usitumie matone ya macho ya mtu mwingine au dawa za zamani zilizoagizwa.',
        'Usisugue wala usikandamize jicho.',
        'Usisubiri kuona kama maumivu yatapungua yenyewe.',
      ],
      seekCare:
        'Tafuta huduma ya macho ya haraka au huduma ya dharura. Maumivu makali pamoja na mabadiliko ya kuona yanahitaji uchunguzi wa haraka.',
    },
  },
  'retinal-warning': {
    en: {
      title: 'New flashes, floaters or a shadow need urgent care',
      label: 'Possible retinal warning',
      summary:
        'Sudden flashes, a sudden increase in floaters, or a dark shadow or curtain across vision can be signs of a retinal problem. Get an urgent eye assessment.',
      steps: [
        'Contact an eye emergency service, optometrist, or hospital eye clinic now for an urgent assessment.',
        'Do not wait for a routine appointment if symptoms started suddenly or are getting worse.',
        'Avoid driving yourself if your vision is affected.',
        'Note when the symptoms started and whether they affect one or both eyes.',
      ],
      doNot: [
        'Do not assume new floaters are harmless.',
        'Do not rub or press the eye.',
        'Do not delay because there is no pain — retinal problems can be painless.',
      ],
      seekCare:
        'Go to urgent eye care today. A shadow or curtain across vision needs immediate assessment.',
    },
    sw: {
      title: 'Mianga, vitu vinavyoelea au kivuli vinahitaji huduma ya haraka',
      label: 'Dalili ya tatizo la retina',
      summary:
        'Mianga ya ghafla, kuongezeka kwa vitu vinavyoelea, au kivuli au pazia juu ya kuona vinaweza kuwa dalili za tatizo la retina. Pata uchunguzi wa macho wa haraka.',
      steps: [
        'Wasiliana na huduma ya dharura ya macho, daktari wa macho, au kliniki ya macho ya hospitali sasa kwa uchunguzi wa haraka.',
        'Usisubiri miadi ya kawaida ikiwa dalili zimeanza ghafla au zinazidi kuwa mbaya.',
        'Usiendeshe mwenyewe ikiwa kuona kwako kumeathirika.',
        'Kumbuka dalili zilipoanza na kama zinaathiri jicho moja au yote mawili.',
      ],
      doNot: [
        'Usidhani vitu vipya vinavyoelea ni salama bila uchunguzi.',
        'Usisugue wala usikandamize jicho.',
        'Usicheleweshe kwa sababu hakuna maumivu — matatizo ya retina yanaweza kuwa bila maumivu.',
      ],
      seekCare:
        'Nenda huduma ya macho ya haraka leo. Kivuli au pazia juu ya kuona linahitaji uchunguzi wa haraka.',
    },
  },
  'painful-red-eye-vision-change': {
    en: {
      title: 'Painful red eye with vision changes needs urgent care',
      label: 'Painful red eye',
      summary:
        'A painful red eye with a change in vision needs prompt professional assessment. It can be more than simple conjunctivitis.',
      steps: [
        'Seek urgent eye care today — contact an eye clinic, optometrist, or urgent care service.',
        'Remove contact lenses if you wear them and bring them with you.',
        'Do not drive if your vision is affected.',
        'Tell the clinician about pain, light sensitivity, discharge, and when symptoms started.',
      ],
      doNot: [
        'Do not use antibiotic or steroid eye drops without a clinician’s advice.',
        'Do not rub the eye or share towels or eye make-up.',
        'Do not wait for a routine appointment if vision is changing.',
      ],
      seekCare: 'Seek urgent professional eye care now.',
    },
    sw: {
      title: 'Jicho jekundu lenye maumivu na mabadiliko ya kuona linahitaji huduma ya haraka',
      label: 'Jicho jekundu lenye maumivu',
      summary:
        'Jicho jekundu lenye maumivu na mabadiliko ya kuona linahitaji uchunguzi wa kitaalamu wa haraka. Linaweza kuwa zaidi ya conjunctivitis ya kawaida.',
      steps: [
        'Tafuta huduma ya macho ya haraka leo — wasiliana na kliniki ya macho, daktari wa macho, au huduma ya dharura.',
        'Toa lenzi za mawasiliano ikiwa unazivaa na uzichukue pamoja nawe.',
        'Usiendeshe ikiwa kuona kwako kumeathirika.',
        'Mwambie daktari kuhusu maumivu, mwanga kuwasha, majimaji, na dalili zilipoanza.',
      ],
      doNot: [
        'Usitumie matone ya antibiotic au steroid bila ushauri wa daktari.',
        'Usisugue jicho wala kushiriki taulo au vipodozi vya macho.',
        'Usisubiri miadi ya kawaida ikiwa kuona kunabadilika.',
      ],
      seekCare: 'Tafuta huduma ya macho ya kitaalamu ya haraka sasa.',
    },
  },
  'acute-glaucoma-pattern': {
    en: {
      title: 'Severe eye pain with headache and nausea needs emergency care',
      label: 'Possible acute eye pressure problem',
      summary:
        'Severe eye pain with headache, nausea, vomiting, blurred vision, or halos around lights can be an emergency. Seek care immediately.',
      steps: [
        'Go to the nearest emergency department or eye emergency service now.',
        'Do not drive yourself if you feel unwell or your vision is affected.',
        'Tell staff about eye pain, headache, nausea, and any change in vision.',
        'Bring a list of medicines and note the time symptoms started.',
      ],
      doNot: [
        'Do not wait for the pain to pass.',
        'Do not use unprescribed eye drops.',
        'Do not delay care to look for an online diagnosis.',
      ],
      seekCare: 'This pattern needs immediate emergency assessment.',
    },
    sw: {
      title: 'Maumivu makali ya jicho na kichwa kuuma pamoja na kichefuchefu yanahitaji dharura',
      label: 'Tatizo la shinikizo la jicho',
      summary:
        'Maumivu makali ya jicho pamoja na kichwa kuuma, kichefuchefu, kutapika, kuona ukungu, au miali ya nuru kuzunguka taa yanaweza kuwa dharura. Tafuta huduma mara moja.',
      steps: [
        'Nenda moja kwa moja kwenye hospitali ya dharura au huduma ya dharura ya macho iliyo karibu.',
        'Usiendeshe mwenyewe ikiwa hujisikii vizuri au kuona kwako kumeathirika.',
        'Waeleze wataalamu kuhusu maumivu ya jicho, kichwa kuuma, kichefuchefu, na mabadiliko yoyote ya kuona.',
        'Chukua orodha ya dawa na kumbuka muda dalili zilipoanza.',
      ],
      doNot: [
        'Usisubiri maumivu yapite.',
        'Usitumie matone ya macho yasiyoagizwa.',
        'Usicheleweshe huduma kwa kutafuta utambuzi mtandaoni.',
      ],
      seekCare: 'Dalili hizi zinahitaji uchunguzi wa dharura mara moja.',
    },
  },
  'contact-lens-infection': {
    en: {
      title: 'Remove contact lenses and seek urgent eye care',
      label: 'Contact lens warning',
      summary:
        'Redness, pain, light sensitivity, or vision change while wearing contact lenses can be an eye infection. Get urgent advice today.',
      steps: [
        'Remove the contact lenses now if you can do so safely.',
        'Keep the lenses and case; take them with you to the appointment.',
        'Contact an eye clinic, optometrist, or urgent care service today.',
        'Use glasses until a clinician says it is safe to wear lenses again.',
      ],
      doNot: [
        'Do not sleep in the lenses or wear them again before assessment.',
        'Do not rinse lenses or the case with tap water.',
        'Do not use leftover antibiotic drops or someone else’s drops.',
      ],
      seekCare:
        'Contact lens-related eye infection can worsen quickly. Seek urgent professional advice.',
    },
    sw: {
      title: 'Toa lenzi za mawasiliano na tafuta huduma ya haraka',
      label: 'Tahadhari ya lenzi',
      summary:
        'Uwekundu, maumivu, mwanga kuwasha, au mabadiliko ya kuona wakati umevaa lenzi za mawasiliano vinaweza kuwa maambukizi ya jicho. Pata ushauri wa haraka leo.',
      steps: [
        'Toa lenzi za mawasiliano sasa ikiwa unaweza kufanya hivyo kwa usalama.',
        'Hifadhi lenzi na kasha lake; chukua pamoja nawe kwenye miadi.',
        'Wasiliana na kliniki ya macho, daktari wa macho, au huduma ya haraka leo.',
        'Tumia miwani hadi daktari aseme ni salama kutumia lenzi tena.',
      ],
      doNot: [
        'Usilale na lenzi wala usizivaa tena kabla ya uchunguzi.',
        'Usioshe lenzi au kasha kwa maji ya bomba.',
        'Usitumie matone ya antibiotic yaliyobaki au ya mtu mwingine.',
      ],
      seekCare:
        'Maambukizi ya jicho yanayohusiana na lenzi yanaweza kuwa mabaya haraka. Tafuta ushauri wa kitaalamu wa haraka.',
    },
  },
  'eye-injury': {
    en: {
      title: 'Eye injury: protect the eye and get urgent advice',
      label: 'Eye injury',
      summary:
        'An eye injury should be assessed promptly, especially if there is pain, vision change, bleeding, or something stuck in the eye.',
      steps: [
        'Stop the activity and avoid touching or rubbing the eye.',
        'For a minor surface injury, gentle rinsing with clean water may help. For a chemical, rinse for at least 15–20 minutes and seek emergency care.',
        'Seek urgent eye care today if pain, vision change, or redness persists.',
        'For a blow to the eye, use a cold pack gently around — not directly on — the eye if it is closed and not painful.',
      ],
      doNot: [
        'Do not try to remove an embedded object.',
        'Do not press on the eye.',
        'Do not use unprescribed drops or traditional eye remedies.',
      ],
      seekCare:
        'Seek urgent assessment for significant pain, vision change, or any penetrating injury.',
    },
    sw: {
      title: 'Jeraha la jicho: linda jicho na pata ushauri wa haraka',
      label: 'Jeraha la jicho',
      summary:
        'Jeraha la jicho linapaswa kuangaliwa haraka, hasa ikiwa kuna maumivu, mabadiliko ya kuona, damu, au kitu kilichokwama jichoni.',
      steps: [
        'Acha shughuli na usigusa wala kusugua jicho.',
        'Kwa jeraha dogo la uso, kusafisha kwa upole kwa maji safi kunaweza kusaidia. Kwa kemikali, safisha kwa angalau dakika 15–20 na tafuta huduma ya dharura.',
        'Tafuta huduma ya macho ya haraka leo ikiwa maumivu, mabadiliko ya kuona, au uwekundu unaendelea.',
        'Kwa kugongwa jichoni, tumia kifuniko cha baridi kwa upole kuzunguka — sio moja kwa moja juu ya — jicho ikiwa limefungwa na hakuna maumivu makali.',
      ],
      doNot: [
        'Usijaribu kutoa kitu kilichokwama.',
        'Usikandamize jicho.',
        'Usitumie matone yasiyoagizwa au dawa za jadi za macho.',
      ],
      seekCare:
        'Tafuta uchunguzi wa haraka kwa maumivu makubwa, mabadiliko ya kuona, au jeraha lolote lililopenya.',
    },
  },
  'foreign-body': {
    en: {
      title: 'Something in the eye needs careful handling',
      label: 'Foreign body in the eye',
      summary:
        'Do not rub the eye. If something is stuck or embedded, do not try to remove it yourself — go to urgent care.',
      steps: [
        'Try blinking a few times or gently rinsing with clean water if the object is loose.',
        'If it remains, cover the eye lightly and seek urgent eye care.',
        'If the object is glass, metal, or was travelling at speed, go to emergency care.',
        'If you wear contact lenses, remove them if easy and bring them with you.',
      ],
      doNot: [
        'Do not rub the eye or use tweezers.',
        'Do not try to remove anything embedded in the eye.',
        'Do not ignore pain or vision change after the object is gone.',
      ],
      seekCare: 'Seek urgent eye care if the object remains, or if pain or vision change persists.',
    },
    sw: {
      title: 'Kitu jichoni kinahitaji uangalifu',
      label: 'Kitu kigeni jichoni',
      summary:
        'Usisugue jicho. Ikiwa kitu kimekwama au kimeingia ndani, usijaribu kukitoa mwenyewe — nenda huduma ya haraka.',
      steps: [
        'Jaribu kufumba na kufumbua mara chache au kusafisha kwa upole kwa maji safi ikiwa kitu kiko juu.',
        'Ikiwa kimebaki, funika jicho kwa upole na tafuta huduma ya macho ya haraka.',
        'Ikiwa kitu ni kioo, chuma, au kilikuja kwa kasi, nenda huduma ya dharura.',
        'Ikiwa umevaa lenzi za mawasiliano, ziondoe ikiwa ni rahisi na uzichukue pamoja nawe.',
      ],
      doNot: [
        'Usisugue jicho wala kutumia koleo.',
        'Usijaribu kutoa kitu kilichoingia ndani ya jicho.',
        'Usipuuze maumivu au mabadiliko ya kuona baada ya kitu kuondoka.',
      ],
      seekCare:
        'Tafuta huduma ya macho ya haraka ikiwa kitu kimebaki, au ikiwa maumivu au mabadiliko ya kuona yanaendelea.',
    },
  },
  'light-sensitivity-pain': {
    en: {
      title: 'Eye pain with light sensitivity needs urgent advice',
      label: 'Pain and light sensitivity',
      summary:
        'Pain when looking at light, especially with a red eye or vision change, needs prompt professional assessment.',
      steps: [
        'Seek urgent eye care today.',
        'Remove contact lenses if you wear them.',
        'Rest your eyes and avoid bright light while arranging care.',
        'Tell the clinician about pain, redness, discharge, and vision changes.',
      ],
      doNot: [
        'Do not use unprescribed eye drops.',
        'Do not rub the eye.',
        'Do not wait if your vision is changing.',
      ],
      seekCare: 'Seek urgent professional eye care today.',
    },
    sw: {
      title: 'Maumivu ya jicho na mwanga kuwasha yanahitaji ushauri wa haraka',
      label: 'Maumivu na mwanga kuwasha',
      summary:
        'Maumivu wakati wa kuangalia mwanga, hasa pamoja na jicho jekundu au mabadiliko ya kuona, yanahitaji uchunguzi wa kitaalamu wa haraka.',
      steps: [
        'Tafuta huduma ya macho ya haraka leo.',
        'Toa lenzi za mawasiliano ikiwa unazivaa.',
        'Pumzisha macho na epuka mwanga mkali wakati unapanga huduma.',
        'Mwambie daktari kuhusu maumivu, uwekundu, majimaji, na mabadiliko ya kuona.',
      ],
      doNot: [
        'Usitumie matone ya macho yasiyoagizwa.',
        'Usisugue jicho.',
        'Usisubiri ikiwa kuona kwako kunabadilika.',
      ],
      seekCare: 'Tafuta huduma ya macho ya kitaalamu ya haraka leo.',
    },
  },
  'sudden-vision-change': {
    en: {
      title: 'A sudden change in vision needs urgent assessment',
      label: 'Sudden vision change',
      summary:
        'New or sudden blurred vision, double vision, or other visual changes should be assessed urgently, especially after a head injury.',
      steps: [
        'Contact an eye clinic, optometrist, or urgent care service today.',
        'Do not drive if your vision is affected.',
        'If this followed a head injury, go to emergency care.',
        'Note whether one or both eyes are affected and when it started.',
      ],
      doNot: [
        'Do not assume it is only eye strain.',
        'Do not wait for a routine appointment if the change is sudden.',
        'Do not use unprescribed drops.',
      ],
      seekCare: 'Sudden vision changes need same-day professional assessment.',
    },
    sw: {
      title: 'Mabadiliko ya ghafla ya kuona yanahitaji uchunguzi wa haraka',
      label: 'Mabadiliko ya ghafla ya kuona',
      summary:
        'Kuona ukungu kwa ghafla, kuona mara mbili, au mabadiliko mengine ya kuona yanapaswa kuangaliwa haraka, hasa baada ya jeraha la kichwa.',
      steps: [
        'Wasiliana na kliniki ya macho, daktari wa macho, au huduma ya haraka leo.',
        'Usiendeshe ikiwa kuona kwako kumeathirika.',
        'Ikiwa hii ilifuata jeraha la kichwa, nenda huduma ya dharura.',
        'Kumbuka kama jicho moja au yote mawili yameathirika na ilipoanza.',
      ],
      doNot: [
        'Usidhani ni uchovu wa macho tu.',
        'Usisubiri miadi ya kawaida ikiwa mabadiliko ni ya ghafla.',
        'Usitumie matone yasiyoagizwa.',
      ],
      seekCare: 'Mabadiliko ya ghafla ya kuona yanahitaji uchunguzi wa kitaalamu siku hiyo hiyo.',
    },
  },
  'newborn-red-eye': {
    en: {
      title: 'A newborn with red eyes needs urgent medical advice',
      label: 'Red eyes in a newborn',
      summary:
        'Red eyes in a newborn or very young baby can be serious. Contact a healthcare professional urgently.',
      steps: [
        'Contact your local urgent care service, paediatric service, or emergency department now.',
        'Do not put any drops in the baby’s eyes unless prescribed.',
        'Keep the baby away from other people’s eye make-up, towels, or hands that may be contaminated.',
        'Note any discharge, swelling, fever, or feeding changes.',
      ],
      doNot: [
        'Do not wait for a routine appointment.',
        'Do not use adult eye drops.',
        'Do not try to treat it with traditional remedies.',
      ],
      seekCare: 'Seek urgent medical advice for a newborn with red eyes.',
    },
    sw: {
      title: 'Mtoto mchanga mwenye macho mekundu anahitaji ushauri wa haraka',
      label: 'Macho mekundu kwa mtoto mchanga',
      summary:
        'Macho mekundu kwa mtoto mchanga au mtoto mdogo sana yanaweza kuwa makubwa. Wasiliana na mtaalamu wa afya haraka.',
      steps: [
        'Wasiliana na huduma ya dharura ya eneo lako, huduma ya watoto, au hospitali ya dharura sasa.',
        'Usiweke matone yoyote kwenye macho ya mtoto bila kuagizwa.',
        'Mweke mtoto mbali na vipodozi vya macho vya watu wengine, taulo, au mikono inayoweza kuwa na uchafu.',
        'Kumbuka majimaji, uvimbe, homa, au mabadiliko ya kunyonya.',
      ],
      doNot: [
        'Usisubiri miadi ya kawaida.',
        'Usitumie matone ya macho ya watu wazima.',
        'Usijaribu kutibu kwa dawa za jadi.',
      ],
      seekCare: 'Tafuta ushauri wa haraka wa matibabu kwa mtoto mchanga mwenye macho mekundu.',
    },
  },
};

const sourceMap: Record<TriageCategory, string[]> = {
  chemical: ['nhs-eye-injuries', 'nhs-red-eye'],
  'penetrating-injury': ['nhs-eye-injuries', 'nhs-vision-loss'],
  'sudden-vision-loss': ['nhs-vision-loss', 'nhs-eye-pain'],
  'severe-pain': ['nhs-eye-pain', 'nhs-vision-loss', 'nhs-red-eye'],
  'retinal-warning': ['moorfields-flashes-floaters', 'nhs-vision-loss'],
  'painful-red-eye-vision-change': ['nhs-red-eye', 'nhs-eye-pain', 'nhs-vision-loss'],
  'acute-glaucoma-pattern': ['nhs-glaucoma', 'nhs-eye-pain', 'nhs-vision-loss'],
  'contact-lens-infection': ['moorfields-contact-lens', 'nhs-red-eye', 'nhs-eye-pain'],
  'eye-injury': ['nhs-eye-injuries', 'nhs-red-eye'],
  'foreign-body': ['nhs-eye-injuries', 'nhs-red-eye'],
  'light-sensitivity-pain': ['nhs-eye-pain', 'nhs-red-eye'],
  'sudden-vision-change': ['nhs-vision-loss', 'nhs-eye-pain'],
  'newborn-red-eye': ['nhs-red-eye', 'nhs-conjunctivitis'],
};

const serviceNotes = {
  emergency: {
    en: 'Call your local emergency number or go to the nearest emergency department. Ask someone else to drive if possible. Do not wait for an online reply.',
    sw: 'Piga simu huduma ya dharura ya eneo lako au nenda moja kwa moja kwenye hospitali ya dharura iliyo karibu. Omba mtu mwingine aendeshe ikiwezekana. Usisubiri jibu la mtandaoni.',
  },
  urgent: {
    en: 'Contact an eye clinic, optometrist, or urgent care service today. If symptoms become severe or your vision suddenly changes, use emergency care.',
    sw: 'Wasiliana na kliniki ya macho, daktari wa macho, au huduma ya haraka leo. Ikiwa dalili zinakuwa mbaya au kuona kunabadilika ghafla, tumia huduma ya dharura.',
  },
} as const;

/**
 * Deterministic safety triage. Runs before any model call. Emergency rules take
 * precedence over urgent rules. If both types match, the highest severity wins.
 */
function isEducationalHypothetical(text: string): boolean {
  const questionStart = /^(what|how|can|could|should|is|are|do|does|nifanye|ninawezaje|je)\b/.test(text);
  const conditional = /\b(if|ikiwa|kama)\b/.test(text);
  const actualSymptomReport = /\b(i have|i got|i feel|i am having|nina|nimepata|nimeanza|naumwa)\b/.test(text);
  return questionStart && conditional && !actualSymptomReport;
}

export function triageSymptoms(input: string, lang: Lang): TriageResult {
  const text = normalizeText(input);
  if (!text) {
    return { severity: 'none', categories: [], guidance: null, matchedRuleIds: [] };
  }

  // Explicit educational hypotheticals ("What should I do if acid gets in my
  // eye?") are answered with first-aid content, not treated as a live exposure.
  if (isEducationalHypothetical(text)) {
    return { severity: 'none', categories: [], guidance: null, matchedRuleIds: [] };
  }

  // Fuzzy reinforcement for common spelling mistakes in critical terms.
  const fuzzyVisionLoss =
    (hasFuzzyToken(text, 'vision', 1) || hasFuzzyToken(text, 'sight', 1)) &&
    (hasFuzzyToken(text, 'lost', 1) || hasFuzzyToken(text, 'loss', 1) || hasFuzzyToken(text, 'suddenly', 2));
  const fuzzySeverePain =
    (hasFuzzyToken(text, 'severe', 1) || hasFuzzyToken(text, 'extreme', 1)) &&
    hasFuzzyToken(text, 'pain', 1);
  const fuzzyChemical =
    (hasFuzzyToken(text, 'chemical', 2) || hasFuzzyToken(text, 'kemikali', 2) || hasFuzzyToken(text, 'asidi', 1)) &&
    (eyeContext(text) || anyRaw(text, [/\beye\b/, /\bmacho\b/]));

  const matchedEmergency = redFlagRules.filter((rule) => rule.test(text));
  if (matchedEmergency.length > 0) {
    return buildResult(matchedEmergency, 'emergency', lang);
  }

  if (fuzzyVisionLoss) {
    return buildResult(
      [{ id: 'sudden-vision-loss-fuzzy', category: 'sudden-vision-loss', severity: 'emergency', test: () => true }],
      'emergency',
      lang,
    );
  }
  if (fuzzySeverePain) {
    return buildResult(
      [{ id: 'severe-eye-pain-fuzzy', category: 'severe-pain', severity: 'emergency', test: () => true }],
      'emergency',
      lang,
    );
  }
  if (fuzzyChemical) {
    return buildResult(
      [{ id: 'chemical-exposure-fuzzy', category: 'chemical', severity: 'emergency', test: () => true }],
      'emergency',
      lang,
    );
  }

  const matchedUrgent = urgentRules.filter((rule) => rule.test(text));
  if (matchedUrgent.length > 0) {
    return buildResult(matchedUrgent, 'urgent', lang);
  }

  return { severity: 'none', categories: [], guidance: null, matchedRuleIds: [] };
}

function buildResult(
  matched: Rule[],
  severity: 'emergency' | 'urgent',
  lang: Lang,
): TriageResult {
  const primary = matched[0]!;
  const content = templates[primary.category][lang];
  const sourceIds = [...new Set(matched.flatMap((rule) => sourceMap[rule.category]))];
  const guidance: EmergencyGuidance = {
    severity,
    category: primary.category,
    title: content.title,
    label: content.label,
    summary: content.summary,
    steps: content.steps,
    doNot: content.doNot,
    seekCare: content.seekCare,
    serviceNote: serviceNotes[severity][lang],
    sources: getSources(sourceIds),
  };

  return {
    severity,
    categories: matched.map((rule) => rule.category),
    guidance,
    matchedRuleIds: matched.map((rule) => rule.id),
  };
}

/** Exposed for unit tests and the source-review script. */
export const triageRuleIds = {
  emergency: redFlagRules.map((rule) => rule.id),
  urgent: urgentRules.map((rule) => rule.id),
};
