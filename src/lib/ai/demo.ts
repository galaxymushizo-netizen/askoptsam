import type { Lang } from '../../i18n/config';
import { getSources, type Source } from '../sources/registry';
import { normalizeText } from '../text/normalize';

interface DemoTopic {
  id: string;
  keywords: string[];
  sourceIds: string[];
  followUps: Record<Lang, string[]>;
  body: Record<Lang, string[]>;
}

const topics: DemoTopic[] = [
  {
    id: 'itchy',
    keywords: ['itch', 'itchy', 'itching', 'allergy', 'allergic', 'pollen', 'hay fever', 'kuwasha', 'yanawasha', 'mzio', 'aleji', 'vumbi'],
    sourceIds: ['nhs-red-eye', 'moorfields-allergic-conjunctivitis', 'nhs-hay-fever', 'nhs-dry-eyes'],
    followUps: {
      en: ['Is it one eye or both?', 'Is there pain or any change in vision?', 'Do you wear contact lenses?'],
      sw: ['Ni jicho moja au yote mawili?', 'Kuna maumivu au mabadiliko ya kuona?', 'Je, unavaa lenzi za mawasiliano?'],
    },
    body: {
      en: [
        'Itchy eyes are commonly linked to allergy (for example pollen, dust, or pets), dry eyes, or irritation from smoke, cosmetics, or chlorine. Infection can also cause itching, but it more often brings stickiness or discharge.',
        'For mild itching, avoid rubbing, try a cold compress over closed eyelids, and keep contact lenses out until the eyes settle. If you have hay fever, reducing exposure and asking a pharmacist about suitable allergy treatment may help.',
        'Get urgent advice if the eye is painful, very red, sensitive to light, or your vision changes — especially if you wear contact lenses.',
      ],
      sw: [
        'Macho yanayowasha mara nyingi huhusiana na mzio (kwa mfano poleni, vumbi, au wanyama), macho kavu, au mchomo kutokana na moshi, vipodozi, au klorini. Maambukizi yanaweza pia kusababisha kuwasha, lakini mara nyingi huleta ute au majimaji.',
        'Kwa kuwasha kidogo, epuka kusugua, jaribu kifuniko cha baridi juu ya kope zilizofungwa, na usitumie lenzi za mawasiliano hadi macho yatulie. Ikiwa una homa ya nyasi, punguza kuwasiliana na kitu kinachouchochea na muulize mfamasia kuhusu tiba inayofaa ya mzio.',
        'Tafuta ushauri wa haraka ikiwa jicho linauma, ni jekundu sana, linawashwa na mwanga, au kuona kunabadilika — hasa ikiwa unavaa lenzi za mawasiliano.',
      ],
    },
  },
  {
    id: 'blurry',
    keywords: ['blur', 'blurry', 'blurred', 'vision', 'sight', 'ukungu', 'kuona', 'miwani', 'glasses', 'refractive'],
    sourceIds: ['nhs-short-sightedness', 'nhs-long-sightedness', 'aao-eye-exam', 'nhs-vision-loss'],
    followUps: {
      en: ['Is the blurriness in one eye or both?', 'Did it start suddenly or gradually?', 'Does it improve with glasses or rest?'],
      sw: ['Kuona ukungu ni kwa jicho moja au yote mawili?', 'Kulianza ghafla au taratibu?', 'Kunaboreka ukiwa na miwani au ukipumzika?'],
    },
    body: {
      en: [
        'Blurred vision can come from a refractive error (short-sightedness, long-sightedness, or astigmatism), dry eyes, screen strain, cataract, or a change in health such as diabetes. These are possibilities, not a diagnosis.',
        'If vision has been blurry gradually and you have not had an eye examination recently, an optometrist can measure your vision and check eye health. A simple online test cannot safely prescribe glasses.',
        'Sudden loss of vision, a dark curtain or shadow across vision, new flashes with floaters, severe pain, or a painful red eye with vision change needs urgent assessment.',
      ],
      sw: [
        'Kuona ukungu kunaweza kutokana na hitilafu ya kuona (ufupi, urefu, au astigmatism), macho kavu, uchovu wa skrini, katarakti, au mabadiliko ya afya kama kisukari. Hizi ni uwezekano, si utambuzi.',
        'Ikiwa kuona kumekuwa ukungu kwa taratibu na hujapata uchunguzi wa macho hivi karibuni, daktari wa macho anaweza kupima kuona na kuangalia afya ya jicho. Mtihani rahisi wa mtandaoni hauwezi kuagiza miwani kwa usalama.',
        'Kupoteza kuona ghafla, pazia jeusi au kivuli juu ya kuona, mianga mipya pamoja na vitu vinavyoelea, maumivu makali, au jicho jekundu lenye maumivu na mabadiliko ya kuona vinahitaji uchunguzi wa haraka.',
      ],
    },
  },
  {
    id: 'light',
    keywords: ['light sensitivity', 'sensitive to light', 'photophobia', 'glare', 'mwangaza', 'nuru', 'mwanga', 'kuwasha na mwanga'],
    sourceIds: ['nhs-eye-pain', 'nhs-red-eye', 'nhs-vision-loss'],
    followUps: {
      en: ['Is it painful, or just uncomfortable?', 'Is one eye or both affected?', 'Do you have a red eye, headache, or vision change?'],
      sw: ['Ni maumivu au usumbufu tu?', 'Jicho moja au yote mawili yameathirika?', 'Una jicho jekundu, kichwa kinakuuma, au mabadiliko ya kuona?'],
    },
    body: {
      en: [
        'Light sensitivity can occur with dry eyes, migraine, a surface irritation, or inflammation inside the eye. It can also happen after a dilated eye examination or from some medicines.',
        'Rest your eyes in softer light and avoid rubbing. Do not use unprescribed eye drops. If you wear contact lenses, remove them.',
        'Get urgent advice if light sensitivity comes with pain, a red eye, blurred or reduced vision, or a severe headache with nausea. These combinations can indicate a more serious problem.',
      ],
      sw: [
        'Mwanga kuwasha kunaweza kutokea na macho kavu, kichwa kinachouma (migraine), mchomo wa uso wa jicho, au uvimbe ndani ya jicho. Kunaweza pia kutokea baada ya uchunguzi wa kupanua mboni au kutokana na dawa zingine.',
        'Pumzisha macho kwenye mwanga hafifu na epuka kusugua. Usitumie matone ya macho yasiyoagizwa. Ikiwa unavaa lenzi za mawasiliano, ziondoe.',
        'Tafuta ushauri wa haraka ikiwa mwanga kuwasha kunaambatana na maumivu, jicho jekundu, kuona ukungu au kupungua, au kichwa kuuma sana pamoja na kichefuchefu. Mchanganyiko huu unaweza kuashiria tatizo kubwa zaidi.',
      ],
    },
  },
  {
    id: 'red',
    keywords: ['red eye', 'red eyes', 'bloodshot', 'pink eye', 'macho mekundu', 'jicho jekundu', 'wekundu', 'conjunctivitis'],
    sourceIds: ['nhs-red-eye', 'nhs-conjunctivitis', 'nhs-dry-eyes', 'moorfields-contact-lens'],
    followUps: {
      en: ['Is there pain, or any change in vision?', 'Is there discharge or stickiness?', 'Do you wear contact lenses?'],
      sw: ['Kuna maumivu, au mabadiliko ya kuona?', 'Kuna ute au kitu kinachonata?', 'Je, unavaa lenzi za mawasiliano?'],
    },
    body: {
      en: [
        'A red eye is often caused by infection, allergy, dry eyes, or irritation, but it can sometimes be serious. Do not try to diagnose the cause yourself.',
        'Avoid rubbing, do not wear contact lenses until the eye has settled, and do not share towels or eye make-up. A pharmacist or optometrist can advise on non-urgent redness.',
        'Seek urgent care if the eye is very painful, your vision changes, it hurts to look at light, you have a severe headache with nausea, or you wear contact lenses and develop a red eye.',
      ],
      sw: [
        'Jicho jekundu mara nyingi husababishwa na maambukizi, mzio, macho kavu, au mchomo, lakini wakati mwingine linaweza kuwa kubwa. Usijaribu kutambua sababu mwenyewe.',
        'Epuka kusugua, usivae lenzi za mawasiliano hadi jicho litulie, na usishiriki taulo au vipodozi vya macho. Mfamasia au daktari wa macho anaweza kushauri kuhusu uwekundu usio wa dharura.',
        'Tafuta huduma ya haraka ikiwa jicho linauma sana, kuona kwako kunabadilika, linauma kuangalia mwanga, una kichwa kinachouma sana pamoja na kichefuchefu, au unavaa lenzi za mawasiliano na unapata jicho jekundu.',
      ],
    },
  },
  {
    id: 'chemical',
    keywords: ['chemical', 'acid', 'bleach', 'kemikali', 'asidi', 'klorini'],
    sourceIds: ['nhs-eye-injuries', 'nhs-red-eye'],
    followUps: {
      en: ['If this is happening now, rinse first and call emergency services.', 'What chemical was involved?', 'When did the exposure happen?'],
      sw: ['Ikiwa hii inatokea sasa, safisha kwanza na upige simu huduma za dharura.', 'Ni kemikali gani ilihusika?', 'Kemikali iliingia lini?'],
    },
    body: {
      en: [
        'If a chemical has entered the eye, act immediately: rinse with clean, running water for at least 15–20 minutes. Remove contact lenses if they come out easily. Do not try to neutralise the chemical with another substance.',
        'Call your local emergency number or go to the nearest emergency department while rinsing or immediately afterwards. Take the container or the chemical name if it is safe to do so.',
        'Do not wait for an online answer, and do not rub the eye. This guidance is educational first aid, not a substitute for emergency care.',
      ],
      sw: [
        'Ikiwa kemikali imeingia jichoni, fanya haraka: safisha kwa maji safi yanayotiririka kwa angalau dakika 15–20. Toa lenzi za mawasiliano ikiwa zinatoka kwa urahisi. Usijaribu kupunguza kemikali kwa dutu nyingine.',
        'Piga simu huduma ya dharura ya eneo lako au nenda hospitali ya dharura wakati au mara baada ya kusafisha. Chukua chupa au jina la kemikali ikiwa ni salama.',
        'Usisubiri jibu la mtandaoni, na usisugue jicho. Mwongozo huu ni huduma ya kwanza ya elimu, si mbadala wa huduma ya dharura.',
      ],
    },
  },
  {
    id: 'screen',
    keywords: ['screen', 'computer', 'phone', 'laptop', 'digital eye strain', 'skrini', 'simu', 'kompyuta', 'eye strain'],
    sourceIds: ['aao-eye-strain', 'aao-screen-time', 'nhs-dry-eyes'],
    followUps: {
      en: ['How many hours a day do you use screens?', 'Do your eyes feel dry, or do you get headaches?', 'Does looking far away help?'],
      sw: ['Unatumia saa ngapi kwa siku kwenye skrini?', 'Macho yanahisi kavu, au unapata kichwa kuuma?', 'Kuona mbali kunasaidia?'],
    },
    body: {
      en: [
        'Long screen use can cause tired, sore, watery, or dry eyes and temporary blurred vision. This is often called digital eye strain and is usually temporary.',
        'Try the 20-20-20 habit: every 20 minutes, look about 20 feet away for 20 seconds. Blink regularly, keep the screen around an arm’s length away, reduce glare, and adjust the font size.',
        'If blurriness or discomfort persists after rest, or you have pain or a sudden vision change, get an eye examination rather than assuming it is screen strain.',
      ],
      sw: [
        'Kutumia skrini kwa muda mrefu kunaweza kusababisha macho kuchoka, kuuma, kutoa maji, au kukauka, na kuona ukungu kwa muda. Hii mara nyingi huitwa uchovu wa macho wa kidijitali na kwa kawaida ni wa muda.',
        'Jaribu tabia ya 20-20-20: kila dakika 20, angalia umbali wa takriban mita 6 kwa sekunde 20. Fumba na kufumbua macho mara kwa mara, weka skrini umbali wa mkono, punguza mwanga unaong’aa, na rekebisha ukubwa wa maandishi.',
        'Ikiwa kuona ukungu au usumbufu unaendelea baada ya kupumzika, au una maumivu au mabadiliko ya ghafla ya kuona, pata uchunguzi wa macho badala ya kudhani ni uchovu wa skrini.',
      ],
    },
  },
  {
    id: 'contacts',
    keywords: ['contact lens', 'contact lenses', 'lenzi', 'lens', 'lenses'],
    sourceIds: ['moorfields-contact-lens', 'nhs-red-eye', 'nhs-eye-pain'],
    followUps: {
      en: ['Do you sleep or swim in your lenses?', 'Is the eye red, painful, or sensitive to light?', 'When did you last replace the lenses or case?'],
      sw: ['Unalala au kuogelea ukiwa na lenzi?', 'Jicho ni jekundu, linauma, au linawashwa na mwanga?', 'Ulibadilisha lenzi au kasha mara ya mwisho lini?'],
    },
    body: {
      en: [
        'Wash and dry your hands before handling lenses, follow the replacement schedule, and use the recommended solution. Never use tap water, bottled water, or saliva on lenses or the case.',
        'Do not swim or shower in lenses, and do not sleep in them unless a clinician has prescribed that schedule. Remove lenses before any eye examination.',
        'If the eye becomes red, painful, light-sensitive, or your vision changes, remove the lenses and seek urgent eye care the same day. Keep the lens and case for the clinician.',
      ],
      sw: [
        'Osha na kausha mikono kabla ya kushika lenzi, fuata ratiba ya kubadilisha, na tumia suluhisho linalopendekezwa. Kamwe usitumie maji ya bomba, maji ya chupa, au mate kwenye lenzi au kasha.',
        'Usiogele wala usioge ukiwa na lenzi, na usilale na lenzi isipokuwa daktari ameagiza ratiba hiyo. Toa lenzi kabla ya uchunguzi wowote wa macho.',
        'Ikiwa jicho linakuwa jekundu, linauma, linawashwa na mwanga, au kuona kunabadilika, toa lenzi na tafuta huduma ya macho ya haraka siku hiyo hiyo. Hifadhi lenzi na kasha kwa daktari.',
      ],
    },
  },
  {
    id: 'children',
    keywords: ['child', 'children', 'baby', 'kid', 'mtoto', 'watoto', 'school', 'squint'],
    sourceIds: ['nhs-eye-tests-children', 'aao-children', 'nhs-red-eye', 'who-blindness'],
    followUps: {
      en: ['How old is the child?', 'Is one eye turning or does the child tilt their head?', 'Is there pain, redness, or a change in vision?'],
      sw: ['Mtoto ana umri gani?', 'Jicho moja linazunguka au mtoto anainamisha kichwa?', 'Kuna maumivu, uwekundu, au mabadiliko ya kuona?'],
    },
    body: {
      en: [
        'Children may not realise their vision is different. Watch for squinting, sitting very close to screens, tilting the head, covering one eye, or rubbing the eyes often.',
        'An eye test is adapted to the child’s age and can detect refractive errors, squints, and other problems early. Ask an eye-care professional how often your child should be tested.',
        'Seek prompt assessment for a new squint, a white reflection in the pupil, red or painful eyes, a chemical splash, an eye injury, or any sudden change in vision.',
      ],
      sw: [
        'Watoto wanaweza wasitambue kuona kwao ni tofauti. Angalia kufinya macho, kukaa karibu sana na skrini, kuinamisha kichwa, kufunika jicho moja, au kusugua macho mara kwa mara.',
        'Uchunguzi wa macho hurekebishwa kwa umri wa mtoto na unaweza kugundua hitilafu za kuona, kuzungusha jicho, na matatizo mengine mapema. Muulize mtaalamu wa macho ni mara ngapi mtoto wako anapaswa kupimwa.',
        'Tafuta uchunguzi wa haraka kwa kuzungusha jicho jipya, mwanga mweupe kwenye mboni, macho mekundu au yenye maumivu, kemikali kumwagika, jeraha la jicho, au mabadiliko yoyote ya ghafla ya kuona.',
      ],
    },
  },
  {
    id: 'diabetes',
    keywords: ['diabetes', 'diabetic', 'sugar', 'kisukari', 'sukari', 'retinopathy'],
    sourceIds: ['nhs-diabetic-retinopathy', 'nhs-vision-loss', 'aao-eye-exam'],
    followUps: {
      en: ['When was your last diabetic eye screening?', 'Is the change in vision sudden or gradual?', 'Is one eye or both affected?'],
      sw: ['Uchunguzi wako wa mwisho wa macho ya kisukari ulikuwa lini?', 'Mabadiliko ya kuona ni ya ghafla au taratibu?', 'Jicho moja au yote mawili yameathirika?'],
    },
    body: {
      en: [
        'Diabetic retinopathy affects the blood vessels at the back of the eye and often has no symptoms at first. That is why screening matters even when you see well.',
        'Later symptoms can include worsening eyesight, blurred vision, floaters, or difficulty seeing in low light. Good control of blood sugar and blood pressure can reduce the risk of progression.',
        'If you have diabetes and your vision suddenly worsens or becomes blurred, or you develop new flashes, floaters, or a shadow across vision, seek urgent advice.',
      ],
      sw: [
        'Diabetic retinopathy huathiri mishipa ya damu nyuma ya jicho na mara nyingi haina dalili mwanzoni. Ndiyo sababu uchunguzi ni muhimu hata ukiona vizuri.',
        'Dalili za baadaye zinaweza kujumuisha kuona kuzidi kuwa mbaya, kuona ukungu, vitu vinavyoelea, au ugumu wa kuona kwenye mwanga hafifu. Kudhibiti vizuri sukari ya damu na shinikizo la damu kunaweza kupunguza hatari ya kuendelea.',
        'Ikiwa una kisukari na kuona kwako kunazidi kuwa mbaya ghafla au kuvurugika, au unapata mianga mipya, vitu vinavyoelea, au kivuli juu ya kuona, tafuta ushauri wa haraka.',
      ],
    },
  },
  {
    id: 'exam',
    keywords: ['eye exam', 'eye test', 'checkup', 'screening', 'optometrist', 'ophthalmologist', 'uchunguzi wa macho', 'daktari wa macho'],
    sourceIds: ['aao-eye-exam', 'nhs-eye-tests-children'],
    followUps: {
      en: ['Is this for you or a child?', 'When was your last eye examination?', 'Do you have diabetes or a family history of eye disease?'],
      sw: ['Hii ni kwa ajili yako au mtoto?', 'Uchunguzi wako wa mwisho wa macho ulikuwa lini?', 'Una kisukari au historia ya familia ya ugonjwa wa macho?'],
    },
    body: {
      en: [
        'An eye examination can include vision testing, eye pressure measurement, and a look at the front and back of the eye. It is adapted to your age and reason for the visit.',
        'Bring your current glasses or contact lenses, a list of medicines, and any previous eye results. If drops will dilate your pupils, arrange travel home and expect temporary blurry vision.',
        'Ask when you should return and which changes should prompt an earlier visit. Sudden vision loss or severe pain should not wait for a routine appointment.',
      ],
      sw: [
        'Uchunguzi wa macho unaweza kuhusisha kupima kuona, kupima shinikizo la jicho, na kuangalia mbele na nyuma ya jicho. Hurekebishwa kwa umri wako na sababu ya ziara.',
        'Chukua miwani au lenzi za mawasiliano za sasa, orodha ya dawa, na matokeo yoyote ya awali ya macho. Ikiwa matone yatapanua mboni, panga safari ya kurudi na utegemee kuona ukungu kwa muda.',
        'Uliza ni lini unapaswa kurudi na mabadiliko gani yanapaswa kukufanya urudi mapema. Kupoteza kuona ghafla au maumivu makali haipaswi kusubiri miadi ya kawaida.',
      ],
    },
  },
  {
    id: 'general',
    keywords: [],
    sourceIds: ['who-blindness', 'nhs-red-eye', 'nhs-vision-loss', 'aao-eye-exam'],
    followUps: {
      en: ['Is the concern in one eye or both?', 'Did it start suddenly or gradually?', 'Is there pain or any change in vision?'],
      sw: ['Tatizo ni kwa jicho moja au yote mawili?', 'Lilianza ghafla au taratibu?', 'Kuna maumivu au mabadiliko ya kuona?'],
    },
    body: {
      en: [
        'I can share general eye-health information, but this demo cannot assess your eyes or give a diagnosis. Tell me what you have noticed — for example itching, redness, blurry vision, pain, or an injury.',
        'Useful details include when it started, whether one or both eyes are affected, whether there is pain or vision change, and whether contact lenses, chemicals, or an injury are involved.',
        'If you have sudden vision loss, severe eye pain, a chemical in the eye, a penetrating injury, or a sudden curtain across vision, seek emergency care immediately.',
      ],
      sw: [
        'Naweza kutoa taarifa za jumla kuhusu afya ya macho, lakini demo hii haiwezi kuchunguza macho yako au kutoa utambuzi. Niambie umegundua nini — kwa mfano kuwasha, uwekundu, kuona ukungu, maumivu, au jeraha.',
        'Taarifa muhimu ni pamoja na ilipoanza, kama jicho moja au yote mawili yameathirika, kama kuna maumivu au mabadiliko ya kuona, na kama lenzi za mawasiliano, kemikali, au jeraha vinahusika.',
        'Ikiwa una kupoteza kuona ghafla, maumivu makali ya jicho, kemikali jichoni, jeraha lililopenya, au pazia la ghafla juu ya kuona, tafuta huduma ya dharura mara moja.',
      ],
    },
  },
];

