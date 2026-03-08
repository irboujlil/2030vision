import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { Client } from '../../core/models';

@Component({ selector: 'app-client-intel', templateUrl: './client-intel.component.html' })
export class ClientIntelComponent implements OnInit {
  clients: Client[] = [];
  selected: Client | null = null;
  briefingText = '';
  briefingLoading = false;
  private generatingClientId: string | null = null;
  private revealedBriefings = new Set<string>();

  marketContext = `Markets today: S&P 500 +0.4%, rates stable at 4.35%, USD slightly weaker.
Key events: NVDA earnings tomorrow pre-market, Fed minutes released today with hawkish tone,
EU AI Act final guidance published this morning impacting financial services.`;

  constructor(private data: DataService) {}

  ngOnInit() { this.data.clients$.subscribe(c => this.clients = c); }

  select(c: Client) {
    this.selected = c;
    // Keep showing the active stream if this exact client is currently being generated.
    if (this.generatingClientId === c.id && this.briefingLoading) return;
    if (c.id === 'c1' && !this.revealedBriefings.has(c.id)) {
      this.briefingText = '';
      return;
    }
    this.briefingText = c.briefing || '';
  }

  async generateBriefing() {
    if (!this.selected) return;
    const c = this.selected;
    this.generatingClientId = c.id;
    this.briefingText = '';
    this.briefingLoading = true;
    const simulatedDelayMs = 3000 + Math.floor(Math.random() * 2001);
    await new Promise(r => setTimeout(r, simulatedDelayMs));
    const finalText = this.buildPreMeetingBriefing(c);
    this.data.updateClient(c.id, { briefing: finalText });
    this.revealedBriefings.add(c.id);
    if (this.selected?.id === c.id) this.briefingText = finalText;
    this.generatingClientId = null;
    this.briefingLoading = false;
  }

  private buildPreMeetingBriefing(client: Client): string {
    const upperName = client.name.toUpperCase();
    const upperFirm = client.firm.toUpperCase();
    const concernA = client.concerns[0] || 'portfolio governance';
    const concernB = client.concerns[1] || 'risk controls';
    const concernC = client.concerns[2] || 'manager oversight';

    const profile: Record<string, { drift: string; dev1: string; dev2: string; dev3: string }> = {
      c1: {
        drift: 'Since last meeting, the portfolio has drifted +2.3% toward growth factor and away from the original balanced mandate. Tech overweight now at 34% vs 28% benchmark. No IPS breach but trending toward guideline limit - worth discussing proactively.',
        dev1: 'Fed higher-for-longer scenario is consistent with the 60% passive sleeve anchor - no rebalancing pressure there.',
        dev2: 'EU AI Act guidance remains directly relevant to the ESG overlay requirements with current holdings mapped as compliant.',
        dev3: 'Semiconductor concentration is still within limits, but we should proactively present trim pacing before it is requested.'
      },
      c2: {
        drift: 'Current positioning remains aligned to long-duration strategic allocation with technology sleeve still below policy maximum. Liquidity profile remains robust and supports staged reallocation if requested.',
        dev1: 'AI infrastructure capex acceleration supports selective upsize conversations within technology risk budget.',
        dev2: 'EM geopolitical sensitivity remains contained versus prior quarter through risk-aware sizing.',
        dev3: 'Credit sleeve carry remains attractive while preserving liquidity thresholds expected by the mandate.'
      },
      c3: {
        drift: 'Private market sleeves remain aligned with long-term expansion objectives while preserving inflation-linked characteristics. Mark dispersion has widened by vintage and sector, so valuation transparency should be front-footed in the meeting.',
        dev1: 'Private market valuation scrutiny is increasing across public pension committees, especially around lag and comparable methodology.',
        dev2: 'Inflation moderation has not eliminated duration risk, so inflation-duration matching remains a core point to reaffirm.',
        dev3: 'Manager concentration monitoring remains a governance priority; we should show current concentration bands and escalation triggers.'
      },
      c4: {
        drift: 'Global balanced positioning remains close to mandate with currency-hedged foreign exposure maintained. The current mix preserves downside control while keeping selective AI-linked equity upside.',
        dev1: 'BOJ normalization path keeps hedging-cost sensitivity elevated and should be discussed with scenario ranges.',
        dev2: 'Governance documentation for AI-assisted process remains aligned with Japan FSA expectations.',
        dev3: 'Attribution methodology transparency should be presented clearly to pre-empt manager-comparison questions.'
      }
    };

    const p = profile[client.id] || profile['c1'];

    return `## PRE-MEETING BRIEFING - ${upperName}, ${upperFirm}

**Portfolio Drift & Positioning**
${p.drift}
[Sources: FactSet | Bloomberg | Internal Risk System]

**Relevant Market Developments**
- ${p.dev1} [Sources: Bloomberg | Refinitiv]
- ${p.dev2} [Sources: AlphaSense | SEC Filings]
- ${p.dev3} [Sources: FactSet | Internal Research DB]

**3 Proactive Conversation Starters**
1. "Before you ask, we prepared the latest view on ${concernA} and what changed since the prior review." [Sources: Internal Research DB | Bloomberg]
2. "We mapped the mandate directly to today's risk posture so you can see where we are inside guardrails and where we are close." [Sources: FactSet | Internal Risk System]
3. "We can walk through the next 30-day plan, including what would trigger a rebalance or conviction change." [Sources: Internal Risk System | AlphaSense]

**Questions They Will Ask (and how to answer)**
- "${concernA}: what changed since last meeting?" - show delta view versus previous review with evidence-backed rationale.
- "${concernB}: where is the risk if markets gap?" - show downside scenario and mitigation already queued.
- "${concernC}: how do we enforce discipline?" - show limits, monitoring cadence, and escalation ownership.

**Risk Points to Address Before They Do**
- Ensure current exposure discussion is framed versus mandate limits, not only performance.
- Clarify near-term scenario risk and pre-committed mitigation actions.
- Confirm follow-up artifacts (attribution, risk map, and mandate-fit notes) with delivery timing.

**Suggested Follow-ups**
Send a one-page mandate-fit summary, risk appendix, and attribution snapshot within 24 hours of the meeting.`;
  }

  daysUntil(date?: Date): string {
    if (!date) return '—';
    const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
    if (d < 0) return 'Past';
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    return `${d} days`;
  }

  urgency(date?: Date): string {
    if (!date) return '';
    const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
    if (d <= 1) return 'text-red-400';
    if (d <= 3) return 'text-amber-400';
    return 'text-gold';
  }
}
