import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

@Injectable({ providedIn: 'root' })
export class AiService {

  private get key(): string {
    return environment.anthropicApiKey;
  }

  get isConfigured(): boolean {
    return this.key !== 'YOUR_API_KEY_HERE' && this.key.length > 10;
  }

  /** Stream tokens from Claude. Call onChunk for each text delta. */
  async stream(system: string, user: string, onChunk: (t: string) => void): Promise<void> {
    if (!this.isConfigured) {
      await this.simulateStream(user, onChunk);
      return;
    }
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        stream: true,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error ${res.status}: ${err}`);
    }

    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.delta?.text;
          if (delta) onChunk(delta);
        } catch { /* skip */ }
      }
    }
  }

  /** Simulate a realistic AI response for demo mode (no API key) */
  private async simulateStream(prompt: string, onChunk: (t: string) => void): Promise<void> {
    const response = this.getDemoResponse(prompt);
    onChunk(response);
  }

  private getDemoResponse(prompt: string): string {
    const p = prompt.toLowerCase();
    const has = (...parts: string[]) => parts.every(part => p.includes(part));

    if (has('active thesis book', 'top 3 priorities')) {
      return `## PORTFOLIO MANAGER BRIEFING

**Overnight Developments**
- MSFT Azure capex expansion remains the most important demand confirmation for AI infrastructure sensitivity in current holdings. [Sources: Bloomberg | SEC Filings | AlphaSense]
- Rate-volatility stayed elevated despite stable headline prints, keeping duration-sensitive names vulnerable to sharp factor rotations. [Sources: Refinitiv | FactSet]
- Regulatory noise in China remains the key tail-risk channel for EM internet exposure. [Sources: Bloomberg | Internal Risk System]

**Top 3 Priorities Today**
1. **Concentration Control:** Semiconductor exposure is near policy limit; confirm trim cadence before market liquidity thins. [Sources: Internal Risk System | FactSet]
2. **Conviction Alignment:** Revalidate BABA sizing versus current regulatory-beta regime and decide hold/trim threshold for this week. [Sources: Bloomberg | Internal Research DB]
3. **Risk Sign-off:** Review VaR trajectory and define explicit escalation trigger if correlation clusters expand intraday. [Sources: Internal Risk System]

**Risk Flags Requiring Decisions**
- **Semiconductor concentration proximity:** No breach yet, but drift path implies elevated near-term compliance risk without active management.
- **China policy beta:** Current sensitivity is above comfort band for neutral risk budget assumptions.
- **Rate shock sensitivity:** Utility/long-duration sleeve remains vulnerable to abrupt curve repricing.
[Sources: Internal Risk System | FactSet | Refinitiv]

**Recommended PM Actions**
1. Approve tactical trim schedule with execution guardrails before noon.
2. Set explicit conviction downgrade trigger for BABA if policy-risk indicators worsen.
3. Hold NVDA/TSM core exposure, but pair with downside hedge sizing review into next catalyst window.
[Sources: Internal Research DB | Bloomberg]`;
    }
    if (p.includes('research signal queue') && p.includes('thesis validation status')) {
      return `## RESEARCH BRIEFING

**Signal Queue Priorities**
1. **MSFT 8-K capex expansion** - Validate GPU/infra demand durability assumptions for NVDA/TSM downstream effects. [Sources: SEC Filings | Bloomberg | AlphaSense]
2. **Alibaba cloud contract acceleration** - Separate one-quarter noise from structural cloud-margin inflection. [Sources: FactSet | AlphaSense]
3. **EU AI Act implementation guidance** - Map regulatory burden channels to covered financials and compliance-sensitive portfolios. [Sources: Bloomberg | SEC Filings]

**Thesis Validation Status**
- **NVDA (High Conviction):** Thesis remains supported by hyperscaler demand data; continue monitoring margin durability triggers. [Sources: FactSet | Internal Research DB]
- **BABA (Medium Conviction):** Thesis still live but risk-adjusted confidence remains capped by regulatory-beta uncertainty. [Sources: Bloomberg | Internal Risk System]
- **NEE (High Conviction):** Validation stable; core risk remains duration sensitivity rather than demand collapse. [Sources: Refinitiv | FactSet]

**Open Research Threads**
1. Is capex growth translating to sustainable earnings power or front-loaded spending?
2. Which trigger would invalidate current BABA sizing before next committee review?
3. What second-order effects from EU AI compliance could alter sector risk premia?
[Sources: Internal Research DB | Bloomberg]

**Actions for Today**
- Publish updated signal ranking by noon with conviction-adjusted impact scores.
- Issue a validation memo on NVDA/TSM linkage with explicit falsification criteria.
- Escalate any trigger movement from watching to triggered before close.
[Sources: Internal Research DB | Internal Risk System]`;
    }
    if (has('upcoming client meetings', 'briefings ready')) {
      return `## SALES BRIEFING

### Client Heatmap
1. **Sarah Chen - OTPP (2d | High Urgency)**  
Mandate fit: global equity with ESG overlay, currently aligned but sensitive to AI governance narrative.  
Commercial objective: secure follow-on allocation to Global Equity Alpha sleeve (+50 to +75 bps).  
Watch item: fee-compression comparison against passive alternatives. [Sources: Bloomberg | FactSet | Internal Research DB]

2. **Ahmed Al-Rashid - ADIA (5d | High Urgency)**  
Mandate fit: strategic multi-asset with explicit technology and infrastructure allowance.  
Commercial objective: advance co-investment conversation tied to AI infrastructure debt sleeve.  
Watch item: geopolitical risk framing for EM-linked exposures. [Sources: Refinitiv | Bloomberg | Internal Risk System]

3. **Maria Gonzalez - CalPERS (Tomorrow | Medium/High Urgency)**  
Mandate fit: inflation-linked and private-market expansion mandate is intact.  
Commercial objective: schedule valuation-transparency session and widen private credit lane.  
Watch item: private mark methodology and concentration optics. [Sources: FactSet | SEC Filings | AlphaSense]

### Meeting-by-Meeting Prep
1. **OTPP**
- Opener: "We tightened AI governance controls at position level; here are the measurable deltas since last review." [Sources: Internal Research DB | SEC Filings]
- Likely objection: "AI exposure is becoming crowded."  
- Best response: show concentration monitoring cadence plus predefined trim/escalation thresholds. [Sources: FactSet | Internal Risk System]
- Specific ask: approve pilot sleeve upsize with monthly risk/transparency package.

2. **ADIA**
- Opener: "We preserved AI upside while reducing fragile EM beta in the latest rebalance." [Sources: Bloomberg | Refinitiv]
- Likely objection: "How does liquidity hold under stress?"  
- Best response: present liquidity ladder and execution fallback playbook. [Sources: Internal Risk System | FactSet]
- Specific ask: confirm committee slot for infrastructure co-invest review.

3. **CalPERS**
- Opener: "Private marks are now mapped to transaction-level comps with lag diagnostics by vintage." [Sources: AlphaSense | SEC Filings]
- Likely objection: "Show attribution clarity across private sleeves."  
- Best response: provide realized vs mark-based bridge and manager-level dispersion view. [Sources: FactSet | Internal Research DB]
- Specific ask: lock workshop date with PM, risk, and operations leads.

### Three Cross-Client Talking Points
1. Alpha quality remains thesis-led (not leverage-led), supporting durability of outperformance. [Sources: FactSet | Bloomberg]
2. Risk control framework is proactive, with explicit trigger-based governance before hard-limit breach. [Sources: Internal Risk System | Refinitiv]
3. AI-enabled research triage is improving decision speed while preserving human sign-off controls. [Sources: AlphaSense | Internal Research DB]

### Likely Objections + Best Response
- **"Performance is late-cycle and mean-reverts from here."**  
Best response: decompose alpha drivers into repeatable vs one-off components and show persistence in core sleeves. [Sources: FactSet | Bloomberg]
- **"Regulatory burden will cap upside."**  
Best response: map holdings to current compliance readiness; show no near-term forced-position risk. [Sources: SEC Filings | Internal Research DB]
- **"Fees are hard to justify versus passive."**  
Best response: lead with downside protection evidence, active attribution, and mandate-specific customization. [Sources: FactSet | Internal Risk System]

### Suggested Actions Today
1. Send OTPP governance appendix before 10:30 ET.
2. Deliver ADIA liquidity sensitivity one-pager before noon.
3. Confirm CalPERS workshop attendees and agenda by 3:00 PM.
4. Prepare one universal objection-handling sheet for all sales calls by close.
[Sources: Internal Research DB | Bloomberg]`;
    }
    if (has('pending execution orders', 'risk limits')) {
      return `## TRADING BRIEFING

## Market Open Setup

US index futures modestly positive; semis bid but breadth narrow. VIX remains subdued, so gap risk is underpriced into macro headlines. [Sources: Bloomberg | Refinitiv | FactSet]

## Priority Orders Ranked

1. **NVDA trim ($4.2M)** - Urgency: High
- Tactic: staged VWAP with max 14% participation in first 90 min [Sources: Internal Risk System | FactSet]
- Fallback: passive limits at +20 bps above microprice if spreads widen [Sources: Refinitiv]

2. **AMD IPS trim ($3.1M)** - Urgency: Medium
- Tactic: TWAP continuation, tighten pace into liquidity pockets [Sources: Internal Risk System | Bloomberg]
- Fallback: defer clips if top-of-book depth falls below threshold [Sources: FactSet]

3. **EM put spread hedge ($5.1M)** - Urgency: Medium
- Tactic: work options legs when skew normalizes [Sources: Refinitiv]
- Fallback: partial delta hedge via liquid index proxy [Sources: Bloomberg]

## Liquidity + Slippage Watchlist

- NVDA: opening auction expected heavy; avoid crossing early unless imbalance confirms seller depth. [Sources: Bloomberg | FactSet]
- AMD: watch spread expansion around first macro print. [Sources: Refinitiv]
- EM options: implied vol pockets can gap; avoid forced fills. [Sources: Bloomberg]

## Risk Limits and Escalations

- Semi concentration is near hard cap; any failed trim triggers immediate PM escalation. [Sources: Internal Risk System]
- VaR headroom is adequate but compresses quickly if semis and rates sell off together. [Sources: Internal Risk System | FactSet]
- Single-name exposure near threshold; do not add directional risk before trims complete. [Sources: Internal Risk System]

## First 90-Minute Plan

- **0-30 min:** read auction/imbalance, initiate NVDA cautiously.
- **30-60 min:** ramp AMD schedule if depth stabilizes.
- **60-90 min:** execute first EM hedge tranche and re-check limit headroom.`;
    }
    if (has('portfolio summary', 'agent swarm status')) {
      return `## EXECUTIVE BRIEFING

### Executive Snapshot
- Performance remains resilient (+2.4% alpha YTD), with risk still controlled but policy headroom tightening in semiconductor concentration. [Sources: FactSet | Bloomberg | Internal Risk System]
- Client-readiness coverage improved and near-term relationship risk has declined versus prior week. [Sources: Internal Research DB]
- Operating cadence is strong, though elevated utilization suggests lower tolerance for unplanned escalation events. [Sources: Internal Research DB]

### What Changed Since Yesterday
1. Two signals moved from monitor to action-required, increasing intraday decision load. [Sources: Internal Research DB]
2. Semiconductor drift moved closer to IPS buffer threshold due to relative outperformance. [Sources: FactSet | Internal Risk System]
3. Client prep completion improved for the next meeting cluster, reducing distribution execution risk. [Sources: Internal Research DB | Bloomberg]

### Strategic Risk Posture
- **Concentration Risk: Amber** - still within policy but buffer compression requires active management. [Sources: Internal Risk System]
- **Liquidity Risk: Green** - executable pathways intact across priority tickets. [Sources: Refinitiv | Bloomberg]
- **Regulatory/Process Risk: Amber** - governance is adequate, but committee bandwidth is becoming a constraint. [Sources: SEC Filings | Internal Research DB]

### Decisions Needed Today
1. **Authorize tactical semiconductor trim**  
Impact: restores policy buffer and lowers drawdown asymmetry in sector shock.  
Owner: PM + Trading Lead.  
Deadline: before midday liquidity window. [Sources: Internal Risk System | FactSet]

2. **Approve staged hedge cadence**  
Impact: improves downside convexity while preserving strategic exposure.  
Owner: CIO delegate + Risk.  
Deadline: end of first session. [Sources: Bloomberg | Refinitiv]

3. **Prioritize top-3 client follow-ups**  
Impact: protects flow pipeline and reduces relationship slippage in current cycle.  
Owner: Head of Distribution.  
Deadline: end of day. [Sources: Internal Research DB | FactSet]

### KPI Scorecard
- AUM Momentum: **Green** [Sources: FactSet]
- Active Alpha YTD: **Green** [Sources: FactSet | Bloomberg]
- Risk Limit Buffer: **Amber** [Sources: Internal Risk System]
- Client Meeting Readiness: **Green** [Sources: Internal Research DB]
- Team Utilization Sustainability: **Amber** [Sources: Internal Research DB]`;
    }

    // Generic client pre-meeting fallback (used by Client Intel) after persona-specific briefs.
    if (p.includes('briefing') || p.includes('meeting') || p.includes('client')) {
      return `## Pre-Meeting Briefing\n\n**Portfolio Drift & Positioning**\nSince last meeting, the portfolio has drifted +2.3% toward growth factor and away from the original balanced mandate. Tech overweight now at 34% vs 28% benchmark. No IPS breach but trending toward guideline limit — worth discussing proactively. [Sources: FactSet | Bloomberg | Internal Risk System]\n\n**Relevant Market Developments**\n- Fed minutes signal higher-for-longer, affecting duration positioning [Sources: Bloomberg | Refinitiv]\n- AI infrastructure capex cycle accelerating — validates overweight thesis [Sources: AlphaSense | FactSet]\n- ESG regulatory changes in EU may require mandate review [Sources: SEC Filings | Bloomberg]\n\n**Conversation Starters**\n1. "We wanted to flag the tech drift before you noticed it on your end — here's our rationale and how we're monitoring it" [Sources: Internal Risk System]\n2. "The AI infrastructure theme we've been building is playing out ahead of schedule — want to walk you through our updated conviction?" [Sources: AlphaSense | FactSet]\n3. "Given your ESG overlay requirements, we've mapped the new EU taxonomy changes to your specific holdings — no action needed now but wanted you aware" [Sources: SEC Filings | Internal Research DB]\n\n**Risk Points to Address Proactively**\n- Q3 underperformance vs benchmark: prepared attribution analysis ready [Sources: FactSet]\n- Concentration in semiconductors: have risk-adjusted return data prepared [Sources: Internal Risk System | Bloomberg]\n\n**Suggested Follow-ups:** Send updated attribution report within 24h. Schedule deep-dive on AI theme for next quarter.`;
    }
    if (
      p.includes('scenario analysis') ||
      p.includes('run any scenario') ||
      p.includes('stress test') ||
      p.includes('china devaluation')
    ) {
      return `**Scenario Analysis**\n\nBased on current portfolio positioning, this scenario presents moderate-to-high impact across key holdings:\n\n**Most Affected Positions:**\n- **NVDA** (Long, High conviction): Limited direct exposure but secondary effects via hyperscaler capex sentiment. Estimate -5% to -8% near-term.\n- **BABA** (Long, Medium conviction): Elevated risk given direct China exposure. Potential -12% to -18% drawdown. Invalidation criteria approaching threshold.\n- **NEE** (Long, High conviction): Minimal correlation. Rate sensitivity is primary risk driver here, not this scenario.\n\n**Key Considerations:**\n1. Monitor PBOC response and USD/CNH cross\n2. Check credit default swap spreads on EM corporates\n3. Historical analogue: 2015 devaluation showed 3-week equity lag before stabilization\n\n**Suggested Actions:** Trim BABA to reduce conviction score from 6→4 pending clarity. NVDA and NEE hold. Consider adding tail hedge via VIX calls.`;
    }
    if (prompt.toLowerCase().includes('thesis') || prompt.toLowerCase().includes('analyze')) {
      return `**Thesis Analysis**\n\n**Strengths:**\n- Thesis is well-anchored in durable structural demand drivers\n- Invalidation criteria are specific and measurable — this is good institutional hygiene\n- Entry timing appears reasonable relative to the catalyst stack\n\n**Key Risks:**\n1. **Positioning risk**: This theme is crowded. Any negative data point could trigger outsized sell-off relative to fundamental impact\n2. **Execution risk**: Management has historically over-promised on timeline guidance\n3. **Rate sensitivity**: Higher-for-longer scenario compresses multiple more than base case assumes\n\n**What Would Change Conviction:**\n- Downward: Any evidence hyperscaler customers pulling back orders (check quarterly capex guidance closely)\n- Upward: Competitor stumble or supply constraint relief ahead of schedule\n\n**Monitoring Triggers:** Set alerts on quarterly earnings guidance, competitor product releases, and monthly channel checks via expert network.`;
    }
    if (prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('var') || prompt.toLowerCase().includes('stress')) {
      return `**Risk Narrative**\n\nThis alert warrants prompt attention from the portfolio manager.\n\n**What Happened:** The increase reflects a genuine shift in the risk profile, not just market vol. The concentration has been building over the past 6 weeks as positions appreciated asymmetrically.\n\n**Why It Matters:** At current levels, a single adverse event in this sector could impact the portfolio disproportionately relative to the intended risk budget. The IPS limit exists precisely to prevent this type of single-factor dominance.\n\n**Historical Context:** Similar concentration levels in 2022 tech selloff resulted in 2-3x benchmark drawdown for comparably positioned portfolios. The difference now is higher starting valuations.\n\n**Recommended Actions:**\n1. Review whether the concentration reflects active conviction or passive drift\n2. If conviction-driven: document the thesis explicitly and ensure PM sign-off\n3. If drift: initiate trim schedule — suggest 3-5% reduction over next 10 trading days to minimize market impact\n4. Update stress test to include sector-specific shock scenario\n\n**Escalation Required:** If no action taken within 48h, flag to Risk Committee per policy.`;
    }
    if (prompt.toLowerCase().includes('skeptic') || prompt.toLowerCase().includes('challenge') || prompt.toLowerCase().includes('devil')) {
      return `**Challenging This Thesis**\n\nLet me steelman the bear case:\n\n**The Market Already Knows:** This thesis relies on information that is widely understood and likely already priced. Sell-side consensus is overwhelmingly bullish — when everyone agrees, the asymmetry is to the downside.\n\n**Historical Analogues Where This Failed:**\n- 2000: Telecom infrastructure buildout thesis — fundamentally correct, but massive overinvestment destroyed returns for a decade\n- 2007: Housing as structural demand story — the fundamental was right until it wasn't\n- The pattern: secular growth thesis + crowded positioning + elevated multiples = eventual painful mean reversion\n\n**Base Rate Check:** Of similar "structural demand" theses over the past 20 years, roughly 60% delivered on the fundamental but only 35% generated positive risk-adjusted returns from the point of consensus formation.\n\n**What the Bull Case Gets Wrong:**\n1. Assumes current market share is defensible — history suggests technology moats erode faster than expected\n2. Ignores execution risk — the biggest value destroyer in growth investing\n3. Underweights regulatory overhang that is building globally\n\n**Question to stress-test:** If the fundamental plays out exactly as expected, but at half the speed — does the thesis still work at current multiples?`;
    }
    return `**Analysis Complete**\n\nBased on the available information, this situation presents several key considerations that merit careful attention from the investment team. The primary factors at play reflect both near-term tactical positioning and longer-term strategic implications for the portfolio.\n\n**Key Observations:**\n- The underlying fundamentals remain intact but market dynamics are shifting\n- Risk-adjusted positioning appears reasonable given current uncertainty\n- Monitoring triggers should be updated to reflect new information\n\n**Recommended Next Steps:** Review current conviction level, update thesis documentation, and schedule team discussion to align on portfolio implications within the next 48 hours.`;
  }
}
