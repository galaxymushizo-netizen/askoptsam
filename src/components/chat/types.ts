import type { Lang } from '../../i18n/config';

export type ChatMode = 'live' | 'demo' | 'safety';

export interface ChatSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
}

export interface ChatTriage {
  severity: 'emergency' | 'urgent';
  category: string;
  title: string;
  label: string;
  summary: string;
  steps: string[];
  doNot: string[];
  seekCare: string;
  serviceNote: string;
  sources?: ChatSource[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  mode?: ChatMode;
  providerLabel?: string;
  demoReasonText?: string;
  sources?: ChatSource[];
  usedSourceIndexes?: number[];
  followUps?: string[];
  triage?: ChatTriage | null;
  cautionApplied?: boolean;
  truncated?: boolean;
  pending?: boolean;
  error?: boolean;
}

export interface ChatInitialProfile {
  savingDefault: boolean;
}

export interface ChatIslandProps {
  lang: Lang;
  initialMode: 'live' | 'demo';
  initialModeDetail: string;
  providerLabel: string;
  signedIn: boolean;
  userEmail: string | null;
  accountsConfigured: boolean;
  initialQuestion: string;
  initialMessages: ChatMessage[];
  initialConversationId: string | null;
  initialSaving: boolean;
  suggested: string[];
  loadError: string | null;
}
