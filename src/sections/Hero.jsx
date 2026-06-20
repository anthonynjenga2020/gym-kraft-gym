import { useEffect, useRef } from 'react'

export default function Hero({ config }) {
  const headlineRef = useRef(null)

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



  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <video
          src="/kraft24.mp4"
          autoPlay
          loop
          muted
          playsInline
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

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20 w-full">
        <div className="max-w-3xl">

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
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
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
