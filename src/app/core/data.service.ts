import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Thesis, ResearchItem, Client, RiskAlert, LivingThesisState, LivingThesisBelief } from './models';

const NVDA_ANALYSIS = `**Thesis Analysis — NVIDIA Corporation (Long, 9/10)**

**Key Takeaway:** Blackwell ramp creates 24-month earnings visibility rarely seen in semiconductor history. The structural AI demand case is intact and strengthening.

**Conviction Drivers:**
- Hyperscaler capex commitments are now multi-year and contractual, establishing a demand floor
- Blackwell architecture delivers 3-5x training performance vs. H100 — switching costs are enormous
- Data center now 78% of revenue at 80%+ gross margins — structurally different, higher-quality business than 2021

**Primary Risks:**
1. **Crowding**: Most-owned institutional trade globally. Any negative surprise triggers forced unwinds across portfolios simultaneously
2. **GAAP volatility**: Revenue recognition for Blackwell NRE costs may create earnings noise in Q2/Q3 independent of underlying demand
3. **AMD inference share**: H200 competitive wins in inference are real and accelerating — training dominance does not equal inference dominance

**What Would Change Conviction:**
- Downward: Any hyperscaler capex revision >10%; AMD H200 hyperscaler wins; NVDA gross margin guidance below 74%
- Upward: Blackwell yields ahead of schedule; sovereign AI deployments (France, UAE, Saudi) beating estimates

**Monitoring Triggers:** Quarterly hyperscaler capex calls, NVDA gross margin trajectory, AMD competitive win disclosures. Set alerts on Q2 guidance language.`;

const BABA_ANALYSIS = `**Thesis Analysis — Alibaba Group (Long, 6/10)**

**Key Takeaway:** A genuine sum-of-parts discount exists, but the risk profile demands position sizing discipline. This is a mean-reversion trade, not a compounder.

**Conviction Drivers:**
- Alibaba Cloud trades at 3x forward revenue vs. AWS at 12x — extreme discount even adjusting for growth differential
- Government signaling materially improved since Jack Ma resolution; PBOC and SAMR tone constructively different
- $25B share buyback authorization signals management confidence and provides EPS support at trough multiples

**Primary Risks:**
1. **ADR binary risk**: US delisting legislation is non-trivial and structurally unresolved — permanently limits institutional accumulation and creates a liquidity discount standard models ignore
2. **China consumer cycle**: Core commerce (68% of revenue) exposed to middle-class consumption trends — PMI trajectory is negative
3. **Regulatory recurrence**: Market assumes normalized environment is permanent; history suggests Chinese internet regulation is cyclical, not resolved

**Position Sizing:**
6/10 conviction is appropriate. Should not exceed 4% of book given the ADR binary risk. The discount is real; so is the risk.

**Monitoring:** PBOC policy signals, US-China ADR legislation, monthly cloud revenue disclosures, win rate vs. Huawei Cloud and Tencent.`;

const NEE_ANALYSIS = `**Thesis Analysis — NextEra Energy (Long, 8/10)**

**Key Takeaway:** NEE is the highest-quality expression of the AI power demand theme with regulated utility downside protection. The grid bottleneck is a genuine competitive moat.

**Conviction Drivers:**
- 18-24 month transmission permitting backlog (confirmed expert network) means NEE's existing interconnection queue is a 2-year competitive advantage that cannot be quickly replicated
- Data center power demand is accelerating beyond any grid buildout scenario; NEE is first call for hyperscalers given PPA execution track record
- Florida Power & Light regulated base provides 6-8% earnings growth floor independent of renewable buildout success

**Primary Risks:**
1. **Duration sensitivity**: Utility rate beta -1.41. Sustained 10Y above 5.75% compresses multiples 15-20%, creating mark-to-market pressure even with intact fundamentals
2. **PPA execution risk**: Market pricing $7B+ in new data center PPAs — underwhelming announcements or interconnection delays create 15-20% downside
3. **ITC/PTC policy**: Investment and Production Tax Credits are existential to renewable economics; congressional risk is non-zero

**Upside Case:**
If data center PPA announcements reach $8B+ and federal grid permitting reform passes, this is a $95 stock within 18 months. The optionality on sovereign and hyperscaler AI power demand is genuinely underpriced.

**Monitoring:** Monthly FERC interconnection queue reports, data center PPA announcements, 10Y UST yield, IRA legislative developments.`;

const TSM_ANALYSIS = `**Thesis Analysis — Taiwan Semiconductor Mfg. (Long, 8/10)**

**Key Takeaway:** TSMC is the most critical single chokepoint in global AI compute supply — and it trades at a 25-30% discount to fair value purely due to geopolitical overhang. That discount is the opportunity.

**Conviction Drivers:**
- Every leading-edge AI chip — NVDA Blackwell, AMD MI300, Google TPU v5, Apple M-series — is manufactured exclusively at TSMC. There is no credible alternative at 3nm/2nm for 3+ years
- Arizona fab diversification with CHIPs Act subsidy confirmation materially reduces geopolitical discount over a 24-month horizon
- N2 node ramp creates next leg of ASP improvement; TSMC historically captures 15-20% price premium at each new node introduction

**Primary Risks:**
1. **Taiwan geopolitical premium**: The 25-30% discount reflects a real, non-zero risk. Any escalation creates immediate and severe mark-to-market impact regardless of fundamentals
2. **Intel 18A wildcard**: If Intel's 18A process genuinely reaches competitive yields, it introduces the first credible alternative source in a decade — low probability, high impact
3. **Customer in-housing**: Apple, Google have stated ambitions to reduce TSMC dependence over 5+ years — a long-dated but directionally real risk

**Geopolitical Discount Framework:**
Current 12x forward P/E implies the market assigns ~20% probability of severe disruption. Our base case is 5-8%. At our probability, intrinsic value is $190-200. The gap is the opportunity.

**Monitoring:** Taiwan Strait political developments, Arizona fab yield reports, Intel 18A benchmarks, customer in-house fab announcements.`;

