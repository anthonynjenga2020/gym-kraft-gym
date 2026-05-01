import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal.js'

const levelColors = {
  'All Levels': '#33D169',
  'Beginner': '#4C9FFF',
  'Intermediate': '#FFB800',
  'Advanced': '#FF4E1A',
}

export default function ClassesPage({ config }) {
  const days = config.schedule.map(d => d.day)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const defaultDay = days.includes(today) ? today : days[0]
  const [activeDay, setActiveDay] = useState(defaultDay)
  const [activeFilter, setActiveFilter] = useState('All')
  const heroRef = useReveal()
  const servicesRef = useReveal()
  const scheduleRef = useReveal()

  const dayData = config.schedule.find(d => d.day === activeDay)

  const levels = ['All', 'All Levels', 'Beginner', 'Intermediate', 'Advanced']
  const filteredClasses = activeFilter === 'All'
    ? dayData?.classes
    : dayData?.classes.filter(c => c.level === activeFilter)

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
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--primary)' }}>Classes</span>
            </div>
            <h1 className="font-headline font-black text-5xl sm:text-6xl lg:text-7xl text-white uppercase leading-tight mb-6">
              Every Class.<br />
              Every <span style={{ color: 'var(--primary)' }}>Level.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mb-8">
              From your first ever gym session to fight camp prep — we've got a class for where you are right now, and where you're going.
            </p>
            <a href="#schedule" className="btn-primary px-8 py-4 rounded-sm text-sm inline-block"
              onClick={e => { e.preventDefault(); document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' }) }}>
              View Full Schedule ↓
            </a>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div ref={servicesRef} className="section-reveal">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                What We Offer
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl text-white uppercase leading-tight mb-12">
              Our Class Types
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.services.map((service, i) => (
                <div key={i}
                  className="relative overflow-hidden rounded-sm border group card-hover"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {/* Background image */}
                  {service.image && (
                    <div className="absolute inset-0">
                      <img src={service.image} alt={service.name}
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface) 40%, transparent)' }} />
                    </div>
                  )}
                  <div className="relative z-10 p-6">
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <h3 className="font-headline font-bold text-white uppercase text-lg mb-2">{service.name}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full Schedule */}
      <section id="schedule" className="py-24" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div ref={scheduleRef} className="section-reveal">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
                  <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                    Timetable
                  </span>
                </div>
                <h2 className="font-headline font-black text-4xl sm:text-5xl text-white uppercase leading-tight">
                  Weekly Schedule
                </h2>
              </div>
              <a href="/#free-trial" className="btn-primary px-6 py-3 rounded-sm text-sm self-start lg:self-auto">
                Book a Spot
              </a>
            </div>

            {/* Day tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2 scrollbar-none">
              {days.map(day => (
                <button key={day} onClick={() => setActiveDay(day)}
                  className={`px-4 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 border ${
                    activeDay === day ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  style={{
                    backgroundColor: activeDay === day ? 'var(--primary)' : 'var(--bg)',
                    borderColor: activeDay === day ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Level filter */}
            <div className="flex gap-2 flex-wrap mb-8">
              {levels.map(level => (
                <button key={level} onClick={() => setActiveFilter(level)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all border ${
                    activeFilter === level ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                  }`}
                  style={{
                    borderColor: activeFilter === level ? (levelColors[level] || 'var(--primary)') : 'var(--border)',
                    backgroundColor: activeFilter === level
                      ? (level === 'All' ? 'var(--primary)' : `${levelColors[level]}20`)
                      : 'transparent',
                    color: activeFilter === level && level !== 'All' ? (levelColors[level] || 'white') : undefined,
                  }}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Classes */}
            <div className="space-y-3">
              {filteredClasses?.length === 0 && (
                <div className="text-center py-16 text-gray-600">
                  <p className="text-lg">No {activeFilter} classes on {activeDay}.</p>
                  <p className="text-sm mt-2">Try a different day or level filter.</p>
                </div>
              )}
              {filteredClasses?.map((cls, i) => (
                <div key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-sm border group card-hover"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                >
                  {/* Time */}
                  <div className="w-24 shrink-0">
                    <span className="font-headline font-black text-lg text-white">{cls.time}</span>
                  </div>

                  <div className="hidden sm:block w-px h-12 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

                  {/* Class info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-headline font-bold text-white uppercase tracking-wide">{cls.name}</h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest"
                        style={{
                          color: levelColors[cls.level] || 'white',
                          backgroundColor: `${levelColors[cls.level]}15`,
                        }}
                      >
                        {cls.level}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      with{' '}
                      <Link
                        to={`/trainers/${config.trainers.find(t => t.name === cls.trainer)?.id || cls.trainer.toLowerCase().replace(/ /g, '-')}`}
                        className="font-medium transition-colors"
                        style={{ color: 'var(--primary)' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                      >
                        {cls.trainer}
                      </Link>
                      <span className="mx-2 opacity-40">·</span>
                      {cls.duration}
                    </p>
                  </div>

                  {/* Spots + CTA */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-gray-600 text-xs uppercase tracking-widest">Spots</p>
                      <p className="font-headline font-black text-white">{cls.spots}</p>
                    </div>
                    <a href="/#free-trial"
                      className="px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest border transition-all"
                      style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.1)' }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      Book
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-8">
              {Object.entries(levelColors).map(([level, color]) => (
                <div key={level} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-500 text-xs">{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-headline font-black text-4xl sm:text-5xl text-white uppercase mb-4">
            Not sure which class to start with?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Claim your 7-day free trial and try everything. Our coaches will point you in the right direction.
          </p>
          <a href="/#free-trial" className="btn-primary px-10 py-4 rounded-sm text-sm inline-block">
            Start Free Trial →
          </a>
        </div>
      </section>
    </div>
  )
}
