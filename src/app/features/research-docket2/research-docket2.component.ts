import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AiService } from '../../core/ai.service';
import { ResearchItem, Thesis, BeliefImpact, ThesisImpactSummary, ImpactDirection, LivingThesisBelief, LivingThesisState } from '../../core/models';

// ── 4D Architecture Layer Definitions ─────────────────────────────────────────

export interface ArchLayer {
  layerClass: string;
  icon: string;
  label: string;
  title: string;
  subtitle: string;
  badge?: string;
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    layerClass: 'layer-0',
    icon: '📄',
    label: 'LAYER 1 — INGEST',
    title: 'Confidential Information Memo',
    subtitle: 'CIM dropped into the Unified Ingestion Pipeline. Structured + unstructured data parsed.',
    badge: 'PRIVATE SIDE'
  },
  {
    layerClass: 'layer-1',
    icon: '❄',
    label: 'LAYER 2 — PLATFORM',
    title: 'Snowflake Strategic Data Platform',
    subtitle: 'Centralized Knowledge Graph + Vector Store. All data types unified in one corpus.',
    badge: 'CENTRAL AGGREGATION'
  },
  {
    layerClass: 'layer-2',
    icon: '🛡',
    label: 'LAYER 3 — GOVERNANCE',
    title: 'Entitlements Framework + Immutable Audit Log',
    subtitle: 'Private-side MNPI scrubbed before public-side access. Walls enforced by architecture.',
    badge: 'COMPLIANCE'
  },
  {
    layerClass: 'layer-3',
    icon: '⬡',
    label: 'LAYER 4 — AGENT',
    title: 'Skeptic / Red-Team Agent',
    subtitle: 'Scrubbed CIM compared vs. public aerospace and energy exposures. Surfaces anomalies.',
    badge: 'AI AGENT'
  },
  {
    layerClass: 'layer-4',
    icon: '⚡',
    label: 'LAYER 5 — OUTPUT',
    title: 'PM Proactive Idea Docket',
    subtitle: 'Actionable insight surfaced in 4 minutes. Not 14 days.',
    badge: 'PUBLIC SIDE'
  }
];

@Component({
  selector: 'app-research-docket2',
  templateUrl: './research-docket2.component.html'
})
export class ResearchDocket2Component implements OnInit {

  // ── Signal Docket (mirrors ResearchDocketComponent) ──────────────────────────
  items: ResearchItem[] = [];
  selected: ResearchItem | null = null;
  aiText = '';
  aiLoading = false;
  skepticText = '';
  skepticLoading = false;
  private analyzingSignalId: string | null = null;

  // Thesis Impact Grid
  theses: Thesis[] = [];
  showImpactGrid = false;
  impactSummaries: ThesisImpactSummary[] = [];

  readonly ANALYST_SYS = `You are a senior research analyst at Morgan Stanley Investment Management.
Analyze incoming research signals with institutional rigor. Structure your response:
1. Key Takeaway (1 sentence)
2. Investment Implication (which positions, how affected)
3. Conviction Impact (does this strengthen or weaken any active theses)
4. Open Questions (what do you need to know next)
Be direct and actionable. Avoid generic statements.`;

  readonly SKEPTIC_SYS = `You are the MSIM 2030 Skeptic Agent — your sole job is adversarial challenge.
Start every response with "Devil's advocate:". Find the holes. Identify base-rate fallacies.
Cite historical analogues where similar signals led to wrong conclusions. Under 250 words. Be ruthless.`;

  // ── Living Thesis — LMT ──────────────────────────────────────────────────────
  livingThesis: LivingThesisState | null = null;
  activeVariantView: string | null = null;
  variantViewText = '';
  toastMessage = '';
  toastVisible = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  // ── 4D Architecture X-Ray ─────────────────────────────────────────────────────
  readonly SCENARIOS = [
    'Private Side CIM Ingestion & Multi-INT Fusion',
    'Research Signal → Thesis Impact Attribution',
    'Client Portfolio Risk Alert → PM Escalation'
  ];
  readonly archLayers: ArchLayer[] = ARCH_LAYERS;
  selectedScenario = this.SCENARIOS[0];
  aggregationEnabled = true;
  animationRunning = false;
  activeLayer = -1;
  showAggWarning = false;