const R1_ANALYSIS = `**Signal Analysis — MSFT $14B Azure AI Capex Expansion**

**Key Takeaway:** Clearest confirmation yet that hyperscaler AI demand is real, large-scale, and accelerating ahead of consensus. COO language is unusually direct for an SEC filing — this is not boilerplate.

**Investment Implications:**
- **NVDA (Long, High):** Directly and immediately positive. Azure is NVDA's largest hyperscaler customer. $14B/18 months implies $5-6B in incremental GPU procurement — 15-20% above current sell-side consensus. Raise near-term estimates now.
- **TSM (Long, High):** Directly positive. Every Azure GPU is manufactured at TSMC. Incremental Azure capex pulls forward TSMC capacity allocation discussions.
- **NEE (Long, High):** Moderately positive. Azure geographic expansion implies new data center builds requiring grid connections; PPA timeline moves forward.
- **EQIX / DLR (Watchlist):** Colocation demand follows compute with 12-18 month lag. Monitor for campus partnership announcements.

**Conviction Impact:**
Strengthens NVDA and TSM at current conviction levels. "Materially exceeds capacity" from COO is not boilerplate investor relations language. This signals real demand pressure creating multi-quarter revenue visibility.

**Open Questions:**
1. Does the 18-month timeline align with Blackwell delivery commitments?
2. What is the GPU vs. networking vs. real estate breakdown of $14B?
3. What are competitive implications for AWS and Google Cloud AI capacity?

**Suggested Actions:** Model NVDA upward revision. Add EQIX to sector watch. Schedule MSFT supply chain expert call within 2 weeks.`;

const R2_ANALYSIS = `**Signal Analysis — Alibaba Cloud Enterprise Win Rate +34% QoQ**

**Key Takeaway:** Meaningful positive datapoint for the cloud thesis, but the financial services/manufacturing mix suggests domestic China share gain rather than international expansion.

**Investment Implications:**
- **BABA (Long, Medium):** Modestly positive for cloud segment valuation. Win rate improvement vs. Tencent Cloud (48%->61%) is the most interesting figure — competitive dynamics improving. Average contract size +18% supports margin mix.
- **Thesis validation:** Supports the cloud inflection element of the BABA sum-of-parts argument. Cloud is the highest-quality segment; any acceleration supports the valuation case.

**Caveats:**
- Alt data from procurement signals carries accuracy limitations — verify with official Q results
- Financial services dominance (42%) makes results sensitive to Chinese regulatory environment changes
- Win rate vs. Tencent doesn't address Huawei Cloud competitive pressure in manufacturing

**Conviction Impact:**
Neutral to slightly positive. Not sufficient to upgrade from Medium conviction given ongoing ADR risk. Updates cloud revenue model by approximately $800M annualized at this run rate.

**Actions:** Verify with official quarterly results. Watch for BABA investor day cloud segment guidance update.`;

const R2_SKEPTIC = `**Devil's Advocate — Alibaba Cloud Win Rate Signal**

**The Market Already Knows:** A 34% QoQ improvement in enterprise wins is visible to every sell-side firm, long/short fund, and quant shop monitoring procurement data. If this signal reached us, the alpha is already priced within minutes of the data hitting terminals.

**Historical Analogues Where This Failed:**
- 2021 Q1: Similar Alibaba Cloud acceleration signals preceded the regulatory crackdown that erased 18 months of cloud thesis value in 6 weeks
- JD Logistics 2022: Strong operational signals throughout the year while the stock declined 45% on macro/regulatory overhang
- The recurring pattern: Chinese internet fundamentals improving does not equal stock outperformance when macro regime is adverse

**What This Signal Gets Wrong:**
The 42% financial services concentration is a double-edged sword — high-quality business today, but financial services is historically the first sector targeted in Chinese regulatory cycles. This could be a concentration risk masquerading as a strength.

**Base Rate Check:**
Of 15 similar "Chinese internet cloud inflection" signals over the past 4 years, 9 were followed by positive stock performance. But average holding period alpha was +3.2% vs. 2.1% standard deviation — the Sharpe on acting on these signals alone is poor.

**Stress Test:** If Chinese regulatory attention returns to fintech/cloud in the next 12 months, does this contract win rate hold? Historical answer: no.`;

const R3_ANALYSIS = `**Signal Analysis — EU AI Act Financial Services Guidance**

**Key Takeaway:** Compliance burden is real and front-loaded. Financial services firms face EUR 50-200M implementation costs with a tight Q1 2026 deadline. This is a headwind for near-term margins at exposed European banks.

**Investment Implications:**
- **European banks (C, JPM intl, GS, HSBC):** Compliance cost headwind is meaningful but manageable for large cap. Watch for Q3/Q4 2025 guidance revisions as implementation costs are scoped.
- **Fintech / AI vendors to banks:** Revenue opportunity as banks outsource compliance monitoring and human oversight workflows.
- **MSIM Operations:** Review internal AI usage in risk models and credit processes — EU AI Act may require new documentation workflows by Q1 2026.

**Regulatory Read:**
The "narrower than expected" carve-outs signal European regulators are taking a materially harder line on financial services AI than the industry lobbied for. European bank operating models will look meaningfully different from US peers by 2026.

**Portfolio Implication:** No direct position impact for current holdings. Monitor C (large European operations) and financial sector AI vendor exposure.`;

