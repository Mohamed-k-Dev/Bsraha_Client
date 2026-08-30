import type { ReactionType } from '@/types';

export const REACTION_META: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  heart: { emoji: '❤️', label: 'Heart', color: 'text-rose-500' },
  laugh: { emoji: '😂', label: 'Laugh', color: 'text-amber-500' },
  fire: { emoji: '🔥', label: 'Fire', color: 'text-orange-500' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-sky-500' },
  angry: { emoji: '😡', label: 'Angry', color: 'text-red-500' },
  wow: { emoji: '😮', label: 'Wow', color: 'text-violet-500' },
};

export const REACTION_ORDER: ReactionType[] = ['heart', 'laugh', 'fire', 'sad', 'angry', 'wow'];

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function formatNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export function totalReactions(reactions: { count: number }[]): number {
  return reactions.reduce((sum, r) => sum + r.count, 0);
}

export function sortReactionsByCount<T extends { count: number; type: ReactionType }>(
  reactions: T[]
): T[] {
  return [...reactions].sort((a, b) => b.count - a.count);
}

export function avatarGradient(seed: string): string {
  const palettes = [
    ['#fb923c', '#f97316'],
    ['#6ab05b', '#4a9437'],
    ['#2563a8', '#1e4d8a'],
    ['#c2410c', '#9a3412'],
    ['#387728', '#2c5d20'],
    ['#a08d65', '#7d6c49'],
    ['#d97706', '#b45309'],
    ['#0f766e', '#0d5d57'],
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const idx = Math.abs(hash) % palettes.length;
  const [a, b] = palettes[idx];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