  constructor(private data: DataService, public ai: AiService) {}

  ngOnInit() {
    this.data.research$.subscribe(i => this.items = i);
    this.data.theses$.subscribe(t => this.theses = t);
    this.data.livingThesis$.subscribe(state => this.livingThesis = state);
  }

  // ── Signal Docket Methods ─────────────────────────────────────────────────────

  select(item: ResearchItem) {
    this.selected = item;
    this.showImpactGrid = false;
    if (!(this.aiLoading && this.analyzingSignalId === item.id)) {
      this.aiText = item.aiAnalysis || '';
    }
    this.skepticText = item.skepticChallenge || '';
  }

  async analyze() {
    if (!this.selected) return;
    const signal = this.selected;
    this.analyzingSignalId = signal.id;
    this.aiText = '';
    this.aiLoading = true;
    const simulatedDelayMs = 3000 + Math.floor(Math.random() * 2001);
    await new Promise(r => setTimeout(r, simulatedDelayMs));
    const result = this.buildSignalAnalysis(signal);
    this.data.updateResearch(signal.id, { aiAnalysis: result });
    if (this.selected?.id === signal.id) this.aiText = result;
    this.analyzingSignalId = null;
    this.aiLoading = false;
  }

  async runSkeptic() {
    if (!this.selected) return;
    this.skepticText = '';
    this.skepticLoading = true;
    const prompt = `Challenge this research:
Title: ${this.selected.title}
Signal: ${this.selected.body}
${this.aiText ? 'Analyst conclusion: ' + this.aiText.slice(0, 500) : ''}`;
    await this.ai.stream(this.SKEPTIC_SYS, prompt, chunk => this.skepticText += chunk);
    this.data.updateResearch(this.selected.id, { skepticChallenge: this.skepticText });
    this.skepticLoading = false;
  }

  dismiss(id: string, event: Event) {
    event.stopPropagation();
    this.data.dismissResearch(id);
    if (this.selected?.id === id) this.selected = null;
  }

  get actionRequiredCount(): number { return this.items.filter(i => i.actionRequired).length; }

  typeIcon(type: string) {
    return { filing: '📄', call: '📞', signal: '📡', news: '📰' }[type] ?? '📌';
  }

