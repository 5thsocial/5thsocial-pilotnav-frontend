// File: src/lib/navApi.ts
// (Unchanged from original)
import type { AppSummary, NavItem, PilotRoute } from '../types/nav'

const API_BASE: string =
  (window as any).__API_BASE__ ||
  (import.meta as any).env?.VITE_API_BASE ||
  'https://fivethsocial-backend-t67i.onrender.com/api';

export async function fetchApps(): Promise<{ apps: AppSummary[] }> {
  const r = await fetch(`${API_BASE}/nav/apps`, { credentials: 'include' })
  if (!r.ok) throw new Error('apps ' + r.status)
  return r.json()
}

export async function fetchMenu(app: string): Promise<{ menu: NavItem[]; defaultRoute?: PilotRoute }> {
  const r = await fetch(`${API_BASE}/nav/menu?app=${encodeURIComponent(app)}`, { credentials: 'include' })
  if (!r.ok) throw new Error('menu ' + r.status)
  return r.json()
}

// Fallbacks for offline preview
export const Fallback = {
  apps: [
    { key: 'Feed', label: 'Feed' },
    { key: 'Posts', label: 'Posts' },
    { key: 'Profile', label: 'Profile' },
  ] as AppSummary[],
  menu(app: string): NavItem[] {
    switch (app) {
      case 'Feed':
        return [
          { key: 'home', label: 'Home', app: 'Feed', view: 'Home', icon: 'home' },
          { key: 'posts_create', label: 'Create Post', app: 'Posts', view: 'Create', icon: 'plus' },
        ]
      case 'Posts':
        return [
          { key: 'create', label: 'Create', app: 'Posts', view: 'Create', icon: 'plus' },
          { key: 'back', label: 'Back to Feed', app: 'Feed', view: 'Home', icon: 'arrowLeft' },
        ]
      default:
        return [
          { key: 'create_prof', label: 'Create Profile', app: 'Profile', view: 'Create', icon: 'user' },
          { key: 'back', label: 'Back to Feed', app: 'Feed', view: 'Home', icon: 'arrowLeft' },
        ]
    }
  },
  defaultRoute: { app: 'Feed', view: 'Home' } as PilotRoute,
}
