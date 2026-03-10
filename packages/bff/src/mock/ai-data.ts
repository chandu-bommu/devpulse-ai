import { v4 as uuid } from 'uuid';

// --- Types ---

export interface IncidentPrediction {
  deploymentId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
  similarIncidents: { id: string; title: string; severity: string; date: string; resolution: string; similarity: number }[];
}

export interface AnomalyDetection {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  source: string;
}

export interface AlertCluster {
  clusterId: string;
  rootCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertCount: number;
  alerts: { id: string; source: string; message: string; timestamp: string; severity: string }[];
  suggestedAction: string;
  affectedServices: string[];
  firstSeen: string;
  lastSeen: string;
}

export interface LogPattern {
  pattern: string;
  count: number;
  severity: string;
  firstSeen: string;
  lastSeen: string;
  sampleMessages: string[];
}

// --- Constants ---

const services = ['api-gateway', 'auth-service', 'payment-service', 'notification-service', 'user-service', 'order-service', 'inventory-service', 'search-service'];

const errorPatterns = [
  'Connection timeout to downstream service',
  'Memory usage exceeded 90% threshold',
  'Disk I/O latency spike detected',
  'HTTP 503 rate exceeded 5% of requests',
  'Database connection pool exhausted',
  'TLS certificate expiring in 7 days',
  'Kafka consumer lag exceeding 10k messages',
  'Pod OOMKilled in production namespace',
];

const resolutions = [
  'Scaled up replicas from 3 to 5',
  'Rolled back deployment to v2.3.1',
  'Increased connection pool size to 50',
  'Applied hotfix for memory leak in auth middleware',
  'Restarted stuck Kafka consumers',
  'Updated circuit breaker timeout to 30s',
  'Cleared Redis cache and restarted service',
  'Migrated to larger instance type',
];

// --- Generators ---

export function generateIncidentPrediction(deploymentId?: string): IncidentPrediction {
  const riskScore = Math.round(Math.random() * 100);
  const riskLevel: IncidentPrediction['riskLevel'] = riskScore > 80 ? 'critical' : riskScore > 60 ? 'high' : riskScore > 35 ? 'medium' : 'low';

  const similarIncidents = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
    id: uuid(),
    title: errorPatterns[Math.floor(Math.random() * errorPatterns.length)],
    severity: ['P1', 'P2', 'P3'][Math.floor(Math.random() * 3)],
    date: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
    resolution: resolutions[Math.floor(Math.random() * resolutions.length)],
    similarity: Math.round(60 + Math.random() * 35),
  }));

  const actions = [
    'Run canary deployment with 5% traffic before full rollout',
    'Enable enhanced monitoring for the next 30 minutes post-deploy',
    'Verify database migration rollback plan is in place',
    'Check downstream service health before proceeding',
    'Pre-warm cache for critical endpoints',
    'Alert on-call engineer proactively',
  ];

  return {
    deploymentId: deploymentId || uuid(),
    riskScore,
    riskLevel,
    confidence: Math.round(70 + Math.random() * 25),
    reasoning: `Based on analysis of ${similarIncidents.length} similar past deployments, ${riskScore > 60 ? 'elevated' : 'moderate'} risk detected. Recent error rate trends and deployment velocity suggest ${riskLevel} incident probability. Key factors: deployment frequency up 40% this week, 2 related services had config changes in last 24h.`,
    suggestedActions: actions.slice(0, Math.floor(Math.random() * 3) + 2),
    similarIncidents,
  };
}

