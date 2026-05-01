import { useParams, Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal.js'

export default function TrainerPage({ config }) {
  const { trainerId } = useParams()
  const trainer = config.trainers.find(t => t.id === trainerId)
  const heroRef = useReveal()
  const contentRef = useReveal()

  if (!trainer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-white font-headline font-black text-4xl uppercase mb-4">Trainer not found.</p>
        <Link to="/trainers" className="btn-primary px-6 py-3 rounded-sm text-sm">← Back to Trainers</Link>
      </div>
    )
  }

  // Get all classes this trainer teaches across all days
  const trainerClasses = config.schedule.flatMap(day =>
    day.classes
      .filter(cls => cls.trainer === trainer.name)
      .map(cls => ({ ...cls, day: day.day }))
  )

  const levelColors = {
    'All Levels': '#33D169',
    'Beginner': '#4C9FFF',
    'Intermediate': '#FFB800',
    'Advanced': '#FF4E1A',
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero — full bleed cover image */}
      <section className="relative pt-40 pb-0 overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
        {/* Cover BG */}
        <div className="absolute inset-0">
          <img src={trainer.coverImage || trainer.image} alt={trainer.name}
            className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, var(--surface) 80%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-12">
            <Link to="/" className="text-gray-600 text-xs uppercase tracking-widest hover:text-gray-400 transition-colors">Home</Link>
            <span className="text-gray-700">/</span>
            <Link to="/trainers" className="text-gray-600 text-xs uppercase tracking-widest hover:text-gray-400 transition-colors">Trainers</Link>
            <span className="text-gray-700">/</span>
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--primary)' }}>{trainer.name}</span>
          </div>

          <div ref={heroRef} className="section-reveal grid lg:grid-cols-[1fr_auto] items-end gap-12 pb-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--primary)' }}>
                {trainer.specialty}
              </p>
              <h1 className="font-headline font-black text-5xl sm:text-6xl lg:text-7xl text-white uppercase leading-tight mb-6">
                {trainer.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                  <span className="text-white font-bold text-sm uppercase tracking-widest">{trainer.experience} Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
                  <span className="text-gray-400 text-sm">{trainer.availableDays.length} days/week</span>
                </div>
              </div>
            </div>

            {/* Profile photo */}
            <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-sm overflow-hidden border-2 shrink-0"
              style={{ borderColor: 'var(--primary)' }}>
              <img src={trainer.image} alt={trainer.name}
                className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div ref={contentRef} className="section-reveal grid lg:grid-cols-[2fr_1fr] gap-12">
            {/* Left column */}
            <div className="space-y-12">
              {/* Quote */}
              <div className="relative p-8 rounded-sm border"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <div className="font-headline font-black text-7xl leading-none absolute -top-4 left-6"
                  style={{ color: 'var(--primary)', opacity: 0.4 }}>
                  "
                </div>
                <p className="text-white text-xl font-medium leading-relaxed italic pt-4">
                  {trainer.quote}
                </p>
              </div>

              {/* Bio */}
              <div>
                <h2 className="font-headline font-black text-2xl text-white uppercase mb-4">About {trainer.name.split(' ')[0]}</h2>
                <p className="text-gray-400 text-base leading-relaxed">{trainer.bio}</p>
              </div>

              {/* Classes they teach */}
              {trainerClasses.length > 0 && (
                <div>
                  <h2 className="font-headline font-black text-2xl text-white uppercase mb-6">
                    {trainer.name.split(' ')[0]}'s Classes
                  </h2>
                  <div className="space-y-3">
                    {trainerClasses.map((cls, i) => (
                      <div key={i}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-sm border"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                      >
                        <div className="w-20 shrink-0">
                          <p className="font-headline font-black text-white">{cls.time}</p>
                          <p className="text-gray-600 text-xs">{cls.day}</p>
                        </div>
                        <div className="hidden sm:block w-px h-10 shrink-0" style={{ backgroundColor: 'var(--border)' }} />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-headline font-bold text-white uppercase text-sm">{cls.name}</span>
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest"
                              style={{
                                color: levelColors[cls.level] || 'white',
                                backgroundColor: `${levelColors[cls.level]}15`,
                              }}
                            >
                              {cls.level}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mt-0.5">{cls.duration} · {cls.spots} spots</p>
                        </div>
                        <a href="/#free-trial"
                          className="px-3 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest border shrink-0 transition-all"
                          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.1)' }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          Book
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              <div className="p-6 rounded-sm border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <h3 className="font-headline font-bold text-white uppercase text-sm mb-4 tracking-widest">Certifications</h3>
                <div className="space-y-2.5">
                  {trainer.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--primary)' }}>
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-400 text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="p-6 rounded-sm border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <h3 className="font-headline font-bold text-white uppercase text-sm mb-4 tracking-widest">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-sm border text-gray-300"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="p-6 rounded-sm border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <h3 className="font-headline font-bold text-white uppercase text-sm mb-4 tracking-widest">Available Days</h3>
                <div className="grid grid-cols-7 gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                    const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
                    const available = trainer.availableDays.includes(fullDay)
                    return (
                      <div key={d} className="flex flex-col items-center gap-1">
                        <span className="text-gray-600 text-xs">{d}</span>
                        <div className={`w-7 h-7 rounded-sm flex items-center justify-center`}
                          style={{
                            backgroundColor: available ? 'var(--primary)' : 'var(--bg)',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            borderColor: available ? 'var(--primary)' : 'var(--border)',
                          }}>
                          {available && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Book PT */}
              <div className="p-6 rounded-sm border" style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(255,78,26,0.05)' }}>
                <p className="font-headline font-bold text-white uppercase text-sm mb-2">Book a PT Session</p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Work 1-on-1 with {trainer.name.split(' ')[0]}. Sessions from Ksh 2,000.
                </p>
                <a href="/#free-trial" className="btn-primary w-full py-3 rounded-sm text-xs text-center block font-black uppercase tracking-widest">
                  Book {trainer.name.split(' ')[0]} →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the rest of the team */}
      <section className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-headline font-black text-3xl text-white uppercase">Meet the Full Team</h2>
            <Link to="/trainers"
              className="text-xs font-black uppercase tracking-widest transition-colors"
              style={{ color: 'var(--primary)' }}>
              All Trainers →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.trainers.filter(t => t.id !== trainer.id).map(t => (
              <Link key={t.id} to={`/trainers/${t.id}`}
                className="flex items-center gap-4 p-4 rounded-sm border group card-hover transition-all"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                <img src={t.image} alt={t.name}
                  className="w-14 h-14 rounded-sm object-cover shrink-0" />
                <div>
                  <p className="font-headline font-bold text-white uppercase text-sm group-hover:text-primary transition-colors">{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--primary)' }}>{t.specialty}</p>
                  <p className="text-gray-600 text-xs">{t.experience}</p>
                </div>
                <svg className="w-4 h-4 ml-auto text-gray-700 group-hover:text-primary transition-all group-hover:translate-x-1"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
