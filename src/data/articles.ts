import type { Lang } from '../i18n/config';

export type ArticleTopic =
  | 'daily-care'
  | 'screen'
  | 'vision'
  | 'contact-lens'
  | 'symptoms'
  | 'children'
  | 'diabetes'
  | 'emergencies'
  | 'checkups';

export const articleTopics: Record<ArticleTopic, { en: string; sw: string }> = {
  'daily-care': { en: 'Everyday eye care', sw: 'Utunzaji wa kila siku' },
  screen: { en: 'Screens & eye strain', sw: 'Skrini na uchovu wa macho' },
  vision: { en: 'Vision & glasses', sw: 'Kuona na miwani' },
  'contact-lens': { en: 'Contact lenses', sw: 'Lenzi za mawasiliano' },
  symptoms: { en: 'Redness, itching & dryness', sw: 'Uwekundu, kuwasha na ukavu' },
  children: { en: "Children's eyes", sw: 'Macho ya watoto' },
  diabetes: { en: 'Diabetes & eyes', sw: 'Kisukari na macho' },
  emergencies: { en: 'Urgent warning signs', sw: 'Dalili za dharura' },
  checkups: { en: 'Eye examinations', sw: 'Uchunguzi wa macho' },
};

export interface ArticleSection {
  heading: { en: string; sw: string };
  body: { en: string[]; sw: string[] };
}

export interface Article {
  slug: string;
  topic: ArticleTopic;
  title: { en: string; sw: string };
  summary: { en: string; sw: string };
  readingMinutes: number;
  reviewedAt: string;
  clinicalReview: 'pending' | 'complete';
  warning?: { en: string; sw: string };
  sections: ArticleSection[];
  sourceIds: string[];
  related: string[];
  keywords: { en: string[]; sw: string[] };
}

