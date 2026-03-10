import { v4 as uuid } from 'uuid';

export interface PipelineRun {
  id: string;
  workflowName: string;
  repo: string;
  branch: string;
  status: 'success' | 'failure' | 'running' | 'cancelled';
  duration: number; // seconds
  startedAt: string;
  finishedAt: string | null;
  commit: string;
  author: string;
  steps: PipelineStep[];
  isFlaky: boolean;
}

export interface PipelineStep {
  name: string;
  status: 'success' | 'failure' | 'running' | 'skipped';
  duration: number;
}

export interface PipelineSummary {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  flakyTests: number;
  activeWorkflows: number;
  recentRuns: PipelineRun[];
  buildTimeTrend: { date: string; avgDuration: number; successRate: number }[];
  workflowStats: { name: string; runs: number; successRate: number; avgDuration: number }[];
}

const workflows = [
  'CI / Build & Test',
  'CI / Lint & Type Check',
  'CD / Deploy Staging',
  'CD / Deploy Production',
  'Security / CodeQL Analysis',
  'Release / Publish NPM',
  'Nightly / Integration Tests',
  'PR / Preview Deploy',
];

const repos = [
  'inferops/frontend',
  'inferops/bff-service',
  'inferops/auth-service',
  'inferops/payment-api',
  'inferops/notification-hub',
  'inferops/infra-config',
];

const authors = ['chandra.r', 'alex.k', 'priya.m', 'james.w', 'sarah.l', 'raj.p'];
const branches = ['main', 'develop', 'feature/auth-v2', 'fix/memory-leak', 'release/v2.4', 'hotfix/rate-limit'];

const stepTemplates: Record<string, string[]> = {
  'CI / Build & Test': ['Checkout', 'Install Dependencies', 'Lint', 'Type Check', 'Unit Tests', 'Build', 'Upload Artifacts'],
  'CI / Lint & Type Check': ['Checkout', 'Install Dependencies', 'ESLint', 'TypeScript Check', 'Prettier Check'],
  'CD / Deploy Staging': ['Checkout', 'Build', 'Docker Build', 'Push to ACR', 'Deploy to AKS Staging', 'Smoke Tests'],
  'CD / Deploy Production': ['Checkout', 'Build', 'Docker Build', 'Push to ACR', 'Deploy Canary 5%', 'Health Check', 'Deploy 100%', 'Post-Deploy Verify'],
  'Security / CodeQL Analysis': ['Initialize CodeQL', 'Autobuild', 'Perform Analysis', 'Upload Results'],
  'Release / Publish NPM': ['Checkout', 'Build', 'Version Bump', 'Publish to NPM', 'Create GitHub Release'],
  'Nightly / Integration Tests': ['Checkout', 'Setup Test DB', 'Run Integration Suite', 'Generate Report', 'Cleanup'],
  'PR / Preview Deploy': ['Checkout', 'Build', 'Deploy Preview', 'Comment PR with URL'],
};

function generatePipelineRun(overrides?: Partial<PipelineRun>): PipelineRun {
  const workflowName = overrides?.workflowName || workflows[Math.floor(Math.random() * workflows.length)];
  const isRunning = Math.random() < 0.1;
  const isFailed = !isRunning && Math.random() < 0.15;
  const isCancelled = !isRunning && !isFailed && Math.random() < 0.05;
  const status: PipelineRun['status'] = isRunning ? 'running' : isFailed ? 'failure' : isCancelled ? 'cancelled' : 'success';

  const duration = Math.floor(Math.random() * 300) + 30;
  const startedAt = new Date(Date.now() - Math.random() * 86400000 * 7);
  const finishedAt = isRunning ? null : new Date(startedAt.getTime() + duration * 1000);

  const steps = (stepTemplates[workflowName] || ['Step 1', 'Step 2', 'Step 3']).map((name, i, arr) => {
    let stepStatus: PipelineStep['status'] = 'success';
    if (isRunning && i === arr.length - 2) stepStatus = 'running';
    else if (isRunning && i === arr.length - 1) stepStatus = 'skipped';
    else if (isFailed && i === arr.length - 1) stepStatus = 'failure';

    return {
      name,
      status: stepStatus,
      duration: Math.floor(Math.random() * 60) + 2,
    };
  });

  return {
    id: uuid(),
    workflowName,
    repo: repos[Math.floor(Math.random() * repos.length)],
    branch: branches[Math.floor(Math.random() * branches.length)],
    status,
    duration,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt?.toISOString() || null,
    commit: Math.random().toString(36).substring(2, 9),
    author: authors[Math.floor(Math.random() * authors.length)],
    steps,
    isFlaky: status === 'failure' && Math.random() < 0.3,
    ...overrides,
  };
}

export function generatePipelineSummary(): PipelineSummary {
  const recentRuns = Array.from({ length: 20 }, () => generatePipelineRun())
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  const successCount = recentRuns.filter((r) => r.status === 'success').length;
  const flakyCount = recentRuns.filter((r) => r.isFlaky).length;
  const avgDuration = Math.round(recentRuns.reduce((sum, r) => sum + r.duration, 0) / recentRuns.length);

  // Build time trend - last 14 days
  const buildTimeTrend = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(Date.now() - (13 - i) * 86400000);
    return {
      date: date.toISOString().split('T')[0],
      avgDuration: Math.floor(Math.random() * 120) + 60,
      successRate: Math.round(75 + Math.random() * 20),
    };
  });

  // Per-workflow stats
  const workflowStats = workflows.map((name) => ({
    name,
    runs: Math.floor(Math.random() * 50) + 5,
    successRate: Math.round(70 + Math.random() * 28),
    avgDuration: Math.floor(Math.random() * 180) + 30,
  }));

  return {
    totalRuns: Math.floor(Math.random() * 500) + 200,
    successRate: Math.round((successCount / recentRuns.length) * 100),
    avgDuration,
    flakyTests: flakyCount,
    activeWorkflows: workflows.length,
    recentRuns,
    buildTimeTrend,
    workflowStats,
  };
}

export function generateLivePipelineEvent(): PipelineRun {
  return generatePipelineRun();
}
