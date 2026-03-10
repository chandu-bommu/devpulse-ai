import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-surface-500';
  }
}

export function getRiskBg(level: string): string {
  switch (level) {
    case 'critical': return 'bg-red-500/10 border-red-500/20';
    case 'high': return 'bg-orange-500/10 border-orange-500/20';
    case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'low': return 'bg-green-500/10 border-green-500/20';
    default: return 'bg-surface-500/10 border-surface-500/20';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'text-emerald-500';
    case 'failure': return 'text-red-500';
    case 'running': return 'text-blue-500';
    case 'cancelled': return 'text-surface-400';
    default: return 'text-surface-500';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'success': return 'bg-emerald-500/10';
    case 'failure': return 'bg-red-500/10';
    case 'running': return 'bg-blue-500/10';
    case 'cancelled': return 'bg-surface-400/10';
    default: return 'bg-surface-500/10';
  }
}

export function getRatingColor(rating: string): string {
  switch (rating) {
    case 'elite': return 'text-emerald-500';
    case 'high': return 'text-blue-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-red-500';
    default: return 'text-surface-500';
  }
}

export function getRatingBg(rating: string): string {
  switch (rating) {
    case 'elite': return 'bg-emerald-500/10 border-emerald-500/30';
    case 'high': return 'bg-blue-500/10 border-blue-500/30';
    case 'medium': return 'bg-yellow-500/10 border-yellow-500/30';
    case 'low': return 'bg-red-500/10 border-red-500/30';
    default: return 'bg-surface-500/10 border-surface-500/30';
  }
}

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:4000';

export async function fetchBFF<T>(path: string): Promise<T> {
  const res = await fetch(`${BFF_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`BFF request failed: ${res.status}`);
  const json = await res.json();
  return json.data as T;
}
