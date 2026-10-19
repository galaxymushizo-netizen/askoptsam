/**
 * Curated source registry.
 *
 * All URLs below were fetched and returned HTTP 200 on 2026-10-19. The
 * `lastVerified` date records that link check. Editorial summaries are written
 * in our own words; they are not quotes. "verified" means the link and topic
 * scope were checked by the project editor — it is NOT a clinical endorsement
 * and not a substitute for source-level medical review.
 */

export type SourceTopic =
  | 'general'
  | 'red-eye'
  | 'itch'
  | 'dry-eye'
  | 'allergy'
  | 'blurred-vision'
  | 'vision-loss'
  | 'pain'
  | 'light-sensitivity'
  | 'injury'
  | 'chemical'
  | 'flashes-floaters'
  | 'contact-lens'
  | 'children'
  | 'diabetes'
  | 'glaucoma'
  | 'cataract'
  | 'refractive'
  | 'screen'
  | 'checkup';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  topics: SourceTopic[];
  languages: Array<'en' | 'sw'>;
  lastVerified: string;
  reviewStatus: 'verified' | 'pending-review' | 'retired';
  /** Short, original summaries used to ground model answers. */
  keyPoints: string[];
}

export const sources: Source[] = [
  {
    id: 'who-blindness',
    title: 'Blindness and visual impairment',
    publisher: 'World Health Organization',
    url: 'https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment',
    topics: ['general', 'refractive', 'cataract', 'glaucoma', 'diabetes', 'children'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Many causes of vision impairment can be prevented or treated, including refractive errors and cataract.',
      'Regular eye care and timely treatment matter, especially for people living with diabetes.',
      'Vision impairment affects people of all ages; children may need eye checks even when they do not complain.',
    ],
  },
  {
    id: 'nhs-red-eye',
    title: 'Red eye',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/symptoms/red-eye/',
    topics: ['red-eye', 'itch', 'dry-eye', 'allergy', 'contact-lens', 'pain', 'vision-loss'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'A red eye is often caused by infection or dry eyes, but it can sometimes be serious.',
      'Seek emergency help for sight changes, severe pain, light sensitivity with severe headache and nausea, serious injury, or chemical exposure.',
      'People who wear contact lenses and develop a red eye should seek urgent advice because of infection risk.',
      'Do not rub the eye, and avoid contact lenses until it has recovered.',
    ],
  },
  {
    id: 'nhs-eye-pain',
    title: 'Eye pain',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/symptoms/eye-pain/',
    topics: ['pain', 'red-eye', 'light-sensitivity', 'vision-loss', 'glaucoma', 'contact-lens'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Eye pain has many causes; do not try to diagnose it yourself.',
      'Urgent assessment is advised for severe pain, light sensitivity, vision changes, or a very red eye.',
      'Sudden severe eye pain or sudden loss of vision needs emergency care.',
    ],
  },
  {
    id: 'nhs-dry-eyes',
    title: 'Dry eyes',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/symptoms/dry-eyes/',
    topics: ['dry-eye', 'itch', 'red-eye', 'screen', 'contact-lens', 'pain'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Dry eyes can feel gritty, sore, itchy, or watery.',
      'Self-care includes avoiding smoke and direct wind, taking screen breaks, and using lubricant eye drops if suitable.',
      'Seek urgent advice if the eye is painful and red, or if a contact lens wearer develops a red eye.',
    ],
  },
  {
    id: 'nhs-eye-injuries',
    title: 'Eye injuries',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/eye-injuries/',
    topics: ['injury', 'chemical', 'pain', 'vision-loss', 'light-sensitivity'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Minor injuries such as shampoo or dust in the eye often settle, but chemical exposure or a piercing injury needs emergency care.',
      'For a chemical in the eye, rinse immediately with clean running water and seek urgent medical help.',
      'Do not try to remove an object stuck in the eye; shield the eye and get emergency care.',
    ],
  },
  {
    id: 'nhs-conjunctivitis',
    title: 'Conjunctivitis',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/conjunctivitis/',
    topics: ['red-eye', 'itch', 'allergy', 'children', 'contact-lens'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Conjunctivitis can cause redness, stickiness, watering, and itching, usually in both eyes.',
      'It often improves without treatment, but contact lens wearers should remove lenses and seek advice.',
      'Seek urgent advice for pain, light sensitivity, vision changes, or a very red eye.',
    ],
  },
  {
    id: 'nhs-hay-fever',
    title: 'Hay fever',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/hay-fever/',
    topics: ['allergy', 'itch', 'red-eye', 'dry-eye'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Hay fever commonly causes itchy, red, or watery eyes along with sneezing and a runny nose.',
      'Avoiding pollen, wearing wraparound sunglasses, and washing after outdoor exposure may reduce symptoms.',
      'A pharmacist can advise on suitable treatments for allergies.',
    ],
  },
  {
    id: 'nhs-vision-loss',
    title: 'Vision loss',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/vision-loss/',
    topics: ['vision-loss', 'blurred-vision', 'flashes-floaters', 'pain', 'red-eye', 'diabetes', 'glaucoma', 'cataract'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Suddenly being unable to see from one or both eyes, or sudden severe eye pain, requires emergency care.',
      'A dark shadow or curtain moving across vision, new flashes, or a sudden increase in floaters needs urgent assessment.',
      'Gradual vision change still deserves a routine eye examination so that treatable causes are not missed.',
    ],
  },
  {
    id: 'nhs-diabetic-retinopathy',
    title: 'Diabetic retinopathy',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/diabetic-retinopathy/',
    topics: ['diabetes', 'vision-loss', 'blurred-vision', 'flashes-floaters'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Diabetic retinopathy often has no symptoms at first and is found through screening.',
      'Later symptoms can include worsening eyesight, blurred vision, and floaters.',
      'People with diabetes should attend recommended eye screening, even when vision feels normal.',
    ],
  },
  {
    id: 'nhs-glaucoma',
    title: 'Glaucoma',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/glaucoma/',
    topics: ['glaucoma', 'pain', 'red-eye', 'vision-loss', 'light-sensitivity'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Glaucoma usually develops slowly and may not cause symptoms until vision is affected.',
      'A sudden attack can cause intense eye pain, redness, blurred vision, halos around lights, headache, and nausea.',
      'Sudden glaucoma symptoms need emergency assessment.',
    ],
  },
  {
    id: 'nhs-cataracts',
    title: 'Cataracts in adults',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/cataracts/',
    topics: ['cataract', 'blurred-vision', 'light-sensitivity', 'vision-loss'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Cataracts usually develop slowly and cause cloudy or blurred vision, glare, and faded colours.',
      'An optician can assess symptoms; cataract surgery can restore vision when appropriate.',
      'Sudden vision loss is not a typical cataract symptom and needs urgent assessment.',
    ],
  },
  {
    id: 'nhs-short-sightedness',
    title: 'Short-sightedness (myopia)',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/short-sightedness/',
    topics: ['refractive', 'blurred-vision', 'children', 'screen'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Myopia makes distant objects look blurred while near objects are usually clearer.',
      'Glasses or contact lenses can correct refractive error after an eye examination.',
      'Children who struggle to see the board or hold things close may need an eye test.',
    ],
  },
  {
    id: 'nhs-long-sightedness',
    title: 'Long-sightedness (hypermetropia)',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/conditions/long-sightedness/',
    topics: ['refractive', 'blurred-vision', 'children', 'screen'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Long-sightedness can make near objects blurred, and some people also struggle with distance vision.',
      'An eye examination can confirm refractive error and whether glasses are needed.',
      'Headaches or eye strain after close work can occur, but persistent or sudden vision change needs assessment.',
    ],
  },
  {
    id: 'nhs-eye-tests-children',
    title: 'Eye tests in children',
    publisher: 'NHS',
    url: 'https://www.nhs.uk/tests-and-treatments/eye-tests-in-children/',
    topics: ['children', 'refractive', 'checkup', 'general'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Children may not realise their vision is different; eye tests can detect problems early.',
      'An eye test is adapted to the child’s age and does not require them to read letters in every case.',
      'Seek advice if a child has a squint, persistent redness, pain, or changes in vision.',
    ],
  },
  {
    id: 'moorfields-contact-lens',
    title: 'Five golden rules for safe contact lens use',
    publisher: 'Moorfields Eye Hospital (NHS)',
    url: 'https://www.moorfields.nhs.uk/private/about-moorfields-private/blog-articles/five-golden-rules-for-safe-contact-lens-use',
    topics: ['contact-lens', 'red-eye', 'pain', 'vision-loss'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Wash and dry hands before handling lenses, and follow the care instructions from the lens provider.',
      'Do not use tap water to rinse lenses or lens cases, and do not swim or shower while wearing lenses.',
      'Do not sleep in lenses unless a clinician has specifically prescribed that schedule.',
      'Remove lenses and seek urgent eye-care advice if the eye becomes red, painful, or sensitive to light.',
    ],
  },
  {
    id: 'moorfields-allergic-conjunctivitis',
    title: 'Allergic conjunctivitis',
    publisher: 'Moorfields Eye Hospital (NHS)',
    url: 'https://www.moorfields.nhs.uk/ae/patient-guides/allergic-conjunctivitis',
    topics: ['allergy', 'itch', 'red-eye', 'dry-eye'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Allergic conjunctivitis usually affects both eyes and causes redness, itching, watering, and sometimes eyelid swelling.',
      'Avoid rubbing the eyes; a cold compress may reduce discomfort.',
      'Lubricant drops may help comfort but do not stop the allergy itself.',
    ],
  },
  {
    id: 'moorfields-flashes-floaters',
    title: 'Flashes and floaters',
    publisher: 'Moorfields Eye Hospital (NHS)',
    url: 'https://www.moorfields.nhs.uk/ae/patient-guides/flashes-and-floaters',
    topics: ['flashes-floaters', 'vision-loss', 'injury'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'New or sudden flashes, a sudden increase in floaters, or a shadow across vision can indicate a retinal problem.',
      'These symptoms need urgent assessment by an eye-care professional.',
      'Do not wait for a routine appointment if vision is changing suddenly.',
    ],
  },
  {
    id: 'aao-eye-strain',
    title: 'Eye strain: symptoms, causes and treatment',
    publisher: 'American Academy of Ophthalmology',
    url: 'https://www.aao.org/eye-health/diseases/eye-strain',
    topics: ['screen', 'dry-eye', 'blurred-vision', 'checkup'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Digital eye strain can cause tired, sore, watery, or dry eyes and temporary blurred vision.',
      'Taking breaks, blinking regularly, adjusting lighting, and positioning the screen can reduce symptoms.',
      'Persistent or worsening vision changes should be assessed rather than assumed to be screen strain.',
    ],
  },
  {
    id: 'aao-screen-time',
    title: 'Screen time and eye health',
    publisher: 'American Academy of Ophthalmology',
    url: 'https://www.aao.org/eye-health/tips-prevention/screen-time',
    topics: ['screen', 'children', 'dry-eye', 'refractive'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Frequent breaks and outdoor time are important habits for children and adults who use screens for long periods.',
      'Screen use can contribute to temporary dryness and eyestrain.',
      'Uncorrected refractive error can make screen use uncomfortable; an eye test can check this.',
    ],
  },
  {
    id: 'aao-children',
    title: 'Children’s eye health and safety',
    publisher: 'American Academy of Ophthalmology',
    url: 'https://www.aao.org/eye-health/tips-prevention/children-eye-health',
    topics: ['children', 'refractive', 'injury', 'checkup'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Children may not report vision problems because they assume everyone sees the same way.',
      'Watch for squinting, sitting very close to screens, tilting the head, or one eye turning.',
      'Eye checks can identify refractive errors and other problems early.',
    ],
  },
  {
    id: 'aao-eye-exam',
    title: 'What to expect during an eye exam',
    publisher: 'American Academy of Ophthalmology',
    url: 'https://www.aao.org/eye-health/tips-prevention/eye-exam',
    topics: ['checkup', 'general', 'refractive'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'An eye examination can include vision testing, eye pressure checks, and examination of the front and back of the eye.',
      'Bring current glasses or contact lenses, a list of medicines, and any questions.',
      'A dilated eye exam may cause temporary blurry vision and light sensitivity; arrange travel accordingly.',
    ],
  },
  {
    id: 'aao-myopia',
    title: 'Myopia (near-sightedness)',
    publisher: 'American Academy of Ophthalmology',
    url: 'https://www.aao.org/eye-health/diseases/myopia-nearsightedness',
    topics: ['refractive', 'children', 'blurred-vision', 'screen'],
    languages: ['en'],
    lastVerified: '2026-10-19',
    reviewStatus: 'verified',
    keyPoints: [
      'Myopia causes blurred distance vision and is commonly corrected with glasses or contact lenses.',
      'It often starts in childhood and may progress during growth.',
      'Regular eye checks help keep prescriptions up to date and detect other eye problems.',
    ],
  },
];

export const sourceById = new Map(sources.map((source) => [source.id, source]));

export function getSources(ids: string[]): Source[] {
  return ids
    .map((id) => sourceById.get(id))
    .filter((source): source is Source => Boolean(source));
}

export const registryMeta = {
  lastFullReview: '2026-10-19',
  reviewPolicy:
    'Links are checked automatically and editorially. Clinical review by a licensed eye-care professional is still pending before public launch.',
  sourceCount: sources.length,
} as const;
