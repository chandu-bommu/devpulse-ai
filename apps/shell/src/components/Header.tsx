'use client';

import { Activity, Bell, Github, Wifi, WifiOff, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  wsConnected: boolean;
}

export function Header({ wsConnected }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              InferOps<span className="gradient-text ml-0.5">AI</span>
            </h1>
            <p className="text-[10px] text-surface-500 -mt-0.5 tracking-wider uppercase">
              Observability & Incident Intelligence
            </p>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: 'Pipelines', icon: Activity, active: true },
            { label: 'DORA Metrics', icon: Github },
            { label: 'AI Insights', icon: Zap },
            { label: 'Alerts', icon: Bell },
          ].map((item) => (
            <button
              key={item.label}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                item.active
                  ? 'bg-brand-600/10 text-brand-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              )}
            >
              <item.icon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border',
            wsConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-surface-800 border-surface-700 text-surface-400'
          )}>
            {wsConnected ? (
              <><Wifi className="w-3 h-3" /> Live</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Offline</>
            )}
          </div>
          <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
            Mock Data
          </div>
        </div>
      </div>
    </header>
  );
}
