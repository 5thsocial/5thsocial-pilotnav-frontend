import React, { useEffect, useMemo, useState, useCallback } from 'react'
import type { AppSummary, NavItem, PilotRoute } from '../types/nav'
import { fetchApps, fetchMenu } from '../lib/navApi'

const TOKENS = { z: { overlay: 60, drawer: 70 }, radius: 18 }

function glass(alpha = 0.08, border = 0.14) {
  return {
    background: `rgba(255,255,255,${alpha})`,
    border: `1px solid rgba(255,255,255,${border})`,
    backdropFilter: 'blur(28px)'
  } as React.CSSProperties
}

export default function PilotShell() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('pn:theme') as any) || 'dark'
  )
  const [apps, setApps] = useState<AppSummary[]>([])
  const [menu, setMenu] = useState<NavItem[]>([])
  const [route, setRoute] = useState<PilotRoute>(() =>
    JSON.parse(localStorage.getItem('pn:route') || '{"app":"","view":""}')
  )
  const [search, setSearch] = useState('')
  const [appDrawer, setAppDrawer] = useState(false)

  useEffect(() => {
    localStorage.setItem('pn:theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    localStorage.setItem('pn:route', JSON.stringify(route))
  }, [route])

  // Load apps from backend
  useEffect(() => {
    ;(async () => {
      try {
        const { apps } = await fetchApps()
        setApps(apps)
        if (!route.app && apps.length) {
          setRoute({ app: apps[0].key, view: '' })
        }
      } catch (error) {
        console.error('Failed to load apps from backend:', error)
        setApps([]) // No fallback - must come from backend
      }
    })()
  }, [])

  // Load menu for current app from backend
  useEffect(() => {
    if (!route.app) return
    ;(async () => {
      try {
        const { menu, defaultRoute } = await fetchMenu(route.app)
        setMenu(menu)
        if (!route.view && (defaultRoute?.view || menu[0])) {
          setRoute({
            app: route.app,
            view: defaultRoute?.view || menu[0].view
          })
        }
      } catch (error) {
        console.error('Failed to load menu from backend:', error)
        setMenu([]) // No fallback - must come from backend
      }
    })()
  }, [route.app])

  const filteredMenu = useMemo(() => {
    if (!search.trim()) return menu
    const searchTerm = search.toLowerCase()
    return menu.filter(
      m =>
        m.label.toLowerCase().includes(searchTerm) ||
        m.view.toLowerCase().includes(searchTerm)
    )
  }, [menu, search])

  const openApp = useCallback((appKey: string) => {
    setRoute({ app: appKey, view: '' })
    setAppDrawer(false)
  }, [])

  const selectMenuItem = useCallback((menuItem: NavItem) => {
    setRoute({ app: menuItem.app, view: menuItem.view })
  }, [])

  const currentApp = apps.find(a => a.key === route.app)

  // Content renderer based on current route
  const renderContent = () => {
    if (route.app === 'Feed' && route.view === 'Home') {
      return (
        <div className="min-h-[60vh] grid place-items-center text-slate-400">
          <div className="text-center">
            <div className="text-2xl mb-2">🏠</div>
            <div>Feed content goes here</div>
            <div className="text-sm opacity-70 mt-1">Route: {route.app}/{route.view}</div>
          </div>
        </div>
      )
    }
    
    if (route.app === 'Posts' && route.view === 'Create') {
      return (
        <div className="max-w-2xl">
          <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white/70 ring-1 ring-slate-200'} backdrop-blur-2xl`}>
            <h2 className="text-xl font-bold mb-4">Create New Post</h2>
            <div className="space-y-4">
              <input 
                placeholder="Post title..."
                className={`w-full h-12 rounded-xl px-4 outline-none ${theme === 'dark' ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/50 ring-1 ring-slate-300'}`}
              />
              <textarea 
                placeholder="What's on your mind?"
                className={`w-full min-h-[120px] rounded-xl px-4 py-3 outline-none resize-none ${theme === 'dark' ? 'bg-white/10 ring-1 ring-white/20' : 'bg-white/50 ring-1 ring-slate-300'}`}
              />
              <div className="flex justify-end">
                <button className={`px-6 py-2 rounded-xl font-semibold ${theme === 'dark' ? 'bg-white/20 hover:bg-white/25' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-[60vh] grid place-items-center text-slate-400">
        <div className="text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <div>Content for {route.app} - {route.view}</div>
          <div className="text-sm opacity-70 mt-1">Route: {route.app}/{route.view}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 w-[220px] md:w-[240px] px-3 py-4">
        <div className={`h-full rounded-3xl ${theme === 'dark' ? 'bg-white/5 ring-1 ring-white/10' : 'bg-white/70 ring-1 ring-slate-200'} backdrop-blur-2xl shadow-2xl shadow-black/20 flex flex-col`}>
          {/* Brand + App Launcher */}
          <div className="px-3 pt-4 pb-2">
            <div className="text-xl font-black tracking-wide">5thSocial</div>
            <button
              onClick={() => setAppDrawer(true)}
              className={`mt-2 h-9 w-9 rounded-xl grid place-items-center font-bold text-sm ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-black/10 hover:bg-black/15'} transition-colors`}
              aria-label="Open App Launcher"
              title="Open App Launcher"
            >
              S
            </button>
          </div>

          {/* Current App Label */}
          <div className="px-3 py-2">
            <div className="text-xs opacity-60 uppercase tracking-wide font-semibold">
              {currentApp?.label || 'Select App'}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-1 py-2 space-y-1">
            {filteredMenu.map(item => (
              <button
                key={item.key}
                onClick={() => selectMenuItem(item)}
                className={`w-full text-left px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.view === route.view
                    ? theme === 'dark'
                      ? 'bg-white/15 ring-1 ring-white/20'
                      : 'bg-slate-900/10 ring-1 ring-slate-300'
                    : theme === 'dark'
                    ? 'hover:bg-white/10'
                    : 'hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-70">{item.icon || '•'}</span>
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
            
            {filteredMenu.length === 0 && (
              <div className={`px-3 py-4 text-center text-sm opacity-50 ${theme === 'dark' ? 'border border-dashed border-white/20' : 'border border-dashed border-slate-300'} rounded-xl`}>
                No menu items
              </div>
            )}
          </nav>

          {/* Theme Toggle */}
          <div className="px-3 pb-4 pt-2 border-t border-white/10">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-full h-10 rounded-xl text-sm font-semibold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-black/10 hover:bg-black/15'}`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </aside>

      {/* APP DRAWER */}
      <div
        className={`fixed left-[220px] md:left-[240px] top-0 bottom-0 z-50 w-[320px] max-w-[85vw] transform transition-all duration-300 ease-out ${
          appDrawer ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0 pointer-events-none'
        }`}
      >
        <div className={`h-full rounded-r-3xl ${theme === 'dark' ? 'bg-white/8 ring-1 ring-white/10' : 'bg-white/90 ring-1 ring-slate-200'} backdrop-blur-2xl shadow-2xl shadow-black/30 p-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm opacity-70 font-semibold">Select App</div>
            <button
              onClick={() => setAppDrawer(false)}
              className={`h-8 w-8 rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-black/10 hover:bg-black/15'} grid place-items-center text-xs`}
            >
              ✕
            </button>
          </div>
          
          <div className="grid gap-2">
            {apps.map(app => (
              <button
                key={app.key}
                className={`h-12 rounded-xl px-4 text-left font-medium transition-colors ${
                  app.key === route.app
                    ? theme === 'dark'
                      ? 'bg-blue-500/20 ring-1 ring-blue-400/30'
                      : 'bg-blue-50 ring-1 ring-blue-200'
                    : theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => openApp(app.key)}
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-70">📱</span>
                  <span>{app.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {appDrawer && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setAppDrawer(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`relative z-10 ml-[220px] md:ml-[240px] px-6 py-6 transition-all duration-300 ${appDrawer ? 'pointer-events-none blur-[2px] brightness-90' : ''}`}>
        {/* Top Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search navigation..."
              className={`w-full max-w-md h-11 rounded-xl px-4 outline-none transition-all ${theme === 'dark' ? 'bg-white/5 ring-1 ring-white/10 focus:ring-white/20 placeholder:text-slate-400' : 'bg-white/80 ring-1 ring-slate-300 focus:ring-slate-400'} backdrop-blur`}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-80"
              >
                ✕
              </button>
            )}
          </div>
          
          <button className={`h-11 px-4 rounded-xl font-semibold transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            Login
          </button>
        </div>

        {/* Page Content */}
        <div className="max-w-6xl">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}