const C1_BRIEFING = `## Pre-Meeting Briefing — Sarah Chen, Ontario Teachers

**Portfolio & Positioning Update**
MSIM Global Equity Alpha is tracking +2.1% active return vs. benchmark YTD, with AI infrastructure overweight as the primary driver. Tech sleeve is at 32% vs. 28% mandate upper bound — within IPS guidelines but worth proactive disclosure. ESG overlay is fully compliant; all AI holdings cleared under the updated governance framework and new EU AI Act disclosure requirements. EM sleeve underperformance is BABA-driven at -0.4% vs. benchmark — address this proactively before she raises it.

**Relevant Developments for Her Mandate**
- Fed higher-for-longer scenario is consistent with the 60% passive sleeve anchor — no rebalancing pressure there
- EU AI Act guidance published this morning is directly relevant to her ESG overlay requirements — 3-page compliance mapping prepared
- NVDA earnings tomorrow pre-market: consensus expects a beat; tech weight could approach 33-34% — frame the trim plan proactively

**3 Proactive Conversation Starters**
1. "We flagged the tech drift before you'd see it in quarterly reporting — here's the trim schedule and rationale for holding through the Blackwell confirmation catalyst before we reduce"
2. "The EU AI Act final guidance published this morning is directly relevant to your ESG overlay. We've mapped all AI holdings against the new disclosure requirements — all clear"
3. "On EM underperformance: the BABA thesis is intact at Medium conviction, sized appropriately for ADR binary risk. Want us to walk through the conviction framework and why we're maintaining vs. exiting?"

**Questions She Will Ask — and How to Answer**
- "How do you justify active fees given passive alternatives?" — Attribution shows 180bp of alpha from AI infrastructure thesis. This is a differentiated active call. Compare Sharpe ratio vs. passive.
- "What's the ESG status of your AI holdings?" — All holdings clear on governance scores. NVDA: 78/100, MSFT: 85/100. BABA carries geopolitical disclosure per IPS.
- "What's your tail risk on the AI concentration?" — Diversified across AI infrastructure (NVDA, TSM) and AI utilities (NEE) — not single-stock risk.

**Suggested Follow-ups:** Send Q attribution report by EOW. Schedule ESG AI governance deep-dive for Q2 review.`;

const C2_BRIEFING = `## Pre-Meeting Briefing — Ahmed Al-Rashid, ADIA

**Portfolio & Positioning Update**
MSIM Multi-Asset Strategic is +3.4% vs. benchmark YTD. Technology sleeve at 29% vs. 35% maximum — significant room to increase at Ahmed's discretion. Infrastructure Debt performing well; duration exposure aligned with ADIA's long-horizon mandate. Credit liquidity profile improved since Q4 as high-yield spreads tightened.

**Relevant Developments for His Mandate**
- AI infrastructure private market opportunities accelerating — 2 co-investment pipeline opportunities to present (data center development, GPU lease financing)
- ADIA's geopolitical risk mandate is well-positioned: EM exposure diversified and currently underweight vs. strategic target
- Infrastructure debt pipeline has $1.2B in new origination opportunities, 3 directly linked to AI data center buildout

**3 Proactive Conversation Starters**
1. "We've identified two AI infrastructure co-investment opportunities that fit ADIA's long-duration mandate — a $400M data center development deal and a GPU lease financing platform. Both are pre-term sheet."
2. "Your tech sleeve is at 29% vs. the 35% maximum. Given MSFT's $14B capex signal this morning, now may be the right moment to discuss closing that gap with infrastructure-linked positions."
3. "On geopolitical risk: we've run your current EM allocation through our China regulatory stress scenario. The portfolio is well-insulated — here's the attribution."

**Questions He Will Ask — and How to Answer**
- "What's the risk-adjusted return on AI infrastructure private market deals?" — Historical data center deal returns: 14-18% IRR, 1.8-2.2x MOIC. Pipeline deals structured with downside protections.
- "How does credit liquidity compare to our needs?" — 87% of positions liquid within 30 days, consistent with ADIA's guidelines.
- "What is your differentiated view on AI vs. consensus?" — Edge: bottom-up supply chain diligence (expert networks, TSM checks) gives 4-6 week lead over sell-side.

**Suggested Follow-ups:** Send co-investment memoranda for data center and GPU financing deals. Schedule infrastructure team deep-dive for next month.`;

const C3_BRIEFING = `## Pre-Meeting Briefing — Maria Gonzalez, CalPERS

**Portfolio & Positioning Update**
MSIM Real Assets Fund III is tracking +1.6% YTD with infrastructure cash yield stability supporting downside protection, while MSIM Private Credit Opportunities is +2.2% with improving spread capture in sponsor-backed middle-market loans. Private market exposure remains aligned with CalPERS' long-term expansion objective, but mark dispersion has widened by vintage and sector. Inflation-linked sleeves remain positioned appropriately through contracted cash flow assets and floating-rate credit exposure.

**Relevant Developments for Her Mandate**
- Private market valuation scrutiny is rising across public pension committees, with greater focus on valuation lag, comparable selection, and exit assumptions.
- Rate-volatility remains elevated even as headline inflation moderates, reinforcing the need for duration-aware portfolio construction.
- Manager concentration remains a board-level governance topic; proactive transparency on concentration controls and pacing discipline is expected.

**3 Proactive Conversation Starters**
1. "Before the committee asks, we can walk through valuation methodology updates at the asset level, including lag policy, comp sets, and realized-vs-unrealized bridge."
2. "Your inflation-duration objective is intact: we can show where real-assets cash flow indexing and floating-rate credit are carrying that mandate."
3. "On concentration risk, we've prepared a manager exposure heatmap with hard limits, soft limits, and remediation triggers."

**Questions She Will Ask — and How to Answer**
- "Are private marks still credible in this rate regime?" — Yes, and we can evidence that with quarter-over-quarter methodology transparency and sensitivity ranges.
- "How are you handling inflation mismatch risk?" — Through contract-linked revenue assets, floating-rate credit, and targeted duration balancing across sleeves.
- "Are we over-concentrated with any manager or sector?" — Concentration remains within governance limits; show the heatmap and escalation thresholds.

**Risk Points to Address Before They Do**
- Valuation lag optics if public comparables move sharply intra-quarter.
- Potential refinancing stress in select private credit borrowers if rates stay higher for longer.
- Sector concentration drift in real assets if deployment pacing is not actively managed.

**Suggested Follow-ups:** Send valuation methodology appendix and manager concentration heatmap within 24 hours. Schedule a 45-minute committee prep on inflation-duration attribution before tomorrow's meeting.`;

