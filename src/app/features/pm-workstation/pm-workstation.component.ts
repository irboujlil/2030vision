import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AiService } from '../../core/ai.service';
import { Thesis } from '../../core/models';

@Component({ selector: 'app-pm-workstation', templateUrl: './pm-workstation.component.html' })
export class PmWorkstationComponent implements OnInit {
  theses: Thesis[] = [];
  selected: Thesis | null = null;

  aiText = '';
  aiLoading = false;
  scenarioText = '';
  scenarioLoading = false;
  scenarioQuery = '';

  showAdd = false;
  draft: any = { direction: 'Long', conviction: 'High', score: 7, catalysts: [], invalidation: [] };
  catalystInput = '';
  invalidationInput = '';

  readonly THESIS_SYS = `You are an AI investment research assistant at Morgan Stanley Investment Management.
Analyze investment theses with institutional rigor. Be direct, quantitative where possible, and cite specific risks.
Format with markdown headers. Focus on: conviction drivers, key risks, what would change the thesis, monitoring triggers.`;

  readonly SCENARIO_SYS = `You are the MSIM 2030 scenario analysis engine. You have access to the full portfolio book.
For any macro or market scenario, identify which positions are affected, quantify the likely impact, suggest actions.
Be specific with numbers and historical analogues. Format clearly with per-position breakdowns.`;

  constructor(private data: DataService, public ai: AiService) {}

  ngOnInit() { this.data.theses$.subscribe(t => this.theses = t); }

  select(t: Thesis) {
    this.selected = t;
    this.aiText = t.aiAnalysis || '';
    this.scenarioText = '';
  }

  async analyzeThesis() {
    if (!this.selected) return;
    this.aiText = '';
    this.aiLoading = true;
    const t = this.selected;
    const prompt = `Analyze this investment thesis:
Ticker: ${t.ticker} (${t.name}) — ${t.direction}
Conviction: ${t.conviction} (${t.score}/10)
Thesis: ${t.thesis}
Catalysts: ${t.catalysts.join('; ')}
Invalidation criteria: ${t.invalidation.join('; ')}
Target: $${t.targetPrice} | Current: $${t.currentPrice} | Upside: ${((t.targetPrice/t.currentPrice - 1)*100).toFixed(1)}%`;

    await this.ai.stream(this.THESIS_SYS, prompt, chunk => this.aiText += chunk);
    this.data.updateThesis(t.id, { aiAnalysis: this.aiText });
    this.aiLoading = false;
  }

  async runScenario() {
    if (!this.scenarioQuery.trim()) return;
    this.scenarioText = '';
    this.scenarioLoading = true;
    const book = this.theses.map(t =>
      `${t.ticker} ${t.direction} conviction ${t.score}/10: ${t.thesis.slice(0, 120)}`
    ).join('\n');

    const prompt = `Portfolio book:\n${book}\n\nScenario: "${this.scenarioQuery}"\n\nAnalyze per-position impact, portfolio-level implications, and suggested tactical actions.`;
    await this.ai.stream(this.SCENARIO_SYS, prompt, chunk => this.scenarioText += chunk);
    this.scenarioLoading = false;
  }

  addCatalyst() {
    if (this.catalystInput.trim()) {
      this.draft.catalysts = [...this.draft.catalysts, this.catalystInput.trim()];
      this.catalystInput = '';
    }
  }

  removeTag(arr: string[], i: number) { arr.splice(i, 1); }

  addInvalidation() {
    if (this.invalidationInput.trim()) {
      this.draft.invalidation = [...this.draft.invalidation, this.invalidationInput.trim()];
      this.invalidationInput = '';
    }
  }

  saveThesis() {
    const t: Thesis = {
      id: Date.now().toString(),
      ticker: (this.draft.ticker || '').toUpperCase(),
      name: this.draft.name || this.draft.ticker,
      direction: this.draft.direction,
      conviction: this.draft.conviction,
      score: +this.draft.score || 5,
      thesis: this.draft.thesis || '',
      catalysts: [...this.draft.catalysts],
      invalidation: [...this.draft.invalidation],
      targetPrice: +this.draft.targetPrice || 0,
      currentPrice: +this.draft.currentPrice || 0,
      entryDate: new Date(),
      updatedAt: new Date()
    };
    this.data.addThesis(t);
    this.showAdd = false;
    this.draft = { direction: 'Long', conviction: 'High', score: 7, catalysts: [], invalidation: [] };
  }
}
