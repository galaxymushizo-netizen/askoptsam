import type { Lang } from '../i18n/config';

export interface LegalText {
  en: string;
  sw: string;
}

export interface LegalBlock {
  type: 'p' | 'ul';
  text?: LegalText;
  items?: LegalText[];
}

export interface LegalSection {
  id: string;
  heading: LegalText;
  blocks: LegalBlock[];
}

export const legalMeta = {
  version: '2026-10-19',
  lastUpdated: '19 October 2026',
  draftNote: {
    en: 'Draft for review. This document is not a legal opinion and has not been reviewed by Tanzanian or other East African counsel. Do not treat it as a compliance certification.',
    sw: 'Rasimu kwa ukaguzi. Hati hii si maoni ya kisheria na haijapitia ukaguzi wa wanasheria wa Tanzania au nchi nyingine za Afrika Mashariki. Usiichukulie kama uthibitisho wa uzingatiaji wa sheria.',
  },
} as const;

export const privacySections: LegalSection[] = [
  {
    id: 'scope',
    heading: { en: '1. Who we are and what this notice covers', sw: '1. Sisi ni nani na taarifa hii inahusu nini' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'AskOptsam is an eye-health education product associated with Optsam Eye Care. Public contact and location details are pending verification and are not published in this deployment. This notice describes how AskOptsam handles information when you use the website and chat.',
          sw: 'AskOptsam ni bidhaa ya elimu ya afya ya macho inayohusiana na Optsam Eye Care. Taarifa za mawasiliano na eneo zinasubiri uthibitisho na hazichapishwi kwenye usambazaji huu. Taarifa hii inaeleza jinsi AskOptsam inavyoshughulikia taarifa unapotumia tovuti na mazungumzo.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'This is a draft prepared for product and legal review. It is not legal advice, and it does not yet describe a final verified data-controller identity, lawful basis assessment, or cross-border transfer mechanism.',
          sw: 'Hii ni rasimu iliyoandaliwa kwa ukaguzi wa bidhaa na kisheria. Si ushauri wa kisheria, na bado haielezi utambulisho wa msimamizi wa data uliothibitishwa, tathmini ya msingi wa kisheria, au utaratibu wa uhamishaji wa data kuvuka mipaka.',
        },
      },
    ],
  },
  {
    id: 'collect',
    heading: { en: '2. What we collect', sw: '2. Tunakusanya nini' },
    blocks: [
      {
        type: 'ul',
        items: [
          {
            en: 'Message text you choose to send, the language you select, and the assistant reply.',
            sw: 'Maandishi ya ujumbe unaochagua kutuma, lugha unayochagua, na jibu la msaidizi.',
          },
          {
            en: 'Technical data needed to operate and protect the service, such as a short-lived request identifier and a rate-limit key derived from your IP address. The rate-limit key is held in server memory and is not written to the database.',
            sw: 'Data ya kiufundi inayohitajika kuendesha na kulinda huduma, kama kitambulisho cha ombi cha muda mfupi na kitufe cha kikomo cha maombi kinachotokana na anwani yako ya IP. Kitufe cha kikomo huhifadhiwa kwenye kumbukumbu ya seva na hakiandikwi kwenye hifadhidata.',
          },
          {
            en: 'If you create an account: your email address, authentication data managed by Supabase Auth, your language preference, and your save-history preference.',
            sw: 'Ikiwa unaunda akaunti: anwani yako ya barua pepe, data ya uthibitishaji inayosimamiwa na Supabase Auth, lugha unayopendelea, na mapendeleo yako ya kuhifadhi historia.',
          },
          {
            en: 'If you choose to save a conversation: the conversation title, messages, assistant metadata (such as sources and safety guidance), and an append-only consent record.',
            sw: 'Ikiwa unachagua kuhifadhi mazungumzo: kichwa cha mazungumzo, ujumbe, metadata ya msaidizi (kama vyanzo na mwongozo wa usalama), na kumbukumbu ya idhini isiyobadilishwa.',
          },
          {
            en: 'We do not accept image uploads in this MVP. The image endpoint is disabled and does not read, store, or forward image data.',
            sw: 'Hatukubali kupakiwa kwa picha kwenye MVP hii. Kiungo cha picha kimezimwa na hakisomi, hakihifadhi, wala hakisambazi data ya picha.',
          },
        ],
      },
      {
        type: 'p',
        text: {
          en: 'Please do not include names, phone numbers, ID numbers, addresses, or other identifying details in a chat message. The service asks you not to do so, but it cannot reliably detect every identifier.',
          sw: 'Tafadhali usijumuishe majina, namba za simu, namba za kitambulisho, anwani, au taarifa zingine zinazokutambulisha kwenye ujumbe wa mazungumzo. Huduma inakuomba usifanye hivyo, lakini haiwezi kugundua kila kitambulisho kwa uhakika.',
        },
      },
    ],
  },
  {
    id: 'temporary',
    heading: { en: '3. Temporary chat', sw: '3. Mazungumzo ya muda' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'If you are not signed in, or you do not choose to save, the conversation is not written to the AskOptsam database. It is held in the browser tab using session storage so that a page refresh does not erase it. It is cleared when you clear the chat or close the tab. Your browser and device may retain copies in memory, history, or backups outside our control.',
          sw: 'Ikiwa hujaingia, au huchagui kuhifadhi, mazungumzo hayo hayaandikwi kwenye hifadhidata ya AskOptsam. Yanahifadhiwa kwenye kichupo cha kivinjari kwa kutumia kumbukumbu ya kikao ili kuonyesha upya ukurasa kusiweze kuyafuta. Yanafutwa unaposafisha mazungumzo au kufunga kichupo. Kivinjari na kifaa chako vinaweza kubaki na nakala kwenye kumbukumbu, historia, au nakala rudufu zisizo chini ya udhibiti wetu.',
        },
      },
    ],
  },
  {
    id: 'ai',
    heading: { en: '4. AI providers and demo mode', sw: '4. Watoa huduma wa AI na hali ya demo' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Live AI is enabled only when the operator has configured a provider and recorded a privacy review. In that configuration, the message text needed to answer your question may be sent to the configured third-party AI provider. The provider may process it outside Tanzania. The current provider label is shown on the Service status page. Provider terms and data-processing arrangements must be reviewed before live mode is enabled.',
          sw: 'AI hai huwashwa tu wakati msimamizi ameweka mtoa huduma na kurekodi ukaguzi wa faragha. Katika usanidi huo, maandishi ya ujumbe yanayohitajika kujibu swali lako yanaweza kutumwa kwa mtoa huduma wa AI wa nje aliyewekwa. Mtoa huduma anaweza kuchakata data nje ya Tanzania. Jina la mtoa huduma wa sasa linaonyeshwa kwenye ukurasa wa Hali ya huduma. Masharti ya mtoa huduma na mipango ya uchakataji wa data lazima ipitiwe kabla ya kuwezesha hali ya AI hai.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'If the deployment is in demo mode, no message is sent to an AI provider. Demo replies are pre-written educational content and are labelled as such. Safety triage runs locally from deterministic rules and does not call a provider.',
          sw: 'Ikiwa usambazaji uko katika hali ya demo, hakuna ujumbe unaotumwa kwa mtoa huduma wa AI. Majibu ya demo ni maudhui ya elimu yaliyoandaliwa tayari na yanawekwa alama kuwa hivyo. Uchunguzi wa usalama hufanyika ndani kwa kanuni zisizobadilika na hauwasiliani na mtoa huduma.',
        },
      },
    ],
  },
  {
    id: 'basis',
    heading: { en: '5. Why we process information', sw: '5. Kwa nini tunachakata taarifa' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'This draft anticipates the following purposes: providing the educational service you request; protecting the service from abuse and controlling costs; maintaining optional accounts and saved history when you consent; meeting legal obligations; and improving safety rules using aggregated, non-identifying observations. Health information can be sensitive. Where consent is the basis, you can withdraw it, but that does not affect processing that already occurred.',
          sw: 'Rasimu hii inatarajia madhumuni yafuatayo: kutoa huduma ya elimu unayoomba; kulinda huduma dhidi ya matumizi mabaya na kudhibiti gharama; kudumisha akaunti za hiari na historia iliyohifadhiwa unapotoa idhini; kutimiza wajibu wa kisheria; na kuboresha kanuni za usalama kwa kutumia uchunguzi wa jumla usioonyesha utambulisho. Taarifa za afya zinaweza kuwa nyeti. Pale idhini ni msingi, unaweza kuiondoa, lakini hiyo haiathiri uchakataji uliofanyika tayari.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'A qualified legal review must confirm the lawful basis and any additional requirements under applicable Tanzanian and East African data-protection law before public launch.',
          sw: 'Ukaguzi wa kisheria uliohitimu lazima uthibitishe msingi wa kisheria na mahitaji yoyote ya ziada chini ya sheria za ulinzi wa data za Tanzania na Afrika Mashariki kabla ya kuzindua hadharani.',
        },
      },
    ],
  },
  {
    id: 'retention',
    heading: { en: '6. Retention', sw: '6. Uhifadhi' },
    blocks: [
      {
        type: 'ul',
        items: [
          {
            en: 'Temporary chat: not stored in the AskOptsam database; session storage is cleared when the tab closes or you clear the chat.',
            sw: 'Mazungumzo ya muda: hayahifadhiwi kwenye hifadhidata ya AskOptsam; kumbukumbu ya kikao hufutwa kichupo kinapofungwa au unaposafisha mazungumzo.',
          },
          {
            en: 'Saved conversations: kept until you delete them or delete your account. Deleting a conversation removes its messages through a database cascade.',
            sw: 'Mazungumzo yaliyohifadhiwa: huhifadhiwa hadi uyafute au ufute akaunti yako. Kufuta mazungumzo huondoa ujumbe wake kupitia mfumo wa hifadhidata.',
          },
          {
            en: 'Consent records: kept while the account exists so the operator can demonstrate consent. They are deleted with the account.',
            sw: 'Kumbukumbu za idhini: huhifadhiwa wakati akaunti ipo ili msimamizi aweze kuthibitisha idhini. Hufutwa pamoja na akaunti.',
          },
          {
            en: 'Server logs and backups: retention depends on the hosting and Supabase configuration. This MVP does not log chat text in application logs, but infrastructure providers may keep standard access logs.',
            sw: 'Kumbukumbu za seva na nakala rudufu: uhifadhi unategemea usanidi wa mwenyeji na Supabase. MVP hii haiandiki maandishi ya mazungumzo kwenye kumbukumbu za programu, lakini watoa huduma wa miundombinu wanaweza kuhifadhi kumbukumbu za kawaida za ufikiaji.',
          },
        ],
      },
    ],
  },
  {
    id: 'rights',
    heading: { en: '7. Your choices and rights', sw: '7. Chaguo na haki zako' },
    blocks: [
      {
        type: 'ul',
        items: [
          {
            en: 'Use temporary chat without creating an account.',
            sw: 'Tumia mazungumzo ya muda bila kuunda akaunti.',
          },
          {
            en: 'Choose whether to save each conversation. You can delete individual conversations or all saved conversations from Saved chats.',
            sw: 'Chagua kuhifadhi au kutohifadhi kila mazungumzo. Unaweza kufuta mazungumzo moja au yote yaliyohifadhiwa kutoka Mazungumzo yaliyohifadhiwa.',
          },
          {
            en: 'Change your language and default saving preference under Account.',
            sw: 'Badilisha lugha na mapendeleo ya msingi ya kuhifadhi chini ya Akaunti.',
          },
          {
            en: 'Delete your account under Account. Complete deletion requires the operator to configure the server-side Supabase service-role key. If it is missing, the site tells you instead of claiming deletion succeeded.',
            sw: 'Futa akaunti yako chini ya Akaunti. Kufuta kikamilifu kunahitaji msimamizi kuweka ufunguo wa service-role wa Supabase upande wa seva. Ikiwa haupo, tovuti inakueleza badala ya kudai kufuta kumefanikiwa.',
          },
          {
            en: 'Request access, correction, or further information from the operator. Public contact details are pending verification and must be added before launch.',
            sw: 'Omba ufikiaji, marekebisho, au taarifa zaidi kutoka kwa msimamizi. Taarifa za mawasiliano za umma zinasubiri uthibitisho na lazima ziongezwe kabla ya kuzindua.',
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    heading: { en: '8. Security', sw: '8. Usalama' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'The design uses HTTPS, server-only API keys, httpOnly auth cookies, row-level security in Supabase, request rate limits, AI budgets, and a server-side output guard. No system is perfectly secure. Do not send information you would not want processed by a third-party AI provider if live mode is enabled.',
          sw: 'Muundo unatumia HTTPS, funguo za API zinazobaki kwenye seva, vidakuzi vya uthibitisho vya httpOnly, usalama wa ngazi ya safu kwenye Supabase, vikomo vya maombi, bajeti za AI, na ulinzi wa matokeo upande wa seva. Hakuna mfumo salama kikamilifu. Usitume taarifa ambazo hutarajii kuchakatwa na mtoa huduma wa AI wa nje ikiwa hali ya AI hai imewashwa.',
        },
      },
    ],
  },
  {
    id: 'children',
    heading: { en: '9. Children', sw: '9. Watoto' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'AskOptsam is written for adults seeking eye-health information, including caregivers asking about a child. It is not directed to children, and an account should not be created for a child by a child. A parent or guardian should decide whether to use the service and should seek professional care for a child’s eye symptoms.',
          sw: 'AskOptsam imeandaliwa kwa watu wazima wanaotafuta taarifa za afya ya macho, ikiwa ni pamoja na walezi wanaouliza kuhusu mtoto. Haielekezwi kwa watoto, na akaunti haipaswi kuundwa kwa mtoto na mtoto. Mzazi au mlezi anapaswa kuamua kutumia huduma na kutafuta huduma ya kitaalamu kwa dalili za macho za mtoto.',
        },
      },
    ],
  },
  {
    id: 'cookies',
    heading: { en: '10. Cookies and local storage', sw: '10. Vidakuzi na hifadhi ya ndani' },
    blocks: [
      {
        type: 'ul',
        items: [
          {
            en: 'A language cookie remembers whether you chose English or Kiswahili.',
            sw: 'Kidakuzi cha lugha hukumbuka ikiwa umechagua Kiingereza au Kiswahili.',
          },
          {
            en: 'Supabase session cookies keep you signed in if you create an account. They are httpOnly.',
            sw: 'Vidakuzi vya kikao vya Supabase hukuweka umeingia ikiwa unaunda akaunti. Ni httpOnly.',
          },
          {
            en: 'Session storage keeps an unsaved conversation inside the current browser tab.',
            sw: 'Hifadhi ya kikao huhifadhi mazungumzo yasiyohifadhiwa ndani ya kichupo cha sasa cha kivinjari.',
          },
          {
            en: 'This MVP does not include advertising trackers or third-party analytics.',
            sw: 'MVP hii haijumuishi vifuatiliaji vya matangazo au uchanganuzi wa watu wengine.',
          },
        ],
      },
    ],
  },
  {
    id: 'changes',
    heading: { en: '11. Changes and contact', sw: '11. Mabadiliko na mawasiliano' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'This notice may change as the product, providers, and legal review develop. The policy version is recorded with saved-history consent. Verified contact details must be published before public launch; until then, do not rely on any contact detail found elsewhere online.',
          sw: 'Taarifa hii inaweza kubadilika kadri bidhaa, watoa huduma, na ukaguzi wa kisheria unavyoendelea. Toleo la sera linarekodiwa pamoja na idhini ya historia iliyohifadhiwa. Taarifa za mawasiliano zilizothibitishwa lazima zichapishwe kabla ya kuzindua hadharani; hadi wakati huo, usitegemee taarifa yoyote ya mawasiliano inayopatikana mtandaoni.',
        },
      },
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    id: 'acceptance',
    heading: { en: '1. Acceptance and eligibility', sw: '1. Kukubali na sifa za mtumiaji' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'By using AskOptsam, you agree to these terms. If you do not agree, do not use the service. You must be at least 18 years old, or use the service with the involvement of a parent or guardian. The service is intended for general educational use in English and Kiswahili.',
          sw: 'Kwa kutumia AskOptsam, unakubali masharti haya. Ikiwa hukubali, usitumie huduma. Lazima uwe na umri wa angalau miaka 18, au utumie huduma kwa ushiriki wa mzazi au mlezi. Huduma imekusudiwa kwa matumizi ya elimu ya jumla kwa Kiingereza na Kiswahili.',
        },
      },
    ],
  },
  {
    id: 'education',
    heading: { en: '2. Educational service, not medical care', sw: '2. Huduma ya elimu, si huduma ya matibabu' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'AskOptsam provides general eye-health information. It is not a doctor, optometrist, ophthalmologist, pharmacist, or emergency service. It does not create a clinician–patient relationship. It cannot examine your eyes, measure vision or eye pressure, diagnose a condition, rule out a serious cause, prescribe medicine, or provide a dosage.',
          sw: 'AskOptsam hutoa taarifa za jumla za afya ya macho. Si daktari, daktari wa macho, mtaalamu wa magonjwa ya macho, mfamasia, au huduma ya dharura. Haiundi uhusiano wa daktari na mgonjwa. Haiwezi kuchunguza macho yako, kupima kuona au shinikizo la jicho, kutambua ugonjwa, kuondoa sababu kubwa, kuagiza dawa, au kutoa kipimo.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'Always seek the advice of a qualified eye-care professional with questions about a medical condition. Never disregard professional advice or delay seeking it because of something you read on AskOptsam.',
          sw: 'Daima tafuta ushauri wa mtaalamu wa macho aliyehitimu kwa maswali kuhusu hali ya matibabu. Kamwe usipuuze ushauri wa kitaalamu au kuchelewesha kuutafuta kwa sababu ya kitu ulichosoma kwenye AskOptsam.',
        },
      },
    ],
  },
  {
    id: 'emergency',
    heading: { en: '3. Emergencies', sw: '3. Dharura' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Do not use AskOptsam for an emergency. For sudden vision loss, severe eye pain, a chemical in the eye, a penetrating injury, a sudden curtain or shadow across vision, or another urgent symptom, call your local emergency number or go to the nearest emergency department immediately. AskOptsam cannot rule out an emergency and may not be available.',
          sw: 'Usitumie AskOptsam kwa dharura. Kwa kupoteza kuona ghafla, maumivu makali ya jicho, kemikali jichoni, jeraha lililopenya, pazia au kivuli cha ghafla juu ya kuona, au dalili nyingine ya haraka, piga simu huduma ya dharura ya eneo lako au nenda moja kwa moja kwenye hospitali ya dharura iliyo karibu. AskOptsam haiwezi kuondoa uwezekano wa dharura na inaweza isipatikane.',
        },
      },
    ],
  },
  {
    id: 'ai-limits',
    heading: { en: '4. AI and content limitations', sw: '4. Mipaka ya AI na maudhui' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Replies may be generated by an AI provider, by pre-written demo content, or by deterministic safety rules. AI output can be incomplete, inaccurate, out of date, or inappropriate for your situation. Source citations indicate where general information came from; they do not make a reply a diagnosis or a substitute for an examination. The education library and source links are provided for general information and are subject to editorial and clinical review.',
          sw: 'Majibu yanaweza kuzalishwa na mtoa huduma wa AI, na maudhui ya demo yaliyoandaliwa tayari, au na kanuni za usalama zisizobadilika. Matokeo ya AI yanaweza kuwa hayakamiliki, yasiyo sahihi, ya zamani, au yasiyofaa kwa hali yako. Marejeleo ya vyanzo yanaonyesha taarifa za jumla zilitoka wapi; hayafanyi jibu kuwa utambuzi au mbadala wa uchunguzi. Maktaba ya elimu na viungo vya vyanzo vinatolewa kwa taarifa ya jumla na vinaweza kupitiwa kwa uhariri na kitabibu.',
        },
      },
    ],
  },
  {
    id: 'acceptable',
    heading: { en: '5. Acceptable use', sw: '5. Matumizi yanayokubalika' },
    blocks: [
      {
        type: 'ul',
        items: [
          {
            en: 'Do not use the service to seek or provide emergency care, a diagnosis, a prescription, or treatment for a specific person.',
            sw: 'Usitumie huduma kutafuta au kutoa huduma ya dharura, utambuzi, agizo la dawa, au matibabu kwa mtu maalum.',
          },
          {
            en: 'Do not send another person’s identifying or health information without lawful authority.',
            sw: 'Usitume taarifa zinazomtambulisha mtu mwingine au taarifa za afya bila mamlaka halali.',
          },
          {
            en: 'Do not attempt to bypass rate limits, budgets, authentication, safety rules, or output protections.',
            sw: 'Usijaribu kupita vikomo vya maombi, bajeti, uthibitishaji, kanuni za usalama, au ulinzi wa matokeo.',
          },
          {
            en: 'Do not use the service for unlawful, abusive, discriminatory, or harmful purposes, or to scrape or overload it.',
            sw: 'Usitumie huduma kwa madhumuni yasiyo halali, ya unyanyasaji, ya ubaguzi, au yenye madhara, au kuichambua au kuilemea.',
          },
        ],
      },
    ],
  },
  {
    id: 'accounts',
    heading: { en: '6. Accounts and saved history', sw: '6. Akaunti na historia iliyohifadhiwa' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Accounts are optional. You are responsible for keeping your password confidential and for activity under your account. Saving is opt-in per conversation and requires consent. You can delete conversations or your account. Complete account deletion depends on the operator configuring the server-side service-role key; the site will not claim success if it cannot complete deletion.',
          sw: 'Akaunti ni za hiari. Unawajibika kutunza nenosiri lako kwa siri na kwa shughuli zinazofanyika chini ya akaunti yako. Kuhifadhi ni kwa hiari kwa kila mazungumzo na kunahitaji idhini. Unaweza kufuta mazungumzo au akaunti yako. Kufuta akaunti kikamilifu kunategemea msimamizi kuweka ufunguo wa service-role upande wa seva; tovuti haitadai kufanikiwa ikiwa haiwezi kukamilisha kufuta.',
        },
      },
    ],
  },
  {
    id: 'ip',
    heading: { en: '7. Intellectual property', sw: '7. Haki miliki' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'The AskOptsam name, design, and original educational text are protected by applicable law. Source material remains the property of its publishers and is used with attribution and links. You may use replies for your own personal, non-commercial understanding. Do not republish substantial parts of the library or present AskOptsam content as clinical advice.',
          sw: 'Jina la AskOptsam, muundo, na maandishi ya awali ya elimu yanalindwa na sheria zinazotumika. Nyenzo za vyanzo zinabaki mali ya wachapishaji wake na hutumika kwa kutaja na viungo. Unaweza kutumia majibu kwa uelewa wako wa kibinafsi usio wa kibiashara. Usichapishe sehemu kubwa za maktaba au kuwasilisha maudhui ya AskOptsam kama ushauri wa kitabibu.',
        },
      },
    ],
  },
  {
    id: 'third-party',
    heading: { en: '8. Third-party services and links', sw: '8. Huduma na viungo vya watu wengine' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'The service may rely on Supabase for authentication and stored history, and on a third-party AI provider when live mode is enabled. Their terms and privacy practices apply to their processing. External source links lead to third-party websites whose content and availability we do not control.',
          sw: 'Huduma inaweza kutegemea Supabase kwa uthibitishaji na historia iliyohifadhiwa, na mtoa huduma wa AI wa nje wakati hali ya AI hai imewashwa. Masharti na desturi zao za faragha zinatumika kwa uchakataji wao. Viungo vya vyanzo vya nje vinaelekea kwenye tovuti za watu wengine ambazo maudhui na upatikanaji wake hatudhibiti.',
        },
      },
    ],
  },
  {
    id: 'liability',
    heading: { en: '9. Disclaimers and limitation of liability', sw: '9. Kanusho na kikomo cha dhima' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'To the maximum extent permitted by applicable law, AskOptsam and Optsam Eye Care provide the service “as is” and disclaim implied warranties, including fitness for a particular purpose. They are not liable for indirect, incidental, special, or consequential loss arising from use of the service or reliance on its content. Nothing in these terms excludes liability that cannot lawfully be excluded. This clause is a draft and requires legal review.',
          sw: 'Kwa kiwango cha juu kinachoruhusiwa na sheria inayotumika, AskOptsam na Optsam Eye Care hutoa huduma “kama ilivyo” na wanakanusha dhamana zisizo wazi, ikiwa ni pamoja na kufaa kwa madhumuni maalum. Hawawajibiki kwa hasara isiyo ya moja kwa moja, ya bahati nasibu, maalum, au inayotokana na matumizi ya huduma au kutegemea maudhui yake. Hakuna katika masharti haya kinachoondoa dhima ambayo haiwezi kuondolewa kisheria. Kifungu hiki ni rasimu na kinahitaji ukaguzi wa kisheria.',
        },
      },
    ],
  },
  {
    id: 'changes',
    heading: { en: '10. Changes, termination, and governing law', sw: '10. Mabadiliko, kusitisha, na sheria inayotumika' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'We may update the service or these terms. Material changes should be communicated before they take effect. We may suspend access for abuse, security, legal, or operational reasons. This draft anticipates the laws of Tanzania, without prejudice to mandatory consumer or data-protection rights. A qualified lawyer must confirm the governing law, dispute process, and required consumer disclosures before launch.',
          sw: 'Tunaweza kusasisha huduma au masharti haya. Mabadiliko makubwa yanapaswa kuwasilishwa kabla ya kuanza kutumika. Tunaweza kusitisha ufikiaji kwa sababu za matumizi mabaya, usalama, kisheria, au uendeshaji. Rasimu hii inatarajia sheria za Tanzania, bila kuathiri haki za lazima za watumiaji au ulinzi wa data. Mwanasheria aliyehitimu lazima athibitishe sheria inayotumika, mchakato wa migogoro, na ufichuzi wa lazima kwa watumiaji kabla ya kuzindua.',
        },
      },
    ],
  },
];

