'use client';

import { Bell, Layers, ChevronRight, Server, Zap, Clock } from 'lucide-react';
import { cn, getRiskColor, getRiskBg, formatTimeAgo } from '@/lib/utils';
import { useState } from 'react';

interface SmartAlertDedupProps {
  data: any[];
}

export function SmartAlertDedup({ data }: SmartAlertDedupProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Smart Alert Clusters</span>
        </div>
        <span className="text-xs text-surface-500">
          {data.reduce((sum: number, c: any) => sum + c.alertCount, 0)} alerts → {data.length} clusters
        </span>
      </div>

      {/* Alert Clusters */}
      {data.map((cluster: any) => (
        <div
          key={cluster.clusterId}
          className={cn(
            'rounded-xl border transition-all',
            getRiskBg(cluster.severity),
            expandedCluster === cluster.clusterId ? 'ring-1 ring-brand-500/30' : ''
          )}
        >
          <button
            onClick={() => setExpandedCluster(expandedCluster === cluster.clusterId ? null : cluster.clusterId)}
            className="w-full text-left p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-bold uppercase',
                    getRiskBg(cluster.severity), getRiskColor(cluster.severity)
                  )}>
                    {cluster.severity}
                  </span>
                  <span className="text-xs text-surface-500 flex items-center gap-1">
                    <Bell className="w-3 h-3" /> {cluster.alertCount} alerts
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-surface-200 truncate">{cluster.rootCause}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-surface-500 flex items-center gap-1">
                    <Server className="w-3 h-3" /> {cluster.affectedServices.join(', ')}
                  </span>
                  <span className="text-[10px] text-surface-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatTimeAgo(cluster.lastSeen)}
                  </span>
                </div>
              </div>
              <ChevronRight className={cn(
                'w-4 h-4 text-surface-500 transition-transform flex-shrink-0 mt-1',
                expandedCluster === cluster.clusterId && 'rotate-90'
              )} />
            </div>
          </button>

          {expandedCluster === cluster.clusterId && (
            <div className="px-4 pb-4 space-y-3 border-t border-surface-700/30 pt-3">
              {/* Suggested Action */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-600/5 border border-brand-500/20">
                <Zap className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-brand-400 font-semibold uppercase">Recommended Action</span>
                  <p className="text-xs text-surface-300 mt-0.5">{cluster.suggestedAction}</p>
                </div>
              </div>

              {/* Sample Alerts */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-surface-500 font-semibold uppercase">Sample Alerts</span>
                {cluster.alerts?.slice(0, 4).map((alert: any) => (
                  <div key={alert.id} className="flex items-center gap-2 p-2 rounded bg-surface-800/50 text-xs">
                    <span className={cn(
                      'px-1 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0',
                      alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                      alert.severity === 'error' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    )}>
                      {alert.severity}
                    </span>
                    <span className="text-surface-400 truncate">{alert.message}</span>
                    <span className="text-[10px] text-surface-600 flex-shrink-0 ml-auto">{alert.source}</span>
                  </div>
                ))}
                {cluster.alertCount > 4 && (
                  <p className="text-[10px] text-surface-600 pl-2">+ {cluster.alertCount - 4} more alerts in this cluster</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
