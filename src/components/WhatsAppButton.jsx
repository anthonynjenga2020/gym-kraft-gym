import { useState, useEffect, useRef } from 'react'

const QUICK_REPLIES = [
  { label: 'Membership Pricing', msg: 'Hi! I would like to know about your membership pricing and plans.' },
  { label: 'Book a Free Trial', msg: 'Hi! I would like to book a free trial session at Kraft Gym.' },
  { label: 'Class Schedule', msg: 'Hi! Can you share the class schedule and timetable?' },
  { label: 'Location & Hours', msg: 'Hi! What are your opening hours and where exactly are you located?' },
]

const BOT_GREETING = "Hi there! Welcome to Kraft Gym. How can I help you today?"
const BOT_SUBTEXT  = "Choose an option below or type your message."

export default function WhatsAppButton({ config }) {
  const [open, setOpen]         = useState(false)
  const [typing, setTyping]     = useState(false)
  const [greetingVisible, setGreetingVisible] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef(null)

  const phone = config.whatsappNumber?.replace(/\D/g, '')

  // Animate bot greeting when chat opens
  useEffect(() => {
    if (open) {
      setGreetingVisible(false)
      setTyping(true)
      const t1 = setTimeout(() => { setTyping(false); setGreetingVisible(true) }, 1000)
      return () => clearTimeout(t1)
    }
  }, [open])

  function openWhatsApp(msg) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleSend() {
    const msg = inputVal.trim()
    if (!msg) return
    openWhatsApp(msg)
    setInputVal('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <>
      {/* ── Chat Widget Popup ── */}
      <div
        className="fixed bottom-24 right-6 z-50 w-[340px] transition-all duration-300 origin-bottom-right"
        style={{
          opacity:    open ? 1 : 0,
          transform:  open ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
          pointerEvents: open ? 'all' : 'none',
        }}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: '#075E54' }}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white/20 flex items-center justify-center font-bold text-white text-sm">
              {config.logoUrl
                ? <img src={config.logoUrl} alt={config.gymName} className="w-full h-full object-cover" />
                : config.gymName.charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-tight truncate">{config.gymName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                <p className="text-white/70 text-[11px]">Online now</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1 -mr-1"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat body */}
          <div
            className="px-4 py-5 min-h-[200px] flex flex-col gap-3"
            style={{
              backgroundColor: '#0d1f2d',
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* Typing indicator */}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-[#075E54] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {config.gymName.charAt(0)}
                </div>
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Bot greeting */}
            {greetingVisible && (
              <div
                className="flex items-end gap-2 transition-all duration-300"
                style={{ opacity: greetingVisible ? 1 : 0, transform: greetingVisible ? 'translateY(0)' : 'translateY(6px)' }}
              >
                <div className="w-7 h-7 rounded-full bg-[#075E54] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {config.gymName.charAt(0)}
                </div>
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div className="bg-white/10 text-white rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
                    {BOT_GREETING}
                    <p className="text-white/50 text-[11px] mt-1">{BOT_SUBTEXT}</p>
                  </div>

                  {/* Quick reply buttons */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    {QUICK_REPLIES.map((qr, i) => (
                      <button
                        key={i}
                        onClick={() => openWhatsApp(qr.msg)}
                        className="text-left text-sm px-3 py-2 rounded-xl border transition-all duration-150 font-medium"
                        style={{
                          borderColor: '#25D366',
                          color: '#25D366',
                          backgroundColor: 'rgba(37,211,102,0.05)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(37,211,102,0.15)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(37,211,102,0.05)' }}
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message input */}
          <div
            className="flex items-center gap-2 px-3 py-3 border-t"
            style={{ backgroundColor: '#0d1f2d', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white
                placeholder-white/30 focus:outline-none focus:border-[#25D366]/50 transition-colors"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{ backgroundColor: inputVal.trim() ? '#25D366' : 'rgba(255,255,255,0.08)' }}
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 py-2" style={{ backgroundColor: '#0d1f2d' }}>
            <svg className="w-3 h-3" fill="#25D366" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="text-[10px] text-white/30">Powered by WhatsApp</span>
          </div>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none"
        style={{
          backgroundColor: '#25D366',
          boxShadow: open
            ? '0 4px 30px rgba(37,211,102,0.3)'
            : '0 4px 30px rgba(37,211,102,0.55)',
        }}
        aria-label={open ? 'Close chat' : 'Chat with us on WhatsApp'}
      >
        {/* Pulse ring (only when closed) */}
        {!open && (
          <div className="absolute w-14 h-14 rounded-full bg-[#25D366] opacity-25 animate-ping" />
        )}

        {/* Icon toggles: WhatsApp <-> X */}
        <div className="relative z-10 transition-all duration-200" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          {open ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          )}
        </div>
      </button>
    </>
  )
}
