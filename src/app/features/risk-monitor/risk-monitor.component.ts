import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AiService } from '../../core/ai.service';
import { RiskAlert, Thesis, ThesisTrigger } from '../../core/models';

@Component({ selector: 'app-risk-monitor', templateUrl: './risk-monitor.component.html' })
export class RiskMonitorComponent implements OnInit {
  alerts: RiskAlert[] = [];
  theses: Thesis[] = [];
  selected: RiskAlert | null = null;
  narrativeText = '';
  narrativeLoading = false;
  stressText = '';
  stressLoading = false;
  stressQuery = '';
  showResolved = false;
  private narratingAlertId: string | null = null;

  readonly RISK_SYS = `You are the MSIM 2030 Risk Intelligence Engine. Convert raw risk data into clear narrative.
Structure: What happened → Why it matters → What's the portfolio impact → Recommended action → Escalation threshold.
Be specific with numbers. Use natural language, not spreadsheet-speak. Under 300 words.`;

  readonly STRESS_SYS = `You are the MSIM 2030 on-demand stress testing engine.
For any scenario, provide: factor exposure analysis, correlated position impacts, historical analogues with outcomes,
hedging options with cost estimates. Be quantitatively specific. Format clearly.`;

  constructor(private data: DataService, public ai: AiService) {}

  ngOnInit() {
    this.data.alerts$.subscribe(a => this.alerts = a);
    this.data.theses$.subscribe(t => this.theses = t);
  }

  get active() { return this.alerts.filter(a => !a.resolved); }
  get resolved() { return this.alerts.filter(a => a.resolved); }
  get displayed() { return this.showResolved ? this.alerts : this.active; }

  get linkedTheses(): { thesis: Thesis; triggers: ThesisTrigger[] }[] {
    if (!this.selected) return [];
    const alertId = this.selected.id;
    return this.theses
      .filter(t => t.triggers && t.triggers.some(tr => tr.linkedAlertIds && tr.linkedAlertIds.indexOf(alertId) >= 0))
      .map(t => ({
        thesis: t,
        triggers: (t.triggers || []).filter(tr => tr.linkedAlertIds && tr.linkedAlertIds.indexOf(alertId) >= 0)
      }));
  }

  toggleTriggerStatus(trigger: ThesisTrigger) {
    const cycle: { [key: string]: 'watching' | 'triggered' | 'cleared' } = {
      watching: 'triggered',
      triggered: 'cleared',
      cleared: 'watching'
    };
    trigger.status = cycle[trigger.status] || 'watching';
  }

  getTriggeredCount(thesis: Thesis): number {
    return (thesis.triggers || []).filter(tr => tr.status === 'triggered').length;
  }

  getTotalTriggers(thesis: Thesis): number {
    return (thesis.triggers || []).length;
  }

  isLinkedTrigger(item: { thesis: Thesis; triggers: ThesisTrigger[] }, trigger: ThesisTrigger): boolean {
    return item.triggers.indexOf(trigger) !== -1;
  }

  select(a: RiskAlert) {
    this.selected = a;
    if (!(this.narrativeLoading && this.narratingAlertId === a.id)) {
      this.narrativeText = a.narrative || '';
    }
    this.stressText = '';
  }

  async narrate() {
    if (!this.selected) return;
    const alert = this.selected;
    this.narratingAlertId = alert.id;
    this.narrativeText = '';
    this.narrativeLoading = true;
    const simulatedDelayMs = 3000 + Math.floor(Math.random() * 2001);
    await new Promise(r => setTimeout(r, simulatedDelayMs));
    const narrative = this.buildRiskNarrative(alert);
    this.data.updateAlert(alert.id, { narrative });
    if (this.selected?.id === alert.id) this.narrativeText = narrative;
    this.narratingAlertId = null;
    this.narrativeLoading = false;
  }

  async runStress() {
    if (!this.stressQuery.trim()) return;
    this.stressText = '';
    this.stressLoading = true;
    const portfolio = this.selected?.portfolio || 'full book';
    const prompt = `Portfolio: ${portfolio}
Scenario: "${this.stressQuery}"
Active alerts context: ${this.active.map(a => a.title).join('; ')}
Run stress test: factor exposures, correlated impacts, historical analogues, hedging recommendations.`;

    await this.ai.stream(this.STRESS_SYS, prompt, chunk => this.stressText += chunk);
    this.stressLoading = false;
  }

  resolve(id: string, event: Event) {
    event.stopPropagation();
    this.data.resolveAlert(id);
    if (this.selected?.id === id) {
      this.selected = null;
      this.narrativeText = '';
    }
  }

  severityClass(s: string) {
    return { critical: 'badge-critical', warning: 'badge-warning', info: 'badge-info' }[s] ?? '';
  }

  indicatorClass(s: string) {
    return { critical: 'bg-red-500 animate-pulse', warning: 'bg-amber-400', info: 'bg-blue-400' }[s] ?? '';
  }

  private buildRiskNarrative(alert: RiskAlert): string {
    const severityAction =
      alert.severity === 'critical'
        ? 'Escalation should be immediate and same-session.'
        : alert.severity === 'warning'
          ? 'Escalation should be prepared today if trend worsens.'
          : 'Monitor and document; no urgent escalation required.';

    const riskTypeView: Record<string, string> = {
      concentration: 'Risk is concentration-driven and can amplify single-theme drawdowns.',
      var: 'Risk is volatility/factor-beta driven and can expand quickly with correlation clustering.',
      factor: 'Risk is factor-sensitivity driven; macro repricing can transmit rapidly to P&L.',
      compliance: 'Risk is limit-proximity/compliance driven and requires control discipline.',
      stress: 'Risk is scenario driven and should be framed with conditional outcomes.'
    };

    const view = riskTypeView[alert.type] || 'Risk requires active monitoring and explicit owner accountability.';

    return `## Risk Narrative - ${alert.portfolio}

**What Happened**
${alert.title}  
${alert.rawData}
[Sources: Internal Risk System | FactSet]

**Why It Matters**
${view} If unmanaged, this can force reactive decisions at worse liquidity conditions.
[Sources: Internal Risk System | Bloomberg]

**Portfolio Impact**
Current signal severity is **${alert.severity.toUpperCase()}** for **${alert.portfolio}**.  
Primary transmission channel is **${alert.type}** risk into near-term position sizing and drawdown profile.
[Sources: Internal Risk System]

**Recommended Action**
1. Confirm owner and timing for mitigation in this session.
2. Tie mitigation to explicit threshold(s) rather than discretionary language.
3. Re-check linked thesis triggers after action is queued.
[Sources: Internal Research DB | Internal Risk System]

**Escalation Threshold**
${severityAction}
[Sources: Internal Risk System]`;
  }
}
