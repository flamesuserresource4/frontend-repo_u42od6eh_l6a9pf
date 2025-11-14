export default function Message({ role, content }){
  const isUser = role === 'user'
  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${isUser ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-white/5 text-white/90 rounded-bl-sm border border-white/10'}`}>
        {content}
      </div>
    </div>
  )
}