function chooseTopic(query: string): DemoTopic {
  const text = normalizeText(query);
  let best = topics[topics.length - 1]!;
  let bestScore = 0;
  for (const topic of topics) {
    const score = topic.keywords.reduce((sum, keyword) => (text.includes(keyword) ? sum + 1 : sum), 0);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }
  return best;
}

function tokenMapFor(sources: Source[]): Map<string, number> {
  return new Map(sources.map((source, index) => [source.id, index + 1]));
}

function renderBody(paragraphs: string[], sources: Source[]): string {
  const tokenMap = tokenMapFor(sources);
  return paragraphs
    .map((paragraph) => {
      // Attach valid citations that the curated paragraph references.
      return paragraph.replace(/\[\[src:([a-z0-9-]+)\]\]/g, (_whole, id: string) => {
        const token = tokenMap.get(id);
        return token ? `[S${token}]` : '';
      });
    })
    .join('\n\n');
}

// Add source placeholders to curated paragraphs without scattering citation
// markup through every sentence. The final citation is attached to the relevant
// paragraph's most factual statement.
const citationHints: Record<string, string[]> = {
  itchy: ['nhs-red-eye', 'moorfields-allergic-conjunctivitis'],
  blurry: ['nhs-short-sightedness', 'aao-eye-exam'],
  light: ['nhs-eye-pain', 'nhs-red-eye'],
  red: ['nhs-red-eye', 'nhs-conjunctivitis'],
  chemical: ['nhs-eye-injuries'],
  screen: ['aao-eye-strain', 'nhs-dry-eyes'],
  contacts: ['moorfields-contact-lens'],
  children: ['nhs-eye-tests-children', 'aao-children'],
  diabetes: ['nhs-diabetic-retinopathy'],
  exam: ['aao-eye-exam'],
  general: ['nhs-vision-loss'],
};

export interface DemoReply {
  text: string;
  sources: Source[];
  followUps: string[];
  topicId: string;
}

/**
 * Deterministic demo response. Clearly labelled as pre-written content, and
 * never presented as live model output.
 */
export function demoReply(query: string, lang: Lang): DemoReply {
  const topic = chooseTopic(query);
  const sourceIds = [...new Set([...topic.sourceIds, ...(citationHints[topic.id] ?? [])])];
  const sources = getSources(sourceIds);
  const body = renderBody(topic.body[lang], sources);
  const heading =
    lang === 'en'
      ? 'Demo mode — this is pre-written educational content, not a live AI response. No message was sent to an AI provider.'
      : 'Hali ya demo — haya ni maudhui ya elimu yaliyoandaliwa tayari, si jibu la AI hai. Hakuna ujumbe uliotumwa kwa mtoa huduma wa AI.';

  const hints = citationHints[topic.id] ?? [];
  const citations = hints
    .map((id) => {
      const token = tokenMapFor(sources).get(id);
      return token ? `[S${token}]` : '';
    })
    .join('');

  return {
    text: `${heading}\n\n${body}${citations ? `\n\n${citations}` : ''}`,
    sources,
    followUps: topic.followUps[lang],
    topicId: topic.id,
  };
}
