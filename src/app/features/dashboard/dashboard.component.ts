import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AiService } from '../../core/ai.service';
import { PersonaService } from '../../core/persona.service';
import { Thesis, ResearchItem, RiskAlert, Client, Persona, PersonaId, Severity } from '../../core/models';

interface IntegratedFirmItem {
  title: string;
  source: string;
  relevance: string;
  summary: string;
  sources: string[];
}

interface TeamCollaborationItem {
  id: string;
  owner: string;
  team: string;
  title: string;
  intersection: string;
  ask: string;
  status: string;
  updated: string;
  mentions: string[];
}

interface NarratorStep {
  target: string;
  message: string;
  position: 'above' | 'below' | 'left' | 'right';
  duration: number;
}

@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit, OnDestroy {
  theses:   Thesis[]       = [];
  research: ResearchItem[] = [];
  alerts:   RiskAlert[]    = [];
  clients:  Client[]       = [];
  persona!: Persona;

  morningBriefing   = '';
  briefingLoading   = false;
  briefingGenerated = false;
  briefingExpanded  = false;
  private briefingRunSeq = 0;

  /* Simulated live prices */
  private priceTimer?: ReturnType<typeof setInterval>;
  livePrices:  Record<string, number> = { NVDA: 875, BABA: 72, NEE: 62, TSM: 145 };
  priceDeltas: Record<string, number> = { NVDA: 0, BABA: 0, NEE: 0, TSM: 0 };
  private vol: Record<string, number> = { NVDA: 4.2, BABA: 1.6, NEE: 0.7, TSM: 2.1 };

  /* Agent activity feed */
  agentActivity = [
    { agent: 'Morning Briefing Agent', action: 'Generated daily briefing', time: '2m ago', status: 'complete' },
    { agent: 'Signal Intelligence Agent', action: 'Analyzed MSFT 8-K filing', time: '8m ago', status: 'complete' },
    { agent: 'Risk Narrative Agent', action: 'Narrated VaR spike alert', time: '14m ago', status: 'complete' },
    { agent: 'Skeptic Challenge Agent', action: 'Challenged BABA cloud signal', time: '22m ago', status: 'complete' },
    { agent: 'Client Briefing Agent', action: 'Prepared Sarah Chen brief', time: '31m ago', status: 'complete' },
    { agent: 'Stress Test Agent', action: 'Ran China devaluation scenario', time: '45m ago', status: 'complete' }
  ];

  collaborationExpanded: Record<string, boolean> = {};
  collaborationToast = '';
  collaborationToastVisible = false;
  private collaborationToastTimer?: ReturnType<typeof setTimeout>;

  briefingAgentName = 'Portfolio Manager Briefing Agent';

  /* ── Narrator spotlight state ── */
  private static narratorPlayed = false;
  narratorActive = false;
  narratorStep = -1;
  narratorTransitioning = false;
  private narratorTimers: ReturnType<typeof setTimeout>[] = [];

  readonly narratorSteps: NarratorStep[] = [
    { target: 'briefing',       message: 'Your briefing is ready \u2014 AI has synthesized overnight developments across your positions.',  position: 'below', duration: 4500 },
    { target: 'critical-alert', message: '1 critical risk alert requires your immediate attention.',                                        position: 'below', duration: 4500 },
    { target: 'critical-stat',  message: 'VaR spiked +22.7% this week. China regulatory beta is elevated.',                                position: 'below', duration: 5000 },
    { target: 'baba-row',       message: 'BABA is the affected position. Consider reviewing sizing assumptions.',                           position: 'right', duration: 5000 },
    { target: 'thesis-flagged', message: '3 of your 5 theses have active risk flags. Open Workstation for details.',                        position: 'right', duration: 4000 },
  ];

  constructor(private data: DataService, public ai: AiService, public ps: PersonaService) {}

  ngOnInit() {
    this.data.theses$.subscribe(t  => this.theses   = t);
    this.data.research$.subscribe(r => this.research = r);
    this.data.alerts$.subscribe(a  => this.alerts   = a);
    this.data.clients$.subscribe(c => this.clients  = c);
    this.ps.persona$.subscribe(p => {
      const changed = this.persona && this.persona.id !== p.id;
      this.persona = p;
      this.briefingAgentName = this.getBriefingAgentName(p.id);
      if (changed) {
        this.endNarrator();
        this.briefingRunSeq++;
        this.morningBriefing = '';
        this.briefingLoading = false;
        this.briefingGenerated = false;
        this.briefingExpanded = false;
        setTimeout(() => this.generateBriefing(), 150);
      }
    });

    setTimeout(() => this.generateBriefing(), 50);
    setTimeout(() => this.startNarrator(), 600);
    this.priceTimer = setInterval(() => this.tickPrices(), 3000);
  }

  ngOnDestroy() {
    if (this.priceTimer) clearInterval(this.priceTimer);
    if (this.collaborationToastTimer) clearTimeout(this.collaborationToastTimer);
    this.narratorTimers.forEach(t => clearTimeout(t));
  }

  private tickPrices() {
    Object.keys(this.livePrices).forEach(t => {
      const move = (Math.random() - 0.47) * this.vol[t];
      this.livePrices[t]  = Math.max(1, +(this.livePrices[t] + move).toFixed(2));
      this.priceDeltas[t] = +move.toFixed(2);
    });
  }

  get urgentCount()       { return this.research.filter(r => r.priority === 'urgent').length; }
  get criticalCount()     { return this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length; }
  get actionCount()       { return this.research.filter(r => r.actionRequired).length; }
  get highConviction()    { return this.theses.filter(t => t.conviction === 'High').length; }
  get activeAlerts()      { return this.alerts.filter(a => !a.resolved).length; }
  get topActiveAlerts()   { return this.alerts.filter(a => !a.resolved).slice(0, 3); }
  get briefingsReady()    { return this.clients.filter(c => !!c.briefing).length; }
  get analyzedSignals()   { return this.research.filter(r => !!r.aiAnalysis).length; }

  get todayMeetings() {
    const today = new Date().toDateString();
    return this.clients.filter(c => c.nextMeeting && new Date(c.nextMeeting).toDateString() === today);
  }

  get upcomingClients() {
    return this.clients.filter(c => c.nextMeeting).slice(0, 4);
  }

  get integratedFirmItems(): IntegratedFirmItem[] {
    switch (this.persona?.id) {
      case 'pm':
        return [
          {
            title: 'Investment Banking touchpoint with ADIA',
            source: 'Investment Banking',
            relevance: 'Client overlap',
            summary: 'Carl from Investment Banking met Ahmed Al-Rashid this morning; AI infrastructure financing appetite remains active and data-center credit structures were discussed.',
            sources: ['Carl B.', 'IB CRM', 'Client Notes']
          },
          {
            title: 'China policy watch moving into risk committee lane',
            source: 'Central Risk',
            relevance: 'Position sizing',
            summary: 'China regulatory-beta escalation is now being discussed outside EM only; PMs with BABA or adjacent internet exposure are expected to revisit sizing assumptions.',
            sources: ['Risk Committee', 'Internal Risk System']
          },
          {
            title: 'Private markets infra read-through to public names',
            source: 'Private Investing',
            relevance: 'Cross-firm thesis input',
            summary: 'Private-side diligence on power-constrained data-center builds is strengthening the case for utility and grid-constrained beneficiaries across public portfolios.',
            sources: ['Private Investing', 'Diligence Memo']
          }
        ];
      case 'sales':
        return [
          {
            title: 'Ahmed Al-Rashid relationship update',
            source: 'Investment Banking',
            relevance: 'Meeting prep',
            summary: 'Carl from Investment Banking recently met Ahmed Al-Rashid; infra-financing optionality and co-invest structures came up, which can support your next distribution conversation.',
            sources: ['Carl B.', 'IB CRM']
          },
          {
            title: 'OTPP governance lens getting sharper',
            source: 'ESG + Compliance',
            relevance: 'Client messaging',
            summary: 'Governance documentation standards for AI-enabled active management were updated this morning; this is directly usable with Sarah Chen and other ESG-overlay clients.',
            sources: ['Compliance', 'ESG Office']
          },
          {
            title: 'Board-level private marks scrutiny rising',
            source: 'Private Markets',
            relevance: 'CalPERS prep',
            summary: 'Multiple public pension conversations across the firm are converging on valuation-lag and manager-concentration questions, reinforcing the need for a strong Maria Gonzalez package.',
            sources: ['Private Markets', 'Relationship Notes']
          }
        ];
      case 'trading':
        return [
          {
            title: 'PM directive likely to accelerate',
            source: 'Portfolio Management',
            relevance: 'Execution timing',
            summary: 'The PM team is leaning toward earlier semiconductor de-risking if the next liquidity window is clean; execution readiness matters more than passive queueing today.',
            sources: ['PM Workstation', 'Internal Risk System']
          },
          {
            title: 'Prime brokerage color on semi crowding',
            source: 'External Coverage',
            relevance: 'Microstructure',
            summary: 'Street color suggests semi crowding remains elevated into the next catalyst window, which raises slippage risk on reactive trims.',
            sources: ['Prime Notes', 'Bloomberg']
          },
          {
            title: 'Cross-desk hedge demand building',
            source: 'Risk + Macro',
            relevance: 'Options liquidity',
            summary: 'Macro and EM teams are both looking at downside overlays, which could tighten pricing in index and sector hedge instruments later in session.',
            sources: ['Risk Desk', 'Macro Desk']
          }
        ];
      case 'research':
        return [
          {
            title: 'Private-side diligence may validate public thesis',
            source: 'Private Investing',
            relevance: 'Research read-through',
            summary: 'Recent infra diligence from the private side contains useful demand and permitting color that may strengthen the utility and AI-infrastructure research stack.',
            sources: ['Private Investing', 'Diligence Memo']
          },
          {
            title: 'Investment Banking has fresh sovereign demand color',
            source: 'Investment Banking',
            relevance: 'Channel check',
            summary: 'Sovereign and pension conversations are emphasizing governance, liquidity, and AI monetization timing rather than pure growth narratives.',
            sources: ['IB CRM', 'Client Notes']
          },
          {
            title: 'Risk team escalated a factor-regime question',
            source: 'Central Risk',
            relevance: 'Research priority',
            summary: 'Risk wants clearer regime definitions around China-beta and semi concentration so thesis notes and monitoring triggers align with alert thresholds.',
            sources: ['Risk Committee', 'Internal Risk System']
          }
        ];
      case 'executive':
        return [
          {
            title: 'Firm-wide sovereign conversations clustering around AI infra',
            source: 'Investment Banking + Distribution',
            relevance: 'Strategic demand signal',
            summary: 'Multiple teams are hearing the same thing: sovereign allocators want governance-safe access to AI infrastructure, not generic tech-beta.',
            sources: ['IB CRM', 'Distribution Notes']
          },
          {
            title: 'Cross-firm governance pressure is increasing',
            source: 'Compliance + Risk',
            relevance: 'Operating model',
            summary: 'AI governance, concentration management, and auditability are being raised in more client and internal forums at the same time, suggesting a firm-level operating issue rather than a desk-level one.',
            sources: ['Compliance', 'Risk Committee']
          },
          {
            title: 'Private-public knowledge loop is still underused',
            source: 'Private Investing',
            relevance: 'Platform opportunity',
            summary: 'Relevant private-side market intelligence is surfacing, but distribution into public-side workflows remains person-dependent instead of systematic.',
            sources: ['Private Investing', 'Operating Review']
          }
        ];
      default:
        return [];
    }
  }

  get teamCollaborationItems(): TeamCollaborationItem[] {
    switch (this.persona?.id) {
      case 'pm':
        return [
          { id: 'pm-1', owner: 'Maya Patel', team: 'Risk', title: 'China beta threshold review', intersection: 'BABA sizing and VaR trajectory intersect with your book.', ask: 'Needs PM feedback on what should trigger a conviction downgrade.', status: 'Review requested', updated: '12m ago', mentions: ['Maya Patel', 'Jon Risk'] },
          { id: 'pm-2', owner: 'Leo Turner', team: 'Trading', title: 'Semi trim execution plan', intersection: 'Execution assumptions are being prepared for a potential NVDA/AMD trim.', ask: 'Confirm whether you want speed or minimal footprint if the trim is authorized.', status: 'Waiting on direction', updated: '18m ago', mentions: ['Leo Turner', 'Ava Chen'] },
          { id: 'pm-3', owner: 'Nina Brooks', team: 'Research', title: 'TSMC follow-through validation', intersection: 'Research is testing whether supply-chain checks justify keeping TSM at current conviction.', ask: 'Review falsification criteria before the note is circulated.', status: 'Draft ready', updated: '31m ago', mentions: ['Nina Brooks'] }
        ];
      case 'sales':
        return [
          { id: 'sales-1', owner: 'Carl Benson', team: 'Investment Banking', title: 'ADIA relationship crossover', intersection: 'His latest meeting with Ahmed Al-Rashid can sharpen your next outreach.', ask: 'Wants distribution input on what commercial angle to lead with in the follow-up.', status: 'Feedback needed', updated: '9m ago', mentions: ['Carl Benson', 'Sarah Kim'] },
          { id: 'sales-2', owner: 'Elena Park', team: 'ESG / Compliance', title: 'OTPP governance appendix', intersection: 'Sarah Chen prep depends on updated AI governance wording.', ask: 'Review whether the language is client-ready before it goes out.', status: 'In review', updated: '16m ago', mentions: ['Elena Park'] },
          { id: 'sales-3', owner: 'David Romero', team: 'Private Markets', title: 'CalPERS valuation transparency pack', intersection: 'Maria Gonzalez meeting prep overlaps with private-mark methodology work already underway.', ask: 'Needs help prioritizing which exhibits matter most for the committee.', status: 'Needs prioritization', updated: '27m ago', mentions: ['David Romero', 'Maria Ops'] }
        ];
      case 'trading':
        return [
          { id: 'trading-1', owner: 'Ava Chen', team: 'Portfolio Management', title: 'Conditional trim readiness', intersection: 'PM is defining thresholds that may trigger same-day action in semis.', ask: 'Provide feedback on realistic execution cadence before the next market window.', status: 'Actionable now', updated: '7m ago', mentions: ['Ava Chen', 'Leo Turner'] },
          { id: 'trading-2', owner: 'Jon Risk', team: 'Risk', title: 'Hedge escalation framework', intersection: 'Options overlays may be needed if beta clusters worsen.', ask: 'Review the proposed escalation ladder and whether desk capacity supports it.', status: 'Review requested', updated: '15m ago', mentions: ['Jon Risk'] },
          { id: 'trading-3', owner: 'Nina Brooks', team: 'Research', title: 'Signal-to-order translation', intersection: 'Research wants tighter mapping from new signals into execution urgency and notional ranges.', ask: 'Comment on what desk-level fields are missing from current signal notes.', status: 'Needs input', updated: '24m ago', mentions: ['Nina Brooks', 'Ava Chen'] }
        ];
      case 'research':
        return [
          { id: 'research-1', owner: 'Jon Risk', team: 'Risk', title: 'Alert threshold alignment', intersection: 'Risk needs research notes to line up with actual regime and trigger language.', ask: 'Review where your current notes are too qualitative for risk escalation.', status: 'Open for feedback', updated: '11m ago', mentions: ['Jon Risk'] },
          { id: 'research-2', owner: 'Carl Benson', team: 'Investment Banking', title: 'Sovereign client pattern readout', intersection: 'Banking is collecting similar client questions across sovereign and pension allocators.', ask: 'Help turn anecdotal color into a usable research pattern memo.', status: 'Drafting', updated: '19m ago', mentions: ['Carl Benson', 'Maya Patel'] },
          { id: 'research-3', owner: 'Maya Patel', team: 'Risk', title: 'China-beta falsification triggers', intersection: 'BABA and EM risk framing depends on sharper invalidation thresholds.', ask: 'Pressure-test the trigger set before the next committee packet.', status: 'Review requested', updated: '28m ago', mentions: ['Maya Patel', 'Leo Turner'] }
        ];
      case 'executive':
        return [
          { id: 'executive-1', owner: 'Head of Distribution', team: 'Distribution', title: 'Cross-client demand pattern synthesis', intersection: 'Distribution sees repeated governance and AI-infra questions across top accounts.', ask: 'Needs executive view on whether this becomes a formal go-to-market theme.', status: 'Needs steer', updated: '10m ago', mentions: ['Head of Distribution', 'CIO Office'] },
          { id: 'executive-2', owner: 'Maya Patel', team: 'Risk', title: 'Concentration governance escalation', intersection: 'Risk wants clarity on how aggressively to standardize threshold-based escalation across teams.', ask: 'Provide a policy view before the next risk committee.', status: 'Decision support', updated: '21m ago', mentions: ['Maya Patel', 'Jon Risk'] },
          { id: 'executive-3', owner: 'Carl Benson', team: 'Investment Banking', title: 'Private-public intelligence routing gap', intersection: 'Banking and investing both see valuable overlap, but distribution remains person-dependent.', ask: 'Comment on whether this should become a firm platform initiative.', status: 'Strategic input', updated: '34m ago', mentions: ['Carl Benson', 'Platform Lead'] }
        ];
      default:
        return [];
    }
  }

  get today() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  get greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good evening';
  }

  daysUntil(date?: Date): string {
    if (!date) return '\u2014';
    const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
    if (d < 0)   return 'Past';
    if (d === 0)  return 'Today';
    if (d === 1)  return 'Tomorrow';
    return `${d}d`;
  }

  urgencyClass(date?: Date): string {
    if (!date) return 'text-slate-500';
    const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
    if (d <= 1) return 'text-red-400';
    if (d <= 3) return 'text-amber-400';
    return 'text-gold/70';
  }

  toggleBriefing() {
    this.briefingExpanded = !this.briefingExpanded;
  }

  get topCriticalAlert(): RiskAlert | undefined {
    return this.alerts.find(a => a.severity === 'critical' && !a.resolved);
  }

  getThesisAlertSeverity(ticker: string): Severity | null {
    const rank: Record<string, number> = { critical: 3, warning: 2, info: 1 };
    let highest: Severity | null = null;
    for (const a of this.alerts.filter(x => !x.resolved)) {
      if (a.rawData.includes(ticker) || a.title.includes(ticker)) {
        if (!highest || rank[a.severity] > (rank[highest] || 0)) highest = a.severity;
      }
    }
    return highest;
  }

  getThesisAlertLabel(ticker: string): string {
    for (const a of this.alerts.filter(x => !x.resolved)) {
      if (a.rawData.includes(ticker) || a.title.includes(ticker)) {
        if (a.severity === 'critical') return 'VaR \u2191';
        if (a.type === 'concentration') return 'Conc.';
        if (a.type === 'factor') return 'Duration';
        if (a.type === 'compliance') return 'Limit';
        return a.severity;
      }
    }
    return '';
  }

  get flaggedThesisCount(): number {
    return this.theses.filter(t => this.getThesisAlertSeverity(t.ticker)).length;
  }

  /* ── Narrator spotlight methods ── */

  startNarrator(): void {
    if (this.persona?.id !== 'pm') return;
    if (DashboardComponent.narratorPlayed) return;
    DashboardComponent.narratorPlayed = true;
    this.narratorActive = true;
    this.narratorStep = -1;
    setTimeout(() => this.advanceNarrator(), 500);
  }

  advanceNarrator(): void {
    // Hide tooltip during transition
    this.narratorTransitioning = true;
    this.narratorStep++;

    if (this.narratorStep >= this.narratorSteps.length) {
      this.endNarrator();
      return;
    }

    const step = this.narratorSteps[this.narratorStep];

    // Scroll target into view, then reveal tooltip after scroll settles
    const scrollTimer = setTimeout(() => {
      const el = document.querySelector(`[data-narrator="${step.target}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Wait for scroll to finish, then show tooltip
      const revealTimer = setTimeout(() => {
        this.narratorTransitioning = false;

        // Auto-advance after step duration (starts after tooltip is visible)
        const advanceTimer = setTimeout(() => this.advanceNarrator(), step.duration);
        this.narratorTimers.push(advanceTimer);
      }, 500);
      this.narratorTimers.push(revealTimer);
    }, 80);
    this.narratorTimers.push(scrollTimer);
  }

  skipToNext(): void {
    this.narratorTimers.forEach(t => clearTimeout(t));
    this.narratorTimers = [];
    this.advanceNarrator();
  }

  dismissNarrator(): void {
    this.endNarrator();
  }

  private endNarrator(): void {
    this.narratorTimers.forEach(t => clearTimeout(t));
    this.narratorTimers = [];
    this.narratorActive = false;
    this.narratorStep = -1;
    this.narratorTransitioning = false;
  }

  isNarratorTarget(target: string): boolean {
    return this.narratorActive && this.narratorStep >= 0
      && this.narratorStep < this.narratorSteps.length
      && this.narratorSteps[this.narratorStep].target === target;
  }

  get narratorTooltipStyle(): Record<string, string> {
    if (this.narratorStep < 0 || this.narratorStep >= this.narratorSteps.length) {
      return { display: 'none' };
    }
    const step = this.narratorSteps[this.narratorStep];
    const el = document.querySelector(`[data-narrator="${step.target}"]`);
    if (!el) return { display: 'none' };

    const rect = el.getBoundingClientRect();
    const gap = 16;

    switch (step.position) {
      case 'below':
        return { position: 'fixed', top: `${rect.bottom + gap}px`, left: `${rect.left}px`, zIndex: '310' };
      case 'above':
        return { position: 'fixed', bottom: `${window.innerHeight - rect.top + gap}px`, left: `${rect.left}px`, zIndex: '310' };
      case 'right':
        return { position: 'fixed', top: `${rect.top + rect.height / 2 - 48}px`, left: `${Math.min(rect.right + gap, window.innerWidth - 380)}px`, zIndex: '310' };
      case 'left':
        return { position: 'fixed', top: `${rect.top + rect.height / 2 - 48}px`, right: `${window.innerWidth - rect.left + gap}px`, zIndex: '310' };
    }
  }

  toggleCollaboration(id: string) {
    this.collaborationExpanded[id] = !this.collaborationExpanded[id];
  }

  isCollaborationExpanded(id: string): boolean {
    return !!this.collaborationExpanded[id];
  }

  async mentionPerson(name: string, event: Event) {
    event.stopPropagation();
    const mention = `@${name}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(mention);
        this.showCollaborationToast(`Mention copied - ${mention}`);
        return;
      }
    } catch {
      // Fall back to toast only if clipboard is unavailable.
    }
    this.showCollaborationToast(`Mention ready - ${mention}`);
  }

  private showCollaborationToast(message: string) {
    this.collaborationToast = message;
    this.collaborationToastVisible = true;
    if (this.collaborationToastTimer) clearTimeout(this.collaborationToastTimer);
    this.collaborationToastTimer = setTimeout(() => this.collaborationToastVisible = false, 2400);
  }

  private getSystemPrompt(): string {
    switch (this.persona?.id) {
      case 'pm':
        return 'You are the MSIM 2030 Portfolio Manager Briefing Agent. Generate a crisp morning briefing for the portfolio manager. Focus on: active thesis positions, conviction changes, risk alerts requiring decisions, and urgent research signals. Be institutional, direct, and action-oriented. Structure: overnight developments, top 3 priorities, risk flags.';
      case 'sales':
        return 'You are the MSIM 2030 Sales Briefing Agent. Write for institutional sales leaders preparing for live client conversations. Be concise, specific, and commercially useful. Never use the phrase "Pre-Meeting Briefing". Use this exact markdown structure and heading names: Client Heatmap, Meeting-by-Meeting Prep, Three Cross-Client Talking Points, Likely Objections + Best Response, Suggested Actions Today. In each client section include: urgency, mandate fit, likely pushback, best response, and one explicit commercial ask. Use concrete language, no vague filler, and no compliance-risky promises. Append citations to each substantive point in this exact format: [Sources: Bloomberg | AlphaSense | FactSet].';
      case 'trading':
        return 'You are the MSIM 2030 Trading Briefing Agent. Write for a buy-side execution team before market open. Be precise and operational. Use this exact structure with markdown headings: 1) Market Open Setup, 2) Priority Orders Ranked, 3) Liquidity + Slippage Watchlist, 4) Risk Limits and Escalations, 5) First 90-Minute Plan. Include concrete execution tactics (TWAP/VWAP/limit/participation), urgency tags, and specific escalation triggers. Append citations to each substantive point in this format: [Sources: Bloomberg | FactSet | Refinitiv | Internal Risk System].';
      case 'research':
        return 'You are the MSIM 2030 Research Briefing Agent. Generate a morning briefing for the research analyst. Focus on: incoming signal pipeline, thesis validation updates, open questions needing investigation, and conviction scoring changes. Be analytical, thorough, and evidence-based. Structure: signal queue, validation status, open research threads.';
      case 'executive':
        return 'You are the MSIM 2030 Executive Briefing Agent. Write for CIO and executive committee review. Be strategic, board-ready, and decision-oriented. Never use the phrase "Pre-Meeting Briefing". Use this exact markdown structure and heading names: Executive Snapshot, What Changed Since Yesterday, Strategic Risk Posture, Decisions Needed Today, KPI Scorecard. In Decisions Needed Today, each item must include decision, impact, owner, and deadline. Keep it compact and high-signal. Append citations to each substantive point in this exact format: [Sources: Bloomberg | AlphaSense | FactSet | SEC Filings].';
      default:
        return 'You are the MSIM 2030 ambient intelligence layer. Generate a crisp morning briefing. Be institutional, direct, and action-oriented. Lead with what matters most today.';
    }
  }

  private getBriefingPrompt(): string {
    const base = 'Generate a morning briefing for ' + this.today + '.\n\n';
    switch (this.persona?.id) {
      case 'pm':
        return base +
          'Active thesis book:\n' +
          this.theses.map(t => '- ' + t.ticker + ' ' + t.direction + ' | Conviction: ' + t.conviction + ' (' + t.score + '/10) | Price: $' + t.currentPrice + ' -> Target: $' + t.targetPrice).join('\n') +
          '\n\nUrgent signals requiring review: ' + (this.research.filter(r => r.priority === 'urgent').map(r => r.title).join('; ') || 'None') +
          '\nAction-required signals: ' + (this.research.filter(r => r.actionRequired).map(r => r.title).join('; ') || 'None') +
          '\nActive risk alerts: ' + this.alerts.filter(a => !a.resolved).map(a => a.title + ' (' + a.severity + ')').join('; ') +
          '\n\nDeliver: overnight developments affecting our positions, top 3 priorities for the PM today, and risk flags requiring immediate decisions.';

      case 'sales':
        return base +
          'Upcoming client meetings:\n' +
          this.clients.filter(c => c.nextMeeting).map(c => '- ' + c.name + ' @ ' + c.firm + ' (' + c.aum + ' AUM) | Meeting: ' + this.daysUntil(c.nextMeeting) + ' | Concerns: ' + c.concerns.join(', ')).join('\n') +
          '\n\nPortfolio performance: Active Alpha +2.4% YTD, Sharpe 1.21, Info Ratio 0.84' +
          '\nKey market signals: ' + (this.research.filter(r => r.priority === 'urgent').map(r => r.title).join('; ') || 'Markets quiet') +
          '\nBriefings ready: ' + this.briefingsReady + ' of ' + this.clients.length + ' clients' +
          '\n\nAdditional guidance:' +
          '\n- Rank clients by commercial urgency (renewal/upsize/risk).' +
          '\n- Include one tailored opener and one tailored close per top 3 meetings.' +
          '\n- Provide exactly 3 cross-client talking points backed by current portfolio evidence.' +
          '\n- Include likely objection handling with a concise rebuttal for each.' +
          '\n- End with a same-day action list (owner + timing).' +
          '\n- Do NOT label the output as Pre-Meeting Briefing.' +
          '\n- Add [Sources: ...] after each substantive point with 2-4 sources.';

      case 'trading':
        return base +
          'Active positions:\n' +
          this.theses.map(t => '- ' + t.ticker + ': $' + (this.livePrices[t.ticker] || t.currentPrice) + ' (' + t.direction + ')').join('\n') +
          '\n\nPending execution orders:\n- NVDA trim 2% of book ($4.2M notional) — PM directive pre-earnings\n- AMD IPS compliance trim, 10-day TWAP ($3.1M notional)\n- EM put spread tail hedge per risk committee ($5.1M notional)' +
          '\n\nRisk limits: Semi concentration 34.8%/35%, 10d VaR $12.4M/$15M, Single stock max 4.73%/5%' +
          '\nVIX: 14.2 (22nd percentile)' +
          '\n\nAdditional guidance:' +
          '\n- Rank all orders by urgency and market-impact risk.' +
          '\n- Specify execution tactic, participation rate, and fallback tactic for each priority order.' +
          '\n- Flag liquidity/volatility hazards that could break execution assumptions.' +
          '\n- Call out explicit escalation thresholds tied to risk limits.' +
          '\n- Finish with a 0-30 min, 30-60 min, and 60-90 min playbook.' +
          '\n- Add [Sources: ...] after each substantive point with 2-4 sources.';

      case 'research':
        return base +
          'Research signal queue:\n' +
          this.research.map(r => '- [' + r.priority.toUpperCase() + '] ' + r.title + ' | Tickers: ' + r.tickers.join(', ') + (r.actionRequired ? ' ACTION REQUIRED' : '') + (r.aiAnalysis ? ' analyzed' : ' pending')).join('\n') +
          '\n\nActive thesis positions for validation:\n' +
          this.theses.map(t => '- ' + t.ticker + ': ' + t.direction + ' ' + t.conviction + ' conviction (' + t.score + '/10)').join('\n') +
          '\n\nOpen questions:\n- MSFT $14B capex timeline alignment with Blackwell delivery?\n- GPU vs networking vs real estate split of Azure capex?\n- Intel 18A yield data credibility assessment?\n- BABA cloud revenue win rate sustainability?' +
          '\n\nDeliver: research queue priorities, thesis validation status, and key open questions to investigate today.';

      case 'executive':
        return base +
          'Portfolio summary:\n- AUM under advisory: $2.1T\n- Active Alpha YTD: +2.4% (top quartile)\n- Sharpe Ratio (3Y): 1.21\n- Information Ratio: 0.84\n- Team utilization: 94% (9 AI agents active)' +
          '\n\nActive positions: ' + this.theses.length + ' theses (' + this.highConviction + ' high conviction)' +
          '\nRisk posture: ' + this.activeAlerts + ' active alerts, ' + this.criticalCount + ' critical' +
          '\nClient relationships: ' + this.clients.length + ' institutional clients, ' + this.briefingsReady + ' briefings prepared' +
          '\nResearch pipeline: ' + this.research.length + ' signals queued, ' + this.actionCount + ' requiring action' +
          '\n\nAgent swarm status: All 9 agents operational.' +
          '\n\nAdditional guidance:' +
          '\n- Highlight what changed versus prior day and why it matters.' +
          '\n- Present decisions in a table-like bullet format: decision, impact, owner, deadline.' +
          '\n- Include downside scenario and mitigation for each strategic risk.' +
          '\n- Keep tone board-ready: no jargon without implication.' +
          '\n- End with KPI scorecard using RAG-style status labels (Green/Amber/Red).' +
          '\n- Do NOT label the output as Pre-Meeting Briefing.' +
          '\n- Add [Sources: ...] after each substantive point with 2-4 sources.';

      default:
        return base +
          'Active portfolio theses: ' + this.theses.map(t => t.ticker + ' ' + t.direction + ' (' + t.conviction + ', ' + t.score + '/10)').join(', ') +
          '\nUrgent signals: ' + this.research.filter(r => r.priority === 'urgent').map(r => r.title).join('; ') +
          '\nActive risk alerts: ' + this.alerts.filter(a => !a.resolved).map(a => a.title + ' (' + a.severity + ')').join('; ') +
          '\n\nDeliver: key overnight developments, top 3 priorities, and risk flags.';
    }
  }

  private getBriefingAgentName(id?: PersonaId): string {
    switch (id) {
      case 'pm': return 'Portfolio Manager Briefing Agent';
      case 'sales': return 'Sales Briefing Agent';
      case 'trading': return 'Trading Briefing Agent';
      case 'research': return 'Research Briefing Agent';
      case 'executive': return 'Executive Briefing Agent';
      default: return 'Morning Briefing Agent';
    }
  }

  async generateBriefing() {
    if (!this.persona) return;
    const personaId = this.persona.id;
    const runId = ++this.briefingRunSeq;
    this.morningBriefing = '';
    this.briefingLoading = true;
    this.briefingGenerated = false;
    this.briefingAgentName = this.getBriefingAgentName(personaId);

    const systemPrompt = this.getSystemPrompt();
    const prompt = this.getBriefingPrompt();

    let draft = '';
    await this.ai.stream(systemPrompt, prompt, chunk => {
      if (runId !== this.briefingRunSeq) return;
      if (this.persona?.id !== personaId) return;
      draft += chunk;
      this.morningBriefing = draft;
    });
    if (runId !== this.briefingRunSeq) return;
    if (this.persona?.id !== personaId) return;
    this.briefingLoading   = false;
    this.briefingGenerated = true;
  }
}