export const articles: Article[] = [
  {
    slug: 'everyday-eye-care',
    topic: 'daily-care',
    title: { en: 'Everyday eye care that actually helps', sw: 'Utunzaji wa macho wa kila siku unaosaidia' },
    summary: {
      en: 'Simple habits for comfort and safety: clean hands, avoiding rubbing, protecting the eyes, and knowing what not to put in them.',
      sw: 'Tabia rahisi kwa faraja na usalama: mikono safi, kuepuka kusugua, kulinda macho, na kujua nini kisichowekwa ndani yake.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    sections: [
      {
        heading: { en: 'Start with clean hands', sw: 'Anza na mikono safi' },
        body: {
          en: [
            'Wash your hands with soap and water before touching your eyes, your contact lenses, or anything that goes near them.',
            'Try not to rub your eyes. Rubbing can worsen irritation and, after an injury, can cause more damage.',
            'Do not share towels, eye make-up, contact lens cases, or eye drops. These can pass infections between people.',
            'Replace eye make-up regularly and remove it gently before sleeping.',
          ],
          sw: [
            'Osha mikono kwa sabuni na maji kabla ya kugusa macho, lenzi za mawasiliano, au kitu chochote kinachokaribia macho.',
            'Jaribu kutosugua macho. Kusugua kunaweza kuongeza kuwasha na, baada ya jeraha, kusababisha madhara zaidi.',
            'Usishiriki taulo, vipodozi vya macho, kasha za lenzi, au matone ya macho. Hivi vinaweza kupeleka maambukizi kati ya watu.',
            'Badilisha vipodozi vya macho mara kwa mara na viondoe kwa upole kabla ya kulala.',
          ],
        },
      },
      {
        heading: { en: 'Protect the eyes', sw: 'Linda macho' },
        body: {
          en: [
            'Wear sunglasses that block UV light when you are outdoors in strong sun.',
            'Use protective goggles for work that creates flying particles, sparks, or chemical splashes.',
            'Take regular breaks during long screen use, and adjust lighting so that the screen is not the brightest thing in the room.',
            'Keep chemicals, cleaning products, and sharp objects out of reach of children.',
          ],
          sw: [
            'Vaa miwani ya jua inayozuia mwanga wa UV ukiwa nje kwenye jua kali.',
            'Tumia miwani ya kinga kwa kazi inayozalisha chembe zinazoruka, cheche, au kemikali zinazomwagika.',
            'Pumzika mara kwa mara unapotumia skrini kwa muda mrefu, na rekebisha mwanga ili skrini isiwe kitu kinachong’aa zaidi kwenye chumba.',
            'Weka kemikali, bidhaa za kusafisha, na vitu vyenye ncha kali mbali na watoto.',
          ],
        },
      },
      {
        heading: { en: 'What not to put in the eye', sw: 'Nini kisiwekwe jichoni' },
        body: {
          en: [
            'Avoid unprescribed herbal preparations, urine, breast milk, or other home substances in the eye. They can introduce infection or cause chemical irritation.',
            'Do not use someone else’s eye drops or leftover prescription drops.',
            'If you use lubricating drops, follow the label and ask a pharmacist if you are unsure.',
          ],
          sw: [
            'Epuka dawa za mitishamba zisizoagizwa, mkojo, maziwa ya mama, au vitu vingine vya nyumbani jichoni. Vinaweza kuleta maambukizi au kuwasha kwa kemikali.',
            'Usitumie matone ya macho ya mtu mwingine au matone ya dawa yaliyobaki.',
            'Ikiwa unatumia matone ya kulainisha, fuata maelekezo ya lebo na muulize mfamasia ikiwa huna uhakika.',
          ],
        },
      },
      {
        heading: { en: 'When to get help', sw: 'Wakati wa kupata msaada' },
        body: {
          en: [
            'Seek urgent care for sudden vision loss, severe pain, chemical exposure, or a serious injury.',
            'See an eye-care professional if redness, irritation, or vision changes persist or keep returning.',
            'A routine eye examination is still useful even when your eyes feel fine, especially if you have diabetes or a family history of eye disease.',
          ],
          sw: [
            'Tafuta huduma ya haraka kwa kupoteza kuona ghafla, maumivu makali, kemikali jichoni, au jeraha kubwa.',
            'Muone mtaalamu wa macho ikiwa uwekundu, kuwasha, au mabadiliko ya kuona yanaendelea au yanarudi mara kwa mara.',
            'Uchunguzi wa kawaida wa macho bado ni muhimu hata macho yakihisi salama, hasa ikiwa una kisukari au historia ya familia ya ugonjwa wa macho.',
          ],
        },
      },
    ],
    sourceIds: ['who-blindness', 'nhs-red-eye', 'nhs-eye-injuries', 'nhs-dry-eyes'],
    related: ['red-itchy-dry-eyes', 'eye-injury-chemical', 'preparing-for-eye-exam'],
    keywords: {
      en: ['eye hygiene', 'hand washing', 'sunglasses', 'protection', 'traditional remedies', 'makeup'],
      sw: ['usafi wa macho', 'kunawa mikono', 'miwani ya jua', 'kinga', 'dawa za jadi', 'vipodozi'],
    },
  },
  {
    slug: 'digital-eye-strain',
    topic: 'screen',
    title: { en: 'Screens, eye strain, and healthy habits', sw: 'Skrini, uchovu wa macho, na tabia bora' },
    summary: {
      en: 'Why screens can make eyes tired or dry, and practical changes that reduce strain without promising a cure.',
      sw: 'Kwa nini skrini zinaweza kuchosha au kukausha macho, na mabadiliko ya vitendo yanayopunguza uchovu bila kuahidi tiba.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    sections: [
      {
        heading: { en: 'What digital eye strain feels like', sw: 'Uchovu wa macho kutokana na skrini unavyohisi' },
        body: {
          en: [
            'Long screen use can cause tired, sore, watery, or dry eyes, temporary blurred vision, and headaches.',
            'These symptoms are usually temporary. They do not mean screens have permanently damaged your eyes.',
            'If blurred vision persists after rest, or if you have pain or a sudden change in vision, get an eye examination rather than assuming it is screen strain.',
          ],
          sw: [
            'Kutumia skrini kwa muda mrefu kunaweza kusababisha macho kuchoka, kuuma, kutoa maji mengi, au kukauka, kuona ukungu kwa muda, na kichwa kuuma.',
            'Dalili hizi kwa kawaida ni za muda. Hazimaanishi skrini zimeharibu macho yako kabisa.',
            'Ikiwa kuona ukungu kunaendelea baada ya kupumzika, au ikiwa una maumivu au mabadiliko ya ghafla ya kuona, pata uchunguzi wa macho badala ya kudhani ni uchovu wa skrini.',
          ],
        },
      },
      {
        heading: { en: 'Practical adjustments', sw: 'Marekebisho ya vitendo' },
        body: {
          en: [
            'Take a short break every 20 minutes. Look at something far away for about 20 seconds.',
            'Blink regularly. People often blink less when concentrating on a screen.',
            'Keep the screen roughly an arm’s length away and position it so you look slightly downward.',
            'Reduce glare, adjust font size, and avoid using a screen in a dark room with a very bright display.',
            'If you wear glasses, check that your prescription is up to date.',
          ],
          sw: [
            'Pumzika kwa muda mfupi kila dakika 20. Angalia kitu kilicho mbali kwa takriban sekunde 20.',
            'Fumba na kufumbua macho mara kwa mara. Watu mara nyingi hufumba macho kidogo wanapokazia fikira kwenye skrini.',
            'Weka skrini umbali wa takriban urefu wa mkono na uiweke ili uangalie kwa kuteremka kidogo.',
            'Punguza mwanga unaong’aa, rekebisha ukubwa wa maandishi, na epuka kutumia skrini kwenye chumba kizito chenye mwanga mkali sana.',
            'Ikiwa unavaa miwani, hakikisha namba yako ni ya sasa.',
          ],
        },
      },
      {
        heading: { en: 'Children and screens', sw: 'Watoto na skrini' },
        body: {
          en: [
            'Frequent breaks and time outdoors are important for children who use screens.',
            'Children may not complain about blurred vision. Watch for squinting, sitting very close, head tilting, or rubbing the eyes.',
            'A child with a new squint, persistent redness, pain, or a white reflection in the pupil should be assessed.',
          ],
          sw: [
            'Mapumziko ya mara kwa mara na muda nje ni muhimu kwa watoto wanaotumia skrini.',
            'Watoto wanaweza wasilalamike kuhusu kuona ukungu. Angalia kufinya macho, kukaa karibu sana, kuinamisha kichwa, au kusugua macho.',
            'Mtoto mwenye kuzungusha jicho jipya, uwekundu unaoendelea, maumivu, au mwanga mweupe kwenye mboni anapaswa kuangaliwa.',
          ],
        },
      },
    ],
    sourceIds: ['aao-eye-strain', 'aao-screen-time', 'nhs-dry-eyes', 'nhs-short-sightedness'],
    related: ['refractive-errors-glasses', 'red-itchy-dry-eyes', 'childrens-eye-health'],
    keywords: {
      en: ['screen time', 'digital eye strain', '20-20-20', 'computer vision', 'dry eyes', 'children screens'],
      sw: ['muda wa skrini', 'uchovu wa macho', '20-20-20', 'kompyuta', 'macho kavu', 'watoto na skrini'],
    },
  },
  {
    slug: 'refractive-errors-glasses',
    topic: 'vision',
    title: { en: 'Blurry vision, refractive errors, and glasses', sw: 'Kuona ukungu, hitilafu za kuona, na miwani' },
    summary: {
      en: 'How short-sightedness, long-sightedness, astigmatism, and age-related focusing changes are assessed and corrected.',
      sw: 'Jinsi ufupi wa kuona, urefu wa kuona, astigmatism, na mabadiliko ya umri yanavyochunguzwa na kurekebishwa.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    warning: {
      en: 'Sudden vision loss or a sudden major change in vision is not a normal glasses problem. Seek urgent care.',
      sw: 'Kupoteza kuona ghafla au mabadiliko makubwa ya ghafla si tatizo la kawaida la miwani. Tafuta huduma ya haraka.',
    },
    sections: [
      {
        heading: { en: 'Common refractive errors', sw: 'Hitilafu za kawaida za kuona' },
        body: {
          en: [
            'Short-sightedness (myopia) makes distant objects blurred while near objects are usually clearer.',
            'Long-sightedness (hypermetropia) can make close work blurred; some people also struggle with distance.',
            'Astigmatism causes blur or distortion because the eye’s surface curves unevenly.',
            'Presbyopia is the normal age-related difficulty with close focus and often becomes noticeable in the 40s.',
            'These are descriptions of how vision is focused, not a diagnosis made from a chat.',
          ],
          sw: [
            'Ufupi wa kuona (myopia) hufanya vitu vya mbali vionekane ukungu wakati vya karibu kawaida vinaonekana wazi.',
            'Urefu wa kuona (hypermetropia) unaweza kufanya kazi za karibu zionekane ukungu; watu wengine pia wana shida ya kuona mbali.',
            'Astigmatism husababisha ukungu au kupinda kwa kuona kwa sababu uso wa jicho unapinda kwa njia isiyo sawa.',
            'Presbyopia ni ugumu wa kawaida wa kuona karibu unaotokana na umri na mara nyingi huonekana miaka ya 40.',
            'Hizi ni maelezo ya jinsi kuona kunavyolenga, si utambuzi unaofanywa kwa mazungumzo.',
          ],
        },
      },
      {
        heading: { en: 'Getting the right prescription', sw: 'Kupata namba sahihi' },
        body: {
          en: [
            'An eye examination can measure how your eyes focus and check eye health. A simple online test cannot prescribe glasses safely.',
            'If glasses are needed, an optometrist can measure the prescription and explain options.',
            'Avoid borrowing someone else’s glasses for regular use; the prescription may not suit you.',
            'Children who struggle at school or hold things very close should have an eye test.',
          ],
          sw: [
            'Uchunguzi wa macho unaweza kupima jinsi macho yako yanavyolenga na kuangalia afya ya jicho. Mtihani rahisi wa mtandaoni hauwezi kuagiza miwani kwa usalama.',
            'Ikiwa miwani inahitajika, daktari wa macho anaweza kupima namba na kueleza chaguo.',
            'Epuka kukopa miwani ya mtu mwingine kwa matumizi ya kawaida; namba inaweza isikufae.',
            'Watoto wanaoshindwa shuleni au kushika vitu karibu sana wanapaswa kupimwa macho.',
          ],
        },
      },
      {
        heading: { en: 'When blurry vision is urgent', sw: 'Wakati kuona ukungu ni dharura' },
        body: {
          en: [
            'Sudden loss of vision, a dark curtain across vision, new flashes with floaters, severe eye pain, or a painful red eye with vision change needs urgent assessment.',
            'Gradual blurring still deserves an eye examination so that treatable causes are not missed.',
            'Diabetes can cause vision changes; follow your screening schedule even if you see well.',
          ],
          sw: [
            'Kupoteza kuona ghafla, pazia jeusi juu ya kuona, mianga mipya pamoja na vitu vinavyoelea, maumivu makali ya jicho, au jicho jekundu lenye maumivu na mabadiliko ya kuona vinahitaji uchunguzi wa haraka.',
            'Ukungu unaoendelea kwa taratibu bado unahitaji uchunguzi wa macho ili sababu zinazoweza kutibika zisikosewe.',
            'Kisukari kinaweza kusababisha mabadiliko ya kuona; fuata ratiba yako ya uchunguzi hata ukiona vizuri.',
          ],
        },
      },
    ],
    sourceIds: ['nhs-short-sightedness', 'nhs-long-sightedness', 'aao-myopia', 'aao-eye-exam', 'nhs-vision-loss'],
    related: ['digital-eye-strain', 'childrens-eye-health', 'preparing-for-eye-exam'],
    keywords: {
      en: ['blurry vision', 'myopia', 'hyperopia', 'astigmatism', 'glasses', 'prescription', 'short sighted', 'long sighted'],
      sw: ['kuona ukungu', 'myopia', 'hypermetropia', 'astigmatism', 'miwani', 'namba ya macho', 'kuona mbali', 'kuona karibu'],
    },
  },
  {
    slug: 'contact-lens-safety',
    topic: 'contact-lens',
    title: { en: 'Contact lens safety: the rules that matter', sw: 'Usalama wa lenzi za mawasiliano: kanuni muhimu' },
    summary: {
      en: 'Clean hands, clean cases, no tap water, and urgent action for a red or painful eye while wearing lenses.',
      sw: 'Mikono safi, kasha safi, hakuna maji ya bomba, na hatua ya haraka kwa jicho jekundu au lenye maumivu wakati umevaa lenzi.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    warning: {
      en: 'If your eye becomes red, painful, sensitive to light, or your vision changes while wearing lenses, remove them and seek urgent eye care.',
      sw: 'Ikiwa jicho lako linakuwa jekundu, linauma, linawashwa na mwanga, au kuona kunabadilika wakati umevaa lenzi, ziondoe na tafuta huduma ya macho ya haraka.',
    },
    sections: [
      {
        heading: { en: 'Everyday lens hygiene', sw: 'Usafi wa lenzi wa kila siku' },
        body: {
          en: [
            'Wash and dry your hands before handling lenses.',
            'Follow the cleaning and replacement schedule given by your lens provider. Do not stretch daily, weekly, or monthly lenses beyond their schedule.',
            'Use the recommended solution. Do not top up old solution in the case; empty, clean, and air-dry it.',
            'Never use tap water, bottled water, or saliva to rinse lenses or the case.',
          ],
          sw: [
            'Osha na kausha mikono kabla ya kushika lenzi.',
            'Fuata ratiba ya kusafisha na kubadilisha uliyopewa na mtoa huduma wa lenzi. Usizidi ratiba ya lenzi za siku, wiki, au mwezi.',
            'Tumia suluhisho linalopendekezwa. Usiongeze suluhisho la zamani kwenye kasha; liamue, lisafishe, na likaushe kwa hewa.',
            'Kamwe usitumie maji ya bomba, maji ya chupa, au mate kusafisha lenzi au kasha.',
          ],
        },
      },
      {
        heading: { en: 'Water, sleep, and swimming', sw: 'Maji, usingizi, na kuogelea' },
        body: {
          en: [
            'Do not swim or shower while wearing contact lenses. Water can carry organisms that cause serious eye infections.',
            'Do not sleep in lenses unless a clinician has specifically prescribed that schedule.',
            'Do not share lenses, cases, or solution with anyone else.',
            'Remove lenses before ANY eye examination or if the eye is irritated.',
          ],
          sw: [
            'Usiogele wala usioge wakati umevaa lenzi za mawasiliano. Maji yanaweza kuwa na viumbe vinavyosababisha maambukizi makubwa ya macho.',
            'Usilale na lenzi isipokuwa daktari ameagiza ratiba hiyo mahususi.',
            'Usishiriki lenzi, kasha, au suluhisho na mtu mwingine.',
            'Toa lenzi kabla ya uchunguzi WOWOTE wa macho au ikiwa jicho lina mchomo.',
          ],
        },
      },
      {
        heading: { en: 'Warning signs', sw: 'Dalili za tahadhari' },
        body: {
          en: [
            'Remove the lenses immediately if the eye is red, painful, light-sensitive, or if vision is blurred or reduced.',
            'Keep the lens and case and take them to the appointment.',
            'Contact an eye clinic, optometrist, or urgent care service the same day.',
            'Do not use leftover antibiotic drops or someone else’s medication.',
          ],
          sw: [
            'Toa lenzi mara moja ikiwa jicho ni jekundu, linauma, linawashwa na mwanga, au kuona kumevurugika au kupungua.',
            'Hifadhi lenzi na kasha na uchukue kwenye miadi.',
            'Wasiliana na kliniki ya macho, daktari wa macho, au huduma ya haraka siku hiyo hiyo.',
            'Usitumie matone ya antibiotic yaliyobaki au dawa ya mtu mwingine.',
          ],
        },
      },
    ],
    sourceIds: ['moorfields-contact-lens', 'nhs-red-eye', 'nhs-eye-pain', 'nhs-conjunctivitis'],
    related: ['red-itchy-dry-eyes', 'urgent-warning-signs', 'preparing-for-eye-exam'],
    keywords: {
      en: ['contact lenses', 'lens care', 'tap water', 'sleeping in lenses', 'swimming', 'eye infection'],
      sw: ['lenzi za mawasiliano', 'utunzaji wa lenzi', 'maji ya bomba', 'kulala na lenzi', 'kuogelea', 'maambukizi ya jicho'],
    },
  },
  {
    slug: 'red-itchy-dry-eyes',
    topic: 'symptoms',
    title: { en: 'Red, itchy, or dry eyes: what may be going on', sw: 'Macho mekundu, yanawasha, au kavu: nini kinaweza kuwa kinaendelea' },
    summary: {
      en: 'Common explanations for redness, itching, and dryness, safe self-care, and the warning signs that change the plan.',
      sw: 'Maelezo ya kawaida ya uwekundu, kuwasha, na ukavu, utunzaji salama wa nyumbani, na dalili za tahadhari zinazobadilisha mpango.',
    },
    readingMinutes: 5,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    warning: {
      en: 'Painful red eye with vision change, severe pain, contact lens use with a red eye, or any sight change needs urgent assessment.',
      sw: 'Jicho jekundu lenye maumivu na mabadiliko ya kuona, maumivu makali, matumizi ya lenzi pamoja na jicho jekundu, au mabadiliko yoyote ya kuona yanahitaji uchunguzi wa haraka.',
    },
    sections: [
      {
        heading: { en: 'Common causes', sw: 'Sababu za kawaida' },
        body: {
          en: [
            'Redness can come from infection, allergy, dry eyes, irritation, or a burst surface blood vessel.',
            'Itching is often linked to allergy, such as hay fever or dust, but can also occur with dryness or irritation.',
            'Dry eyes can feel gritty, sore, watery, or as if something is in the eye.',
            'Screens, wind, smoke, and some medicines can make dryness worse.',
            'This list is not a diagnosis. The same symptom can have different causes.',
          ],
          sw: [
            'Uwekundu unaweza kutokana na maambukizi, mzio, macho kavu, mchomo, au mshipa wa damu uliopasuka juu ya uso wa jicho.',
            'Kuwasha mara nyingi huhusiana na mzio, kama homa ya nyasi au vumbi, lakini kunaweza pia kutokea na ukavu au mchomo.',
            'Macho kavu yanaweza kuhisi kama kuna mchanga, kuuma, kutoa maji, au kama kuna kitu jichoni.',
            'Skrini, upepo, moshi, na dawa zingine zinaweza kuongeza ukavu.',
            'Orodha hii si utambuzi. Dalili moja inaweza kuwa na sababu tofauti.',
          ],
        },
      },
      {
        heading: { en: 'Gentle self-care', sw: 'Utunzaji wa upole nyumbani' },
        body: {
          en: [
            'Avoid rubbing your eyes. A cold compress over closed eyelids may ease itching and swelling.',
            'If you have allergies, reduce exposure to the trigger and ask a pharmacist about suitable treatment.',
            'Lubricating drops may help dry-eye comfort. Follow the label; do not use unprescribed medicated drops.',
            'Remove contact lenses and use glasses until the eye has recovered.',
            'Do not share eye drops, towels, or make-up.',
          ],
          sw: [
            'Epuka kusugua macho. Kifuniko cha baridi juu ya kope zilizofungwa kinaweza kupunguza kuwasha na uvimbe.',
            'Ikiwa una mzio, punguza kuwasiliana na kitu kinachouchochea na muulize mfamasia kuhusu matibabu yanayofaa.',
            'Matone ya kulainisha yanaweza kusaidia faraja ya macho kavu. Fuata lebo; usitumie matone ya dawa yasiyoagizwa.',
            'Toa lenzi za mawasiliano na tumia miwani hadi jicho lipone.',
            'Usishiriki matone ya macho, taulo, au vipodozi.',
          ],
        },
      },
      {
        heading: { en: 'Change the plan if...', sw: 'Badilisha mpango ikiwa...' },
        body: {
          en: [
            'The eye is very painful, very red, or sensitive to light.',
            'Vision becomes blurred, reduced, or changes suddenly.',
            'You wear contact lenses and develop a red or painful eye.',
            'A newborn or young baby has red eyes.',
            'Symptoms persist for more than a few days, keep returning, or you are worried.',
          ],
          sw: [
            'Jicho linauma sana, ni jekundu sana, au linawashwa na mwanga.',
            'Kuona kunavurugika, kupungua, au kubadilika ghafla.',
            'Umevaa lenzi za mawasiliano na unapata jicho jekundu au lenye maumivu.',
            'Mtoto mchanga au mdogo ana macho mekundu.',
            'Dalili zinaendelea kwa zaidi ya siku chache, zinarudi mara kwa mara, au una wasiwasi.',
          ],
        },
      },
    ],
    sourceIds: ['nhs-red-eye', 'nhs-dry-eyes', 'nhs-conjunctivitis', 'nhs-hay-fever', 'moorfields-allergic-conjunctivitis'],
    related: ['everyday-eye-care', 'contact-lens-safety', 'urgent-warning-signs'],
    keywords: {
      en: ['red eyes', 'itchy eyes', 'dry eyes', 'allergy', 'conjunctivitis', 'hay fever', 'gritty'],
      sw: ['macho mekundu', 'macho yanawasha', 'macho kavu', 'mzio', 'conjunctivitis', 'homa ya nyasi', 'mchanga'],
    },
  },
  {
    slug: 'childrens-eye-health',
    topic: 'children',
    title: { en: "Children's eye health: what to watch for", sw: 'Afya ya macho ya watoto: nini cha kuangalia' },
    summary: {
      en: 'Signs that a child may need an eye test, why children may not report poor vision, and when to seek urgent care.',
      sw: 'Dalili zinazoonyesha mtoto anaweza kuhitaji uchunguzi wa macho, kwa nini watoto hawasemi kuona vibaya, na wakati wa kutafuta huduma ya haraka.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    sections: [
      {
        heading: { en: 'Why eye tests matter', sw: 'Kwa nini uchunguzi wa macho ni muhimu' },
        body: {
          en: [
            'Children may not realise their vision is different because they have never seen any other way.',
            'An eye test can find refractive errors, squints, and other problems early, when treatment may work better.',
            'Eye tests are adapted to the child’s age and do not always require reading letters.',
            'Ask your eye-care provider how often your child needs a test, especially if there is a family history of glasses or eye disease.',
          ],
          sw: [
            'Watoto wanaweza wasitambue kuona kwao ni tofauti kwa sababu hawajawahi kuona kwa njia nyingine.',
            'Uchunguzi wa macho unaweza kugundua hitilafu za kuona, kuzungusha jicho, na matatizo mengine mapema, wakati matibabu yanaweza kufanya kazi vizuri zaidi.',
            'Uchunguzi wa macho hurekebishwa kwa umri wa mtoto na hautahitaji kusoma herufi kila wakati.',
            'Muulize mtoa huduma wa macho ni mara ngapi mtoto wako anahitaji uchunguzi, hasa ikiwa kuna historia ya familia ya miwani au ugonjwa wa macho.',
          ],
        },
      },
      {
        heading: { en: 'Signs to notice', sw: 'Dalili za kuangalia' },
        body: {
          en: [
            'Squinting, sitting very close to the TV or holding a phone very close.',
            'Tilting the head, covering one eye, or turning the head to see.',
            'One eye turning inward or outward, even occasionally.',
            'Frequent rubbing, redness, watering, or complaints of headache after close work.',
            'A white reflection in the pupil, a new squint, or sudden vision change needs prompt assessment.',
          ],
          sw: [
            'Kufinya macho, kukaa karibu sana na TV au kushika simu karibu sana.',
            'Kuinamisha kichwa, kufunika jicho moja, au kugeuza kichwa ili kuona.',
            'Jicho moja kugeuka ndani au nje, hata mara kwa mara.',
            'Kusugua mara kwa mara, uwekundu, maji, au malalamiko ya kichwa kuuma baada ya kazi za karibu.',
            'Mwanga mweupe kwenye mboni, kuzungusha jicho jipya, au mabadiliko ya ghafla ya kuona yanahitaji uchunguzi wa haraka.',
          ],
        },
      },
      {
        heading: { en: 'Prevention and urgent care', sw: 'Kinga na huduma ya dharura' },
        body: {
          en: [
            'Encourage outdoor play and regular breaks from screens.',
            'Store chemicals and sharp objects safely, and supervise children around fireworks and tools.',
            'Seek emergency care after a chemical splash, a penetrating injury, or a blow to the eye with pain or vision change.',
            'Do not delay an eye test because a child “seems fine”; some problems are silent.',
          ],
          sw: [
            'Himiza mchezo wa nje na mapumziko ya mara kwa mara kutoka kwenye skrini.',
            'Hifadhi kemikali na vitu vyenye ncha kali kwa usalama, na simamia watoto karibu na fataki na zana.',
            'Tafuta huduma ya dharura baada ya kemikali kumwagika, jeraha lililopenya, au kugongwa jichoni kwa maumivu au mabadiliko ya kuona.',
            'Usicheleweshe uchunguzi wa macho kwa sababu mtoto “anaonekana sawa”; matatizo mengine hayana dalili.',
          ],
        },
      },
    ],
    sourceIds: ['nhs-eye-tests-children', 'aao-children', 'who-blindness', 'aao-screen-time'],
    related: ['digital-eye-strain', 'refractive-errors-glasses', 'urgent-warning-signs'],
    keywords: {
      en: ['children', 'child eye test', 'squint', 'white pupil', 'school vision', 'kids glasses'],
      sw: ['watoto', 'uchunguzi wa macho watoto', 'kuzungusha jicho', 'mboni nyeupe', 'kuona shuleni', 'miwani ya watoto'],
    },
  },
  {
    slug: 'diabetes-and-eye-health',
    topic: 'diabetes',
    title: { en: 'Diabetes and eye health', sw: 'Kisukari na afya ya macho' },
    summary: {
      en: 'Why regular eye screening matters, what diabetic retinopathy can do, and which changes need urgent attention.',
      sw: 'Kwa nini uchunguzi wa macho wa mara kwa mara ni muhimu, diabetic retinopathy inaweza kufanya nini, na mabadiliko yanayohitaji huduma ya haraka.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    warning: {
      en: 'If you have diabetes and your vision suddenly worsens or becomes blurred, seek urgent medical advice.',
      sw: 'Ikiwa una kisukari na kuona kwako kunazidi kuwa mbaya ghafla au kuvurugika, tafuta ushauri wa haraka wa matibabu.',
    },
    sections: [
      {
        heading: { en: 'A silent problem', sw: 'Tatizo lisilo na dalili' },
        body: {
          en: [
            'Diabetic retinopathy affects the blood vessels at the back of the eye. It usually has no symptoms at first.',
            'It is found through diabetic eye screening, which is why screening matters even when you see well.',
            'In later stages it can cause worsening eyesight, blurred vision, floaters, or difficulty seeing in low light.',
            'Good control of blood sugar and blood pressure can reduce the risk of progression. Do not stop prescribed medicines without advice.',
          ],
          sw: [
            'Diabetic retinopathy huathiri mishipa ya damu nyuma ya jicho. Kwa kawaida haina dalili mwanzoni.',
            'Hugundulika kupitia uchunguzi wa macho wa kisukari, ndiyo sababu uchunguzi ni muhimu hata ukiona vizuri.',
            'Katika hatua za baadaye inaweza kusababisha kuona kuzidi kuwa mbaya, kuona ukungu, vitu vinavyoelea, au ugumu wa kuona kwenye mwanga hafifu.',
            'Kudhibiti vizuri sukari ya damu na shinikizo la damu kunaweza kupunguza hatari ya kuendelea. Usiacha dawa zilizoagizwa bila ushauri.',
          ],
        },
      },
      {
        heading: { en: 'What screening involves', sw: 'Uchunguzi unahusisha nini' },
        body: {
          en: [
            'Screening usually includes photographs of the retina, sometimes after drops to dilate the pupils.',
            'Your vision may be blurry for a few hours after dilation. Arrange travel home and avoid driving until it clears.',
            'Bring your current glasses, medicines, and any previous eye results.',
            'If you are pregnant and have diabetes, ask your care team about eye checks.',
          ],
          sw: [
            'Uchunguzi kwa kawaida huhusisha picha za retina, wakati mwingine baada ya matone ya kupanua mboni.',
            'Kuona kwako kunaweza kuwa ukungu kwa saa chache baada ya kupanua mboni. Panga safari ya kurudi na uepuke kuendesha hadi kipite.',
            'Chukua miwani ya sasa, dawa, na matokeo yoyote ya awali ya macho.',
            'Ikiwa una mimba na una kisukari, muulize timu yako ya huduma kuhusu uchunguzi wa macho.',
          ],
        },
      },
      {
        heading: { en: 'When to seek urgent advice', sw: 'Wakati wa kutafuta ushauri wa haraka' },
        body: {
          en: [
            'Sudden worsening or blurring of vision.',
            'A sudden increase in floaters, new flashes, or a shadow across vision.',
            'Severe eye pain or a painful red eye.',
            'These symptoms do not always mean retinopathy, but they need prompt assessment.',
          ],
          sw: [
            'Kuona kuzidi kuwa mbaya au kuvurugika ghafla.',
            'Kuongezeka kwa ghafla kwa vitu vinavyoelea, mianga mipya, au kivuli juu ya kuona.',
            'Maumivu makali ya jicho au jicho jekundu lenye maumivu.',
            'Dalili hizi hazimaanishi kila mara retinopathy, lakini zinahitaji uchunguzi wa haraka.',
          ],
        },
      },
    ],
    sourceIds: ['nhs-diabetic-retinopathy', 'nhs-vision-loss', 'aao-eye-exam', 'who-blindness'],
    related: ['preparing-for-eye-exam', 'urgent-warning-signs', 'refractive-errors-glasses'],
    keywords: {
      en: ['diabetes', 'diabetic retinopathy', 'screening', 'floaters', 'blood sugar', 'retina'],
      sw: ['kisukari', 'diabetic retinopathy', 'uchunguzi', 'vitu vinavyoelea', 'sukari ya damu', 'retina'],
    },
  },
  {
    slug: 'eye-injury-chemical',
    topic: 'emergencies',
    title: { en: 'Eye injury and chemical exposure: first actions', sw: 'Jeraha la jicho na kemikali: hatua za kwanza' },
    summary: {
      en: 'Immediate first aid for chemical splashes, foreign objects, and blows to the eye — and what not to do.',
      sw: 'Huduma ya kwanza ya haraka kwa kemikali kumwagika, vitu vigeni, na kugongwa jichoni — na nini kutosikufanya.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    warning: {
      en: 'For a chemical in the eye, start rinsing immediately with clean running water and seek emergency care. Do not delay.',
      sw: 'Kwa kemikali jichoni, anza kusafisha mara moja kwa maji safi yanayotiririka na tafuta huduma ya dharura. Usicheleweshe.',
    },
    sections: [
      {
        heading: { en: 'Chemical splash', sw: 'Kemikali kumwagika' },
        body: {
          en: [
            'Start rinsing the eye immediately with clean, running water. Keep the eyelid open.',
            'Continue for at least 15–20 minutes. Remove contact lenses if they come out easily.',
            'Do not try to neutralise the chemical with another substance.',
            'Call emergency services or go to the nearest emergency department. Take the container or chemical name if safe to do so.',
          ],
          sw: [
            'Anza kusafisha jicho mara moja kwa maji safi yanayotiririka. Fungua kope.',
            'Endelea kwa angalau dakika 15–20. Toa lenzi za mawasiliano ikiwa zinatoka kwa urahisi.',
            'Usijaribu kupunguza kemikali kwa dutu nyingine.',
            'Piga simu huduma za dharura au nenda hospitali ya dharura iliyo karibu. Chukua chupa au jina la kemikali ikiwa ni salama.',
          ],
        },
      },
      {
        heading: { en: 'Foreign object or penetrating injury', sw: 'Kitu kigeni au jeraha lililopenya' },
        body: {
          en: [
            'Do not rub the eye or try to remove anything that is stuck or embedded.',
            'Cover the eye lightly with a clean shield or cup that does not press on it.',
            'Go to emergency care immediately. Do not eat or drink in case surgery is needed, unless staff advise otherwise.',
            'If something loose is in the eye, gentle rinsing with clean water may help; if it remains, get urgent care.',
          ],
          sw: [
            'Usisugue jicho wala usijaribu kutoa kitu kilichokwama au kilichoingia ndani.',
            'Funika jicho kwa upole kwa kifuniko safi au kikombe kisichokandamiza.',
            'Nenda huduma ya dharura mara moja. Usile wala kunywa kwa sababu upasuaji unaweza kuhitajika, isipokuwa wataalamu wakuelekeze vinginevyo.',
            'Ikiwa kitu kilicho huru kiko jichoni, kusafisha kwa upole kwa maji safi kunaweza kusaidia; ikiwa kimebaki, pata huduma ya haraka.',
          ],
        },
      },
      {
        heading: { en: 'Blow to the eye', sw: 'Kugongwa jichoni' },
        body: {
          en: [
            'Apply a cold pack gently around the eye, not directly on it, if the eye is closed and the skin is intact.',
            'Seek urgent care if there is pain, vision change, bleeding, swelling that worsens, or you cannot move the eye normally.',
            'Do not drive yourself if your vision is affected.',
            'Prevention matters: use eye protection for work, sport, and chemicals, and store products safely.',
          ],
          sw: [
            'Weka kifuniko cha baridi kwa upole kuzunguka jicho, sio moja kwa moja juu yake, ikiwa jicho limefungwa na ngozi haijavunjika.',
            'Tafuta huduma ya haraka ikiwa kuna maumivu, mabadiliko ya kuona, damu, uvimbe unaozidi, au huwezi kusogeza jicho kawaida.',
            'Usiendeshe mwenyewe ikiwa kuona kwako kumeathirika.',
            'Kinga ni muhimu: tumia kinga ya macho kwa kazi, michezo, na kemikali, na hifadhi bidhaa kwa usalama.',
          ],
        },
      },
    ],
    sourceIds: ['nhs-eye-injuries', 'nhs-red-eye', 'nhs-vision-loss'],
    related: ['urgent-warning-signs', 'everyday-eye-care', 'contact-lens-safety'],
    keywords: {
      en: ['chemical eye injury', 'eye splash', 'foreign body', 'eye trauma', 'rinse eye', 'first aid'],
      sw: ['jeraha la jicho', 'kemikali jichoni', 'kitu jichoni', 'kugongwa jicho', 'kusafisha jicho', 'huduma ya kwanza'],
    },
  },
  {
    slug: 'urgent-warning-signs',
    topic: 'emergencies',
    title: { en: 'Warning signs that need urgent eye care', sw: 'Dalili za tahadhari zinazohitaji huduma ya macho ya haraka' },
    summary: {
      en: 'The red flags AskOptsam treats as urgent, with clear actions and no invented phone numbers or clinic hours.',
      sw: 'Dalili za hatari ambazo AskOptsam huchukulia kuwa za haraka, pamoja na hatua wazi na bila namba za simu au saa za kliniki zisizothibitishwa.',
    },
    readingMinutes: 4,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    warning: {
      en: 'This is not a complete list. If you are worried about your eyes, seek professional advice.',
      sw: 'Hii si orodha kamili. Ikiwa una wasiwasi kuhusu macho yako, tafuta ushauri wa kitaalamu.',
    },
    sections: [
      {
        heading: { en: 'Go to emergency care now for', sw: 'Nenda huduma ya dharura sasa kwa' },
        body: {
          en: [
            'A sudden loss or major reduction of vision in one or both eyes.',
            'Severe eye pain, especially with a red eye or vision change.',
            'A chemical in the eye — rinse immediately and keep rinsing while seeking help.',
            'A penetrating injury, an object stuck in the eye, or serious trauma.',
            'A painful red eye with vision changes.',
            'Sudden flashes, a sudden increase in floaters, or a dark shadow or curtain across vision.',
            'Severe eye pain with headache, nausea, or vomiting, which can be a sign of acute glaucoma.',
          ],
          sw: [
            'Kupoteza au kupungua sana kwa kuona ghafla kwenye jicho moja au yote mawili.',
            'Maumivu makali ya jicho, hasa pamoja na jicho jekundu au mabadiliko ya kuona.',
            'Kemikali jichoni — safisha mara moja na uendelee kusafisha wakati unatafuta msaada.',
            'Jeraha lililopenya, kitu kilichokwama jichoni, au jeraha kubwa.',
            'Jicho jekundu lenye maumivu pamoja na mabadiliko ya kuona.',
            'Mianga ya ghafla, kuongezeka kwa ghafla kwa vitu vinavyoelea, au kivuli au pazia jeusi juu ya kuona.',
            'Maumivu makali ya jicho pamoja na kichwa kuuma, kichefuchefu, au kutapika, ambayo inaweza kuwa dalili ya glaucoma ya ghafla.',
          ],
        },
      },
      {
        heading: { en: 'Urgent, same-day advice for', sw: 'Ushauri wa haraka, siku hiyo hiyo kwa' },
        body: {
          en: [
            'A red or painful eye while wearing contact lenses.',
            'Eye pain with light sensitivity.',
            'A sudden change in vision that is not a complete loss.',
            'A significant eye injury, even if it seems to improve.',
            'Red eyes in a newborn or very young baby.',
          ],
          sw: [
            'Jicho jekundu au lenye maumivu wakati umevaa lenzi za mawasiliano.',
            'Maumivu ya jicho pamoja na mwanga kuwasha.',
            'Mabadiliko ya ghafla ya kuona ambayo si kupoteza kabisa.',
            'Jeraha kubwa la jicho, hata likionekana kupungua.',
            'Macho mekundu kwa mtoto mchanga au mdogo sana.',
          ],
        },
      },
      {
        heading: { en: 'Do not do this', sw: 'Usifanye hivi' },
        body: {
          en: [
            'Do not wait for a routine appointment when a red flag is present.',
            'Do not try to remove an embedded object or press on the eye.',
            'Do not use someone else’s drops or leftover prescription medicine.',
            'Do not drive yourself if your vision is affected.',
            'Do not include a phone number, address, or ID in a chat message.',
          ],
          sw: [
            'Usisubiri miadi ya kawaida wakati dalili ya hatari ipo.',
            'Usijaribu kutoa kitu kilichoingia ndani wala usikandamize jicho.',
            'Usitumie matone ya mtu mwingine au dawa za zamani zilizoagizwa.',
            'Usiendeshe mwenyewe ikiwa kuona kwako kumeathirika.',
            'Usijumuishe namba ya simu, anwani, au kitambulisho kwenye ujumbe wa mazungumzo.',
          ],
        },
      },
    ],
    sourceIds: [
      'nhs-vision-loss',
      'nhs-red-eye',
      'nhs-eye-pain',
      'nhs-eye-injuries',
      'moorfields-flashes-floaters',
      'nhs-glaucoma',
      'moorfields-contact-lens',
    ],
    related: ['eye-injury-chemical', 'contact-lens-safety', 'red-itchy-dry-eyes'],
    keywords: {
      en: ['emergency', 'warning signs', 'sudden vision loss', 'severe pain', 'chemical', 'flashes', 'floaters', 'curtain'],
      sw: ['dharura', 'dalili za tahadhari', 'kupoteza kuona ghafla', 'maumivu makali', 'kemikali', 'mianga', 'vitu vinavyoelea', 'pazia'],
    },
  },
  {
    slug: 'preparing-for-eye-exam',
    topic: 'checkups',
    title: { en: 'Preparing for an eye examination', sw: 'Kujiandaa kwa uchunguzi wa macho' },
    summary: {
      en: 'What to bring, what may happen during the visit, and how to make the most of your appointment.',
      sw: 'Nini cha kuchukua, kinachoweza kutokea wakati wa ziara, na jinsi ya kufaidika zaidi na miadi yako.',
    },
    readingMinutes: 3,
    reviewedAt: '2026-10-19',
    clinicalReview: 'pending',
    sections: [
      {
        heading: { en: 'Before the appointment', sw: 'Kabla ya miadi' },
        body: {
          en: [
            'Bring your current glasses or contact lenses, and any previous eye prescriptions or results.',
            'Bring a list of medicines, including eye drops, and mention allergies.',
            'Write down your main questions and when your symptoms started.',
            'Ask whether you need someone to accompany you, especially if drops will dilate your pupils.',
            'Do not include identifying details in an online chat; save them for the clinic.',
          ],
          sw: [
            'Chukua miwani au lenzi za mawasiliano za sasa, na namba au matokeo yoyote ya awali ya macho.',
            'Chukua orodha ya dawa, pamoja na matone ya macho, na taja mzio.',
            'Andika maswali yako makuu na dalili zilipoanza.',
            'Uliza ikiwa unahitaji mtu wa kukuandamana, hasa ikiwa matone yatapanua mboni zako.',
            'Usijumuishe taarifa zinazokutambulisha kwenye mazungumzo ya mtandaoni; ziweke kwa kliniki.',
          ],
        },
      },
      {
        heading: { en: 'What may happen', sw: 'Kinachoweza kutokea' },
        body: {
          en: [
            'The examination may include vision testing, eye pressure measurement, and a look at the front and back of the eye.',
            'Drops may be used to dilate the pupils. This can cause temporary blurry vision and light sensitivity for a few hours.',
            'Some tests involve bright lights or a puff of air; they are usually quick.',
            'Tell the clinician if you are pregnant, have diabetes, or take blood thinners.',
          ],
          sw: [
            'Uchunguzi unaweza kuhusisha kupima kuona, kupima shinikizo la jicho, na kuangalia mbele na nyuma ya jicho.',
            'Matone yanaweza kutumika kupanua mboni. Hii inaweza kusababisha kuona ukungu kwa muda na mwanga kuwasha kwa saa chache.',
            'Majaribio mengine huhusisha mwanga mkali au upepo mfupi; kwa kawaida ni ya haraka.',
            'Mwambie daktari ikiwa una mimba, una kisukari, au unatumia dawa za kupunguza damu.',
          ],
        },
      },
      {
        heading: { en: 'After the appointment', sw: 'Baada ya miadi' },
        body: {
          en: [
            'Follow the instructions you were given, including how and when to use any prescribed drops.',
            'Ask when you should return and what changes should prompt an earlier visit.',
            'If your vision becomes suddenly worse, you develop severe pain, or you have a new shadow or flashes, seek urgent care.',
          ],
          sw: [
            'Fuata maelekezo uliyopewa, pamoja na jinsi na wakati wa kutumia matone yaliyoagizwa.',
            'Uliza ni lini unapaswa kurudi na mabadiliko gani yanapaswa kukufanya urudi mapema.',
            'Ikiwa kuona kwako kunakuwa mbaya ghafla, unapata maumivu makali, au kivuli kipya au mianga, tafuta huduma ya haraka.',
          ],
        },
      },
    ],
    sourceIds: ['aao-eye-exam', 'nhs-eye-tests-children', 'nhs-diabetic-retinopathy'],
    related: ['refractive-errors-glasses', 'diabetes-and-eye-health', 'childrens-eye-health'],
    keywords: {
      en: ['eye exam', 'eye test', 'dilated pupils', 'optometrist', 'appointment', 'what to bring'],
      sw: ['uchunguzi wa macho', 'mtihani wa macho', 'kupanua mboni', 'daktari wa macho', 'miadi', 'nini cha kuchukua'],
    },
  },
];

export const articleBySlug = new Map(articles.map((article) => [article.slug, article]));

export function getArticle(slug: string): Article | undefined {
  return articleBySlug.get(slug);
}

export function articleTitle(article: Article, lang: Lang): string {
  return article.title[lang];
}
