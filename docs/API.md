# API Reference

> Complete reference for every REST endpoint and WebSocket event in the DevPulse AI BFF server.

---

## Table of Contents

1. [Base URL & Conventions](#base-url--conventions)
2. [Authentication](#authentication)
3. [Health Check](#health-check)
4. [Pipeline Endpoints](#pipeline-endpoints)
5. [DORA Metrics Endpoints](#dora-metrics-endpoints)
6. [AI Engine Endpoints](#ai-engine-endpoints)
7. [WebSocket Events](#websocket-events)
8. [Error Handling](#error-handling)
9. [Rate Limits](#rate-limits)
10. [Response Types (TypeScript)](#response-types-typescript)

---

## Base URL & Conventions

| Environment | Base URL |
|------------|---------|
| **Local Development** | `http://localhost:4000` |
| **Production** | `https://api.devpulse.ai` |

### Standard Response Format

Every REST endpoint returns this structure:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

On error:

```json
{
  "success": false,
  "error": "Description of what went wrong",
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

### Content Type

All responses are `application/json`. Request bodies (where applicable) should also be `application/json`.

---

## Authentication

Currently, the BFF does not require authentication in development mode. In production, add an API key header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:4000/api/health
```

---

## Health Check

### `GET /api/health`

Returns the health status of the BFF server and all connected data sources.

**Request:**
```bash
curl http://localhost:4000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "devpulse-bff",
  "version": "0.1.0",
  "uptime": 76.188,
  "timestamp": "2026-03-10T05:32:48.487Z",
  "datasources": {
    "githubActions": {
      "status": "mock",
      "connected": true
    },
    "azureMonitor": {
      "status": "mock",
      "connected": true
    },
    "customWebhook": {
      "status": "mock",
      "connected": true
    },
    "aiEngine": {
      "status": "mock",
      "connected": true
    }
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | `"healthy"` or `"degraded"` |
| `service` | `string` | Always `"devpulse-bff"` |
| `version` | `string` | Semantic version of the BFF |
| `uptime` | `number` | Seconds since server started |
| `timestamp` | `string` | ISO 8601 timestamp |
| `datasources` | `object` | Status of each upstream data source |
| `datasources.*.status` | `string` | `"mock"` or `"live"` |
| `datasources.*.connected` | `boolean` | Whether the source is reachable |

**Use case:** Load balancer health probes, monitoring, debugging connectivity.

---

## Pipeline Endpoints

### `GET /api/pipelines/summary`

Returns a complete summary including recent pipeline runs, build time trends, workflow statistics, and aggregate metrics.

**Request:**
```bash
curl http://localhost:4000/api/pipelines/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recentRuns": [
      {
        "id": "run-1710045168-abc123",
        "workflowName": "CI/CD Pipeline",
        "repo": "devpulse-ai/core-api",
        "branch": "main",
        "status": "success",
        "duration": 245,
        "startedAt": "2026-03-10T05:12:48.000Z",
        "author": "Priya Patel",
        "commitMessage": "Fix memory leak in WebSocket handler",
        "isFlaky": false
      }
    ],
    "totalRuns": 156,
    "successRate": 87,
    "avgBuildTime": 198,
    "flakyTestCount": 3,
    "buildTimeTrend": [
      {
        "date": "2026-02-24",
        "avgDuration": 210,
        "successRate": 85,
        "totalRuns": 12
      }
    ],
    "workflowStats": [
      {
        "name": "CI/CD Pipeline",
        "totalRuns": 45,
        "successRate": 91,
        "avgDuration": 180,
        "flakyTests": 1
      }
    ]
  },
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

**Key Fields in `data`:**

| Field | Type | Description |
|-------|------|-------------|
| `recentRuns` | `PipelineRun[]` | Last 20 pipeline runs, newest first |
| `totalRuns` | `number` | Total runs in the current period |
| `successRate` | `number` | Percentage (0-100) of successful runs |
| `avgBuildTime` | `number` | Average build duration in seconds |
| `flakyTestCount` | `number` | Number of tests flagged as flaky |
| `buildTimeTrend` | `TrendPoint[]` | Daily aggregates for the last 14 days |
| `workflowStats` | `WorkflowStat[]` | Per-workflow breakdown |

**`PipelineRun` object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique run identifier |
| `workflowName` | `string` | Name of the CI/CD workflow |
| `repo` | `string` | Repository in `org/repo` format |
| `branch` | `string` | Git branch name |
| `status` | `string` | `"success"`, `"failure"`, `"running"`, `"cancelled"` |
| `duration` | `number` | Run duration in seconds |
| `startedAt` | `string` | ISO 8601 timestamp |
| `author` | `string` | Commit author name |
| `commitMessage` | `string` | First line of commit message |
| `isFlaky` | `boolean` | Whether the run was marked as flaky |

---

### `GET /api/pipelines/runs`

Returns only the recent pipeline runs list (lighter payload than summary).

**Request:**
```bash
curl http://localhost:4000/api/pipelines/runs

# With optional limit parameter
curl http://localhost:4000/api/pipelines/runs?limit=5
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `number` | `20` | Maximum number of runs to return |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "run-...",
      "workflowName": "CI/CD Pipeline",
      "status": "success",
      ...
    }
  ],
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

---

## DORA Metrics Endpoints

### `GET /api/dora/metrics`

Returns all four DORA engineering metrics with historical data, team comparisons, and an overall performance rating.

**Request:**
```bash
curl http://localhost:4000/api/dora/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallRating": "high",
    "deploymentFrequency": {
      "value": 10.4,
      "unit": "per day",
      "rating": "elite",
      "trend": 12,
      "history": [
        { "date": "2026-02-24", "count": 8 },
        { "date": "2026-02-25", "count": 11 }
      ]
    },
    "leadTimeForChanges": {
      "value": 4.9,
      "unit": "hours",
      "rating": "high",
      "trend": -8,
      "history": [
        { "date": "2026-02-24", "hours": 5.2 }
      ]
    },
    "changeFailureRate": {
      "value": 8.2,
      "unit": "percent",
      "rating": "high",
      "trend": -15,
      "history": [
        { "date": "2026-02-24", "rate": 9.1 }
      ]
    },
    "meanTimeToRestore": {
      "value": 1.8,
      "unit": "hours",
      "rating": "elite",
      "trend": -22,
      "history": [
        { "date": "2026-02-24", "hours": 2.1 }
      ]
    },
    "teamComparison": [
      {
        "team": "Platform",
        "deployFreq": 12.3,
        "leadTime": 3.2,
        "cfr": 5.1,
        "mttr": 1.2
      }
    ]
  },
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

**DORA Rating Scale:**

| Rating | Deployment Freq | Lead Time | Change Failure Rate | MTTR |
|--------|----------------|-----------|-------------------|------|
| **Elite** | On-demand (multiple/day) | < 1 hour | < 5% | < 1 hour |
| **High** | Daily-weekly | 1 day-1 week | 5-10% | < 1 day |
| **Medium** | Weekly-monthly | 1 week-1 month | 10-15% | 1 day-1 week |
| **Low** | Monthly+ | 1 month+ | > 15% | 1 week+ |

**Metric Object Structure:**

| Field | Type | Description |
|-------|------|-------------|
| `value` | `number` | Current metric value |
| `unit` | `string` | Human-readable unit label |
| `rating` | `string` | `"elite"`, `"high"`, `"medium"`, `"low"` |
| `trend` | `number` | Percentage change vs previous period (negative = improvement for LT/CFR/MTTR) |
| `history` | `object[]` | Daily data points for the last 30 days |

---

## AI Engine Endpoints

### `GET /api/ai/predict`

Returns an AI-generated incident risk prediction based on current system state.

**Request:**
```bash
curl http://localhost:4000/api/ai/predict
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deploymentId": "deploy-20260310-abc",
    "riskScore": 73,
    "riskLevel": "high",
    "confidence": 82,
    "reasoning": "Elevated error rates in payment-service combined with 3 recent hotfix deployments suggest instability. Similar patterns preceded P1 incidents in the past.",
    "suggestedActions": [
      "Pause non-critical deployments for the next 2 hours",
      "Scale up payment-service replicas from 3 to 5",
      "Enable enhanced logging on checkout flow",
      "Notify on-call SRE team for standby"
    ],
    "similarIncidents": [
      {
        "id": "INC-2024-0892",
        "title": "Payment gateway timeout cascade",
        "severity": "P1",
        "date": "2025-12-15T03:22:00.000Z",
        "resolution": "Scaled payment pods + circuit breaker enabled",
        "similarity": 87
      }
    ]
  },
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

**Risk Levels:**

| Risk Score | Risk Level | Color | Meaning |
|-----------|-----------|-------|---------|
| 0-35 | `low` | Green | Normal operations |
| 36-60 | `medium` | Yellow | Elevated — monitor closely |
| 61-80 | `high` | Orange | Likely incident — take action |
| 81-100 | `critical` | Red | Imminent incident — immediate response |

---

### `GET /api/ai/predict/:deploymentId`

Returns a prediction for a specific deployment.

**Request:**
```bash
curl http://localhost:4000/api/ai/predict/deploy-20260310-abc
```

**Response:** Same structure as `/api/ai/predict` but with the specified `deploymentId`.

---

### `GET /api/ai/anomalies`

Returns a list of detected anomalies in system metrics.

**Request:**
```bash
curl http://localhost:4000/api/ai/anomalies

# With optional count parameter
curl http://localhost:4000/api/ai/anomalies?count=5
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | `number` | `10` | Number of anomalies to return |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "anomaly-abc123",
      "metric": "response_time_p99",
      "value": 2450,
      "expected": 800,
      "deviation": 206,
      "severity": "critical",
      "timestamp": "2026-03-10T05:30:00.000Z",
      "source": "payment-service"
    }
  ],
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

**Anomaly Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique anomaly identifier |
| `metric` | `string` | Name of the metric that anomaled |
| `value` | `number` | Actual observed value |
| `expected` | `number` | Expected baseline value |
| `deviation` | `number` | Percentage deviation from expected |
| `severity` | `string` | `"critical"` (>200%), `"warning"` (>100%), `"info"` (<100%) |
| `timestamp` | `string` | ISO 8601 when anomaly was detected |
| `source` | `string` | Service or component that produced the metric |

---

### `GET /api/ai/alerts/clusters`

Returns deduplicated alert clusters. Multiple noisy alerts are grouped by root cause.

**Request:**
```bash
curl http://localhost:4000/api/ai/alerts/clusters

# With optional count parameter
curl http://localhost:4000/api/ai/alerts/clusters?count=3
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | `number` | `4` | Number of clusters to return |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "clusterId": "cluster-abc123",
      "rootCause": "Database connection pool exhaustion in us-east-1",
      "severity": "critical",
      "alertCount": 34,
      "affectedServices": ["user-service", "auth-service", "profile-api"],
      "suggestedAction": "Increase connection pool size from 20 to 50 and restart affected pods. Check for connection leaks in recent PRs.",
      "firstSeen": "2026-03-10T04:15:00.000Z",
      "lastSeen": "2026-03-10T05:30:00.000Z",
      "alerts": [
        {
          "id": "alert-001",
          "message": "Connection timeout after 30s on user-service",
          "severity": "critical",
          "source": "user-service",
          "timestamp": "2026-03-10T05:28:00.000Z"
        }
      ]
    }
  ],
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

**Cluster Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `clusterId` | `string` | Unique cluster identifier |
| `rootCause` | `string` | AI-determined root cause |
| `severity` | `string` | Highest severity in the cluster: `"critical"`, `"high"`, `"medium"`, `"low"` |
| `alertCount` | `number` | Total number of individual alerts in this cluster |
| `affectedServices` | `string[]` | List of impacted services |
| `suggestedAction` | `string` | AI-recommended remediation |
| `firstSeen` | `string` | ISO 8601 timestamp of first alert |
| `lastSeen` | `string` | ISO 8601 timestamp of most recent alert |
| `alerts` | `Alert[]` | Sample alerts from the cluster |

---

### `GET /api/ai/logs/patterns`

Returns detected log patterns across services.

**Request:**
```bash
curl http://localhost:4000/api/ai/logs/patterns?count=5
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | `number` | `5` | Number of patterns to return |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pattern-abc123",
      "pattern": "Connection refused to {host}:{port}",
      "count": 1247,
      "severity": "error",
      "services": ["api-gateway", "payment-service"],
      "firstSeen": "2026-03-10T02:00:00.000Z",
      "lastSeen": "2026-03-10T05:30:00.000Z",
      "sampleLog": "2026-03-10T05:28:12Z ERROR Connection refused to db-primary.internal:5432 after 3 retries"
    }
  ],
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

---

## WebSocket Events

The BFF uses **Socket.IO** for real-time event streaming. Connect to `ws://localhost:4000`.

### Connecting

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to DevPulse AI BFF');
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

### Event: `pipeline:event`

Emitted every **3-8 seconds** with a new pipeline run.

```javascript
socket.on('pipeline:event', (data) => {
  console.log('New pipeline run:', data);
});
```

**Payload:**
```json
{
  "id": "run-1710045168-xyz789",
  "workflowName": "Deploy to Production",
  "repo": "devpulse-ai/web-app",
  "branch": "main",
  "status": "success",
  "duration": 189,
  "startedAt": "2026-03-10T05:32:48.000Z",
  "author": "Alex Chen",
  "commitMessage": "Upgrade auth middleware",
  "isFlaky": false
}
```

### Event: `anomaly:detected`

Emitted every **10-15 seconds** with detected anomalies.

```javascript
socket.on('anomaly:detected', (data) => {
  console.log('Anomalies:', data);
});
```

**Payload:** Array of anomaly objects (same shape as `/api/ai/anomalies` response items).

```json
[
  {
    "id": "anomaly-rt-abc123",
    "metric": "cpu_usage_percent",
    "value": 94.5,
    "expected": 45.0,
    "deviation": 110,
    "severity": "warning",
    "timestamp": "2026-03-10T05:32:48.000Z",
    "source": "worker-pool"
  }
]
```

### Connection Lifecycle

```
Client                              Server
  │                                   │
  ├── connect() ──────────────────────►│
  │                                   │  Start pipeline interval (3-8s)
  │                                   │  Start anomaly interval (10-15s)
  │◄───────────── pipeline:event ─────┤
  │◄───────────── pipeline:event ─────┤
  │◄───────────── anomaly:detected ───┤
  │◄───────────── pipeline:event ─────┤
  │                                   │
  ├── disconnect ─────────────────────►│
  │                                   │  Clear all intervals
  │                                   │  (no memory leak)
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | Success | Normal response |
| `400` | Bad Request | Invalid query parameters |
| `404` | Not Found | Unknown endpoint |
| `500` | Server Error | Unexpected failure in BFF |

### Error Response Format

```json
{
  "success": false,
  "error": "Invalid count parameter: must be a positive integer",
  "timestamp": "2026-03-10T05:32:48.487Z"
}
```

---

## Rate Limits

Currently no rate limits in development mode. Production recommendations:

| Endpoint | Suggested Limit |
|----------|----------------|
| `/api/health` | 60 requests/minute |
| `/api/pipelines/*` | 30 requests/minute |
| `/api/dora/*` | 30 requests/minute |
| `/api/ai/*` | 20 requests/minute |

---

## Response Types (TypeScript)

If you're building a client in TypeScript, here are the types:

```typescript
// Standard API response wrapper
interface APIResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// Pipeline types
interface PipelineRun {
  id: string;
  workflowName: string;
  repo: string;
  branch: string;
  status: 'success' | 'failure' | 'running' | 'cancelled';
  duration: number;
  startedAt: string;
  author: string;
  commitMessage: string;
  isFlaky: boolean;
}

interface PipelineSummary {
  recentRuns: PipelineRun[];
  totalRuns: number;
  successRate: number;
  avgBuildTime: number;
  flakyTestCount: number;
  buildTimeTrend: { date: string; avgDuration: number; successRate: number; totalRuns: number }[];
  workflowStats: { name: string; totalRuns: number; successRate: number; avgDuration: number; flakyTests: number }[];
}

// DORA types
interface DORAMetric {
  value: number;
  unit: string;
  rating: 'elite' | 'high' | 'medium' | 'low';
  trend: number;
  history: Record<string, any>[];
}

interface DORAMetrics {
  overallRating: string;
  deploymentFrequency: DORAMetric;
  leadTimeForChanges: DORAMetric;
  changeFailureRate: DORAMetric;
  meanTimeToRestore: DORAMetric;
  teamComparison: { team: string; deployFreq: number; leadTime: number; cfr: number; mttr: number }[];
}

// AI types
interface IncidentPrediction {
  deploymentId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
  similarIncidents: SimilarIncident[];
}

interface SimilarIncident {
  id: string;
  title: string;
  severity: string;
  date: string;
  resolution: string;
  similarity: number;
}

interface AnomalyDetection {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  source: string;
}

interface AlertCluster {
  clusterId: string;
  rootCause: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  alertCount: number;
  affectedServices: string[];
  suggestedAction: string;
  firstSeen: string;
  lastSeen: string;
  alerts: { id: string; message: string; severity: string; source: string; timestamp: string }[];
}
```

---

*This document should be updated whenever endpoints are added or modified. Last updated: March 2026.*
