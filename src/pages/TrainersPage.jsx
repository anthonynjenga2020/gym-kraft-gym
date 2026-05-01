import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal.js'

export default function TrainersPage({ config }) {
  const heroRef = useReveal()
  const gridRef = useReveal()

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 1px, transparent 1px, transparent 60px)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div ref={heroRef} className="section-reveal">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/" className="text-gray-600 text-xs uppercase tracking-widest hover:text-gray-400 transition-colors">
                Home
              </Link>
              <span className="text-gray-700">/</span>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Trainers</span>
            </div>
            <h1 className="font-headline font-black text-5xl sm:text-6xl lg:text-7xl text-white uppercase leading-tight mb-6">
              The People<br />
              Who <span style={{ color: 'var(--primary)' }}>Push You.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Every coach at {config.gymName} has been in the trenches — competitive athletes, certified experts, and people who genuinely give a damn about your results.
            </p>
          </div>
        </div>
      </section>

      {/* Trainer grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div ref={gridRef} className="section-reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.trainers.map((trainer) => (
              <Link key={trainer.id} to={`/trainers/${trainer.id}`}
                className="group relative overflow-hidden rounded-sm border card-hover block"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
              >
                {/* Cover image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface) 20%, transparent 60%)' }} />

                  {/* Experience badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-sm text-xs font-black uppercase tracking-widest text-white"
                    style={{ backgroundColor: 'var(--primary)' }}>
                    {trainer.experience}
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 -mt-8 relative z-10">
                  <h3 className="font-headline font-black text-2xl text-white uppercase mb-1">{trainer.name}</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--primary)' }}>{trainer.specialty}</p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {trainer.specialties.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-sm text-gray-400 border"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                        {s}
                      </span>
                    ))}
                    {trainer.specialties.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-sm text-gray-600 border"
                        style={{ borderColor: 'var(--border)' }}>
                        +{trainer.specialties.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-500 text-xs italic leading-relaxed mb-5 line-clamp-2">
                    "{trainer.quote}"
                  </p>

                  {/* View profile */}
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-200"
                    style={{ color: 'var(--primary)' }}>
                    View Profile
                    <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom accent on hover */}
                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: 'var(--primary)' }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PT CTA */}
      <section className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
                <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                  Personal Training
                </span>
              </div>
              <h2 className="font-headline font-black text-4xl sm:text-5xl text-white uppercase leading-tight mb-4">
                Want a coach<br />
                all to yourself?
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                One-on-one PT sessions with any of our coaches. They'll build a program around your specific goals, lifestyle, and schedule — no cookie-cutter plans.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-sm border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                <div className="text-2xl">💰</div>
                <div>
                  <p className="font-headline font-bold text-white uppercase mb-1">Single Session</p>
                  <p className="text-gray-400 text-sm">Ksh 2,000 per session — drop in anytime that works for you and your trainer.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-sm border"
                style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(255,78,26,0.05)' }}>
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="font-headline font-bold text-white uppercase mb-1">8-Session Package</p>
                  <p className="text-gray-400 text-sm">Ksh 15,000 — save Ksh 1,000 and lock in your weekly slot with your coach.</p>
                </div>
              </div>
              <a href="/#free-trial" className="btn-primary w-full py-4 rounded-sm text-sm text-center block mt-6">
                Book a PT Session →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
