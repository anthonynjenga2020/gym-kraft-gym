import { useEffect, useRef } from 'react'

export default function Hero({ config }) {
  const headlineRef = useRef(null)

  useEffect(() => {
    // Stagger animate children
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
        <img
          src={config.heroImageUrl}
          alt={config.gymName}
          className="w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
      </div>

      {/* Glowing orb */}
      <div
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 z-0 pointer-events-none"
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
        <div ref={headlineRef} className="max-w-3xl">
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
            <span className="block text-white text-5xl sm:text-7xl lg:text-8xl xl:text-9xl">
              {config.gymName.split(' ')[0]}
            </span>
            <span
              className="block text-6xl sm:text-8xl lg:text-9xl xl:text-[10rem]"
              style={{ color: 'var(--primary)' }}
            >
              {config.gymName.split(' ').slice(1).join(' ') || 'GYM'}
            </span>
          </h1>

          {/* Tagline */}
          <p className="hero-anim text-gray-300 text-xl sm:text-2xl font-medium italic mb-3 pl-1">
            "{config.tagline}"
          </p>
          <p className="hero-anim text-gray-500 text-base sm:text-lg font-light mb-10 pl-1 max-w-xl">
            {config.subTagline}
          </p>

          {/* CTAs */}
          <div className="hero-anim flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="btn-primary px-8 py-4 rounded-sm text-base inline-block"
            >
              {config.trialCTA}
            </a>
            <a
              href="#classes"
              className="btn-outline px-8 py-4 rounded-sm text-base inline-block"
            >
              See Our Classes
            </a>
          </div>

          {/* Trust bar */}
          <div className="hero-anim flex flex-wrap gap-6 mt-12 pt-10 border-t border-white/10">
            {config.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-headline font-black text-2xl" style={{ color: 'var(--primary)' }}>
                  {stat.value}
                </span>
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
                {i < config.stats.length - 1 && (
                  <div className="h-6 w-px bg-white/10 ml-3" />
                )}
              </div>
            ))}
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
      `}</style>
    </section>
  )
}
