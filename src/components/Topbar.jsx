import { Menu, ChevronDown } from 'lucide-react'

export default function Topbar({ model, onMenu }) {
  return (
    <header className="h-14 border-b border-white/10 bg-gradient-to-r from-[#0b0b12] to-[#141427] text-white flex items-center justify-between px-3">
      <button className="p-2 rounded-md hover:bg-white/5" onClick={onMenu} aria-label="Menu">
        <Menu size={18}/>
      </button>
      <div className="flex items-center gap-2 text-white/90">
        <div className="text-sm">{model}</div>
        <ChevronDown size={16} className="opacity-70"/>
      </div>
      <div className="w-8"/>
    </header>
  )
}
