import { useState, useEffect, useRef } from 'react'
import { insertLead } from '../lib/supabase.js'

const GOALS = ['Lose Weight', 'Build Muscle', 'Improve Fitness', 'Train for Sport', 'Just Explore']
const TIMES = ['Morning', 'Afternoon', 'Evening']

export default function Hero({ config }) {
  const headlineRef = useRef(null)
  const [form, setForm]           = useState({ name: '', phone: '', goal: '', time: '' })
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const el = headlineRef.current
    if (!el) return
    const children = el.querySelectorAll('.hero-anim')
    children.forEach((child, i) => {
      child.style.opacity = '0'
      child.style.transform = 'translateY(30px)'
      setTimeout(() => {
        child.style.transition = 'opacity 0.7s ease, transform 0.7s ease'
        child.style.opacity = '1'
        child.style.transform = 'translateY(0)'
      }, 100 + i * 120)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('Please fill in your name and phone number.'); return }
    setError('')
    setLoading(true)
    try {
      await insertLead({
        gymName:       config.gymName,
        name:          form.name,
        phone:         form.phone,
        goal:          form.goal,
        preferredTime: form.time,
        source:        'hero_form',
        lead_score:    10,
      })
    } catch (err) {
      console.error('Hero form error:', err)
    }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={config.heroImageUrl}
          alt={config.gymName}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
      </div>

      {/* Glowing orb */}
      <div
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 z-0 pointer-events-none"
        style={{ backgroundColor: 'var(--primary)' }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content — two-column grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── LEFT: Copy ── */}
          <div ref={headlineRef}>
            {/* Eyebrow */}
            <div className="hero-anim flex items-center gap-3 mb-6">
              <div className="h-px w-12" style={{ backgroundColor: 'var(--primary)' }} />
              <span
                className="text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: 'var(--primary)' }}
              >
                {config.location}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-anim font-headline font-black uppercase leading-[0.9] tracking-tight mb-6">
              <span className="block text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
                {config.gymName.split(' ')[0]}
              </span>
              <span
                className="block text-6xl sm:text-7xl lg:text-8xl xl:text-9xl"
                style={{ color: 'var(--primary)' }}
              >
                {config.gymName.split(' ').slice(1).join(' ') || 'GYM'}
              </span>
            </h1>

            {/* Tagline */}
            <p className="hero-anim text-gray-300 text-xl sm:text-2xl font-medium italic mb-3 pl-1">
              "{config.tagline}"
            </p>
            <p className="hero-anim text-gray-500 text-base font-light mb-8 pl-1 max-w-md">
              {config.subTagline}
            </p>

            {/* Phone CTA */}
            <div className="hero-anim flex flex-wrap gap-3 items-center mb-10">
              <a
                href={`tel:${config.phone}`}
                className="flex items-center gap-3 px-6 py-3.5 rounded-sm border border-white/15 text-white font-bold text-sm hover:border-white/35 hover:bg-white/5 transition-all duration-200 group"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-full group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </span>
                {config.phone}
              </a>
              <a
                href="#about"
                className="btn-outline px-6 py-3.5 rounded-sm text-sm"
              >
                Learn More
              </a>
            </div>

            {/* Trust bar */}
            <div className="hero-anim flex flex-wrap gap-5 pt-8 border-t border-white/10">
              {(config.stats ?? []).map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="font-headline font-black text-xl" style={{ color: 'var(--primary)' }}>
                    {stat.value}
                  </span>
                  <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                    {stat.label}
                  </span>
                  {i < config.stats.length - 1 && (
                    <div className="h-5 w-px bg-white/10 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Free Trial Form ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10,10,10,0.75)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.5)',
              animation: 'slideInRight 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both',
            }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, var(--primary), transparent)` }} />

            <div className="p-7">
              {submitted ? (
                /* Success state */
                <div className="py-6 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-headline font-black text-2xl text-white uppercase mb-2">You're In!</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    We'll call you within 24 hours to lock in your trial start date. Get ready to work.
                  </p>

                  {/* What happens next pipeline */}
                  <div className="text-left space-y-4 mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">What happens next</p>
                    {[
                      { color: 'var(--primary)', text: 'Your details saved to our CRM instantly' },
                      { color: '#25D366',         text: 'Our team gets a WhatsApp alert right now' },
                      { color: '#3B82F6',          text: 'You get a call within 24 hours to confirm' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <p className="text-gray-400 text-xs">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Form header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.3em] px-2 py-0.5 rounded-sm"
                        style={{ backgroundColor: 'rgba(var(--primary-rgb, 220 38 38) / 0.15)', color: 'var(--primary)' }}
                      >
                        Limited Spots
                      </span>
                    </div>
                    <h3 className="font-headline font-black text-2xl text-white uppercase leading-tight mt-2">
                      7-Day Free Trial
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      No credit card. No lock-in. Just results.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="John Kamau"
                        className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-gray-600 border transition-colors focus:outline-none"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-1.5">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+254 700 000 000"
                        className="w-full px-4 py-3 rounded-lg text-white text-sm placeholder-gray-600 border transition-colors focus:outline-none"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                      />
                    </div>

                    {/* Goal pills */}
                    <div>
                      <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">
                        Your Goal
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {GOALS.map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setForm({ ...form, goal: g })}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
                            style={{
                              borderColor: form.goal === g ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                              backgroundColor: form.goal === g ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)',
                              color: form.goal === g ? 'var(--primary)' : 'rgba(255,255,255,0.45)',
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preferred time */}
                    <div>
                      <label className="block text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-2">
                        Preferred Time
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {TIMES.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, time: t })}
                            className="py-2 rounded-lg text-xs font-semibold border transition-all duration-150"
                            style={{
                              borderColor: form.time === t ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                              backgroundColor: form.time === t ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)',
                              color: form.time === t ? 'var(--primary)' : 'rgba(255,255,255,0.45)',
                            }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-lg text-sm font-black uppercase tracking-widest text-white transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--primary)',
                        boxShadow: '0 4px 24px rgba(220,38,38,0.35)',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Claiming...
                        </>
                      ) : 'Claim My Free Trial →'}
                    </button>

                    <p className="text-gray-600 text-xs text-center">
                      We call you within 24 hours. Zero pressure.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-gray-600 text-xs uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-px h-12 relative overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div
            className="absolute top-0 left-0 w-full"
            style={{
              height: '50%',
              backgroundColor: 'var(--primary)',
              animation: 'scrollLine 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0% { top: -50%; }
          100% { top: 150%; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
