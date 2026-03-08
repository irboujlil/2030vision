import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-ai-stream',
  template: `
    <div *ngIf="text || loading"
         class="mt-4 rounded-xl overflow-hidden animate-fade-in"
         [class.ai-stream-glow]="loading"
         [style.border]="'1px solid ' + (loading ? 'rgba(37,99,235,0.28)' : 'rgba(15,23,42,0.1)')"
         style="background: linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%); backdrop-filter: blur(8px)">

      <!-- Header bar -->
      <div class="flex items-center gap-2.5 px-4 py-2.5 border-b border-slate-200/80"
           style="background: linear-gradient(90deg, rgba(37,99,235,0.05), rgba(14,165,233,0.02))">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full border flex items-center justify-center"
               [style.border-color]="loading ? 'rgba(37,99,235,0.45)' : 'rgba(37,99,235,0.22)'"
               [style.background]="loading ? 'rgba(37,99,235,0.14)' : 'rgba(37,99,235,0.08)'"
               [style.box-shadow]="loading ? '0 0 8px rgba(37,99,235,0.18)' : 'none'">
            <span class="text-gold text-[7px] font-bold font-mono">AI</span>
          </div>
          <span class="text-[9px] font-semibold tracking-[0.14em] uppercase text-slate-600">
            {{ agentName || 'Intelligence Layer' }}
          </span>
        </div>

        <div *ngIf="loading" class="ml-auto flex items-center gap-1.5">
          <span class="w-1 h-1 rounded-full bg-gold/60 animate-pulse"></span>
          <span class="w-1 h-1 rounded-full bg-gold/40 animate-pulse" style="animation-delay:0.18s"></span>
          <span class="w-1 h-1 rounded-full bg-gold/20 animate-pulse" style="animation-delay:0.36s"></span>
          <span class="text-[9px] text-slate-500 font-mono ml-1">analyzing</span>
        </div>
        <div *ngIf="!loading && text" class="ml-auto flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400/60"
                style="box-shadow: 0 0 6px rgba(52,211,153,0.4)"></span>
          <span class="text-[9px] text-emerald-400/50 font-mono">complete</span>
        </div>
      </div>

      <!-- Content -->
      <div class="px-5 py-4 text-slate-700 text-sm leading-relaxed ai-text"
           [class.streaming-cursor]="loading"
           [innerHTML]="formattedHtml"></div>
    </div>
  `
})
export class AiStreamComponent {
  @Input() text = '';
  @Input() loading = false;
  @Input() agentName = '';

  private readonly sourceUrls: Record<string, string> = {
    bloomberg: 'https://www.bloomberg.com',
    alphasense: 'https://www.alpha-sense.com',
    factset: 'https://www.factset.com',
    refinitiv: 'https://www.lseg.com/en/data-analytics/financial-data',
    lseg: 'https://www.lseg.com',
    sec: 'https://www.sec.gov/edgar/search',
    'sec filings': 'https://www.sec.gov/edgar/search',
    'internal risk system': '#',
    'internal research db': '#'
  };

  constructor(private sanitizer: DomSanitizer) {}

  get formattedHtml(): SafeHtml {
    if (!this.text) return this.sanitizer.bypassSecurityTrustHtml('');

    const escaped = this.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const html = escaped
      .replace(/\[Sources?:\s*([^\]]+)\]/gi, (_m, raw) => this.renderSources(raw))
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a class="ai-link" href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^## (.+)$/gm, '<div class="ai-h2">$1</div>')
      .replace(/^### (.+)$/gm, '<div class="ai-h3">$1</div>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^(\d+)\. (.+)$/gm, '<div class="ai-numbered"><span class="ai-num">$1.</span><span>$2</span></div>')
      .replace(/^[-\u2022] (.+)$/gm, '<div class="ai-bullet">$1</div>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private renderSources(raw: string): string {
    const sources = raw
      .split(/[|,;]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (!sources.length) return '';

    const chips = sources.map(source => {
      const key = source.toLowerCase();
      const href = this.sourceUrls[key] ?? `https://www.google.com/search?q=${encodeURIComponent(source)}`;
      if (href === '#') return `<span class="ai-cite ai-cite-internal">${source}</span>`;
      return `<a class="ai-cite" href="${href}" target="_blank" rel="noopener noreferrer">${source}</a>`;
    }).join('');

    return `<span class="ai-sources"><span class="ai-source-label">Sources:</span>${chips}</span>`;
  }
}
