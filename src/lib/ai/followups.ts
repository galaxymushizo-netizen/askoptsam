import type { Lang } from '../../i18n/config';
import type { SourceTopic } from '../sources/registry';

const followUps: Record<string, Record<Lang, string[]>> = {
  pain: {
    en: ['Is the pain severe, or mild?', 'Is one eye or both affected?', 'Is there any change in vision?'],
    sw: ['Maumivu ni makali au kidogo?', 'Jicho moja au yote mawili yameathirika?', 'Kuna mabadiliko yoyote ya kuona?'],
  },
  'red-eye': {
    en: ['Is there pain or discharge?', 'Do you wear contact lenses?', 'Has your vision changed?'],
    sw: ['Kuna maumivu au ute?', 'Je, unavaa lenzi za mawasiliano?', 'Kuona kwako kumebadilika?'],
  },
  itch: {
    en: ['Is it one eye or both?', 'Do you have other allergy symptoms, like sneezing?', 'Do you wear contact lenses?'],
    sw: ['Ni jicho moja au yote mawili?', 'Una dalili zingine za mzio, kama kupiga chafya?', 'Je, unavaa lenzi za mawasiliano?'],
  },
  'dry-eye': {
    en: ['Is it worse after screen use?', 'Do your eyes water as well as feel dry?', 'Are you using any eye drops?'],
    sw: ['Ni mbaya zaidi baada ya kutumia skrini?', 'Macho yanatoa maji pia au yanahisi kavu?', 'Unatumia matone yoyote ya macho?'],
  },
  'blurred-vision': {
    en: ['Did the blurriness start suddenly or gradually?', 'Is it one eye or both?', 'Does it improve with glasses or rest?'],
    sw: ['Ukungu ulianza ghafla au taratibu?', 'Ni jicho moja au yote mawili?', 'Unaboreka ukiwa na miwani au ukipumzika?'],
  },
  'vision-loss': {
    en: ['Did this start suddenly?', 'Is one eye or both affected?', 'Is there pain or a shadow across your vision?'],
    sw: ['Hii ilianza ghafla?', 'Jicho moja au yote mawili yameathirika?', 'Kuna maumivu au kivuli juu ya kuona?'],
  },
  'light-sensitivity': {
    en: ['Is it painful or just uncomfortable?', 'Do you have a red eye or headache?', 'Did it start after an injury or eye drops?'],
    sw: ['Ni maumivu au usumbufu tu?', 'Una jicho jekundu au kichwa kinakuuma?', 'Ilianza baada ya jeraha au matone ya macho?'],
  },
  injury: {
    en: ['What caused the injury?', 'Is anything stuck in the eye?', 'Has your vision changed?'],
    sw: ['Nini kilisababisha jeraha?', 'Kuna kitu kilichokwama jichoni?', 'Kuona kwako kumebadilika?'],
  },
  chemical: {
    en: ['What chemical was involved?', 'How long ago did it happen?', 'Are you rinsing the eye now?'],
    sw: ['Ni kemikali gani ilihusika?', 'Imetokea muda gani uliopita?', 'Je, unasafisha jicho sasa?'],
  },
  'flashes-floaters': {
    en: ['Did the flashes or floaters start suddenly?', 'Do you see a shadow or curtain?', 'Is one eye or both affected?'],
    sw: ['Mianga au vitu vinavyoelea vilianza ghafla?', 'Unaona kivuli au pazia?', 'Jicho moja au yote mawili yameathirika?'],
  },
  'contact-lens': {
    en: ['Do you sleep or swim in your lenses?', 'Is the eye red or painful?', 'When did you last replace the lens or case?'],
    sw: ['Unalala au kuogelea ukiwa na lenzi?', 'Jicho ni jekundu au linauma?', 'Ulibadilisha lenzi au kasha mara ya mwisho lini?'],
  },
  children: {
    en: ['How old is the child?', 'Is one eye turning or is the head tilted?', 'When was the last eye test?'],
    sw: ['Mtoto ana umri gani?', 'Jicho moja linazunguka au kichwa kimeinama?', 'Uchunguzi wa mwisho wa macho ulikuwa lini?'],
  },
  diabetes: {
    en: ['When was your last diabetic eye screening?', 'Is the vision change sudden or gradual?', 'Is one eye or both affected?'],
    sw: ['Uchunguzi wako wa mwisho wa macho ya kisukari ulikuwa lini?', 'Mabadiliko ya kuona ni ya ghafla au taratibu?', 'Jicho moja au yote mawili yameathirika?'],
  },
  glaucoma: {
    en: ['Is there severe pain, headache, or nausea?', 'Has your vision changed?', 'When did the symptoms start?'],
    sw: ['Kuna maumivu makali, kichwa kuuma, au kichefuchefu?', 'Kuona kwako kumebadilika?', 'Dalili zilianza lini?'],
  },
  cataract: {
    en: ['Is the blurriness gradual?', 'Do lights seem glaring or haloed?', 'Is one eye or both affected?'],
    sw: ['Ukungu unaendelea taratibu?', 'Taa zinaonekana ziking’aa au zenye miali?', 'Jicho moja au yote mawili yameathirika?'],
  },
  refractive: {
    en: ['Is it harder to see near or far?', 'Is one eye or both affected?', 'When was your last eye test?'],
    sw: ['Ni vigumu kuona karibu au mbali?', 'Jicho moja au yote mawili yameathirika?', 'Uchunguzi wa mwisho wa macho ulikuwa lini?'],
  },
  screen: {
    en: ['How many hours a day do you use screens?', 'Do your eyes feel dry or tired?', 'Does looking far away help?'],
    sw: ['Unatumia saa ngapi kwa siku kwenye skrini?', 'Macho yanahisi kavu au yamechoka?', 'Kuona mbali kunasaidia?'],
  },
  checkup: {
    en: ['Is this for you or a child?', 'When was the last eye examination?', 'Do you have diabetes or a family history of eye disease?'],
    sw: ['Hii ni kwa ajili yako au mtoto?', 'Uchunguzi wa mwisho wa macho ulikuwa lini?', 'Una kisukari au historia ya familia ya ugonjwa wa macho?'],
  },
  allergy: {
    en: ['Do you also have sneezing or a runny nose?', 'Is it seasonal or all year?', 'Do you wear contact lenses?'],
    sw: ['Una pia kupiga chafya au kamasi?', 'Ni ya msimu au mwaka mzima?', 'Je, unavaa lenzi za mawasiliano?'],
  },
  general: {
    en: ['Is it one eye or both?', 'Did it start suddenly or gradually?', 'Is there pain or any change in vision?'],
    sw: ['Ni jicho moja au yote mawili?', 'Lilianza ghafla au taratibu?', 'Kuna maumivu au mabadiliko ya kuona?'],
  },
};

export function getFollowUps(topics: SourceTopic[], lang: Lang, limit = 3): string[] {
  const result: string[] = [];
  const order: SourceTopic[] = [
    'pain',
    'vision-loss',
    'red-eye',
    'itch',
    'dry-eye',
    'blurred-vision',
    'light-sensitivity',
    'contact-lens',
    'injury',
    'chemical',
    'flashes-floaters',
    'children',
    'diabetes',
    'glaucoma',
    'cataract',
    'refractive',
    'screen',
    'checkup',
    'allergy',
    'general',
  ];
  for (const topic of order) {
    if (topics.includes(topic) && followUps[topic]) {
      for (const question of followUps[topic]![lang]) {
        if (!result.includes(question)) result.push(question);
        if (result.length >= limit) return result;
      }
    }
  }
  for (const question of followUps.general![lang]) {
    if (!result.includes(question)) result.push(question);
    if (result.length >= limit) break;
  }
  return result;
}
