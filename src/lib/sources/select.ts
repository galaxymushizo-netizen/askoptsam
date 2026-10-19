import { sources, type Source, type SourceTopic } from './registry';
import { normalizeText } from '../text/normalize';

const topicKeywords: Record<SourceTopic, string[]> = {
  general: ['eye', 'eyes', 'vision', 'macho', 'jicho', 'kuona', 'eye health', 'afya ya macho'],
  'red-eye': ['red eye', 'red eyes', 'pink eye', 'bloodshot', 'jicho jekundu', 'macho mekundu', 'redness', 'wekundu'],
  itch: ['itchy', 'itching', 'itch', 'yanawasha', 'inawasha', 'kuwasha', 'mchomo', 'inauma kuwasha'],
  'dry-eye': ['dry eye', 'dry eyes', 'gritty', 'dryness', 'macho kavu', 'ukavu', 'jicho kavu'],
  allergy: ['allergy', 'allergic', 'pollen', 'hay fever', 'mzio', 'aleji', 'vumbi', 'dust'],
  'blurred-vision': ['blur', 'blurry', 'blurred', 'cloudy', 'kuona ukungu', 'ukungu', 'hazy', 'mfuto', 'kuona vibaya'],
  'vision-loss': ['vision loss', 'lost vision', 'cannot see', 'can not see', 'cant see', 'blind', 'sight loss', 'kupoteza kuona', 'sioni', 'kuona kumepotea', 'upofu'],
  pain: ['pain', 'painful', 'hurts', 'hurt', 'sore', 'maumivu', 'uma', 'inuma', 'chungu'],
  'light-sensitivity': ['light sensitivity', 'sensitive to light', 'photophobia', 'glare', 'mwangaza', 'nuru', 'kuwasha na mwanga'],
  injury: ['injury', 'injured', 'trauma', 'hit in the eye', 'poked', 'jeraha', 'kujeruhi', 'kupigwa', 'kuchomwa'],
  chemical: ['chemical', 'acid', 'bleach', 'ammonia', 'lye', 'kemikali', 'asidi', 'klorini', 'soda', 'maji ya moto', 'petrol'],
  'flashes-floaters': ['flashes', 'flashing', 'floaters', 'curtain', 'shadow', 'mianga', 'vitu vinavyoelea', 'kivuli', 'pazia'],
  'contact-lens': ['contact lens', 'contact lenses', 'lens', 'lenzi', 'lenses', 'contact'],
  children: ['child', 'children', 'baby', 'kid', 'mtoto', 'watoto', 'mwanangu', 'infant'],
  diabetes: ['diabetes', 'diabetic', 'sugar', 'blood sugar', 'kisukari', 'sukari', 'diabetesi'],
  glaucoma: ['glaucoma', 'eye pressure', 'glaukom', 'shinikizo la jicho'],
  cataract: ['cataract', 'cataracts', 'cloudy lens', 'katarakti', 'kataract'],
  refractive: ['glasses', 'spectacles', 'short sighted', 'long sighted', 'myopia', 'hyperopia', 'astigmatism', 'miwani', 'refractive', 'prescription'],
  screen: ['screen', 'phone', 'computer', 'laptop', 'tablet', 'digital eye strain', 'skrini', 'simu', 'kompyuta', 'muda mrefu'],
  checkup: ['eye test', 'eye exam', 'checkup', 'check up', 'screening', 'optometrist', 'ophthalmologist', 'daktari wa macho', 'uchunguzi wa macho'],
};

const emergencyTopics = new Set<SourceTopic>([
  'vision-loss',
  'pain',
  'injury',
  'chemical',
  'flashes-floaters',
  'red-eye',
  'light-sensitivity',
]);

const topicScoreBoost: Partial<Record<SourceTopic, number>> = {
  'vision-loss': 5,
  chemical: 6,
  injury: 5,
  pain: 3,
  'flashes-floaters': 5,
  'contact-lens': 4,
  diabetes: 4,
  children: 3,
  glaucoma: 3,
  cataract: 3,
  'red-eye': 2,
  'dry-eye': 2,
  allergy: 2,
  'blurred-vision': 2,
  'light-sensitivity': 2,
};

export interface SelectedSources {
  list: Source[];
  topics: SourceTopic[];
}

/**
 * Deterministic, keyword-based source selection. If nothing matches, returns a
 * small general set. No model is involved, so this is cheap and testable.
 */
export function selectSources(query: string, limit = 5): SelectedSources {
  const text = normalizeText(query);
  const topicHits = new Map<SourceTopic, number>();

  for (const [topic, keywords] of Object.entries(topicKeywords) as Array<
    [SourceTopic, string[]]
  >) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        topicHits.set(topic, (topicHits.get(topic) ?? 0) + (topicScoreBoost[topic] ?? 1));
      }
    }
  }

  const activeTopics = [...topicHits.keys()];

  // With no topic signal, return the curated general set rather than letting
  // the unconditional tie-break boosts select an arbitrary pair of sources.
  if (activeTopics.length === 0) {
    const fallbackIds = ['who-blindness', 'nhs-red-eye', 'nhs-vision-loss', 'aao-eye-exam'];
    return {
      list: sources.filter((source) => fallbackIds.includes(source.id)).slice(0, limit),
      topics: ['general'],
    };
  }

  const scored = sources
    .map((source) => {
      let score = 0;
      for (const topic of source.topics) {
        if (topicHits.has(topic)) score += topicHits.get(topic)!;
      }
      if (source.id === 'who-blindness') score += 0.5;
      if (source.id === 'nhs-vision-loss' && emergencyTopics.size) score += 0.25;
      return { source, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.source.id.localeCompare(b.source.id));

  const list = scored.slice(0, limit).map((item) => item.source);
  if (list.length === 0) {
    const fallbackIds = ['who-blindness', 'nhs-red-eye', 'nhs-vision-loss', 'aao-eye-exam'];
    return {
      list: sources.filter((source) => fallbackIds.includes(source.id)).slice(0, limit),
      topics: ['general'],
    };
  }

  return { list, topics: activeTopics };
}