  timeAgo(date: Date): string {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  // ── Thesis Impact Grid Methods ────────────────────────────────────────────────

  openImpactGrid() {
    if (!this.selected) return;
    this.impactSummaries = this.theses.map(t => this.computeImpact(this.selected!, t));
    this.showImpactGrid = true;
  }

  closeImpactGrid() { this.showImpactGrid = false; }

  getBeliefsByImpact(summary: ThesisImpactSummary, impact: ImpactDirection): BeliefImpact[] {
    return summary.beliefs.filter(b => b.impact === impact);
  }

  get totalConfirmed(): number {
    return this.impactSummaries.reduce((n, s) => n + s.beliefs.filter(b => b.impact === 'positive').length, 0);
  }
  get totalChallenged(): number {
    return this.impactSummaries.reduce((n, s) => n + s.beliefs.filter(b => b.impact === 'negative').length, 0);
  }
  get totalUnchanged(): number {
    return this.impactSummaries.reduce((n, s) => n + s.beliefs.filter(b => b.impact === 'unchanged').length, 0);
  }

  private computeImpact(signal: ResearchItem, thesis: Thesis): ThesisImpactSummary {
    const signalText = `${signal.title} ${signal.body}`.toLowerCase();
    const tickerRelevant = signal.tickers.includes(thesis.ticker);
    const positiveTerms = ['beat', 'growth', 'wins', 'surge', 'raised', 'ahead', 'expansion',
      'confirms', 'above', 'acceleration', 'strong', 'breakthrough', 'yield', 'outperform',
      'record', 'momentum', 'upgrade', 'approval', 'milestone', 'subsidy', 'inflection'];
    const negativeTerms = ['miss', 'decline', 'risk', 'delay', 'backlog', 'concern',
      'weaker', 'audit', 'ban', 'restrict', 'elevated', 'deterioration', 'narrower',
      'regulation', 'penalty', 'downgrade', 'breach', 'warning', 'shortfall', 'negative'];
    const posHits = positiveTerms.filter(t => signalText.includes(t)).length;
    const negHits = negativeTerms.filter(t => signalText.includes(t)).length;
    const signalSentiment: 'positive' | 'negative' | 'neutral' =
      posHits > negHits ? 'positive' : negHits > posHits ? 'negative' : 'neutral';
    const beliefs: BeliefImpact[] = [];
    for (const catalyst of thesis.catalysts) {
      const overlapScore = this.semanticOverlapScore(signalText, catalyst);
      const relevant = overlapScore >= 1 || (tickerRelevant && overlapScore > 0);
      let impact: ImpactDirection = 'unchanged';
      if (relevant) impact = signalSentiment === 'positive' ? 'positive' : signalSentiment === 'negative' ? 'negative' : 'unchanged';
      beliefs.push({ text: catalyst, type: 'catalyst', impact });
    }
    for (const inv of thesis.invalidation) {
      const overlapScore = this.semanticOverlapScore(signalText, inv);
      const relevant = overlapScore >= 1 || (tickerRelevant && overlapScore > 0);
      let impact: ImpactDirection = 'unchanged';
      if (relevant) impact = signalSentiment === 'negative' ? 'positive' : signalSentiment === 'positive' ? 'negative' : 'unchanged';
      beliefs.push({ text: inv, type: 'invalidation', impact });
    }
    const positiveCount = beliefs.filter(b => b.impact === 'positive').length;
    const negativeCount = beliefs.filter(b => b.impact === 'negative').length;
    const impactScore = positiveCount - negativeCount;
    const overallImpact: ImpactDirection =
      impactScore > 1 ? 'positive' : impactScore < -1 ? 'negative' : 'unchanged';
    return { thesis, overallImpact, impactScore, beliefs };
  }

  private semanticOverlapScore(signalText: string, belief: string): number {
    const words = belief
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4)
      .map(w => this.normalizeBeliefToken(w));
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.filter(word => signalText.includes(word)).length;
  }

  private normalizeBeliefToken(token: string): string {
    return token
      .replace(/ing$|ed$|es$|s$/g, '')
      .replace(/tion$/g, 't')
      .replace(/ical$/g, 'ic');
  }

  private buildSignalAnalysis(item: ResearchItem): string {
    const shortTitle = item.title.length > 78 ? `${item.title.slice(0, 78)}...` : item.title;
    const priorityTone = item.priority === 'urgent'
      ? 'High urgency. Treat as decision-relevant today.'
      : item.priority === 'high' ? 'Material signal. Prioritize in current research cycle.'
      : 'Useful but non-urgent. Integrate into baseline monitoring.';
    const tickerLens = item.tickers.slice(0, 4).join(', ');
    const actionLine = item.actionRequired
      ? 'This signal is flagged action-required and should be tied to a same-day owner.'
      : 'No immediate action flag, but update watchlist assumptions and trigger thresholds.';
    return `## Signal Analysis - ${shortTitle}\n\n**Key Takeaway:** ${priorityTone} The signal has direct relevance to ${tickerLens || 'current covered names'}.\n[Sources: Bloomberg | FactSet | AlphaSense]\n\n**Investment Implication**\n- Coverage impact: ${tickerLens} remain the primary transmission path for portfolio impact.\n- Decision framing: ${actionLine}\n[Sources: Internal Research DB | Bloomberg | Refinitiv]\n\n**Conviction Impact**\n- Base case: maintain conviction unless follow-through data confirms a regime change.\n- Upside path: strengthen conviction if corroborating data appears across at least two independent channels.\n[Sources: FactSet | Internal Risk System]\n\n**Open Questions**\n1. What must be true for this signal to persist over the next 1-2 quarters?\n2. Which KPI would falsify the current interpretation fastest?\n[Sources: AlphaSense | SEC Filings]`;
  }

