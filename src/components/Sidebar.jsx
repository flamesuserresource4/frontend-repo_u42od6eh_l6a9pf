import { useState, useEffect } from 'react'
import { Plus, Library, Search, PanelLeftOpen, PanelLeftClose, Trash2, Pencil, LogOut, UserRound } from 'lucide-react'

const formatDate = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Sidebar({
  token,
  chats,
  activeId,
  onCreate,
  onSelect,
  onRename,
  onDelete,
  collapsed,
  setCollapsed,
}) {
  const [search, setSearch] = useState('')

  const filtered = chats.filter(c => !search || (c.title?.toLowerCase()||'').includes(search.toLowerCase()))

  return (
    <aside className={`h-full bg-[#0b0b12] border-r border-white/10 text-white/90 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-80'}`}>
      <div className="p-3 flex items-center gap-2 border-b border-white/10">
        <button className="p-2 rounded-md hover:bg-white/5" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
          {collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}
        </button>
        {!collapsed && (
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5" size={16}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="w-full bg-white/5 pl-8 pr-2 py-2 rounded-md outline-none focus:ring-2 ring-purple-500"/>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-2 flex items-center gap-2 text-sm text-white/70">
          <Library size={16}/> Library
        </div>
      )}

      <div className="px-3">
        <button onClick={onCreate} className="w-full mt-2 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md py-2 transition-colors">
          <Plus size={16}/> {!collapsed && 'New Chat'}
        </button>
      </div>

      <div className="mt-3 px-2 overflow-y-auto flex-1 space-y-1">
        {filtered.map(chat => (
          <div key={chat._id} className={`group rounded-md px-3 py-2 cursor-pointer hover:bg-white/5 ${activeId===chat._id ? 'bg-white/10' : ''}`}
               onClick={()=>onSelect(chat._id)}>
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-sm">{chat.title}</div>
              {!collapsed && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-white/10 rounded" onClick={(e)=>{e.stopPropagation(); const title = prompt('Rename chat', chat.title); if(title) onRename(chat._id, title)}}><Pencil size={14}/></button>
                  <button className="p-1 hover:bg-white/10 rounded" onClick={(e)=>{e.stopPropagation(); if(confirm('Delete chat?')) onDelete(chat._id)}}><Trash2 size={14}/></button>
                </div>
              )}
            </div>
            {!collapsed && <div className="text-xs text-white/50">{formatDate(chat.updated_at)}</div>}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <UserRound size={16}/>
              <span className="text-sm truncate">Profile</span>
            </div>
            <button className="text-white/70 hover:text-white flex items-center gap-1 text-sm" onClick={()=>{ localStorage.removeItem('token'); location.reload()}}><LogOut size={16}/> Logout</button>
          </div>
        ) : (
          <button className="w-full p-2 hover:bg-white/5 rounded-md" title="Logout" onClick={()=>{ localStorage.removeItem('token'); location.reload()}}>
            <LogOut size={18} className="mx-auto"/>
          </button>
        )}
      </div>
    </aside>
  )
}
