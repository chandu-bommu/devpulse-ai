'use client';

import { Rocket, Clock, AlertTriangle, RotateCcw, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { cn, getRatingColor, getRatingBg } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

interface DORAMetricsProps {
  data: any;
}

const metricConfig = [
  { key: 'deploymentFrequency', label: 'Deploy Frequency', icon: Rocket, unit: '/day', color: '#8b5cf6', historyKey: 'count' },
  { key: 'leadTimeForChanges', label: 'Lead Time', icon: Clock, unit: 'hrs', color: '#3b82f6', historyKey: 'hours' },
  { key: 'changeFailureRate', label: 'Change Failure Rate', icon: AlertTriangle, unit: '%', color: '#f59e0b', historyKey: 'rate' },
  { key: 'meanTimeToRestore', label: 'MTTR', icon: RotateCcw, unit: 'hrs', color: '#ef4444', historyKey: 'hours' },
];

export function DORAMetrics({ data }: DORAMetricsProps) {
  if (!data) return null;

  const radarData = [
    { metric: 'Deploy Freq', value: Math.min(data.deploymentFrequency.value * 10, 100) },
    { metric: 'Lead Time', value: Math.max(100 - data.leadTimeForChanges.value * 4, 0) },
    { metric: 'CFR', value: Math.max(100 - data.changeFailureRate.value * 5, 0) },
    { metric: 'MTTR', value: Math.max(100 - data.meanTimeToRestore.value * 10, 0) },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className={cn(
        'flex items-center gap-4 p-4 rounded-xl border',
        getRatingBg(data.overallRating)
      )}>
        <Award className={cn('w-8 h-8', getRatingColor(data.overallRating))} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold capitalize">{data.overallRating} Performer</span>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-semibold uppercase',
              getRatingBg(data.overallRating), getRatingColor(data.overallRating)
            )}>
              DORA
            </span>
          </div>
          <p className="text-xs text-surface-400 mt-0.5">Based on 4 key engineering metrics over the last 30 days</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        {metricConfig.map((metric) => {
          const metricData = data[metric.key];
          if (!metricData) return null;

          return (
            <div key={metric.key} className="bg-surface-900/50 border border-surface-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                  <span className="text-xs text-surface-400 font-medium">{metric.label}</span>
                </div>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                  getRatingBg(metricData.rating), getRatingColor(metricData.rating)
                )}>
                  {metricData.rating}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold">{metricData.value}<span className="text-xs text-surface-500 ml-1">{metric.unit}</span></span>
                <span className={cn(
                  'text-xs font-medium flex items-center gap-0.5',
                  metricData.trend > 0
                    ? (metric.key === 'deploymentFrequency' ? 'text-emerald-400' : 'text-red-400')
                    : (metric.key === 'deploymentFrequency' ? 'text-red-400' : 'text-emerald-400')
                )}>
                  {metricData.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metricData.trend > 0 ? '+' : ''}{metricData.trend}%
                </span>
              </div>

              {/* Sparkline */}
              <div className="h-16 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricData.history.slice(-14)}>
                    <Line
                      type="monotone"
                      dataKey={metric.historyKey}
                      stroke={metric.color}
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px', fontSize: '10px', padding: '4px 8px' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar Chart */}
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Performance Radar</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Comparison Table */}
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">Team Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-800">
                <th className="text-left py-2 px-3 text-xs text-surface-500 font-medium">Team</th>
                <th className="text-right py-2 px-3 text-xs text-surface-500 font-medium">Deploy Freq</th>
                <th className="text-right py-2 px-3 text-xs text-surface-500 font-medium">Lead Time</th>
                <th className="text-right py-2 px-3 text-xs text-surface-500 font-medium">CFR %</th>
                <th className="text-right py-2 px-3 text-xs text-surface-500 font-medium">MTTR</th>
              </tr>
            </thead>
            <tbody>
              {data.teamComparison?.map((team: any) => (
                <tr key={team.team} className="border-b border-surface-800/50 hover:bg-surface-800/30">
                  <td className="py-2 px-3 font-medium">{team.team}</td>
                  <td className="py-2 px-3 text-right text-purple-400">{team.deployFreq}/d</td>
                  <td className="py-2 px-3 text-right text-blue-400">{team.leadTime}h</td>
                  <td className="py-2 px-3 text-right text-amber-400">{team.cfr}%</td>
                  <td className="py-2 px-3 text-right text-red-400">{team.mttr}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
