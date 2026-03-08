import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/data.service';
import { AiService } from '../../core/ai.service';
import { Thesis, ResearchItem, RiskAlert, Client, ChatMessage } from '../../core/models';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html'
})
export class ChatComponent implements OnInit {

  readonly SYSTEM = `You are the MSIM 2030 Conversational Intelligence Agent. You have full access to the portfolio book, research signals, risk alerts, and client data. Answer questions directly with specific data references. Be institutional and precise.`;

  messages: ChatMessage[] = [];
  inputText = '';
  isTyping = false;
  showContextMenu = false;
  contextType = '';
  attachedContext: { type: string; label: string; id: string } | null = null;

  theses: Thesis[] = [];
  research: ResearchItem[] = [];
  alerts: RiskAlert[] = [];
  clients: Client[] = [];

  constructor(private data: DataService, private ai: AiService) {
    const now = Date.now();

    this.messages = [
      {
        id: 'seed-1',
        role: 'user',
        content: 'What\'s our biggest risk exposure right now?',
        timestamp: new Date(now - 5 * 60 * 1000)
      },
      {
        id: 'seed-2',
        role: 'assistant',
        content: `**Current Risk Exposure Summary**

The most significant risk vector is semiconductor concentration, which has drifted to 34.8% of the total book — well above the 30% IPS guideline limit. This is driven primarily by NVDA (+22% since entry), which now represents an outsized single-name position. The concentration has been building passively as the position appreciated, not through active accumulation, but the risk is identical regardless of the cause.

Second priority is the Value-at-Risk spike in the EM book. The 1-day 95% VaR has moved to $12.4M, breaching the $10M internal threshold. This is largely attributable to BABA and broader China exposure following the latest PBOC policy uncertainty. The correlation between BABA and the broader Hang Seng has increased from 0.62 to 0.78 over the past two weeks, reducing the diversification benefit we were counting on.

**Recommended Actions:**
1. Initiate a measured NVDA trim — suggest reducing by 3-5% of book over the next 10 trading days to bring semiconductor concentration below the 30% guideline
2. Review BABA position sizing given elevated EM VaR; current 6/10 conviction may warrant a reduction to 4% max allocation
3. Schedule Risk Committee review within 48 hours per escalation policy`,
        timestamp: new Date(now - 4.5 * 60 * 1000),
        agentName: 'Conversational Agent'
      },
      {
        id: 'seed-3',
        role: 'user',
        content: 'How should I position for the NVDA earnings tomorrow?',
        timestamp: new Date(now - 3 * 60 * 1000),
        context: { type: 'thesis', label: 'NVDA Long 9/10', id: '1' }
      },
      {
        id: 'seed-4',
        role: 'assistant',
        content: `**NVDA Earnings Positioning Recommendation**

Given the current 9/10 conviction and the concentration risk flagged above, I recommend a disciplined pre-earnings framework rather than a binary bet:

**Trim Plan (Pre-Earnings):**
Reduce NVDA by 2% of total book before the close today. This accomplishes two objectives simultaneously — it addresses the concentration breach flagged by Risk, and it creates optionality to add back post-earnings if the thesis is confirmed. At current levels, this means selling approximately $4.2M notional, which is well within the 20-day ADV threshold for minimal market impact.

**Option Overlay:**
Consider a post-earnings collar structure: buy the 1-week 5% OTM put funded by selling the 1-week 8% OTM call. Net cost is approximately 15bps given current skew. This protects against a downside gap while preserving 80% of the upside scenario. The implied move is pricing at +/-7.2%, which is historically elevated — selling vol above the strike makes sense here.

**Blackwell Guidance — The Key Variable:**
Consensus is focused on the revenue beat (expected $24.8B vs. street at $24.2B). That is table stakes. The real catalyst is Blackwell production yield and ramp timeline commentary. Our expert network channel checks suggest yields are running ahead of schedule at TSMC — if management confirms this on the call, the stock re-rates on forward estimates, not the backward-looking revenue print. Monitor the prepared remarks for specific Blackwell unit shipment guidance for Q2/Q3 and gross margin trajectory above 75%.`,
        timestamp: new Date(now - 2.5 * 60 * 1000),
        agentName: 'Conversational Agent'
      }
    ];
  }

  ngOnInit(): void {
    this.data.theses$.subscribe(t => this.theses = t);
    this.data.research$.subscribe(r => this.research = r);
    this.data.alerts$.subscribe(a => this.alerts = a);
    this.data.clients$.subscribe(c => this.clients = c);
  }

  async sendMessage(): Promise<void> {
    if (!this.inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: this.inputText.trim(),
      timestamp: new Date(),
      context: this.attachedContext ? { ...this.attachedContext } : undefined
    };
    this.messages.push(userMsg);

    const prompt = this.buildPrompt(this.inputText.trim());
    this.inputText = '';
    this.isTyping = true;

    const assistantMsg: ChatMessage = {
      id: 'msg-' + (Date.now() + 1),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      agentName: 'Conversational Agent'
    };
    this.messages.push(assistantMsg);

    try {
      await this.ai.stream(this.SYSTEM, prompt, (chunk: string) => {
        assistantMsg.content += chunk;
      });
    } catch (err) {
      assistantMsg.content += '\n\n*[Error communicating with the AI service. Please try again.]*';
    }

    this.isTyping = false;
    this.attachedContext = null;
  }

  attachContext(type: string, item: any): void {
    let label = '';
    switch (type) {
      case 'thesis':
        label = item.ticker + ' ' + item.direction + ' ' + item.score + '/10';
        break;
      case 'client':
        label = item.name + ' @ ' + item.firm;
        break;
      case 'alert':
        label = item.title;
        break;
      case 'signal':
        label = item.title;
        break;
    }
    this.attachedContext = { type, label, id: item.id };
    this.showContextMenu = false;
  }

  removeContext(): void {
    this.attachedContext = null;
  }

  toggleContextMenu(): void {
    this.showContextMenu = !this.showContextMenu;
  }

  trackById(index: number, msg: ChatMessage): string {
    return msg.id;
  }

  private buildPrompt(userText: string): string {
    let prompt = userText;
    if (this.attachedContext) {
      prompt = `[Attached context — ${this.attachedContext.type}: ${this.attachedContext.label}]\n\n${userText}`;
    }
    return prompt;
  }
}
