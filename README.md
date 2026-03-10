# InferOps

**Intelligent Full-Stack Observability & Incident Intelligence Platform**

A real-time developer operations dashboard that ingests logs, metrics, and deployment events from GitHub Actions, Azure Monitor, and any REST API — then uses an AI BFF layer to detect anomalies, predict incident risk, and surface actionable remediation suggestions.

> Think: **Datadog + PagerDuty + Copilot**, but open-source, AI-native, and buildable by one Staff Engineer over a weekend sprint.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)

---

## Table of Contents

- [Why InferOps?](#why-inferops)
- [Core Features](#core-features)
- [Live Demo](#live-demo)
- [Quick Start (2 minutes)](#quick-start-2-minutes)
- [Architecture Overview](#architecture-overview)
- [Repo Structure](#repo-structure)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Real-World Value](#real-world-value)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why InferOps?

Most observability tools are either **expensive** (Datadog costs $23+/host/month), **complex** to set up (Grafana + Prometheus + AlertManager), or **lack AI** capabilities. InferOps fills this gap:

| Problem | InferOps Solution |
|---------|---------------------|
| Noisy alerts — 40 Slack pings for 1 incident | Smart Alert Deduplication clusters by root cause |
| "Is it safe to deploy?" — unknown risk | AI Incident Predictor scores risk with reasoning |
| DORA metrics need manual spreadsheets | Auto-computed from CI/CD data in real-time |
| Pipeline failures discovered too late | Live Pipeline Health Board with WebSocket push |
| Vendor lock-in with expensive tools | Open source, self-hosted, extensible |

---

## Core Features

### 1. Live Pipeline Health Board
Real-time view of all CI/CD workflows — pass/fail rates, flaky test detection, build time trends with interactive area and bar charts. WebSocket pushes new runs every 3-8 seconds.

### 2. AI Incident Predictor
The BFF calls an LLM with recent error patterns + deployment history and returns:
- **Risk Score** (0-100) with a visual gauge
- **Confidence Level** — how sure the AI is
- **Reasoning** — human-readable explanation
- **Suggested Actions** — concrete steps to prevent the incident
- **Similar Past Incidents** — historical pattern matching with resolution details

### 3. DORA Metrics Dashboard
Auto-computes the 4 elite engineering metrics with trend analysis:
- **Deployment Frequency** — how often you ship
- **Lead Time for Changes** — commit to production time
- **Change Failure Rate** — % of deploys causing incidents
- **Mean Time to Restore** — how fast you recover

Includes: sparkline charts, performance radar, team comparison table, and DORA rating (Elite/High/Medium/Low).

### 4. Smart Alert Deduplication
Aggregates alerts from multiple sources, clusters them by root cause using AI embeddings, and surfaces one actionable cluster instead of dozens of noisy alerts. Each cluster shows:
- Root cause analysis
- Affected services
- Recommended remediation action
- Sample alerts with expandable details

### 5. Lit Web Components Design System
Ships framework-agnostic components embeddable in any app:
- `<inferops-status-badge>` — Pipeline status with animated dot
- `<inferops-metric-card>` — Metric display with trend indicator
- `<inferops-risk-gauge>` — SVG circular risk score gauge

---

## Live Demo

The app runs in **Mock Data Mode** by default — **zero signup, zero API keys required**. Every panel is populated with realistic simulated data that refreshes in real-time.

```bash
git clone https://github.com/chandu-bommu/inferops.git
cd inferops
npm install
npm run dev:all
# Open http://localhost:3000
```

---

## Quick Start (2 minutes)

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 18 | `node --version` |
| npm | >= 10 | `npm --version` |

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/chandu-bommu/inferops.git
cd inferops

# 2. Install all dependencies (monorepo — one install handles everything)
npm install

# 3. Start both servers
npm run dev:all
```

**That's it!** Open http://localhost:3000 in your browser.

| Server | URL | Purpose |
|--------|-----|---------|
| Frontend | http://localhost:3000 | Dashboard UI |
| BFF API | http://localhost:4000 | REST API + WebSocket |
| Health Check | http://localhost:4000/api/health | Verify BFF is running |

### Verify the BFF is working

```bash
curl http://localhost:4000/api/health
# → {"status":"healthy","service":"inferops-bff","version":"0.1.0",...}
```

> **New to this project?** Read the full [Step-by-Step Setup Guide](docs/SETUP.md) for a beginner-friendly walkthrough.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION TIER                        │
│  Next.js 14  ·  React 18  ·  Tailwind CSS  ·  Recharts     │
│  WebSocket Client  ·  Lit Web Components                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                   REST + WebSocket
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   ORCHESTRATION TIER (BFF)                    │
│  Express.js  ·  Socket.IO  ·  Route Handlers                │
│  Aggregates + transforms + enriches data from all sources    │
└────┬──────────────┬──────────────┬───────────────┬──────────┘
     │              │              │               │
┌────▼────┐   ┌─────▼────┐   ┌────▼─────┐   ┌────▼─────┐
│ GitHub  │   │  Azure   │   │  Custom  │   │   AI     │
│ Actions │   │ Monitor  │   │ Webhook  │   │ Engine   │
│  API    │   │  API     │   │ Sources  │   │ (OpenAI) │
└─────────┘   └──────────┘   └──────────┘   └──────────┘
                    DATA TIER
```

**Key architectural decisions:**
- **BFF Pattern** — Frontend never talks to upstream APIs directly. BFF aggregates, transforms, and protects API keys.
- **Monorepo** (Turborepo) — Shared types, atomic commits, single `npm install`, intelligent build caching.
- **Mock Data Mode** — Every data source has a mock generator for zero-config demos and development.
- **WebSocket + REST** — REST for initial data loads (cacheable), WebSocket for live push events.

> **Deep Dive:** Read the full [Architecture Guide](docs/ARCHITECTURE.md) for diagrams, data flow details, and design trade-offs.

---

## Repo Structure

```
inferops/
├── apps/
│   └── shell/                  ← Next.js 14 dashboard (frontend)
│       ├── src/app/            ← Pages (layout.tsx, page.tsx, globals.css)
│       ├── src/components/     ← 6 React components (one per feature)
│       └── src/lib/            ← Hooks (useBFFData, useWebSocket) + utils
│
├── packages/
│   ├── bff/                    ← Express BFF server
│   │   ├── src/routes/         ← 4 route modules (health, pipelines, dora, ai)
│   │   └── src/mock/           ← 3 mock data generators
│   ├── ai-engine/              ← AI prediction library
│   │   └── src/                ← IncidentPredictor class + types + mocks
│   └── ui-system/              ← Lit Web Components
│       └── src/components/     ← 3 embeddable web components
│
├── infra/azure/                ← AKS deployment + Azure Monitor ARM template
├── docs/                       ← Full documentation suite
│   ├── ARCHITECTURE.md         ← System design deep dive
│   ├── SETUP.md                ← Beginner-friendly setup guide
│   └── API.md                  ← Complete API reference
│
├── package.json                ← Root workspaces + scripts
├── turbo.json                  ← Turborepo pipeline config
├── tsconfig.json               ← Root TypeScript config
├── .env.example                ← Environment variable template
├── CONTRIBUTING.md             ← Developer contribution guide
└── README.md                   ← You are here
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14, React 18 | App Router, SSR, best DX |
| **Styling** | Tailwind CSS | Utility-first, rapid iteration |
| **Charts** | Recharts | Declarative React charts |
| **Icons** | Lucide React | Consistent, tree-shakeable |
| **BFF Server** | Express.js | Mature, ecosystem, Socket.IO support |
| **Real-time** | Socket.IO | Auto-reconnect, fallback to polling |
| **AI Engine** | OpenAI / Azure OpenAI | GPT-4 for predictions (mock mode default) |
| **Design System** | Lit 3.x | Framework-agnostic web components |
| **Monorepo** | Turborepo + npm workspaces | Fast caching, simple config |
| **Language** | TypeScript 5.5 (strict) | End-to-end type safety |
| **Infrastructure** | AKS, Azure Monitor | Production-ready cloud config |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service health + datasource connectivity |
| `GET` | `/api/pipelines/summary` | Pipeline runs, trends, workflow stats |
| `GET` | `/api/pipelines/runs?limit=N` | Recent pipeline runs list |
| `GET` | `/api/dora/metrics` | All 4 DORA metrics + history + team comparison |
| `GET` | `/api/ai/predict` | AI incident risk prediction |
| `GET` | `/api/ai/predict/:deploymentId` | Prediction for specific deployment |
| `GET` | `/api/ai/anomalies?count=N` | Detected metric anomalies |
| `GET` | `/api/ai/alerts/clusters?count=N` | Deduplicated alert clusters |
| `GET` | `/api/ai/logs/patterns?count=N` | Log pattern analysis |
| `WS` | `pipeline:event` | Real-time pipeline updates (push, every 3-8s) |
| `WS` | `anomaly:detected` | Real-time anomaly stream (push, every 10-15s) |

> **Full details:** See the [API Reference](docs/API.md) with request/response examples, field descriptions, TypeScript types, and WebSocket usage.

---

## Environment Variables

Copy `.env.example` to `.env`. All variables are **optional** — the app works out of the box with mock data.

| Variable | Purpose | Default |
|----------|---------|---------|
| `BFF_PORT` | BFF server port | `4000` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `NEXT_PUBLIC_BFF_URL` | Frontend → BFF connection | `http://localhost:4000` |
| `AI_API_KEY` | OpenAI / Azure OpenAI key | *(empty = mock mode)* |
| `AI_ENDPOINT` | Azure OpenAI endpoint URL | *(empty)* |
| `AI_MODEL` | LLM model name | `gpt-4` |
| `GITHUB_TOKEN` | GitHub API Personal Access Token | *(empty = mock mode)* |
| `GITHUB_ORG` | GitHub organization name | *(empty)* |
| `AZURE_MONITOR_CONNECTION_STRING` | Azure Monitor integration | *(empty = mock mode)* |

---

## Deployment

### Vercel (Frontend)

```bash
# Deploy the Next.js shell to Vercel
cd apps/shell
npx vercel
```

Set `NEXT_PUBLIC_BFF_URL` to your production BFF URL.

### Azure AKS (BFF)

Pre-built Kubernetes manifests are in `infra/azure/aks-config.yaml`:
- 3-replica Deployment with health probes
- ClusterIP Service
- Nginx Ingress with TLS (cert-manager)

```bash
kubectl apply -f infra/azure/aks-config.yaml
```

### Azure Monitor

ARM template in `infra/azure/monitor-config.json` provisions:
- Log Analytics Workspace (30-day retention)
- Application Insights (web type)

```bash
az deployment group create \
  --resource-group inferops-rg \
  --template-file infra/azure/monitor-config.json
```

---

## Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| **[Setup Guide](docs/SETUP.md)** | Step-by-step beginner-friendly setup | New developers |
| **[Architecture Guide](docs/ARCHITECTURE.md)** | System design, data flow, trade-offs | All developers |
| **[API Reference](docs/API.md)** | Every endpoint with examples + types | Frontend/API developers |
| **[Contributing Guide](CONTRIBUTING.md)** | Code style, git workflow, how to add features | Contributors |

---

## Real-World Value

| Audience | Value Proposition |
|----------|-------------------|
| **Startups** | Free Datadog alternative with AI built in |
| **GCCs / Enterprises** | Plug into existing Azure + GitHub stack in hours |
| **Fintechs** | WCAG-compliant, audit-ready observability out of the box |
| **Open Source Community** | Extensible webhook system — any CI/CD tool can plug in |
| **SRE / DevOps Teams** | Reduce MTTR with AI-powered root cause analysis |
| **Engineering Leaders** | DORA metrics automated — track team performance instantly |

---

## Roadmap

- [x] Monorepo scaffolding (Turborepo + npm workspaces)
- [x] Express BFF with REST + WebSocket + mock data
- [x] AI Engine with incident prediction + anomaly detection
- [x] Next.js 14 dashboard with 4 feature panels
- [x] Lit Web Components design system (3 components)
- [x] Azure infrastructure config (AKS + Monitor)
- [x] Full documentation suite
- [ ] Live GitHub Actions API integration
- [ ] Live Azure Monitor API integration
- [ ] OpenAI / Azure OpenAI production integration
- [ ] Storybook for component showcase
- [ ] E2E tests with Playwright
- [ ] GitHub Actions CI/CD pipeline
- [ ] Docker Compose for local development
- [ ] Grafana plugin export
- [ ] Slack / Teams webhook integration
- [ ] Multi-tenant support

---

## WCAG 2.1 Compliance

- Semantic HTML throughout all components
- Full keyboard navigation support
- Screen reader friendly labels and ARIA attributes
- Sufficient color contrast ratios (AA level)
- Visible focus indicators on all interactive elements
- Responsive design (mobile, tablet, desktop)

---

## Contributing

We welcome contributions! Whether it's a bug fix, new feature, or documentation improvement.

1. Fork the repository
2. Create your branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat(shell): add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

> **Read the full [Contributing Guide](CONTRIBUTING.md)** for code style, TypeScript conventions, and step-by-step instructions for adding features.

---

## License

MIT — free for personal and commercial use.

---

**Built by [Chandra Reddy](https://github.com/chandu-bommu) — Staff Engineer**

*If you find InferOps useful, please star the repository!*