export function generateAnomalies(count: number = 5): AnomalyDetection[] {
  const metrics = [
    { name: 'response_time_p99', base: 200, variance: 500 },
    { name: 'error_rate', base: 0.5, variance: 15 },
    { name: 'cpu_usage', base: 45, variance: 40 },
    { name: 'memory_usage', base: 60, variance: 30 },
    { name: 'request_rate', base: 1500, variance: 3000 },
    { name: 'db_query_time', base: 50, variance: 200 },
    { name: 'kafka_consumer_lag', base: 100, variance: 5000 },
    { name: 'gc_pause_time', base: 20, variance: 100 },
  ];

  return Array.from({ length: count }, () => {
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const expected = metric.base;
    const value = Math.round((expected + Math.random() * metric.variance) * 100) / 100;
    const deviation = Math.round(((value - expected) / expected) * 100);
    const severity: AnomalyDetection['severity'] = deviation > 200 ? 'critical' : deviation > 100 ? 'warning' : 'info';

    return {
      id: uuid(),
      metric: metric.name,
      value,
      expected,
      deviation,
      severity,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      source: services[Math.floor(Math.random() * services.length)],
    };
  }).sort((a, b) => b.deviation - a.deviation);
}

export function generateAlertClusters(count: number = 4): AlertCluster[] {
  const rootCauses = [
    { cause: 'Database connection pool saturation', action: 'Increase max connections from 25 to 50 and restart affected pods' },
    { cause: 'Upstream API rate limiting triggered', action: 'Enable request queuing and reduce batch size to stay under rate limit' },
    { cause: 'Memory leak in auth middleware v3.2.1', action: 'Roll back auth-service to v3.2.0 and apply hotfix PR #847' },
    { cause: 'DNS resolution failures to payment provider', action: 'Switch to backup payment endpoint and notify provider NOC' },
    { cause: 'Certificate rotation caused TLS handshake failures', action: 'Deploy updated certificate bundle and restart ingress controllers' },
    { cause: 'Kafka broker disk space below 10%', action: 'Increase retention cleanup frequency and expand broker storage' },
  ];

  return Array.from({ length: count }, () => {
    const rc = rootCauses[Math.floor(Math.random() * rootCauses.length)];
    const alertCount = Math.floor(Math.random() * 35) + 5;
    const affectedCount = Math.floor(Math.random() * 4) + 1;
    const severity: AlertCluster['severity'] = alertCount > 25 ? 'critical' : alertCount > 15 ? 'high' : alertCount > 8 ? 'medium' : 'low';

    return {
      clusterId: uuid(),
      rootCause: rc.cause,
      severity,
      alertCount,
      alerts: Array.from({ length: Math.min(alertCount, 5) }, () => ({
        id: uuid(),
        source: ['GitHub Actions', 'Azure Monitor', 'Prometheus', 'Datadog Webhook', 'Custom Webhook'][Math.floor(Math.random() * 5)],
        message: errorPatterns[Math.floor(Math.random() * errorPatterns.length)],
        timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
        severity: ['warning', 'critical', 'error'][Math.floor(Math.random() * 3)],
      })),
      suggestedAction: rc.action,
      affectedServices: services.slice(0, affectedCount),
      firstSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      lastSeen: new Date(Date.now() - Math.random() * 600000).toISOString(),
    };
  });
}

export function generateLogPatterns(count: number = 6): LogPattern[] {
  const patterns = [
    { pattern: 'ERROR.*timeout.*downstream', severity: 'error' },
    { pattern: 'WARN.*memory.*threshold', severity: 'warning' },
    { pattern: 'ERROR.*connection.*refused', severity: 'error' },
    { pattern: 'WARN.*deprecated.*API.*call', severity: 'warning' },
    { pattern: 'ERROR.*authentication.*failed', severity: 'error' },
    { pattern: 'INFO.*deployment.*started', severity: 'info' },
    { pattern: 'ERROR.*rate.*limit.*exceeded', severity: 'error' },
    { pattern: 'WARN.*disk.*space.*low', severity: 'warning' },
  ];

  return patterns.slice(0, count).map((p) => ({
    pattern: p.pattern,
    count: Math.floor(Math.random() * 500) + 10,
    severity: p.severity,
    firstSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    sampleMessages: [
      `[${p.severity.toUpperCase()}] ${services[Math.floor(Math.random() * services.length)]}: ${errorPatterns[Math.floor(Math.random() * errorPatterns.length)]}`,
      `[${p.severity.toUpperCase()}] ${services[Math.floor(Math.random() * services.length)]}: ${errorPatterns[Math.floor(Math.random() * errorPatterns.length)]}`,
    ],
  }));
}
