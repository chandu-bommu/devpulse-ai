'use client';

import { CheckCircle2, XCircle, Loader2, Ban, AlertTriangle, GitBranch, Clock, User } from 'lucide-react';
import { cn, formatDuration, formatTimeAgo, getStatusColor, getStatusBg } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

interface PipelineHealthBoardProps {
  data: any;
  liveEvents: any[];
}

const statusIcons: Record<string, any> = {
  success: CheckCircle2,
  failure: XCircle,
  running: Loader2,
  cancelled: Ban,
};

export function PipelineHealthBoard({ data, liveEvents }: PipelineHealthBoardProps) {
  const runs = liveEvents.length > 0
    ? [...liveEvents, ...(data?.recentRuns || [])].slice(0, 20)
    : data?.recentRuns || [];

  return (
    <div className="space-y-6">
      {/* Build Time Trend Chart */}
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Build Time Trend (14d)</h3>
          <span className="text-xs text-surface-500">avg duration & success rate</span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.buildTimeTrend || []}>
              <defs>
                <linearGradient id="gradDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="avgDuration" stroke="#3b82f6" fill="url(#gradDuration)" name="Avg Duration (s)" />
              <Area yAxisId="right" type="monotone" dataKey="successRate" stroke="#10b981" fill="url(#gradSuccess)" name="Success Rate (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workflow Performance */}
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Workflow Performance</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.workflowStats?.slice(0, 6) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={140} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="successRate" name="Success %" radius={[0, 4, 4, 0]}>
                {(data?.workflowStats || []).slice(0, 6).map((_: any, i: number) => (
                  <Cell key={i} fill={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'][i % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Pipeline Runs */}
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Recent Runs</h3>
          {liveEvents.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="status-dot bg-emerald-400 animate-pulse" />
              Live updating
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {runs.map((run: any, i: number) => {
            const StatusIcon = statusIcons[run.status] || Ban;
            return (
              <div
                key={run.id || i}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg border transition-all hover:bg-surface-800/50',
                  i === 0 && liveEvents.length > 0 ? 'border-brand-600/30 bg-brand-600/5 animate-fade-in' : 'border-surface-800/50'
                )}
              >
                <div className={cn('p-1.5 rounded-lg', getStatusBg(run.status))}>
                  <StatusIcon className={cn('w-4 h-4', getStatusColor(run.status), run.status === 'running' && 'animate-spin')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{run.workflowName}</span>
                    {run.isFlaky && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        FLAKY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> {run.branch}
                    </span>
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <User className="w-3 h-3" /> {run.author}
                    </span>
                    <span className="text-xs text-surface-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDuration(run.duration)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-surface-500">{run.repo?.split('/')[1]}</span>
                  <div className="text-[10px] text-surface-600 mt-0.5">{formatTimeAgo(run.startedAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
