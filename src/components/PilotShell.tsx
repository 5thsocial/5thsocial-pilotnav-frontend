import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { NavItem, PilotRoute } from '../types/nav'
import { Fallback } from '../lib/navApi'

// Tokens & styles (from original)
const TOKENS = { nav: { width: 180, radius: 18, pad: 10 }, drawer: { width: 320, radius: 20 }, z: { nav: 40, dim: 60, drawer: 70, main: 10 }, motion: { fast: '200ms', normal: '300ms' } }
const glass = (alpha=0.08, ring=0.12, shadow=0.28): React.CSSProperties => ({ background:`rgba(255,255,255,${alpha})`, border:`1px solid rgba(255,255,255,${ring})`, backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)', boxShadow:`0 28px 96px rgba(0,0,0,${shadow})` })
const btn = (a=0.10): React.CSSProperties => ({ background:`rgba(255,255,255,${a})`, border:'1px solid rgba(255,255,255,0.14)', borderRadius:12, height:36, padding:'0 12px', cursor:'pointer' })
const inputStyle = (): React.CSSProperties => ({ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:12, height:44, padding:'0 12px', outline:'none', color:'#E5E7EB' })

// Icons (from original)
function Icon({ name, color = '#E5E7EB' }:{ name?: string; color?: string }){
  const sz = 18
  const common:any = { width:sz, height:sz, viewBox:'0 0 24 24', fill:'none', stroke:color, strokeWidth:1.6, strokeLinecap:'round', strokeLinejoin:'round' }
  switch(name){
    case 'home': return (<svg {...common}><path d='M3 11l9-8 9 8'/><path d='M9 22V12h6v10'/></svg>)
    case 'plus': return (<svg {...common}><path d='M12 5v14M5 12h14'/></svg>)
    case 'user': return (<svg {...common}><path d='M20 21a8 8 0 10-16 0'/><circle cx='12' cy='7' r='4'/></svg>)
    case 'arrowLeft': return (<svg {...common}><path d='M19 12H5'/><path d='M12 19l-7-7 7-7'/></svg>)
    default: return (<svg {...common}><circle cx='12' cy='12' r='9'/></svg>)
  }
}

// Top bar (from original, adapted for search if needed)
function TopBar({ onSearch, right }:{ onSearch?:(q:string)=>void; right?:React.ReactNode }){
  const [q,setQ] = useState('')
  const submit = useCallback((e:React.FormEvent)=>{ e.preventDefault(); if(onSearch) onSearch(q.trim()) },[q,onSearch])
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <form onSubmit={submit} style={{ flex:1 }}>
        <input placeholder="I'm Zoe" aria-label='Zoe Search' value={q} onChange={e=>setQ(e.target.value)} style={{ ...inputStyle(), width:'100%' }} />
      </form>
      {right ?? <button style={{ ...btn(0.12), height:44, padding:'0 16px', fontWeight:600, color:'#fff' }}>Login</button>}
    </div>
  )
}