const C4_BRIEFING = `## Pre-Meeting Briefing — Kenji Yamamoto, GPIF

**Portfolio & Positioning Update**
MSIM Global Balanced Strategy is tracking +1.8% vs. benchmark YTD. Current asset allocation: 52% global equities, 28% fixed income, 12% alternatives, 8% cash. The portfolio is moderately overweight technology at 24% vs. the 20% strategic target, reflecting AI infrastructure conviction. Duration: 5.8 years, consistent with GPIF's intermediate-horizon mandate. Currency hedge ratio at 75% on USD exposure per IPS guidelines.

**Relevant Developments for His Mandate**
- BOJ policy normalization path continues — implications for JPY-hedged returns and fixed income allocation
- AI infrastructure theme is translating to Japanese supply chain: Tokyo Electron, Advantest gaining from TSMC capex cycle
- GPIF's own AI governance framework aligns with our ESG overlay — positive narrative for their board reporting

**3 Proactive Conversation Starters**
1. "BOJ normalization is creating hedging cost pressure on your USD exposure. We've modeled three scenarios for adjusting the hedge ratio — including a partial unwind that saves 40bp annually while maintaining 85% downside protection."
2. "The AI infrastructure cycle is pulling through significant value to Japanese semiconductor equipment names. We've identified 3 domestic beneficiaries that align with your home-bias allocation targets."
3. "On governance: we've mapped our AI-assisted investment process against GPIF's published stewardship principles. Full alignment — here's the documentation for your next board meeting."

**Questions He Will Ask — and How to Answer**
- "How does your AI process comply with Japan FSA guidelines?" — Full documentation prepared. Human oversight at every decision point. AI used for research acceleration, not autonomous trading.
- "What is the currency impact on returns?" — JPY strengthening has cost 65bp YTD. Hedge adjustment options prepared with cost-benefit analysis.
- "How do you compare to our other global managers?" — Top-quartile active return with below-median tracking error. Information ratio of 0.84 is strongest among GPIF's global equity allocators.

**Suggested Follow-ups:** Send BOJ scenario analysis by end of week. Schedule Japan supply chain deep-dive with Tokyo-based team.`;

const A1_NARRATIVE = `**What Happened:** Semiconductor sector weight drifted to 34.8%, just 20 basis points below the IPS maximum. This wasn't sudden — it reflects 6 weeks of asymmetric appreciation: NVDA +18%, ASML +12%, while the rest of the portfolio generated more modest returns. The addition of TSM accelerated the drift.

**Why It Matters:** At 34.8%, the portfolio has effectively made a single-sector bet at nearly 3x benchmark weight. A 15% semiconductor correction — historically common around earnings cycles — would generate approximately -220bp active return versus the benchmark's -80bp. That's 140bp of tracking error from one sector event.

**The Tension:** Our conviction in the semiconductor thesis is high — NVDA at 9/10 and TSM at 8/10 are well-founded. But the IPS limit reflects deliberate risk governance, not a conviction judgment. These must be managed independently. High conviction does not override compliance thresholds.

**Recommended Action:** Initiate a 10-day trim schedule targeting 32% sector weight. Priority: AMD first (weakest relative conviction at 7/10), then proportional NVDA trim if needed. Estimated market impact: 3-4bp of spread at current liquidity.

**Escalation:** If weight reaches 35.0% before trim completes — e.g., from NVDA post-earnings appreciation — flag to Investment Committee per IPS Policy 4.2 immediately.`;

const A2_NARRATIVE = `**What Happened:** 10-day 95% VaR spiked $2.3M in one week (+22.7%), driven entirely by China regulatory factor beta expanding from 1.21 to 1.83. The PBOC announcement created an implied volatility spike of +340bps across Chinese internet names — BABA and JD were the primary drivers.

**Why It Matters:** A China regulatory beta of 1.83 means this portfolio now moves 83% more than the regulatory factor when policy announcements occur. That is significant uncompensated tail risk — we are not being paid a risk premium for this beta; it is passive drift from position appreciation and macro correlation shift.

**The Real Number:** Historical CVaR of $18.2M — the expected loss conditional on a bad China regulatory event. The question for the PM is whether current position sizing is appropriate for an $18M tail scenario in a single emerging market.

**Historical Context:** In the 2021 Chinese internet crackdown, portfolios with similar China regulatory beta profiles saw drawdowns of 18-22% within 4 weeks of initial VaR spikes. The starting regulatory environment today is more constructive, but the factor dynamics are similar.

**Recommended Action:** Review BABA and JD position sizing relative to current regulatory beta. Consider tail hedge via EM put spreads (estimated 45-60bp annually). Escalate to Risk Committee if no action within 48 hours per policy.`;

const LIVING_THESIS_STORAGE_KEY = 'msim2030.living-thesis.lmt';

