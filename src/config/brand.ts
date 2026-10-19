/**
 * Editorial / business configuration.
 *
 * No contact details, locations, hours, or credentials are configured in this
 * MVP. Unverified Optsam details must not be published. Add verified contact
 * information only after the owner has approved the exact wording and data.
 */
export const brand = {
  productName: 'AskOptsam',
  organisation: 'Optsam Eye Care',
  tagline: {
    en: 'Ask about your eyes. Understand your next step.',
    sw: 'Uliza kuhusu macho yako. Fahamu hatua inayofuata.',
  },
  shortDescription: {
    en: 'Bilingual eye-health information, with safety-first guidance on when to seek care.',
    sw: 'Taarifa za afya ya macho kwa Kiswahili na Kiingereza, pamoja na mwongozo wa usalama kuhusu wakati wa kutafuta huduma.',
  },
} as const;

export const legal = {
  policyVersion: import.meta.env.POLICY_VERSION || '2026-10-19',
  lastUpdated: '19 October 2026',
  jurisdictionNote:
    'This is a draft prepared for product review. It is not a legal opinion and has not been reviewed by Tanzanian or other East African counsel.',
} as const;

export const emergency = {
  // Deliberately no invented phone numbers, clinic hours, or addresses.
  serviceNote: {
    en: 'Call your local emergency number or go to the nearest emergency department. Do not wait for an online reply.',
    sw: 'Piga simu huduma ya dharura ya eneo lako au nenda moja kwa moja kwenye hospitali ya dharura iliyo karibu. Usisubiri jibu la mtandaoni.',
  },
  disclaimer: {
    en: 'AskOptsam is educational. It cannot diagnose an eye condition, rule out an emergency, or replace an eye examination.',
    sw: 'AskOptsam ni kwa elimu. Haiwezi kutambua ugonjwa wa macho, kuondoa uwezekano wa dharura, au kuchukua nafasi ya uchunguzi wa macho.',
  },
} as const;

export const features = {
  /**
   * Image explanation ships disabled by design. There is no upload, storage,
   * or image provider pipeline. Enabling a future implementation requires code,
   * provider review, and a separate privacy assessment — not an env flag.
   */
  imageExplanation: false,
} as const;
