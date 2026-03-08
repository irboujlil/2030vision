#!/bin/bash
set -e
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║     MSIM 2030 Intelligence Platform              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
if ! command -v node &>/dev/null; then echo "❌ Node.js not found. Install v18+ from https://nodejs.org"; exit 1; fi
echo "✅ Node $(node -v)"
if ! command -v ng &>/dev/null; then echo "📦 Installing Angular CLI..."; npm install -g @angular/cli@17 --silent; fi
echo "✅ Angular CLI ready"
echo "📦 Installing dependencies (~1 min)..."
npm install --silent
echo "✅ Done. Starting server..."
echo ""
echo "  ➜  http://localhost:4200"
echo "  ➜  Add API key: src/environments/environment.ts"
echo ""
npx ng serve --open
