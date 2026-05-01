import { useReveal } from '../hooks/useReveal.js'

export default function Programs({ config }) {
  const headerRef = useReveal()
  const contentRef = useReveal()

  const levelColors = {
    'All Levels': '#33D169',
    'Beginner–Intermediate': '#4C9FFF',
    'Intermediate–Advanced': '#FF4E1A',
  }

  return (
    <section className="py-28 lg:py-40" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              Structured Programs
            </span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-4">
            Commit to a Program.<br />
            <span style={{ color: 'var(--primary)' }}>Get Real Results.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Not just a gym membership. These are structured, coached programs with a clear goal, a clear timeline, and real accountability.
          </p>
        </div>

        {/* Program cards */}
        <div ref={contentRef} className="section-reveal grid lg:grid-cols-3 gap-6">
          {config.programs.map((program, i) => {
            const levelColor = levelColors[program.level] || 'var(--primary)'
            const isFeatured = i === 0

            return (
              <div key={i}
                className={`relative rounded-sm border flex flex-col card-hover overflow-hidden ${isFeatured ? 'lg:-mt-4 lg:mb-4' : ''}`}
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: isFeatured ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {isFeatured && (
                  <div className="py-2 text-center text-xs font-black uppercase tracking-widest text-white"
                    style={{ backgroundColor: 'var(--primary)' }}>
                    Most Popular
                  </div>
                )}

                <div className="p-8 flex flex-col flex-1">
                  {/* Icon + title */}
                  <div className="text-4xl mb-4">{program.icon}</div>
                  <div className="mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest"
                      style={{ color: levelColor, backgroundColor: `${levelColor}15` }}>
                      {program.level}
                    </span>
                  </div>
                  <h3 className="font-headline font-black text-2xl text-white uppercase mb-1 mt-3">
                    {program.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    {program.tagline}
                  </p>

                  {/* Duration badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                    <span className="text-white font-bold text-sm uppercase tracking-widest">{program.duration}</span>
                  </div>

                  {/* Includes */}
                  <div className="space-y-3 mb-8 flex-1">
                    {program.includes.map((item, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: 'var(--primary)' }}>
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-400 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div className="border-t pt-6 mt-auto" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Program Fee</p>
                        <p className="font-headline font-black text-3xl text-white">
                          {program.currency} {program.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-gray-600 text-xs">One-time</p>
                    </div>
                    <a href="#free-trial"
                      className={`block w-full py-3.5 rounded-sm text-sm font-black uppercase tracking-widest text-center transition-all ${
                        isFeatured ? 'btn-primary' : 'border hover:border-primary'
                      }`}
                      style={!isFeatured ? {
                        borderColor: 'var(--border)',
                        color: 'var(--primary)',
                      } : {}}
                      onMouseOver={!isFeatured ? (e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.08)' }) : undefined}
                      onMouseOut={!isFeatured ? (e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }) : undefined}
                    >
                      Enquire Now →
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Note */}
        <p className="text-center text-gray-600 text-xs mt-8 uppercase tracking-widest">
          All programs include full gym access for the duration · M-Pesa accepted
        </p>
      </div>
    </section>
  )
}
