'use client';

import { Activity, Clock, AlertTriangle, GitBranch, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  pipelineData: any;
  doraData: any;
}

export function StatsBar({ pipelineData, doraData }: StatsBarProps) {
  const stats = [
    {
      label: 'Success Rate',
      value: pipelineData ? `${pipelineData.successRate}%` : '--',
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      trend: pipelineData ? '+2.3%' : null,
      trendUp: true,
    },
    {
      label: 'Avg Build Time',
      value: pipelineData ? `${Math.floor(pipelineData.avgDuration / 60)}m ${pipelineData.avgDuration % 60}s` : '--',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      trend: '-12s',
      trendUp: true,
    },
    {
      label: 'Flaky Tests',
      value: pipelineData ? pipelineData.flakyTests : '--',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      trend: pipelineData?.flakyTests > 2 ? '+1' : '-1',
      trendUp: pipelineData?.flakyTests <= 2,
    },
    {
      label: 'Deploy Frequency',
      value: doraData ? `${doraData.deploymentFrequency.value}/day` : '--',
      icon: GitBranch,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      trend: doraData ? `${doraData.deploymentFrequency.trend > 0 ? '+' : ''}${doraData.deploymentFrequency.trend}%` : null,
      trendUp: doraData?.deploymentFrequency.trend > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-900/50 border border-surface-800 rounded-xl p-4 hover:border-surface-700 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-surface-500 font-medium uppercase tracking-wider">{stat.label}</span>
            <div className={cn('p-1.5 rounded-lg', stat.bg)}>
              <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
            {stat.trend && (
              <span className={cn(
                'text-xs font-medium flex items-center gap-0.5',
                stat.trendUp ? 'text-emerald-400' : 'text-red-400'
              )}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
