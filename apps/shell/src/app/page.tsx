'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { PipelineHealthBoard } from '@/components/PipelineHealthBoard';
import { DORAMetrics } from '@/components/DORAMetrics';
import { AIIncidentPredictor } from '@/components/AIIncidentPredictor';
import { SmartAlertDedup } from '@/components/SmartAlertDedup';
import { useBFFData, useWebSocket } from '@/lib/hooks';
import { Activity, BarChart3, Brain, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey = 'pipelines' | 'dora' | 'ai' | 'alerts';

const tabs: { key: TabKey; label: string; icon: any }[] = [
  { key: 'pipelines', label: 'Pipelines', icon: Activity },
  { key: 'dora', label: 'DORA Metrics', icon: BarChart3 },
  { key: 'ai', label: 'AI Insights', icon: Brain },
  { key: 'alerts', label: 'Alerts', icon: Bell },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pipelines');

  const { connected, pipelineEvents, anomalyEvents } = useWebSocket();
  const { data: pipelineData, loading: pipelineLoading } = useBFFData<any>('/api/pipelines/summary', 30000);
  const { data: doraData, loading: doraLoading } = useBFFData<any>('/api/dora/metrics', 60000);
  const { data: predictionData } = useBFFData<any>('/api/ai/predict', 45000);
  const { data: alertData } = useBFFData<any[]>('/api/ai/alerts/clusters', 30000);

  return (
    <div className="min-h-screen bg-surface-950">
      <Header wsConnected={connected} />

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview Bar */}
        <StatsBar pipelineData={pipelineData} doraData={doraData} />

        {/* Tab Navigation (Mobile) */}
        <div className="flex md:hidden gap-1 bg-surface-900/50 p-1 rounded-xl border border-surface-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                  : 'text-surface-400 hover:text-surface-200'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column — Pipeline Health (7 cols) */}
          <div className={cn(
            'lg:col-span-7',
            activeTab !== 'pipelines' && activeTab !== 'dora' ? 'hidden lg:block' : ''
          )}>
            {/* Desktop: show both pipelines and DORA stacked */}
            <div className="space-y-6">
              <div className={cn(activeTab !== 'pipelines' && 'hidden lg:block')}>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-bold">Live Pipeline Health</h2>
                  {pipelineLoading && (
                    <span className="text-xs text-surface-500 animate-pulse">Loading...</span>
                  )}
                </div>
                <PipelineHealthBoard data={pipelineData} liveEvents={pipelineEvents} />
              </div>

              <div className={cn(activeTab !== 'dora' && 'hidden lg:block')}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold">DORA Metrics</h2>
                  {doraLoading && (
                    <span className="text-xs text-surface-500 animate-pulse">Loading...</span>
                  )}
                </div>
                <DORAMetrics data={doraData} />
              </div>
            </div>
          </div>

          {/* Right Column — AI + Alerts (5 cols) */}
          <div className={cn(
            'lg:col-span-5',
            activeTab !== 'ai' && activeTab !== 'alerts' ? 'hidden lg:block' : ''
          )}>
            <div className="space-y-6">
              <div className={cn(activeTab !== 'ai' && 'hidden lg:block')}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold">AI Incident Predictor</h2>
                </div>
                <AIIncidentPredictor data={predictionData} />
              </div>

              <div className={cn(activeTab !== 'alerts' && 'hidden lg:block')}>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-bold">Smart Alert Deduplication</h2>
                </div>
                <SmartAlertDedup data={alertData || []} />
              </div>

              {/* Live Anomaly Feed */}
              {anomalyEvents.length > 0 && (
                <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="status-dot bg-red-400 animate-pulse" />
                    Live Anomaly Feed
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {anomalyEvents.slice(0, 10).map((anomaly: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-800/50 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-1 py-0.5 rounded text-[9px] font-bold uppercase',
                            anomaly.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                            anomaly.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                          )}>
                            {anomaly.severity}
                          </span>
                          <span className="text-surface-300">{anomaly.metric}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-surface-400">{anomaly.source}</span>
                          <span className="text-surface-600 ml-2">+{anomaly.deviation}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-surface-800/50">
          <p className="text-xs text-surface-600">
            DevPulse AI v0.1.0 — Intelligent Observability & Incident Intelligence Platform
          </p>
          <p className="text-[10px] text-surface-700 mt-1">
            Built with Next.js + Express BFF + AI Engine | Mock Data Mode
          </p>
        </footer>
      </main>
    </div>
  );
}
