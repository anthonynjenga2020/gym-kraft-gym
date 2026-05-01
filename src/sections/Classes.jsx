import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal.js'

export default function Classes({ config }) {
  const headerRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="classes" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                What We Offer
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight">
              Classes &<br />Services
            </h2>
          </div>
          <p className="text-gray-500 text-base max-w-md lg:text-right">
            From beginner-friendly sessions to elite training — we've got a class for every goal, every level, every schedule.
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="section-reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.services.map((service, i) => (
            <div
              key={i}
              className={`card-hover rounded-sm p-8 border group cursor-default ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              {/* Icon */}
              <div className="text-4xl mb-6">{service.icon}</div>

              {/* Title */}
              <h3 className="font-headline font-bold text-xl text-white uppercase tracking-wide mb-3 group-hover:text-primary transition-colors"
                style={{ '--tw-text-opacity': 1 }}
              >
                {service.name}
              </h3>

              {/* Divider */}
              <div
                className="h-px w-8 mb-4 transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: 'var(--primary)' }}
              />

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>

              {/* CTA */}
              <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                  Learn More
                </span>
                <svg className="w-4 h-4" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/classes"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-sm text-sm"
          >
            View Full Schedule →
          </Link>
          <a
            href="#free-trial"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-sm text-sm font-black uppercase tracking-widest border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.08)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Try a Class Free
          </a>
        </div>
      </div>
    </section>
  )
}