const DEFAULT_LIVING_THESIS: LivingThesisState = {
  id: 'lmt-2030',
  ticker: 'LMT',
  name: 'Lockheed Martin',
  updatedAt: new Date(),
  beliefs: [
    { id: 'c1', text: 'Compact fusion Q-value breakthrough validated by independent physics consortium', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c2', text: 'Declassification of advanced aerospace platforms opens new commercial verticals', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c3', text: 'AI-enabled autonomous combat systems shifting DoD procurement to software-defined platforms', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c4', text: 'National energy security mandate accelerating government-funded fusion R&D', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c5', text: 'Hypersonic weapons program (ARRW, LRHW) achieving milestone production readiness', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c6', text: 'NATO allied defense spending surge creating sustained multi-year procurement backlog', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c7', text: 'Space Force constellation contracts securing 15-year revenue visibility', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c8', text: 'F-35 Block 4 upgrades driving sustained depot and services revenue through 2040', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c9', text: 'Defense industrial policy shielding LMT from critical supply chain disruption', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'c10', text: 'Carbon-free aviation propulsion patents positioning for next-gen commercial aerospace', type: 'catalyst', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i1', text: 'Sustained delay in magnetic confinement timelines pushing past 2030', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i2', text: 'Congressional defense budget sequestration reducing DoD procurement >15%', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i3', text: 'F-35 program cancellation or fleet reduction by major allied customer', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i4', text: 'China achieving hypersonic parity removing LMT first-mover premium', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i5', text: 'Fusion energy commercially viable via private sector removing government rationale', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i6', text: 'DoD pivot to AI/software dramatically reducing legacy platform hardware demand', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i7', text: 'Geopolitical de-escalation sharply reducing NATO defense spending commitments', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i8', text: 'Regulatory rejection of Skunk Works advanced aerospace commercialization', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i9', text: 'Rare earth supply chain bottleneck exceeding LMT internal stockpile resilience', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() },
    { id: 'i10', text: 'Congressional cost-plus contract investigation eroding LMT political capital', type: 'invalidation', tracked: false, notRelevant: false, updatedAt: new Date() }
  ]
};

@Injectable({ providedIn: 'root' })
export class DataService {

  private _theses = new BehaviorSubject<Thesis[]>([
    {
      id: '1', ticker: 'NVDA', name: 'NVIDIA Corporation', direction: 'Long',
      conviction: 'High', score: 9, currentPrice: 875, targetPrice: 1100,
      thesis: 'AI infrastructure buildout creates multi-year GPU demand runway. Data center revenue inflecting with Blackwell cycle. Hyperscaler capex commitments de-risk near-term execution.',
      catalysts: ['Q2 data center revenue beat vs. consensus', 'Blackwell ramp commentary on earnings call', 'Microsoft Azure $14B capacity expansion'],
      invalidation: ['Hyperscaler capex cuts >20%', 'AMD AI training market share exceeds 25%', 'Broad export control expansion'],
      entryDate: new Date('2024-01-15'), updatedAt: new Date(), aiAnalysis: NVDA_ANALYSIS,
      triggers: [
        { id: 'nvda-t1', label: 'Hyperscaler Capex Guidance', description: 'Quarterly capex disclosures from MSFT, AMZN, GOOG — any revision >10% is a red flag', status: 'triggered', linkedAlertIds: ['a1'] },
        { id: 'nvda-t2', label: 'Blackwell Yield Data', description: 'TSMC N2/N3 yield reports and Blackwell production ramp metrics', status: 'watching' },
        { id: 'nvda-t3', label: 'AMD Competitive Wins', description: 'Track MI300/H200 hyperscaler design wins vs. NVDA incumbent position', status: 'watching' },
        { id: 'nvda-t4', label: 'Export Control Expansion', description: 'US Commerce Dept. semiconductor export policy changes affecting China revenue', status: 'cleared' },
        { id: 'nvda-t5', label: 'Gross Margin Trajectory', description: 'NVDA gross margin guidance below 74% would signal pricing pressure', status: 'watching' }
      ]
    },
    {
      id: '5', ticker: 'LMT', name: 'Lockheed Martin', direction: 'Long',
      conviction: 'High', score: 8, currentPrice: 521, targetPrice: 780,
      thesis: 'Skunk Works commercialization of compact fusion and next-gen propulsion creates unpriced optionality at the frontier of the 2030 energy and aerospace transition. Government-funded R&D creates asymmetric upside with defense contract floors providing downside protection throughout the fusion development timeline.',
      catalysts: [
        'Compact fusion Q-value breakthrough validated by independent physics consortium',
        'Declassification of advanced propulsion program enabling commercial aerospace verticals',
        'AI-enabled autonomous combat systems shifting DoD procurement to software-defined platforms'
      ],
      invalidation: [
        'Sustained delay in magnetic confinement timelines pushing past 2030',
        'Congressional defense budget sequestration reducing DoD procurement >15%',
        'F-35 program cancellation or fleet reduction by major allied customer'
      ],
      entryDate: new Date('2024-05-15'), updatedAt: new Date(),
      triggers: [
        { id: 'lmt-t1', label: 'Fusion Validation Milestone', description: 'Independent verification of compact fusion progress and engineering feasibility', status: 'watching' },
        { id: 'lmt-t2', label: 'Program Declassification', description: 'Any disclosure that expands commercial relevance of Skunk Works propulsion and energy research', status: 'watching' },
        { id: 'lmt-t3', label: 'Defense Budget Trajectory', description: 'US and allied procurement budgets affecting long-cycle platform demand', status: 'watching' },
        { id: 'lmt-t4', label: 'Autonomy Program Awards', description: 'Award flow for software-defined combat systems, autonomy, and advanced aerospace platforms', status: 'triggered' }
      ]
    },
    {
      id: '2', ticker: 'BABA', name: 'Alibaba Group', direction: 'Long',
      conviction: 'Medium', score: 6, currentPrice: 72, targetPrice: 110,
      thesis: 'Regulatory normalization + cloud inflection + sum-of-parts discount. Government signaling support for private sector. Valuation at trough multiples with buyback support.',
      catalysts: ['Cloud margin expansion above 10%', 'Fintech subsidiary regulatory clarity', 'Accelerated share buyback program'],
      invalidation: ['Renewed targeted regulatory action', 'US ADR delisting risk materializes', 'China consumer spending deterioration'],
      entryDate: new Date('2024-03-01'), updatedAt: new Date(), aiAnalysis: BABA_ANALYSIS,
      triggers: [
        { id: 'baba-t1', label: 'PBOC Policy Signal', description: 'Monetary policy announcements affecting Chinese internet sector sentiment', status: 'triggered', linkedAlertIds: ['a2'] },
        { id: 'baba-t2', label: 'ADR Legislation', description: 'US Congress progress on HFCAA enforcement or new delisting legislation', status: 'watching' },
        { id: 'baba-t3', label: 'Cloud Revenue Growth', description: 'Alibaba Cloud quarterly revenue and margin trajectory vs. consensus', status: 'watching' },
        { id: 'baba-t4', label: 'Regulatory Action', description: 'SAMR or PBOC targeted enforcement actions against Chinese internet platforms', status: 'triggered', linkedAlertIds: ['a2'] }
      ]
    },
    {
      id: '3', ticker: 'NEE', name: 'NextEra Energy', direction: 'Long',
      conviction: 'High', score: 8, currentPrice: 62, targetPrice: 82,
      thesis: 'AI data center power demand creates unprecedented utility growth opportunity. Grid infrastructure bottleneck provides pricing power. Regulated utility base provides valuation floor.',
      catalysts: ['Data center PPA announcements ($5B+)', 'Florida rate case approval', 'Federal transmission permitting reform'],
      invalidation: ['10Y Treasury yield sustained above 6%', 'Renewable ITC reduction in reconciliation', 'Major permitting reform failure'],
      entryDate: new Date('2024-02-10'), updatedAt: new Date(), aiAnalysis: NEE_ANALYSIS,
      triggers: [
        { id: 'nee-t1', label: '10Y Yield Level', description: 'Sustained 10Y above 5.75% compresses utility multiples 15-20%', status: 'triggered', linkedAlertIds: ['a3'] },
        { id: 'nee-t2', label: 'PPA Announcements', description: 'Data center PPA deal flow — market pricing $7B+, need $5B+ minimum', status: 'watching' },
        { id: 'nee-t3', label: 'ITC/PTC Legislation', description: 'Congressional action on Investment/Production Tax Credits for renewables', status: 'watching' },
        { id: 'nee-t4', label: 'Grid Permitting Reform', description: 'Federal transmission permitting legislation and FERC interconnection queue', status: 'cleared' }
      ]
    },
    {
      id: '4', ticker: 'TSM', name: 'Taiwan Semiconductor Mfg.', direction: 'Long',
      conviction: 'High', score: 8, currentPrice: 145, targetPrice: 195,
      thesis: 'Sole-source supplier for every leading-edge AI chip in production. NVDA Blackwell, AMD MI300, Google TPU, Apple silicon all manufactured exclusively at TSMC 3nm/2nm. Geopolitical discount of 25-30% vs. fair value is a buying opportunity given irreplaceable supply chain position.',
      catalysts: ['N2 node yield ramp ahead of schedule', 'Arizona fab operational milestone + CHIPs Act subsidy', 'Hyperscaler direct wafer agreements (Google, Amazon, Microsoft)'],
      invalidation: ['Taiwan Strait military escalation materially above baseline', 'Intel 18A yield materially beats TSMC N3', 'Customer in-house fab capacity reaches 20%+ of leading-edge needs'],
      entryDate: new Date('2024-04-01'), updatedAt: new Date(), aiAnalysis: TSM_ANALYSIS,
      triggers: [
        { id: 'tsm-t1', label: 'Taiwan Strait Tensions', description: 'Military activity, diplomatic incidents, or election-related escalation in the Taiwan Strait', status: 'watching' },
        { id: 'tsm-t2', label: 'Arizona Fab Progress', description: 'Construction milestones, yield data, and CHIPs Act subsidy disbursement for AZ fab', status: 'watching' },
        { id: 'tsm-t3', label: 'Intel 18A Yields', description: 'Intel foundry 18A process node yield benchmarks vs. TSMC N3/N2 competitive position', status: 'watching' },
        { id: 'tsm-t4', label: 'Customer In-Housing', description: 'Apple, Google, Amazon in-house fab capacity development announcements', status: 'cleared' },
        { id: 'tsm-t5', label: 'N2 Node Ramp', description: 'TSMC N2 production yield and ASP premium realization vs. internal targets', status: 'triggered', linkedAlertIds: ['a1'] }
      ]
    },
  ]);

  private _research = new BehaviorSubject<ResearchItem[]>([
    {
      id: 'r1', type: 'filing', ticker: 'MSFT',
      title: 'MSFT 8-K: $14B Azure AI capacity expansion — COO confirms demand "materially exceeds" capacity',
      body: 'Microsoft filed an 8-K disclosing $14B incremental capex commitment to Azure AI infrastructure over 18 months. COO quoted: "Demand signals across enterprise AI customers materially exceed our current capacity in every region." Breakout by geography: North America 45%, Europe 30%, Asia 25%.',
      priority: 'urgent', tickers: ['MSFT', 'NVDA', 'TSM', 'NEE', 'EQIX'],
      actionRequired: true, ts: new Date(), aiAnalysis: R1_ANALYSIS
    },
    {
      id: 'r2', type: 'signal', ticker: 'BABA',
      title: 'Alt data: Alibaba Cloud enterprise contract wins up 34% QoQ — financial services dominant',
      body: 'Alternative data from enterprise procurement signals shows Alibaba Cloud winning 34% more enterprise contracts vs prior quarter. Dominated by financial services (42%) and manufacturing (31%) sectors in China. Average contract size up 18%. Competitive win rate vs Tencent Cloud improved from 48% to 61%.',
      priority: 'high', tickers: ['BABA', 'BIDU', 'JD', '9988.HK'],
      actionRequired: true, ts: new Date(Date.now() - 3_600_000),
      aiAnalysis: R2_ANALYSIS, skepticChallenge: R2_SKEPTIC
    },
    {
      id: 'r3', type: 'news',
      title: 'FT: EU AI Act final guidance — financial services carve-outs narrower than industry expected',
      body: 'EU regulators published final AI Act implementation guidance. Financial services carve-outs for "high-risk AI systems" significantly narrower than industry lobbied for. Requires human oversight for credit decisions and risk models. Implementation deadline Q1 2026. Estimated compliance cost for large banks: EUR 50-200M.',
      priority: 'high', tickers: ['C', 'JPM', 'GS', 'MS', 'HSBC'],
      actionRequired: false, ts: new Date(Date.now() - 7_200_000), aiAnalysis: R3_ANALYSIS
    },
    {
      id: 'r4', type: 'call', ticker: 'NEE',
      title: 'Expert call: Grid permitting attorney — 18-24 month approval backlog confirmed, Texas exception',
      body: 'Former FERC attorney (25 years experience) confirms transmission permitting backlog is 18-24 months for projects under 500MW. Notes IRA provisions are helping at federal level but state utility commissions remain primary bottleneck. Texas ERCOT highlighted as exception — 6-month average. Called out NEE specifically as best-positioned given regulatory relationships.',
      priority: 'normal', tickers: ['NEE', 'AES', 'D', 'EXC'],
      actionRequired: false, ts: new Date(Date.now() - 14_400_000)
    },
    {
      id: 'r5', type: 'signal', ticker: 'TSM',
      title: 'Supply chain check: N2 node yield tracking 8-12% ahead of TSMC internal targets',
      body: 'Checks with 3 TSMC equipment suppliers confirm N2 node yield is tracking 8-12% above internal targets at this stage of ramp. Historical yield outperformance at new node introduction has consistently preceded production pull-forward and positive ASP revision. If confirmed in Q2 call, accelerates the Blackwell cycle timeline by 1-2 quarters.',
      priority: 'high', tickers: ['TSM', 'NVDA', 'AMAT', 'ASML', 'KLAC'],
      actionRequired: true, ts: new Date(Date.now() - 1_800_000)
    }
  ]);

  private _clients = new BehaviorSubject<Client[]>([
    {
      id: 'c1', name: 'Sarah Chen', firm: 'Ontario Teachers Pension Plan', aum: '$247B',
      mandate: 'Global equity — 60% passive / 40% active, ESG overlay required on all active sleeves',
      concerns: ['AI governance in active management process', 'Carbon transition portfolio exposure', 'Fee compression vs passive alternatives'],
      portfolios: ['MSIM Global Equity Alpha', 'MSIM Emerging Markets Growth'],
      lastMeeting: new Date(Date.now() - 86_400_000 * 45),
      nextMeeting: new Date(Date.now() + 86_400_000 * 2),
      briefing: C1_BRIEFING
    },
    {
      id: 'c2', name: 'Ahmed Al-Rashid', firm: 'Abu Dhabi Investment Authority', aum: '$1.1T',
      mandate: 'Multi-asset long-duration, strategic allocation, technology overweight permitted up to 35%',
      concerns: ['Geopolitical risk in EM exposure', 'Access to AI infrastructure investment opportunities', 'Liquidity profile of credit positions'],
      portfolios: ['MSIM Multi-Asset Strategic', 'MSIM Infrastructure Debt'],
      lastMeeting: new Date(Date.now() - 86_400_000 * 30),
      nextMeeting: new Date(Date.now() + 86_400_000 * 5),
      briefing: C2_BRIEFING
    },
    {
      id: 'c3', name: 'Maria Gonzalez', firm: 'CalPERS', aum: '$496B',
      mandate: 'Diversified, inflation-linked, expanding private market allocation to 40% over 5 years',
      concerns: ['Private equity valuation marks transparency', 'Inflation duration matching', 'Manager concentration risk'],
      portfolios: ['MSIM Real Assets Fund III', 'MSIM Private Credit Opportunities'],
      lastMeeting: new Date(Date.now() - 86_400_000 * 60),
      nextMeeting: new Date(Date.now() + 86_400_000 * 1),
      briefing: C3_BRIEFING
    },
    {
      id: 'c4', name: 'Kenji Yamamoto', firm: 'Government Pension Investment Fund (GPIF)', aum: '$1.6T',
      mandate: 'Global balanced — 50% equities / 50% fixed income, currency hedge required on foreign exposure',
      concerns: ['BOJ policy normalization impact on hedging costs', 'AI governance compliance with Japan FSA guidelines', 'Manager performance attribution methodology'],
      portfolios: ['MSIM Global Balanced Strategy', 'MSIM Asia Pacific Opportunities'],
      lastMeeting: new Date(Date.now() - 86_400_000 * 21),
      nextMeeting: new Date(Date.now() + 86_400_000 * 8),
      briefing: C4_BRIEFING
    }
  ]);

  private _alerts = new BehaviorSubject<RiskAlert[]>([
    {
      id: 'a1', portfolio: 'Global Tech Growth', type: 'concentration', severity: 'warning',
      title: 'Semiconductor concentration at 34.8% — IPS limit 35%',
      rawData: 'Sector exposure: NVDA 18.2%, TSM 8.1%, ASML 5.4%, AMD 3.1% = 34.8%. IPS single-sector limit: 35.0%. Buffer: 20bps. At current drift rate, breach in est. 8 trading days.',
      ts: new Date(), resolved: false, narrative: A1_NARRATIVE
    },
    {
      id: 'a2', portfolio: 'EM Opportunities', type: 'var', severity: 'critical',
      title: '10-day VaR +22.7% WoW — China regulatory beta elevated',
      rawData: '10d 95% VaR: $12.4M (prev week: $10.1M, +22.7%). Primary driver: BABA/JD implied vol spike +340bps post-PBOC announcement. China regulatory factor beta: 1.83 (was 1.21). Historical CVaR: $18.2M.',
      ts: new Date(Date.now() - 1_800_000), resolved: false, narrative: A2_NARRATIVE
    },
    {
      id: 'a3', portfolio: 'Clean Energy Fund', type: 'factor', severity: 'warning',
      title: 'Duration exposure elevated — rate vol at 98th percentile',
      rawData: 'Portfolio effective duration: 8.2yr. Dollar duration: $41.0M. Rate sensitivity: -$3.1M per 25bp parallel shift. 1-month rate vol: 98th percentile (2004-present). Utility sector rate beta: -1.41.',
      ts: new Date(Date.now() - 3_600_000), resolved: false
    },
    {
      id: 'a4', portfolio: 'Global Equity Core', type: 'compliance', severity: 'info',
      title: 'MSFT approaching 5% single-stock limit (currently 4.73%)',
      rawData: 'MSFT weight: 4.73% (IPS limit: 5.0%). Buffer: 27bps. At +2.1% weekly price appreciation rate, estimated breach: 13 trading days. No current violation. Proactive flag per policy.',
      ts: new Date(Date.now() - 7_200_000), resolved: false
    }
  ]);

  private _livingThesis = new BehaviorSubject<LivingThesisState>(this.loadLivingThesis());

  theses$   = this._theses.asObservable();
  research$ = this._research.asObservable();
  clients$  = this._clients.asObservable();
  alerts$   = this._alerts.asObservable();
  livingThesis$ = this._livingThesis.asObservable();

  get theses()   { return this._theses.value; }
  get research() { return this._research.value; }
  get clients()  { return this._clients.value; }
  get alerts()   { return this._alerts.value; }
  get livingThesis() { return this._livingThesis.value; }

  addThesis(t: Thesis) { this._theses.next([...this._theses.value, t]); }
  updateThesis(id: string, patch: Partial<Thesis>) {
    this._theses.next(this._theses.value.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date() } : t));
  }

  updateResearch(id: string, patch: Partial<ResearchItem>) {
    this._research.next(this._research.value.map(i => i.id === id ? { ...i, ...patch } : i));
  }
  dismissResearch(id: string) {
    this._research.next(this._research.value.filter(i => i.id !== id));
  }

  updateClient(id: string, patch: Partial<Client>) {
    this._clients.next(this._clients.value.map(c => c.id === id ? { ...c, ...patch } : c));
  }

  resolveAlert(id: string) {
    this._alerts.next(this._alerts.value.map(a => a.id === id ? { ...a, resolved: true } : a));
  }

  updateAlert(id: string, patch: Partial<RiskAlert>) {
    this._alerts.next(this._alerts.value.map(a => a.id === id ? { ...a, ...patch } : a));
  }

  trackLivingThesisBelief(id: string) {
    this.updateLivingThesisBelief(id, belief => ({ ...belief, tracked: true, notRelevant: false }));
  }

  submitLivingThesisVariantView(id: string, variantView: string) {
    this.updateLivingThesisBelief(id, belief => ({
      ...belief,
      tracked: true,
      notRelevant: false,
      variantView: variantView.trim()
    }));
  }

  markLivingThesisBeliefNotRelevant(id: string) {
    this.updateLivingThesisBelief(id, belief => ({
      ...belief,
      tracked: false,
      notRelevant: true
    }));
  }

  restoreLivingThesisBelief(id: string) {
    this.updateLivingThesisBelief(id, belief => ({
      ...belief,
      notRelevant: false
    }));
  }

  resetLivingThesis() {
    const resetState: LivingThesisState = {
      ...DEFAULT_LIVING_THESIS,
      updatedAt: new Date(),
      beliefs: DEFAULT_LIVING_THESIS.beliefs.map(belief => ({
        ...belief,
        updatedAt: new Date()
      }))
    };
    this._livingThesis.next(resetState);
    try {
      localStorage.removeItem(LIVING_THESIS_STORAGE_KEY);
    } catch {
      // Ignore storage failures in demo mode.
    }
  }

  private updateLivingThesisBelief(id: string, updater: (belief: LivingThesisBelief) => LivingThesisBelief) {
    const nextState: LivingThesisState = {
      ...this._livingThesis.value,
      updatedAt: new Date(),
      beliefs: this._livingThesis.value.beliefs.map(belief =>
        belief.id === id ? { ...updater(belief), updatedAt: new Date() } : belief
      )
    };
    this._livingThesis.next(nextState);
    this.persistLivingThesis(nextState);
  }

  private loadLivingThesis(): LivingThesisState {
    try {
      const raw = localStorage.getItem(LIVING_THESIS_STORAGE_KEY);
      if (!raw) return DEFAULT_LIVING_THESIS;
      const parsed = JSON.parse(raw) as LivingThesisState;
      return {
        ...parsed,
        updatedAt: new Date(parsed.updatedAt),
        beliefs: parsed.beliefs.map(belief => ({
          ...belief,
          updatedAt: new Date(belief.updatedAt)
        }))
      };
    } catch {
      return DEFAULT_LIVING_THESIS;
    }
  }

  private persistLivingThesis(state: LivingThesisState) {
    try {
      localStorage.setItem(LIVING_THESIS_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage failures in demo mode.
    }
  }
}
