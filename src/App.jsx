import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Composer from './components/Composer'
import Message from './components/Message'
import Hero from './components/Hero'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

function useAuth(){
  const [token, setToken] = useState(localStorage.getItem('token')||'')
  const [user, setUser] = useState(null)

  const register = async (name, email) => {
    const res = await fetch(`${BACKEND}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password: crypto.randomUUID() }) })
    if(!res.ok){ throw new Error('Register failed') }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }
  const loginAnon = async () => {
    if(token) return
    // quick anonymous register using random identity
    const name = 'Guest ' + Math.floor(Math.random()*1000)
    const email = `guest${Math.floor(Math.random()*100000)}@demo.dev`
    await register(name, email)
  }
  useEffect(()=>{ (async()=>{ if(!token){ await loginAnon() } else { try{ const me = await fetch(`${BACKEND}/me`, { headers:{ Authorization:`Bearer ${token}` } }); if(me.ok){ setUser(await me.json()) } }catch(e){} } })() }, [])
  return { token, user }
}

export default function App(){
  const { token, user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [model, setModel] = useState('Aurora-1')
  const [chats, setChats] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const headers = useMemo(()=> ({ 'Content-Type':'application/json', Authorization: `Bearer ${token}` }), [token])

  const loadChats = useCallback(async()=>{
    if(!token) return
    const res = await fetch(`${BACKEND}/chats`, { headers })
    if(res.ok){ const data = await res.json(); setChats(data); if(!activeId && data[0]?._id){ setActiveId(data[0]._id) } }
  }, [token])

  const loadMessages = useCallback(async(id)=>{
    if(!id) return
    const res = await fetch(`${BACKEND}/chats/${id}/messages`, { headers })
    if(res.ok){ setMessages(await res.json()); setTimeout(()=> scrollToBottom(true), 50) }
  }, [headers])

  const createChat = useCallback(async()=>{
    const res = await fetch(`${BACKEND}/chats`, { method:'POST', headers, body: JSON.stringify({ title: 'New Chat', model }) })
    if(res.ok){ const c = await res.json(); await loadChats(); setActiveId(c._id); setMessages([]) }
  }, [headers, model])

  const renameChat = useCallback(async(id, title)=>{
    await fetch(`${BACKEND}/chats/${id}`, { method:'PATCH', headers, body: JSON.stringify({ title }) })
    loadChats()
  }, [headers])

  const deleteChat = useCallback(async(id)=>{
    await fetch(`${BACKEND}/chats/${id}`, { method:'DELETE', headers })
    await loadChats(); if(activeId===id){ setActiveId(null); setMessages([]) }
  }, [headers, activeId])

  const send = useCallback(async (text)=>{
    if(!activeId){ await createChat() }
    const id = activeId || (await (async()=>{ const res = await fetch(`${BACKEND}/chats`, { method:'POST', headers, body: JSON.stringify({ title: text.slice(0,30)||'New Chat', model }) }); const c = await res.json(); setActiveId(c._id); return c._id })())
    // optimistic show user message
    setMessages(x=> [...x, { _id: Math.random().toString(36).slice(2), role:'user', content:text }])

    // stream assistant
    setLoading(true)
    const resp = await fetch(`${BACKEND}/chats/${id}/stream?`+ new URLSearchParams({ content:text }), { headers })
    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let acc = ''
    setMessages(x=> [...x, { _id: 'stream', role:'assistant', content:'' }])
    while(true){
      const { value, done } = await reader.read()
      if(done) break
      const chunk = decoder.decode(value)
      const textParts = chunk.split('\n\n').filter(Boolean)
      for(const part of textParts){
        if(part.startsWith('data: ')){
          const t = part.slice(6)
          if(t === '[DONE]') continue
          acc += t
          setMessages(x=> x.map(m=> m._id==='stream' ? { ...m, content: acc } : m))
          scrollToBottom()
        }
      }
    }
    setLoading(false)
    // reload messages from server to ensure consistency
    await loadMessages(id)
  }, [headers, activeId, model])

  const scrollToBottom = (smooth=false)=>{
    const el = scrollRef.current
    if(!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(()=>{ loadChats() }, [token])
  useEffect(()=>{ if(activeId){ loadMessages(activeId) } }, [activeId])

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} token={token} chats={chats} activeId={activeId} onCreate={createChat} onSelect={setActiveId} onRename={renameChat} onDelete={deleteChat} />
      <div className="flex-1 flex flex-col">
        <Topbar model={model} onMenu={()=>setCollapsed(!collapsed)} />

        {!activeId && (
          <div>
            <Hero />
            <div className="max-w-3xl mx-auto px-4">
              <h1 className="text-2xl md:text-4xl font-semibold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent mt-6">Your AI workspace</h1>
              <p className="text-white/70 mt-2">Start a new project or chat. Everything is saved to your library automatically.</p>
              <div className="mt-6">
                <button onClick={createChat} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500">New Chat</button>
              </div>
            </div>
          </div>
        )}

        {activeId && (
          <div className="flex-1 flex flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
              {messages.map(m=> <Message key={m._id} role={m.role} content={m.content} />)}
            </div>
            <Composer onSend={send} disabled={loading} />
          </div>
        )}
      </div>

      <div className="fixed inset-0 -z-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 bg-purple-600/30 blur-3xl rounded-full"/>
        <div className="absolute top-20 right-10 h-60 w-60 bg-fuchsia-500/20 blur-3xl rounded-full"/>
      </div>
    </div>
  )
}
