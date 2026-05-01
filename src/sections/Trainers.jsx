import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal.js'

export default function Trainers({ config }) {
  const headerRef = useReveal()
  const gridRef = useReveal()

  return (
    <section id="trainers" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              The Team
            </span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight">
            Meet Your<br />Coaches
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Certified. Experienced. Genuinely invested in your progress — not just counting your reps.
          </p>
        </div>

        {/* Trainer Cards */}
        <div ref={gridRef} className={`section-reveal grid gap-6 ${config.trainers.length === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {config.trainers.map((trainer, i) => (
            <Link
              key={i}
              to={`/trainers/${trainer.id}`}
              className="group card-hover rounded-sm overflow-hidden border relative block"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to top, var(--primary), transparent)` }}
                />
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="font-headline font-bold text-lg text-white uppercase tracking-wide">
                  {trainer.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--primary)' }}>
                  {trainer.specialty}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-px w-4 opacity-40" style={{ backgroundColor: 'var(--primary)' }} />
                  <span className="text-gray-600 text-xs uppercase tracking-widest">
                    {trainer.experience} experience
                  </span>
                </div>
              </div>

              {/* View Profile CTA on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 py-3 text-center text-xs font-black uppercase tracking-widest text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                View Profile →
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/trainers"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-sm text-sm font-black uppercase tracking-widest border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.08)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            Meet the Full Team →
          </Link>
        </div>
      </div>
    </section>
  )
}
