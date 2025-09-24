import React, { useEffect, useMemo, useState, useCallback } from 'react'
import type { AppSummary, NavItem, PilotRoute } from '../types/nav'
import { fetchApps, fetchMenu } from '../lib/navApi'

const TOKENS = { z: { overlay: 60, drawer: 70 }, radius: 18 }

function glass(alpha=0.08, border=0.14){ 
  return { background:`rgba(255,255,255,${alpha})`, border:`1px solid rgba(255,255,255,${border})`, backdropFilter:'blur(28px)' } as React.CSSProperties 
}

export default function PilotShell(){
  const [theme, setTheme] = useState<'dark'|'light'>(() => (localStorage.getItem('pn:theme') as any) || 'dark')
  const [apps, setApps] = useState<AppSummary[]>([])
  const [menu, setMenu] = useState<NavItem[]>([])
  const [route, setRoute] = useState<PilotRoute>(() => JSON.parse(localStorage.getItem('pn:route') || '{"app":"","view":""}'))
  const [search, setSearch] = useState('')
  const [appDrawer, setAppDrawer] = useState(false)

  useEffect(() => { localStorage.setItem('pn:theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('pn:route', JSON.stringify(route)) }, [route])

  // Load apps
  useEffect(() => {
    (async () => {
      try {
        const { apps } = await fetchApps()
        setApps(apps)
        if (!route.app && apps.length) setRoute({ app: apps[0].key, view: '' })
      } catch {
        // fallback
        setApps([{ key:'friends', label:'Friends' }, { key:'campaigns', label:'Campaigns' }, { key:'missions', label:'Missions' }, { key:'settings', label:'Settings' }])
      }
    })()
  }, [])

  // Load menu for app
  useEffect(() => {
    if (!route.app) return
    (async () => {
      try {
        const { menu, defaultRoute } = await fetchMenu(route.app)
        setMenu(menu)
        if (!route.view && (defaultRoute?.view || menu[0])) setRoute({ app: route.app, view: defaultRoute?.view || menu[0].view })
      } catch {
        // fallback minimal
        const m = [
          { key:`${route.app}:primary`, label:'Primary', app: route.app, view:'primary', icon:'home' },
          { key:`${route.app}:secondary`, label:'Secondary', app: route.app, view:'secondary', icon:'plus' },
        ]
        setMenu(m)
        if (!route.view) setRoute({ app: route.app, view: m[0].view })
      }
    })()
  }, [route.app])

  const filteredMenu = useMemo(() => {
    if (!search.trim()) return menu
    const t = search.toLowerCase()
    return menu.filter(m => m.label.toLowerCase().includes(t) || m.view.toLowerCase().includes(t))
  }, [menu, search])

  const openApp = useCallback((appKey: string) => {
    setRoute({ app: appKey, view: '' })
    setAppDrawer(false)
  }, [])

  return (
    <div style={{ minHeight:'100vh', color: theme==='dark' ? '#E5E7EB' : '#0F172A', background: theme==='dark' ? '#020617' : '#F8FAFC' }}>
      {/* Top bar */}
      <div style={{ position:'sticky', top:0, zIndex:80, display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.12)', ...(theme==='dark'? glass(0.04,0.14) : glass(0.7,0.06)) }}>
        <div onClick={()=>setAppDrawer(true)} style={{ fontWeight:700, cursor:'pointer', userSelect:'none' }} aria-label='Open apps'>S</div>
        <div style={{ flex:1 }} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search...' style={{ border:'1px solid rgba(255,255,255,0.2)', height:36, padding:'0 12px', borderRadius:12, background:'rgba(255,255,255,0.10)', color:'inherit', outline:'none', minWidth:220 }} />
        <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} style={{ border:'1px solid rgba(255,255,255,0.2)', height:36, padding:'0 12px', borderRadius:12, background:'rgba(255,255,255,0.10)' }}>{theme==='dark'?'Light':'Dark'}</button>
      </div>

      {/* Body */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:12 }}>
          {/* Left: Menu */}
          <div style={{ ...glass(theme==='dark'?0.06:0.18, theme==='dark'?0.14:0.06), borderRadius:TOKENS.radius, padding:12 }}>
            <div style={{ fontSize:12, opacity:0.7, marginBottom:8 }}>Menu — {apps.find(a=>a.key===route.app)?.label || '-'}</div>
            <div style={{ display:'grid', gap:8 }}>
              {filteredMenu.map(m => (
                <button key={m.key} onClick={()=>setRoute({ app: m.app, view: m.view })} style={{ textAlign:'left', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 12px', background: m.view===route.view ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.10)' }}>{m.label}</button>
              ))}
              {filteredMenu.length===0 && <div style={{ border:'1px dashed rgba(255,255,255,0.2)', borderRadius:12, padding:12, opacity:0.7 }}>No items</div>}
            </div>
          </div>

          {/* Right: Sub menu / workflows placeholder */}
          <div style={{ display:'grid', gap:12 }}>
            <div style={{ fontSize:12, opacity:0.7 }}>Sub menu — {route.view || '-'}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12 }}>
              {/* Demo cards derived from menu selection; real impl should fetch workflows for route.view */}
              {Array.from({length:3}).map((_,i)=>(
                <div key={i} style={{ ...glass(theme==='dark'?0.06:0.16, theme==='dark'?0.14:0.08), borderRadius:TOKENS.radius, padding:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:600 }}>Action {i+1}</div>
                    <span style={{ fontSize:10, textTransform:'uppercase', border:'1px solid rgba(255,255,255,0.22)', borderRadius:9999, padding:'2px 8px' }}>page</span>
                  </div>
                  <div style={{ fontSize:12, opacity:0.7, marginTop:4 }}>/path/to/action/{i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App Drawer (left) */}
      {appDrawer && (
        <>
          <div onClick={()=>setAppDrawer(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:TOKENS.z.overlay }} />
          <div style={{ position:'fixed', inset:'0 auto 0 0', width:320, zIndex:TOKENS.z.drawer, borderRight:'1px solid rgba(255,255,255,0.22)', ...(theme==='dark'? glass(0.92,0.10) : glass(0.90,0.06)), padding:12 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontWeight:600 }}>Apps</div>
              <button onClick={()=>setAppDrawer(false)} style={{ border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 12px', background:'rgba(255,255,255,0.10)' }}>Close</button>
            </div>
            <div style={{ display:'grid', gap:8 }}>
              {apps.map(a => (
                <button key={a.key} onClick={()=>openApp(a.key)} style={{ textAlign:'left', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 12px', background: a.key===route.app ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.10)' }}>{a.label}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
