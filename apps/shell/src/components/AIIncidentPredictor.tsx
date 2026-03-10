'use client';

import { Brain, AlertTriangle, Shield, ChevronDown, ChevronUp, Lightbulb, History } from 'lucide-react';
import { cn, getRiskColor, getRiskBg, formatTimeAgo } from '@/lib/utils';
import { useState } from 'react';

interface AIIncidentPredictorProps {
  data: any;
}

export function AIIncidentPredictor({ data }: AIIncidentPredictorProps) {
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Risk Score Card */}
      <div className={cn('rounded-xl border p-5', getRiskBg(data.riskLevel))}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className={cn('w-5 h-5', getRiskColor(data.riskLevel))} />
            <span className="text-sm font-semibold uppercase tracking-wider">AI Risk Assessment</span>
          </div>
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-bold uppercase',
            getRiskBg(data.riskLevel), getRiskColor(data.riskLevel)
          )}>
            {data.riskLevel}
          </span>
        </div>

        {/* Risk Score Gauge */}
        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={data.riskScore > 80 ? '#ef4444' : data.riskScore > 60 ? '#f97316' : data.riskScore > 35 ? '#eab308' : '#22c55e'}
                strokeWidth="8"
                strokeDasharray={`${data.riskScore * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{data.riskScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-surface-300 mb-1">
              Confidence: <span className="text-white font-semibold">{data.confidence}%</span>
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">{data.reasoning}</p>
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-300 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Suggested Actions
          </div>
          {data.suggestedActions?.map((action: string, i: number) => (
            <div key={i} className="flex items-start gap-2 pl-1">
              <Shield className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-surface-300">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Incidents */}
      {data.similarIncidents?.length > 0 && (
        <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-surface-400" />
              <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                Similar Past Incidents ({data.similarIncidents.length})
              </span>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {data.similarIncidents.map((incident: any) => (
                <div key={incident.id} className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{incident.title}</span>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-bold',
                      incident.severity === 'P1' ? 'bg-red-500/10 text-red-400' :
                      incident.severity === 'P2' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    )}>
                      {incident.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-surface-500">
                    <span>Similarity: {incident.similarity}%</span>
                    <span>{formatTimeAgo(incident.date)}</span>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{incident.resolution}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Anomalies Section */}
      <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Detected Anomalies</span>
        </div>
        <p className="text-xs text-surface-500">Anomalies are streamed in real-time via WebSocket when connected.</p>
      </div>
    </div>
  );
}
