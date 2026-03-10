# Architecture Guide

> A deep dive into how InferOps is designed, why each decision was made, and how every piece fits together.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Monorepo Structure](#monorepo-structure)
4. [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
   - [Frontend (apps/shell)](#1-frontend---appsshell)
   - [BFF Layer (packages/bff)](#2-bff-layer---packagesbff)
   - [AI Engine (packages/ai-engine)](#3-ai-engine---packagesai-engine)
   - [UI System (packages/ui-system)](#4-design-system---packagesui-system)
   - [Infrastructure (infra/azure)](#5-infrastructure---infrazure)
5. [Data Flow](#data-flow)
6. [Real-Time Architecture](#real-time-architecture)
7. [AI/ML Pipeline](#aiml-pipeline)
8. [Security Model](#security-model)
9. [Design Decisions & Trade-offs](#design-decisions--trade-offs)

---

## High-Level Overview

InferOps follows a **3-tier architecture** with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                        │
│                                                                 │
│   Next.js 14 App Router  ·  Tailwind CSS  ·  Recharts          │
│   React 18 with Server Components  ·  WebSocket Client          │
│   Lit Web Components (embeddable design system)                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    REST + WebSocket
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                      ORCHESTRATION TIER                          │
│                     (BFF — Backend For Frontend)                 │
│                                                                 │
│   Express.js  ·  Socket.IO  ·  Route Handlers                  │
│   Aggregates data from 4+ upstream sources                      │
│   Enriches responses with AI predictions                        │
│   Pushes real-time events to connected clients                  │
└──────┬──────────────┬──────────────┬───────────────┬────────────┘
       │              │              │               │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│  GitHub     │ │   Azure    │ │  Custom  │ │  AI Engine  │
│  Actions    │ │  Monitor   │ │  Webhook │ │  (OpenAI /  │
│  API        │ │  API       │ │  Sources │ │  Azure AI)  │
└─────────────┘ └────────────┘ └──────────┘ └─────────────┘
                      DATA TIER
```

### Why This Architecture?

| Decision | Reasoning |
|----------|-----------|
| **BFF Pattern** | The frontend never talks to upstream APIs directly. The BFF aggregates, transforms, and enriches data — reducing client complexity and protecting API keys. |
| **Monorepo** | All packages live together. Shared types, atomic deployments, single `npm install`. Turborepo handles build caching and task orchestration. |
| **Mock Data Mode** | Every data source has a mock generator. The app works out-of-the-box with zero configuration — critical for demos, development, and CI testing. |
| **WebSocket + REST** | REST for initial page load data (cacheable, simple). WebSocket for live pipeline events and anomaly streams (low-latency, push-based). |
| **Lit Web Components** | Framework-agnostic UI primitives. Anyone can embed `<inferops-risk-gauge>` in React, Angular, Vue, or plain HTML. |

---

## System Architecture Diagram

```
                    ┌──────────────────────────┐
                    │      User's Browser       │
                    │                            │
                    │  ┌──────────────────────┐  │
                    │  │   Next.js Shell App   │  │
                    │  │                        │  │
                    │  │  ┌──────┐ ┌──────┐    │  │
                    │  │  │Pipe- │ │DORA  │    │  │
                    │  │  │line  │ │Metric│    │  │
                    │  │  │Board │ │Dash  │    │  │
                    │  │  └──────┘ └──────┘    │  │
                    │  │  ┌──────┐ ┌──────┐    │  │
                    │  │  │AI    │ │Alert │    │  │
                    │  │  │Pred- │ │Dedup │    │  │
                    │  │  │ictor │ │Panel │    │  │
                    │  │  └──────┘ └──────┘    │  │
                    │  └────────┬─────────────┘  │
                    └───────────┼─────────────────┘
                                │
                   HTTP REST    │    WebSocket
                   (polling)    │    (push)
                                │
                    ┌───────────▼─────────────────┐
                    │        BFF Server            │
                    │     (Express + Socket.IO)    │
                    │                              │
                    │  ┌────────┐  ┌────────────┐  │
                    │  │ Routes │  │  WebSocket  │  │
                    │  │/api/*  │  │  Emitters   │  │
                    │  └───┬────┘  └──────┬─────┘  │
                    │      │              │         │
                    │  ┌───▼──────────────▼──────┐  │
                    │  │    Mock Data Generators   │  │
                    │  │    (or Live API Clients)  │  │
                    │  └──────────────────────────┘  │
                    └────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                  │
     ┌────────▼──────┐  ┌──────▼───────┐  ┌──────▼──────┐
     │ GitHub Actions │  │Azure Monitor │  │  OpenAI /   │
     │     API        │  │    API       │  │ Azure OpenAI│
     └────────────────┘  └──────────────┘  └─────────────┘
```

---

## Monorepo Structure

```
inferops/
│
├── apps/                          # Deployable applications
│   └── shell/                     # Next.js 14 — the main dashboard
│       ├── src/
│       │   ├── app/               # Next.js App Router pages
│       │   │   ├── layout.tsx     # Root layout (HTML, body, fonts)
│       │   │   ├── page.tsx       # Main dashboard page (assembles all panels)
│       │   │   └── globals.css    # Tailwind + custom CSS variables
│       │   ├── components/        # React components (one per feature)
│       │   │   ├── Header.tsx              # Top nav bar with live status
│       │   │   ├── StatsBar.tsx            # 4-stat overview cards
│       │   │   ├── PipelineHealthBoard.tsx # Pipeline runs + charts
│       │   │   ├── DORAMetrics.tsx         # DORA 4 metrics + radar
│       │   │   ├── AIIncidentPredictor.tsx # Risk gauge + suggestions
│       │   │   └── SmartAlertDedup.tsx     # Alert clustering panel
│       │   └── lib/               # Shared utilities
│       │       ├── utils.ts       # cn(), formatters, color helpers, fetchBFF
│       │       └── hooks.ts       # useBFFData() + useWebSocket() hooks
│       ├── tailwind.config.ts     # Custom colors (brand, surface), fonts
│       ├── next.config.js         # Next.js configuration
│       └── package.json
│
├── packages/                      # Shared libraries
│   ├── bff/                       # Backend For Frontend server
│   │   ├── src/
│   │   │   ├── index.ts           # Express app + Socket.IO setup
│   │   │   ├── routes/            # REST API route handlers
│   │   │   │   ├── health.ts      # GET /api/health
│   │   │   │   ├── pipelines.ts   # GET /api/pipelines/*
│   │   │   │   ├── dora.ts        # GET /api/dora/metrics
│   │   │   │   └── ai.ts          # GET /api/ai/*
│   │   │   └── mock/              # Mock data generators
│   │   │       ├── pipelines.ts   # Pipeline runs, trends, workflow stats
│   │   │       ├── dora-metrics.ts# DORA 4 metrics with history
│   │   │       └── ai-data.ts     # Predictions, anomalies, alert clusters
│   │   └── package.json
│   │
│   ├── ai-engine/                 # AI/ML orchestration library
│   │   ├── src/
│   │   │   ├── index.ts           # Public exports
│   │   │   ├── types.ts           # TypeScript interfaces for all AI data
│   │   │   ├── incident-predictor.ts # IncidentPredictor class (mock + LLM)
│   │   │   └── mock-data.ts       # Standalone mock generators
│   │   └── package.json
│   │
│   └── ui-system/                 # Lit Web Components design system
│       ├── src/
│       │   ├── index.ts           # Public exports
│       │   └── components/
│       │       ├── status-badge.ts    # <inferops-status-badge>
│       │       ├── metric-card.ts     # <inferops-metric-card>
│       │       └── risk-gauge.ts      # <inferops-risk-gauge>
│       └── package.json
│
├── infra/                         # Infrastructure as Code
│   └── azure/
│       ├── aks-config.yaml        # Kubernetes deployment + service + ingress
│       └── monitor-config.json    # Azure Monitor ARM template
│
├── package.json                   # Root — workspaces, scripts
├── turbo.json                     # Turborepo pipeline config
├── tsconfig.json                  # Root TypeScript config
├── .env.example                   # Environment variable template
├── .gitignore
└── README.md
```

### What Goes Where?

| I want to... | Go to... |
|---|---|
| Change the dashboard UI | `apps/shell/src/components/` |
| Add a new API endpoint | `packages/bff/src/routes/` |
| Modify AI predictions | `packages/ai-engine/src/` |
| Add a new web component | `packages/ui-system/src/components/` |
| Change Kubernetes config | `infra/azure/` |
| Add a new page/route | `apps/shell/src/app/` |

---

## Layer-by-Layer Breakdown

### 1. Frontend — `apps/shell`

**Technology**: Next.js 14 (App Router), React 18, Tailwind CSS, Recharts, Framer Motion, Socket.IO Client

```
Browser Request
      │
      ▼
┌─────────────────────┐
│  Next.js App Router  │
│                      │
│  layout.tsx          │  ← Sets <html>, <body>, global CSS, metadata
│       │              │
│  page.tsx            │  ← Main dashboard — 'use client' directive
│       │              │
│  ┌────▼────┐         │
│  │ Hooks   │         │  ← useBFFData() polls REST, useWebSocket() streams
│  └────┬────┘         │
│       │              │
│  ┌────▼────────────┐ │
│  │  Components     │ │
│  │  ┌────────────┐ │ │
│  │  │ Header     │ │ │  ← Shows live/offline status, nav tabs
│  │  │ StatsBar   │ │ │  ← 4 summary metric cards
│  │  │ Pipeline   │ │ │  ← AreaChart, BarChart, run list
│  │  │ DORA       │ │ │  ← Sparklines, RadarChart, team table
│  │  │ AIPredict  │ │ │  ← SVG gauge, action list, similar incidents
│  │  │ AlertDedup │ │ │  ← Cluster cards, expandable details
│  │  └────────────┘ │ │
│  └─────────────────┘ │
└──────────────────────┘
```

**Key Design Patterns:**

- **`'use client'` on page.tsx** — The entire dashboard is client-rendered because it uses hooks for real-time data. Layout is server-rendered for SEO metadata.
- **Custom hooks** — `useBFFData<T>(path, pollInterval)` is a generic hook that fetches any BFF endpoint with optional auto-polling. `useWebSocket()` manages the Socket.IO connection lifecycle.
- **Utility-first CSS** — All styling uses Tailwind classes. Custom colors (brand-*, surface-*) are defined in `tailwind.config.ts`. No CSS modules or styled-components.
- **`cn()` helper** — Combines `clsx` + `tailwind-merge` for conditional class names without conflicts.

**Data Fetching Flow:**

```
Component mounts
      │
      ▼
useBFFData('/api/pipelines/summary', 30000)
      │
      ├── fetch('http://localhost:4000/api/pipelines/summary')
      │         │
      │         ▼
      │   { success: true, data: {...}, timestamp: "..." }
      │         │
      │         ▼
      │   setData(json.data)  →  Component re-renders with data
      │
      └── setInterval(fetch, 30000)  →  Auto-polls every 30s
```

---

### 2. BFF Layer — `packages/bff`

**Technology**: Express.js, Socket.IO, TypeScript, tsx (for dev mode)

The BFF (Backend For Frontend) is the **central nervous system** of InferOps. It sits between the frontend and all external data sources.

```
Client Request: GET /api/pipelines/summary
      │
      ▼
┌─────────────────────────────────┐
│  Express App (index.ts)          │
│                                  │
│  Middleware Chain:                │
│  1. cors()        ← Allow frontend origin
│  2. express.json() ← Parse JSON bodies
│                                  │
│  Route Matching:                 │
│  /api/health     → health.ts     │
│  /api/pipelines  → pipelines.ts  │
│  /api/dora       → dora.ts       │
│  /api/ai         → ai.ts         │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Route Handler (pipelines.ts)     │
│                                   │
│  1. Check if live mode (API key?) │
│  2a. MOCK: generatePipelineSummary()
│  2b. LIVE: fetch GitHub Actions API
│  3. Return { success, data, timestamp }
└───────────────────────────────────┘
```

**WebSocket Architecture:**

```
Client connects via Socket.IO
      │
      ▼
io.on('connection', (socket) => {
      │
      ├── Start pipeline event emitter (every 3-8s)
      │     └── socket.emit('pipeline:event', generateLivePipelineEvent())
      │
      ├── Start anomaly emitter (every 10-15s)
      │     └── socket.emit('anomaly:detected', generateAnomalies(2))
      │
      └── socket.on('disconnect', () => clearIntervals())
})
```

**Why Express + Socket.IO (not Next.js API routes)?**

| Factor | Express BFF | Next.js API Routes |
|--------|------------|-------------------|
| WebSocket support | Native with Socket.IO | Requires custom server |
| Independent scaling | Can scale BFF separately | Tied to frontend deployment |
| Microservice migration | Easy to extract later | Harder to decouple |
| Long-running connections | Designed for it | Serverless functions timeout |
| Multiple frontends | Any client can use | Coupled to Next.js |

---

### 3. AI Engine — `packages/ai-engine`

**Technology**: TypeScript, OpenAI SDK (optional), Azure OpenAI SDK (optional)

The AI Engine is a **library** (not a server). It exports classes and functions that the BFF imports and calls.

```
┌──────────────────────────────────────┐
│  IncidentPredictor (Class)            │
│                                       │
│  constructor({ apiKey, endpoint,      │
│                useMockData })         │
│                                       │
│  Methods:                             │
│  ├── predictIncidentRisk(deployId)    │
│  │     ├── Mock → generateIncidentPrediction()
│  │     └── Live → callLLMForPrediction()
│  │                                    │
│  ├── detectAnomalies(count)           │
│  │     ├── Mock → generateAnomalies() │
│  │     └── Live → callLLMForAnomalies()
│  │                                    │
│  ├── clusterAlerts(count)             │
│  │     ├── Mock → generateAlertClusters()
│  │     └── Live → callLLMForAlertClustering()
│  │                                    │
│  └── analyzeLogPatterns(count)        │
│        └── Always → generateLogPatterns()
└──────────────────────────────────────┘
```

**Type System:**

Every piece of data that flows through the system has a TypeScript interface defined in `types.ts`:

```typescript
IncidentPrediction {
  deploymentId, riskScore, riskLevel, confidence,
  reasoning, suggestedActions[], similarIncidents[]
}

AnomalyDetection {
  id, metric, value, expected, deviation, severity,
  timestamp, source
}

AlertCluster {
  clusterId, rootCause, severity, alertCount,
  alerts[], suggestedAction, affectedServices[],
  firstSeen, lastSeen
}
```

**Mock Data Design Philosophy:**

The mock generators produce **realistic, varied data** — not static fixtures:
- Risk scores are random but map to correct severity levels
- Timestamps are relative to "now" so data always looks fresh
- Service names, error patterns, and resolutions are drawn from real-world scenarios
- Array lengths vary randomly to simulate real system behavior

---

### 4. Design System — `packages/ui-system`

**Technology**: Lit 3.x, Web Components, Shadow DOM

Three embeddable components that work in any framework:

| Component | Tag | Props |
|-----------|-----|-------|
| Status Badge | `<inferops-status-badge>` | `status`, `label` |
| Metric Card | `<inferops-metric-card>` | `label`, `value`, `unit`, `trend`, `rating` |
| Risk Gauge | `<inferops-risk-gauge>` | `score`, `level` |

**Usage in any HTML page:**

```html
<script type="module" src="@inferops/ui-system/dist/index.js"></script>

<inferops-status-badge status="success" label="Deploy v2.4.1">
</inferops-status-badge>

<inferops-risk-gauge score="73" level="high">
</inferops-risk-gauge>
```

**Why Lit (not React components)?**

- **Framework agnostic** — Works in React, Angular, Vue, Svelte, or plain HTML
- **Shadow DOM** — Styles are encapsulated, no CSS leaking
- **Small bundle** — Lit is ~5KB gzipped vs 40KB+ for React
- **Native web platform** — Uses standard Custom Elements API

---

### 5. Infrastructure — `infra/azure`

```
┌─────────────────────────────────────────┐
│           Azure Cloud                    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  AKS Cluster                     │    │
│  │                                  │    │
│  │  ┌──────────┐  ┌──────────┐     │    │
│  │  │ BFF Pod  │  │ BFF Pod  │ x3  │    │
│  │  │ :4000    │  │ :4000    │     │    │
│  │  └────┬─────┘  └────┬─────┘     │    │
│  │       └──────┬───────┘           │    │
│  │              │                   │    │
│  │  ┌───────────▼────────────┐      │    │
│  │  │  ClusterIP Service     │      │    │
│  │  │  :80 → :4000           │      │    │
│  │  └───────────┬────────────┘      │    │
│  │              │                   │    │
│  │  ┌───────────▼────────────┐      │    │
│  │  │  Nginx Ingress + TLS   │      │    │
│  │  │  api.inferops.ai       │      │    │
│  │  └────────────────────────┘      │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Azure Monitor                   │    │
│  │  ├── Application Insights        │    │
│  │  └── Log Analytics Workspace     │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Frontend: Deployed to Vercel / Azure    │
│  Static Web Apps (separate)              │
└──────────────────────────────────────────┘
```

---

## Data Flow

### Complete Request Lifecycle

Here's what happens when a user opens the InferOps dashboard:

```
Step 1: Browser loads http://localhost:3000
        │
        ▼  Next.js SSR renders the page shell (layout + loading states)
        │
Step 2: React hydration kicks in — 'use client' components mount
        │
        ▼  Four useBFFData() hooks fire simultaneously:
        │
        ├── GET /api/pipelines/summary  ──→ BFF ──→ Mock Generator ──→ JSON
        ├── GET /api/dora/metrics       ──→ BFF ──→ Mock Generator ──→ JSON
        ├── GET /api/ai/predict         ──→ BFF ──→ Mock Generator ──→ JSON
        └── GET /api/ai/alerts/clusters ──→ BFF ──→ Mock Generator ──→ JSON
        │
Step 3: All 4 responses arrive → React re-renders with data
        │  Charts animate in, gauges fill, tables populate
        │
Step 4: useWebSocket() connects to ws://localhost:4000
        │
        ▼  Socket.IO handshake → 'connect' event
        │
Step 5: BFF starts pushing events:
        │
        ├── Every 3-8s:  'pipeline:event' → new run appears at top of list
        └── Every 10-15s: 'anomaly:detected' → anomaly feed updates
        │
Step 6: Auto-polling keeps REST data fresh:
        │
        ├── Pipelines:  re-fetched every 30s
        ├── DORA:       re-fetched every 60s
        ├── AI Predict: re-fetched every 45s
        └── Alerts:     re-fetched every 30s
```

---

## Real-Time Architecture

```
┌─────────────┐         ┌─────────────┐
│  Browser 1   │◄───────►│             │
└─────────────┘  ws://  │             │
                        │  Socket.IO  │
┌─────────────┐         │  Server     │
│  Browser 2   │◄───────►│             │
└─────────────┘  ws://  │  Manages:   │
                        │  - Room per  │
┌─────────────┐         │    client    │
│  Browser N   │◄───────►│  - Interval  │
└─────────────┘  ws://  │    per client│
                        │  - Cleanup   │
                        │    on disconnect
                        └─────────────┘
```

Each connected client gets its own intervals. When the client disconnects, intervals are cleared to prevent memory leaks. This scales to hundreds of concurrent connections per BFF instance.

---

## AI/ML Pipeline

### Current (Mock Mode)

```
BFF receives request → Calls mock generator → Returns realistic fake data
```

### Production (with API key)

```
BFF receives request
      │
      ▼
IncidentPredictor.predictIncidentRisk(deploymentId)
      │
      ▼
Fetch recent error logs + deployment history
      │
      ▼
Build prompt with context:
  "Given these error patterns: [...],
   deployment velocity: [...],
   similar past incidents: [...],
   predict the incident risk..."
      │
      ▼
Call Azure OpenAI / OpenAI Chat Completions API
  model: gpt-4
  temperature: 0.3 (deterministic)
      │
      ▼
Parse structured response → IncidentPrediction type
      │
      ▼
Return to frontend with risk score + reasoning
```

---

## Security Model

| Concern | Approach |
|---------|----------|
| **API Keys** | Stored in `.env`, never exposed to frontend. BFF proxies all external calls. |
| **CORS** | BFF allows only `FRONTEND_URL` origin. |
| **Secrets in K8s** | Mounted from Kubernetes Secrets, not ConfigMaps. |
| **TLS** | Ingress configured with cert-manager + Let's Encrypt. |
| **Input validation** | Route params parsed with `parseInt()`, query defaults provided. |
| **Rate limiting** | Not yet implemented — recommended for production. |

---

## Design Decisions & Trade-offs

| Decision | Alternatives Considered | Why We Chose This |
|----------|------------------------|-------------------|
| **Turborepo** monorepo | Nx, Lerna, pnpm workspaces | Simplest config, great caching, zero lock-in |
| **Express** BFF | Fastify, Hono, NestJS | Most familiar ecosystem, Socket.IO native support |
| **Recharts** | D3, Victory, Nivo, Visx | Best React integration, declarative API, good defaults |
| **Tailwind CSS** | CSS Modules, styled-components | Utility-first = fast iteration, no context switching |
| **Socket.IO** | Raw WebSocket, SSE, tRPC subscriptions | Auto-reconnect, fallback to polling, room support |
| **Lit** for design system | React only, Stencil, Shoelace | True web standards, smallest runtime, any-framework |
| **Mock data generators** | Static JSON fixtures, MSW | Dynamic + fresh timestamps, no extra tooling needed |

---

*This document should be updated as the architecture evolves. Last updated: March 2026.*