// Sidebar (from original)
function Sidebar({ dark, items, onSelect, onToggleLauncher, onToggleTheme }:{ dark:boolean; items:NavItem[]; onSelect:(it:NavItem)=>void; onToggleLauncher:()=>void; onToggleTheme:()=>void }){
  return (
    <aside style={{ position:'fixed', inset:'0 auto 0 0', width:TOKENS.nav.width, padding:TOKENS.nav.pad, zIndex:TOKENS.z.nav }}>
      <div style={{ ...glass(dark?0.06:0.7, 0.12, 0.22), height:'100%', borderRadius:TOKENS.nav.radius, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 12px 4px' }}>
          <div style={{ fontSize:18, fontWeight:900 }}>5thSocial</div>
          <button aria-label='Open App Launcher' onClick={onToggleLauncher} style={{ ...btn(0.10), marginTop:6, width:34, height:34, borderRadius:10, display:'grid', placeItems:'center', fontWeight:700 }}>S</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'6px 8px' }}>
          {items.map(it => (
            <button key={it.key} onClick={()=>onSelect(it)} style={{ ...btn(0.08), width:'100%', textAlign:'left', marginBottom:8, display:'flex', alignItems:'center', gap:10, color:dark?'#E5E7EB':'#111827', background:dark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)' }}>
              <Icon name={it.icon} color={dark ? '#E5E7EB' : '#111827'} />
              <span>{it.label}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop:'auto', padding:'8px 10px 12px', borderTop:'1px solid rgba(255,255,255,0.12)' }}>
          <button onClick={onToggleTheme} style={{ ...btn(0.10), width:'100%', fontWeight:600, color:dark?'#E5E7EB':'#111827' }}>{dark?'Dark':'Light'}</button>
        </div>
      </div>
    </aside>
  )
}

// Drawer (from original, adapted to use apps prop)
function AppDrawer({ dark, open, onClose, apps, onPickApp }:{ dark:boolean; open:boolean; onClose:()=>void; apps:{key:string;label:string}[]; onPickApp:(app:string)=>void }){
  const left = TOKENS.nav.width
  const ref = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    if(!open || !ref.current) return
    const onKey = (e:KeyboardEvent)=>{ if(e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return ()=>document.removeEventListener('keydown', onKey)
  },[open,onClose])

  return (<>
    {open && <div aria-hidden onClick={onClose} style={{ position:'fixed', inset:0, zIndex:TOKENS.z.dim, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }} />}
    <div ref={ref} role='dialog' aria-modal={open} aria-label='App Launcher'
      style={{ position:'fixed', top:0, bottom:0, left, width:TOKENS.drawer.width, maxWidth:'85vw', zIndex:TOKENS.z.drawer,
               transform:`translateX(${open?'0':'-16px'})`, opacity:open?1:0,
               transition:`transform ${TOKENS.motion.normal} ease-out, opacity ${TOKENS.motion.normal} ease-out`,
               pointerEvents:open?'auto':'none' }}>
      <div style={{ ...glass(dark?0.08:0.9, 0.12, 0.3), height:'100%', borderTopRightRadius:TOKENS.drawer.radius, borderBottomRightRadius:TOKENS.drawer.radius, padding:14 }}>
        <div style={{ fontSize:12, opacity:0.7, marginBottom:8 }}>Select App</div>
        <div style={{ display:'grid', gap:8 }}>
          {apps.map(a => <button key={a.key} style={btn(0.10)} onClick={()=>onPickApp(a.key)}>{a.label}</button>)}
        </div>
      </div>
    </div>
  </>)
}

export type ViewRenderer = { render:(route:PilotRoute)=>React.ReactNode }
export type PilotShellProps = { 
  renderer: ViewRenderer; 
  showTopBar?: boolean;
  children?: React.ReactNode;
  apps: {key:string;label:string}[];
  menu: NavItem[];
  route: PilotRoute;
  onPickApp: (app: string) => void;
  onSelectMenu: (it: NavItem) => void;
}

export default function PilotShell({ renderer, showTopBar = true, children, apps, menu, route, onPickApp, onSelectMenu }: PilotShellProps){
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('5thsocial-theme')
    return saved ? saved === 'dark' : true
  })
  useEffect(()=>{
    localStorage.setItem('5thsocial-theme', dark ? 'dark' : 'light')
    document.body.style.background = dark ? '#0B0F14' : '#F3F4F6'
    document.body.style.color = dark ? '#E5E7EB' : '#111827'
  },[dark])

  const [drawerOpen,setDrawerOpen] = useState(false)

  const dim = useMemo<React.CSSProperties>(() => (
    drawerOpen ? { filter:'saturate(0.9) brightness(0.9)', pointerEvents:'none', userSelect:'none', transition:`filter ${TOKENS.motion.fast} ease` } : {}
  ), [drawerOpen])

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <Sidebar dark={dark} items={menu} onSelect={onSelectMenu} onToggleLauncher={()=>setDrawerOpen(v=>!v)} onToggleTheme={()=>setDark(d=>!d)} />
      <AppDrawer dark={dark} open={drawerOpen} onClose={()=>setDrawerOpen(false)} apps={apps} onPickApp={onPickApp} />
      <main style={{ position:'relative', zIndex:TOKENS.z.main, marginLeft:TOKENS.nav.width, padding:18, ...dim }}>
        {showTopBar && <TopBar />}
        {children || renderer.render(route)}
      </main>
    </div>
  )
}