  // ── Living Thesis Methods ─────────────────────────────────────────────────────

  trackBelief(belief: LivingThesisBelief, event: Event) {
    event.stopPropagation();
    this.data.trackLivingThesisBelief(belief.id);
    this.showToast(`Now tracking - ${belief.text}`);
  }

  openVariantView(belief: LivingThesisBelief, event: Event) {
    event.stopPropagation();
    this.activeVariantView = belief.id;
    this.variantViewText = belief.variantView || '';
  }

  closeVariantView() { this.activeVariantView = null; }

  submitVariantView() {
    const belief = this.activeBelief;
    if (!belief || !this.variantViewText.trim()) return;
    this.data.submitLivingThesisVariantView(belief.id, this.variantViewText);
    this.showToast(`Variant view saved - ${belief.text}`);
    this.activeVariantView = null;
    this.variantViewText = '';
  }

  markNotRelevant(belief: LivingThesisBelief, event: Event) {
    event.stopPropagation();
    this.data.markLivingThesisBeliefNotRelevant(belief.id);
    if (this.activeVariantView === belief.id) this.closeVariantView();
    this.showToast(`No longer tracking - ${belief.text}`);
  }

  resetLivingThesisState() {
    this.data.resetLivingThesis();
    this.closeVariantView();
    this.showToast('Living thesis state reset');
  }

  // ── Living Thesis Computed Getters ────────────────────────────────────────

  get totalCatalystEndorsements(): number {
    return this.lmtCatalysts.filter(belief => belief.tracked).length;
  }

  get totalInvalidationEndorsements(): number {
    return this.lmtInvalidation.filter(belief => belief.tracked).length;
  }

  get totalTrackedBeliefs(): number {
    return this.totalCatalystEndorsements + this.totalInvalidationEndorsements;
  }

  get activeBeliefCount(): number {
    return this.lmtCatalysts.length + this.lmtInvalidation.length;
  }

  get consensusPct(): number {
    return this.activeBeliefCount === 0 ? 0 : Math.max(8, Math.round((this.totalTrackedBeliefs / this.activeBeliefCount) * 100));
  }

  get lmtCatalysts(): LivingThesisBelief[] {
    return (this.livingThesis?.beliefs || []).filter(belief => belief.type === 'catalyst' && !belief.notRelevant);
  }

  get lmtInvalidation(): LivingThesisBelief[] {
    return (this.livingThesis?.beliefs || []).filter(belief => belief.type === 'invalidation' && !belief.notRelevant);
  }

  get activeBelief(): LivingThesisBelief | null {
    return (this.livingThesis?.beliefs || []).find(belief => belief.id === this.activeVariantView) || null;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible = false, 2600);
  }

  // ── 4D Architecture Mode ──────────────────────────────────────────────────

  archMode: '2030' | '2024' = '2030';

  setArchMode(mode: '2030' | '2024'): void {
    this.archMode = mode;
    if (mode === '2024') {
      this.activeLayer = -1;
      this.animationRunning = false;
      this.aggregationEnabled = true;
      this.showAggWarning = false;
    }
  }

  // ── 4D Architecture Methods ────────────────────────────────────────────────────

  runScenario() {
    if (this.animationRunning || !this.aggregationEnabled) return;
    this.animationRunning = true;
    this.activeLayer = -1;
    [0, 1, 2, 3, 4].forEach((layer, i) => {
      setTimeout(() => {
        this.activeLayer = layer;
        if (layer === 4) this.animationRunning = false;
      }, (i + 1) * 700);
    });
  }

  toggleAggregation() {
    this.aggregationEnabled = !this.aggregationEnabled;
    this.showAggWarning = !this.aggregationEnabled;
    if (!this.aggregationEnabled) {
      this.activeLayer = -1;
      this.animationRunning = false;
    }
  }

  isLayerActive(index: number): boolean {
    return this.activeLayer >= index;
  }

  isConnectorActive(afterLayer: number): boolean {
    return this.activeLayer >= afterLayer;
  }
}
