export type Direction = 'Long' | 'Short';
export type ConvictionLevel = 'High' | 'Medium' | 'Low';
export type Priority = 'urgent' | 'high' | 'normal';
export type Severity = 'critical' | 'warning' | 'info';
export type ResearchType = 'filing' | 'call' | 'signal' | 'news';
export type RiskType = 'var' | 'concentration' | 'factor' | 'compliance' | 'stress';
export type PersonaId = 'pm' | 'sales' | 'trading' | 'research' | 'executive';

export interface ThesisTrigger {
  id: string;
  label: string;
  description: string;
  status: 'watching' | 'triggered' | 'cleared';
  linkedAlertIds?: string[];
}

export interface Thesis {
  id: string;
  ticker: string;
  name: string;
  direction: Direction;
  conviction: ConvictionLevel;
  score: number; // 1-10
  thesis: string;
  catalysts: string[];
  invalidation: string[];
  targetPrice: number;
  currentPrice: number;
  entryDate: Date;
  updatedAt: Date;
  aiAnalysis?: string;
  triggers?: ThesisTrigger[];
}

export interface ResearchItem {
  id: string;
  type: ResearchType;
  ticker?: string;
  title: string;
  body: string;
  priority: Priority;
  tickers: string[];
  actionRequired: boolean;
  ts: Date;
  aiAnalysis?: string;
  skepticChallenge?: string;
}

export interface Client {
  id: string;
  name: string;
  firm: string;
  aum: string;
  mandate: string;
  concerns: string[];
  portfolios: string[];
  lastMeeting?: Date;
  nextMeeting?: Date;
  briefing?: string;
}

export interface RiskAlert {
  id: string;
  portfolio: string;
  type: RiskType;
  severity: Severity;
  title: string;
  rawData: string;
  narrative?: string;
  ts: Date;
  resolved: boolean;
}

export interface NavLink {
  route: string;
  label: string;
}

export interface Persona {
  id: PersonaId;
  label: string;
  subtitle: string;
  icon: string;
  greeting: string;
  navLinks: NavLink[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: { type: string; label: string; id: string };
  agentName?: string;
}

// ── Thesis Impact Grid ────────────────────────────────────────────────────────

export type ImpactDirection = 'positive' | 'negative' | 'unchanged';

export interface BeliefImpact {
  text: string;
  type: 'catalyst' | 'invalidation';
  impact: ImpactDirection;
}

export interface ThesisImpactSummary {
  thesis: Thesis;
  overallImpact: ImpactDirection;
  impactScore: number; // positiveCount − negativeCount
  beliefs: BeliefImpact[];
}

export interface LivingThesisBelief {
  id: string;
  text: string;
  type: 'catalyst' | 'invalidation';
  tracked: boolean;
  notRelevant: boolean;
  variantView?: string;
  updatedAt: Date;
}

export interface LivingThesisState {
  id: string;
  ticker: string;
  name: string;
  beliefs: LivingThesisBelief[];
  updatedAt: Date;
}
