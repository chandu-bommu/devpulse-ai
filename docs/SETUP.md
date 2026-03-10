# Step-by-Step Setup Guide

> A beginner-friendly guide to get DevPulse AI running on your machine from scratch. No prior experience with monorepos or this specific stack is assumed.

---

## Table of Contents

1. [What You'll Need (Prerequisites)](#what-youll-need-prerequisites)
2. [Understanding the Project](#understanding-the-project)
3. [Clone & Install](#step-1-clone--install)
4. [Understanding the Folder Structure](#step-2-understanding-the-folder-structure)
5. [Running the App](#step-3-running-the-app)
6. [Verifying Everything Works](#step-4-verifying-everything-works)
7. [What You're Looking At (Dashboard Tour)](#step-5-what-youre-looking-at)
8. [Environment Variables Explained](#step-6-environment-variables)
9. [Making Your First Change](#step-7-making-your-first-change)
10. [Common Errors & Fixes](#common-errors--fixes)
11. [Next Steps](#next-steps)

---

## What You'll Need (Prerequisites)

Before starting, make sure you have these installed:

### 1. Node.js (version 18 or newer)

Node.js is the JavaScript runtime that runs our backend server and build tools.

**Check if you have it:**
```bash
node --version
# Should output: v18.x.x or v20.x.x or higher
```

**Install if needed:**
- **macOS**: `brew install node` (if you have Homebrew) or download from https://nodejs.org
- **Windows**: Download the LTS version from https://nodejs.org
- **Linux**: `sudo apt install nodejs npm` or use nvm (recommended)

### 2. npm (version 10 or newer)

npm is the package manager that comes with Node.js. It installs libraries our project depends on.

**Check if you have it:**
```bash
npm --version
# Should output: 10.x.x or higher
```

**Update if needed:**
```bash
npm install -g npm@latest
```

### 3. Git

Git is the version control tool we use to manage code changes.

**Check if you have it:**
```bash
git --version
```

### 4. A Code Editor

We recommend **VS Code** (https://code.visualstudio.com) with these extensions:
- **ESLint** — catches code errors
- **Tailwind CSS IntelliSense** — autocompletes CSS classes
- **TypeScript Importer** — helps with imports

### 5. A Terminal

- **macOS**: Terminal.app or iTerm2
- **Windows**: Windows Terminal or PowerShell
- **Linux**: Any terminal emulator
- **VS Code**: Built-in terminal (`` Ctrl+` ``)

---

## Understanding the Project

Before we start, let's understand what DevPulse AI is made of. Think of it like a restaurant:

| Part | Restaurant Analogy | Technology |
|------|-------------------|-----------|
| **Frontend** (`apps/shell`) | The dining room — what customers see | Next.js + React |
| **BFF** (`packages/bff`) | The kitchen — prepares and serves food | Express.js |
| **AI Engine** (`packages/ai-engine`) | The head chef — makes smart decisions | TypeScript + OpenAI |
| **UI System** (`packages/ui-system`) | The plates and utensils — reusable items | Lit Web Components |
| **Infrastructure** (`infra/azure`) | The building blueprints | Kubernetes + Azure |

The **Frontend** asks the **BFF** for data. The **BFF** gathers data from multiple sources (GitHub, Azure, AI) and sends it back in a clean format. This "Backend For Frontend" pattern means the frontend never needs to worry about where data comes from.

---

## Step 1: Clone & Install

### 1a. Clone the repository

```bash
# Navigate to where you keep your projects
cd ~/projects  # or wherever you prefer

# Clone the repo
git clone https://github.com/your-username/devpulse-ai.git

# Enter the project directory
cd devpulse-ai
```

### 1b. Install all dependencies

```bash
npm install
```

**What this does:**
- Reads `package.json` files in the root AND all sub-packages (`apps/shell`, `packages/bff`, `packages/ai-engine`, `packages/ui-system`)
- Downloads all the libraries they need into `node_modules/` folders
- This is why we use "npm workspaces" — one `npm install` at the root handles everything

**Expected output:**
```
added 295 packages, and audited 300 packages in 2m
```

**If you get errors:** See [Common Errors & Fixes](#common-errors--fixes) below.

### 1c. Set up environment variables (optional)

```bash
# Copy the template
cp .env.example .env
```

**You don't need to fill in any values!** The app runs in **Mock Data Mode** by default. All API keys are optional — only needed if you want to connect to real GitHub Actions, Azure Monitor, or OpenAI.

---

## Step 2: Understanding the Folder Structure

After cloning, your project looks like this:

```
devpulse-ai/
├── apps/                    ← Applications (things you deploy)
│   └── shell/               ← The main web dashboard
│
├── packages/                ← Shared libraries (reusable code)
│   ├── bff/                 ← Backend server (API + WebSocket)
│   ├── ai-engine/           ← AI prediction logic
│   └── ui-system/           ← Reusable web components
│
├── infra/                   ← Infrastructure config (for cloud deployment)
│   └── azure/
│
├── docs/                    ← Documentation (you're reading one now!)
│
├── node_modules/            ← Downloaded dependencies (don't edit!)
├── package.json             ← Root config — defines workspaces
├── turbo.json               ← Turborepo config — manages builds
├── tsconfig.json            ← TypeScript config — type checking
├── .env.example             ← Environment variable template
├── .gitignore               ← Files Git should ignore
└── README.md                ← Project overview
```

**Key concept — Monorepo:**

This project is a **monorepo** — all related packages live in one repository. The alternative would be separate repos for each package. Benefits:
- One `git clone`, one `npm install`
- Shared TypeScript types across packages
- Atomic changes (update BFF + frontend in one commit)
- Turborepo caches builds so only changed packages rebuild

---

## Step 3: Running the App

You need **two servers** running at the same time:

| Server | Port | Purpose |
|--------|------|---------|
| BFF (Backend) | `http://localhost:4000` | Serves API data + WebSocket |
| Shell (Frontend) | `http://localhost:3000` | The dashboard you see in the browser |

### Option A: Start both at once (recommended)

```bash
npm run dev:all
```

This uses `concurrently` to run both servers in one terminal.

### Option B: Start them separately (useful for debugging)

**Terminal 1 — Start the BFF:**
```bash
npm run dev:bff
```

You should see:
```
╔══════════════════════════════════════════════════╗
║          DevPulse AI — BFF Server                ║
║──────────────────────────────────────────────────║
║  REST API:    http://localhost:4000/api          ║
║  WebSocket:   ws://localhost:4000                ║
║  Health:      http://localhost:4000/api/health   ║
║  Mode:        MOCK DATA                          ║
╚══════════════════════════════════════════════════╝
```

**Terminal 2 — Start the Frontend:**
```bash
npm run dev:shell
```

You should see:
```
▲ Next.js 14.2.x
- Local: http://localhost:3000
✓ Ready in Xs
```

### Step 3 Complete!

Open **http://localhost:3000** in your browser.

---

## Step 4: Verifying Everything Works

### Check the BFF API

Open a new terminal and run these commands:

```bash
# 1. Health check — is the BFF alive?
curl http://localhost:4000/api/health
# Expected: {"status":"healthy","service":"devpulse-bff",...}

# 2. Pipeline data
curl http://localhost:4000/api/pipelines/summary | head -c 200
# Expected: {"success":true,"data":{"recentRuns":[...],...}}

# 3. DORA metrics
curl http://localhost:4000/api/dora/metrics | head -c 200
# Expected: {"success":true,"data":{"overallRating":"high",...}}

# 4. AI predictions
curl http://localhost:4000/api/ai/predict | head -c 200
# Expected: {"success":true,"data":{"riskScore":...,"riskLevel":"...",...}}

# 5. Alert clusters
curl http://localhost:4000/api/ai/alerts/clusters | head -c 200
# Expected: {"success":true,"data":[{"clusterId":"...","rootCause":"...",...}]}
```

**If all 5 return JSON data, the BFF is working perfectly.**

### Check the Frontend

1. Open http://localhost:3000 in your browser
2. You should see the DevPulse AI dashboard with:
   - A header with "DevPulse AI" logo and connection status
   - Stats bar showing Success Rate, Avg Build Time, Flaky Tests, Deploy Frequency
   - Pipeline Health Board with charts and recent runs
   - DORA Metrics with 4 metric cards and a radar chart
   - AI Incident Predictor with a risk gauge
   - Smart Alert Deduplication with expandable clusters

**If you see "Loading..." that doesn't resolve:**
- Make sure the BFF is running on port 4000
- Check your browser console (F12 → Console tab) for errors
- The frontend fetches from `http://localhost:4000` by default

---

## Step 5: What You're Looking At

### Dashboard Tour

The dashboard has 4 main panels arranged in a responsive grid:

```
┌──────────────────────────────┬──────────────────────┐
│                              │                      │
│  PIPELINE HEALTH BOARD       │  AI INCIDENT         │
│  ├── Build Time Trend (14d)  │  PREDICTOR           │
│  ├── Workflow Performance    │  ├── Risk Score Gauge │
│  └── Recent Runs (live)     │  ├── Confidence %     │
│                              │  ├── Suggested Actions│
│                              │  └── Similar Incidents│
├──────────────────────────────┤                      │
│                              ├──────────────────────┤
│  DORA METRICS                │                      │
│  ├── 4 Metric Cards         │  SMART ALERT          │
│  │   (Deploy Freq, Lead     │  DEDUPLICATION        │
│  │    Time, CFR, MTTR)      │  ├── Clusters by Root │
│  ├── Performance Radar      │  │   Cause             │
│  └── Team Comparison Table  │  ├── Severity Badges  │
│                              │  └── Recommended      │
│                              │      Actions          │
└──────────────────────────────┴──────────────────────┘
```

### Live Features

- **Green dot** next to "LIVE" in the header = WebSocket connected
- **Pipeline runs** appear at the top of the list every few seconds
- **Anomaly feed** shows detected anomalies in real-time (right column)
- **Data auto-refreshes** — no need to manually reload

### Mobile Responsive

On smaller screens, the 4 panels become tabs. Tap the tab icons at the top to switch between Pipelines, DORA, AI, and Alerts.

---

## Step 6: Environment Variables

The `.env.example` file lists all available configuration:

```bash
# ============================================
# BFF Server
# ============================================
BFF_PORT=4000                    # Port the BFF server runs on
FRONTEND_URL=http://localhost:3000  # Allowed CORS origin

# ============================================
# AI / LLM Integration
# ============================================
AI_API_KEY=                      # Leave blank = mock mode
AI_ENDPOINT=                     # Azure OpenAI endpoint URL
AI_MODEL=gpt-4                   # Which model to use

# ============================================
# GitHub Actions API
# ============================================
GITHUB_TOKEN=                    # GitHub Personal Access Token
GITHUB_ORG=                      # Your GitHub organization name

# ============================================
# Azure Monitor
# ============================================
AZURE_MONITOR_CONNECTION_STRING= # From Azure Portal
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

# ============================================
# Next.js Frontend
# ============================================
NEXT_PUBLIC_BFF_URL=http://localhost:4000  # Where frontend finds the BFF
```

**Rules:**
- Variables starting with `NEXT_PUBLIC_` are visible in the browser
- All other variables are server-side only (BFF)
- Empty values = feature disabled / mock mode

---

## Step 7: Making Your First Change

Let's make a small change to understand the development workflow.

### Example: Change the header title

1. Open `apps/shell/src/components/Header.tsx`
2. Find the line with `DevPulse AI`
3. Change it to `DevPulse AI - My Custom Dashboard`
4. Save the file
5. Your browser auto-refreshes (Next.js Hot Module Replacement)

### Example: Add a new API endpoint

1. Create a new file `packages/bff/src/routes/custom.ts`:

```typescript
import { Router } from 'express';

const router = Router();

router.get('/custom/hello', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Hello from DevPulse AI!' },
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

2. Register it in `packages/bff/src/index.ts` — add:

```typescript
import customRoutes from './routes/custom';
app.use('/api', customRoutes);
```

3. Test it:
```bash
curl http://localhost:4000/api/custom/hello
```

### Development Workflow Summary

```
1. Edit a file
      │
      ▼
2. Save (Ctrl+S / Cmd+S)
      │
      ▼
3. tsx/next.js detects the change automatically
      │
      ▼
4. BFF restarts / Frontend hot-reloads
      │
      ▼
5. See your change in the browser instantly
```

No manual restart needed! Both `tsx watch` (BFF) and Next.js dev server have hot reloading.

---

## Common Errors & Fixes

### `npm install` fails

**Error**: `ERESOLVE unable to resolve dependency tree`
```bash
# Fix: use legacy peer deps
npm install --legacy-peer-deps
```

**Error**: `EACCES permission denied`
```bash
# Fix: don't use sudo! Fix npm permissions instead:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
# Add to your shell profile: export PATH=~/.npm-global/bin:$PATH
```

### BFF won't start

**Error**: `EADDRINUSE: address already in use :::4000`
```bash
# Something is already using port 4000. Find and kill it:
lsof -i :4000
kill -9 <PID>

# Or change the port:
BFF_PORT=4001 npm run dev:bff
```

### Frontend shows blank page

**Check 1**: Is the BFF running?
```bash
curl http://localhost:4000/api/health
```
If this fails, start the BFF first.

**Check 2**: Browser console errors (F12 → Console)
- `net::ERR_CONNECTION_REFUSED` → BFF is not running
- `CORS error` → The `FRONTEND_URL` in `.env` doesn't match your browser URL

### TypeScript errors in IDE

If you see red squiggly lines like "Cannot find module 'react'":
```bash
# Make sure dependencies are installed
npm install

# Restart TypeScript server in VS Code:
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Port 3000 already in use

```bash
# Find what's using port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port:
npm run dev:shell -- -p 3001
```

---

## Next Steps

Now that you have the project running, here's where to go next:

| I want to... | Read... |
|---|---|
| Understand the architecture deeply | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| See all API endpoints with examples | [API.md](./API.md) |
| Contribute code | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Connect real GitHub Actions data | Set `GITHUB_TOKEN` in `.env` |
| Connect real Azure Monitor | Set `AZURE_MONITOR_*` in `.env` |
| Deploy to production | [README.md](../README.md#deployment) |

---

*If you're stuck, check the [Common Errors & Fixes](#common-errors--fixes) section or open a GitHub issue. Happy building!*
