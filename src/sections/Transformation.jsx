import { useReveal } from '../hooks/useReveal.js'

export default function Transformation({ config }) {
  const headerRef = useReveal()
  const contentRef = useReveal()

  return (
    <section className="py-28 lg:py-40 relative overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Background accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-5 pointer-events-none"
        style={{ backgroundColor: 'var(--primary)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                Real Results
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight">
              They Came In.<br />
              They <span style={{ color: 'var(--primary)' }}>Changed.</span>
            </h2>
            <p className="text-gray-400 text-lg mt-4 max-w-xl">
              No filters, no tricks. Just real members, real numbers, real life changes.
            </p>
          </div>
          <a href="#free-trial" className="btn-primary px-6 py-3 rounded-sm text-sm self-start lg:self-auto shrink-0">
            Start Your Story →
          </a>
        </div>

        {/* Transformation cards */}
        <div ref={contentRef} className="section-reveal grid lg:grid-cols-3 gap-6">
          {config.transformations.map((t, i) => (
            <div key={i}
              className="relative rounded-sm border overflow-hidden group card-hover"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Top stat bar */}
              <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Before</p>
                    <p className="font-headline font-black text-white text-lg">{t.statBefore}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <div className="h-px w-6" style={{ backgroundColor: 'var(--border)' }} />
                      <div className="w-7 h-7 rounded-sm flex items-center justify-center text-white text-xs font-black"
                        style={{ backgroundColor: 'var(--primary)' }}>
                        →
                      </div>
                      <div className="h-px w-6" style={{ backgroundColor: 'var(--border)' }} />
                    </div>
                    <span className="font-headline font-black text-sm" style={{ color: 'var(--primary)' }}>
                      {t.change}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">After</p>
                    <p className="font-headline font-black text-white text-lg">{t.statAfter}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full mb-6" style={{ backgroundColor: 'var(--border)' }} />
              </div>

              {/* Quote */}
              <div className="px-6 pb-6">
                {/* Large quote mark */}
                <div className="font-headline font-black text-6xl leading-none mb-2 -mt-2"
                  style={{ color: 'var(--primary)', opacity: 0.3 }}>
                  "
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 -mt-4">
                  {t.quote}
                </p>

                {/* Member info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-gray-600 text-xs">{t.duration} · {t.program}</p>
                  </div>
                  <div className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-widest"
                    style={{ backgroundColor: 'rgba(255,78,26,0.1)', color: 'var(--primary)' }}>
                    {t.highlight}
                  </div>
                </div>
              </div>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: 'var(--primary)' }} />
            </div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-16 p-8 rounded-sm border flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          <div>
            <p className="text-white font-headline font-bold text-xl uppercase">Your transformation starts with one decision.</p>
            <p className="text-gray-500 text-sm mt-1">7 days free. No credit card. No contracts. Just show up.</p>
          </div>
          <a href="#free-trial" className="btn-primary px-8 py-4 rounded-sm text-sm whitespace-nowrap shrink-0">
            Claim Free Trial →
          </a>
        </div>
      </div>
    </section>
  )
}