export const medicalSections: LegalSection[] = [
  {
    id: 'not-medical',
    heading: { en: 'AskOptsam is not medical care', sw: 'AskOptsam si huduma ya matibabu' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'AskOptsam provides general eye-health education in English and Kiswahili. It does not provide medical advice for your specific circumstances, diagnose a condition, rule out a serious cause, prescribe or supply medicine, recommend a dose, or replace an examination by a licensed eye-care professional.',
          sw: 'AskOptsam hutoa elimu ya jumla ya afya ya macho kwa Kiingereza na Kiswahili. Haitoi ushauri wa kitabibu kwa hali yako mahususi, haitambui ugonjwa, haiondoi sababu kubwa, haiagizi au kutoa dawa, haipendekezi kipimo, wala haichukui nafasi ya uchunguzi wa mtaalamu wa macho aliyeidhinishwa.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'No doctor–patient or clinician–patient relationship is created by using AskOptsam. A reply may be generated by AI, by pre-written demo content, or by deterministic safety rules. AI can be wrong, incomplete, or out of date, and it cannot see your eyes.',
          sw: 'Hakuna uhusiano wa daktari na mgonjwa au mtaalamu na mgonjwa unaoundwa kwa kutumia AskOptsam. Jibu linaweza kuzalishwa na AI, maudhui ya demo yaliyoandaliwa tayari, au kanuni za usalama zisizobadilika. AI inaweza kukosea, kukosa sehemu, au kuwa ya zamani, na haiwezi kuona macho yako.',
        },
      },
    ],
  },
  {
    id: 'emergency',
    heading: { en: 'Do not wait in an emergency', sw: 'Usisubiri katika dharura' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Seek emergency care immediately for sudden loss or major reduction of vision, severe eye pain, a chemical in the eye, a penetrating injury or object stuck in the eye, a sudden curtain or shadow across vision, new flashes with floaters, or a painful red eye with vision change. If you are worried, seek professional advice even if your symptom is not on this list.',
          sw: 'Tafuta huduma ya dharura mara moja kwa kupoteza au kupungua sana kwa kuona ghafla, maumivu makali ya jicho, kemikali jichoni, jeraha lililopenya au kitu kilichokwama jichoni, pazia au kivuli cha ghafla juu ya kuona, mianga mipya pamoja na vitu vinavyoelea, au jicho jekundu lenye maumivu na mabadiliko ya kuona. Ikiwa una wasiwasi, tafuta ushauri wa kitaalamu hata dalili yako haipo kwenye orodha hii.',
        },
      },
      {
        type: 'p',
        text: {
          en: 'Call your local emergency number or go to the nearest emergency department. AskOptsam does not publish unverified clinic hours, addresses, or emergency contact numbers.',
          sw: 'Piga simu huduma ya dharura ya eneo lako au nenda hospitali ya dharura iliyo karibu. AskOptsam haichapishi saa za kliniki, anwani, au namba za mawasiliano za dharura ambazo hazijathibitishwa.',
        },
      },
    ],
  },
  {
    id: 'review',
    heading: { en: 'Content review status', sw: 'Hali ya ukaguzi wa maudhui' },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Source links were checked on 19 October 2026. The educational library and safety rules have not yet completed clinical review by a licensed eye-care professional. They are not a clinically validated triage system. Do not rely on AskOptsam as your only source of health information.',
          sw: 'Viungo vya vyanzo vilikaguliwa tarehe 19 Oktoba 2026. Maktaba ya elimu na kanuni za usalama bado hazijakamilisha ukaguzi wa kitabibu na mtaalamu wa macho aliyeidhinishwa. Si mfumo wa triage uliothibitishwa kitabibu. Usitegemee AskOptsam kama chanzo chako pekee cha taarifa za afya.',
        },
      },
    ],
  },
];

export function legalText(value: LegalText, lang: Lang): string {
  return value[lang];
}
