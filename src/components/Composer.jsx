import { useEffect, useRef, useState } from 'react'
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react'

export default function Composer({ onSend, disabled }){
  const [value, setValue] = useState('')
  const ref = useRef(null)

  useEffect(()=>{
    const el = ref.current
    if(!el) return
    const handler = (e)=>{
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault()
        if(value.trim()){
          onSend(value)
          setValue('')
        }
      }
    }
    el.addEventListener('keydown', handler)
    return ()=> el.removeEventListener('keydown', handler)
  }, [value, onSend])

  return (
    <div className="p-3 bg-[#0b0b12] border-t border-white/10">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 bg-[#121224] rounded-2xl border border-white/10 p-2">
          <textarea ref={ref} rows={1} value={value} onChange={e=>setValue(e.target.value)} placeholder="Message..." className="flex-1 resize-none bg-transparent outline-none text-white placeholder-white/40 px-3 py-2"/>
          <div className="flex items-center gap-2 pr-2 pb-1">
            <button className="p-2 rounded-lg hover:bg-white/10 text-white/80" title="Attach"><Paperclip size={18}/></button>
            <button className="p-2 rounded-lg hover:bg-white/10 text-white/80" title="Voice"><Mic size={18}/></button>
            <button disabled={disabled || !value.trim()} onClick={()=>{ onSend(value); setValue('') }} className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white"><Send size={18}/></button>
          </div>
        </div>
        <div className="text-xs text-white/40 mt-2 text-center">Press Enter to send • Shift+Enter for new line</div>
      </div>
    </div>
  )
}
