# MSIM 2030 Intelligence Platform

An Angular 17 + Tailwind CSS application demonstrating the MSIM 2030 AI-transformed investment firm vision.

## Features

- **Dashboard** — Morning briefing, portfolio overview, live alert monitoring
- **PM Workstation** — Living thesis management with AI analysis and scenario war room
- **Research Docket** — Prioritized signal queue with analyst AI + Skeptic Agent challenge
- **Client Intelligence** — Pre-meeting briefing generation for institutional clients
- **Risk Monitor** — Natural-language risk narratives and on-demand stress testing

## Quick Start

```bash
chmod +x setup.sh
./setup.sh
```

Then add your Anthropic API key to `src/environments/environment.ts`.

Without an API key, the app runs in **demo mode** with simulated AI responses.

## Tech Stack

- Angular 17 (module-based, no standalone)
- Tailwind CSS 3
- Claude API (claude-sonnet-4-5) with streaming
- RxJS BehaviorSubject state management
# 2030vision
