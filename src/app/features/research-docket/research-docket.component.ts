import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AiService } from '../../core/ai.service';
import { ResearchItem, Thesis, BeliefImpact, ThesisImpactSummary, ImpactDirection } from '../../core/models';

@Component({ selector: 'app-research-docket', templateUrl: './research-docket.component.html' })
export class ResearchDocketComponent implements OnInit {
  items: ResearchItem[] = [];
  selected: ResearchItem | null = null;
  aiText = '';
  aiLoading = false;
  skepticText = '';
  skepticLoading = false;
  private analyzingSignalId: string | null = null;

  // ── Thesis Impact Grid ──────────────────────────────────────────────────────
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

  constructor(private data: DataService, public ai: AiService) {}

  ngOnInit() {
    this.data.research$.subscribe(i => this.items = i);
    this.data.theses$.subscribe(t => this.theses = t);
  }

  select(item: ResearchItem) {
    this.selected = item;
    this.showImpactGrid = false; // close grid when switching signals
    if (!(this.aiLoading && this.analyzingSignalId === item.id)) {
      this.aiText = item.aiAnalysis || '';
    }
    this.skepticText = item.skepticChallenge || '';
  }

  // ── Impact Grid ─────────────────────────────────────────────────────────────

  openImpactGrid() {
    if (!this.selected) return;
    this.impactSummaries = this.theses.map(t => this.computeImpact(this.selected!, t));
    this.showImpactGrid = true;
  }

  closeImpactGrid() {
    this.showImpactGrid = false;
  }

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

    // Sentiment analysis on signal
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

    // Catalysts — things that SUPPORT the thesis
    for (const catalyst of thesis.catalysts) {
      const relevant = tickerRelevant || this.semanticOverlap(signalText, catalyst);
      let impact: ImpactDirection = 'unchanged';
      if (relevant) {
        impact = signalSentiment === 'positive' ? 'positive'
               : signalSentiment === 'negative' ? 'negative'
               : 'unchanged';
      }
      beliefs.push({ text: catalyst, type: 'catalyst', impact });
    }

    // Invalidation criteria — things that BREAK the thesis
    for (const inv of thesis.invalidation) {
      const relevant = tickerRelevant || this.semanticOverlap(signalText, inv);
      let impact: ImpactDirection = 'unchanged';
      if (relevant) {
        // Negative signal → invalidation risk rising → negative for thesis
        // Positive signal → invalidation risk shrinking → positive for thesis
        impact = signalSentiment === 'negative' ? 'negative'
               : signalSentiment === 'positive' ? 'positive'
               : 'unchanged';
      }
      beliefs.push({ text: inv, type: 'invalidation', impact });
    }

    const positiveCount = beliefs.filter(b => b.impact === 'positive').length;
    const negativeCount = beliefs.filter(b => b.impact === 'negative').length;
    const impactScore = positiveCount - negativeCount;
    const overallImpact: ImpactDirection =
      impactScore > 1 ? 'positive' : impactScore < -1 ? 'negative' : 'unchanged';

    return { thesis, overallImpact, impactScore, beliefs };
  }

  /** Returns true if any meaningful word (>4 chars) from `belief` appears in `signalText` */
  private semanticOverlap(signalText: string, belief: string): boolean {
    const words = belief.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    return words.some(w => signalText.includes(w));
  }

  // ── Existing methods ────────────────────────────────────────────────────────

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
    const prompt = `Challenge this research and its analysis:
Title: ${this.selected.title}
Signal: ${this.selected.body}
${this.aiText ? 'Analyst conclusion: ' + this.aiText.slice(0, 500) : ''}
What could go wrong? What is the market already pricing in? What historical analogues suggest this is a false signal?`;

    await this.ai.stream(this.SKEPTIC_SYS, prompt, chunk => this.skepticText += chunk);
    this.data.updateResearch(this.selected.id, { skepticChallenge: this.skepticText });
    this.skepticLoading = false;
  }

  dismiss(id: string, event: Event) {
    event.stopPropagation();
    this.data.dismissResearch(id);
    if (this.selected?.id === id) this.selected = null;
  }

  get actionRequiredCount(): number {
    return this.items.filter(i => i.actionRequired).length;
  }

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

  private buildSignalAnalysis(item: ResearchItem): string {
    const shortTitle = item.title.length > 78 ? `${item.title.slice(0, 78)}...` : item.title;
    const priorityTone =
      item.priority === 'urgent'
        ? 'High urgency. Treat as decision-relevant today.'
        : item.priority === 'high'
          ? 'Material signal. Prioritize in current research cycle.'
          : 'Useful but non-urgent. Integrate into baseline monitoring.';

    const tickerLens = item.tickers.slice(0, 4).join(', ');
    const actionLine = item.actionRequired
      ? 'This signal is flagged action-required and should be tied to a same-day owner.'
      : 'No immediate action flag, but update watchlist assumptions and trigger thresholds.';

    return `## Signal Analysis - ${shortTitle}

**Key Takeaway:** ${priorityTone} The signal has direct relevance to ${tickerLens || 'current covered names'}.
[Sources: Bloomberg | FactSet | AlphaSense]

**Investment Implication**
- Title-context alignment: "${item.title}" should be evaluated against current thesis assumptions before next rebalance window.
- Coverage impact: ${tickerLens || 'No explicit tickers listed'} remain the primary transmission path for portfolio impact.
- Decision framing: ${actionLine}
[Sources: Internal Research DB | Bloomberg | Refinitiv]

**Conviction Impact**
- Base case: maintain conviction unless follow-through data confirms a regime change.
- Upside path: strengthen conviction if corroborating data appears across at least two independent channels.
- Downside path: reduce conviction if this signal contradicts management guidance or invalidation triggers.
[Sources: FactSet | Internal Risk System]

**Open Questions**
1. What must be true for this signal to persist over the next 1-2 quarters?
2. Which KPI would falsify the current interpretation fastest?
3. What second-order risk is not obvious in the headline?
[Sources: AlphaSense | SEC Filings]`;
  }
}
