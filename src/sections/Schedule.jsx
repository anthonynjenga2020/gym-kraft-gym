import { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'

const levelColors = {
  'All Levels': '#33D169',
  'Beginner': '#4C9FFF',
  'Intermediate': '#FFB800',
  'Advanced': '#FF4E1A',
}

export default function Schedule({ config }) {
  const days = config.schedule.map(d => d.day)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const defaultDay = days.includes(today) ? today : days[0]
  const [activeDay, setActiveDay] = useState(defaultDay)
  const headerRef = useReveal()
  const contentRef = useReveal()

  const dayData = config.schedule.find(d => d.day === activeDay)

  return (
    <section id="schedule" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={headerRef} className="section-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                Weekly Timetable
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight">
              Class Schedule
            </h2>
          </div>
          <a href="#free-trial" className="btn-primary px-6 py-3 rounded-sm text-sm self-start lg:self-auto">
            Book a Spot
          </a>
        </div>

        {/* Day tabs */}
        <div ref={contentRef} className="section-reveal">
          <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {days.map(day => (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`px-4 py-2.5 rounded-sm text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 border ${
                  activeDay === day ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                style={{
                  backgroundColor: activeDay === day ? 'var(--primary)' : 'var(--surface)',
                  borderColor: activeDay === day ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Classes list */}
          <div className="space-y-3">
            {dayData?.classes.map((cls, i) => (
              <div key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-sm border group card-hover"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                {/* Time */}
                <div className="w-24 shrink-0">
                  <span className="font-headline font-black text-lg text-white">{cls.time}</span>
                </div>

                {/* Divider */}
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
                    with <span className="text-gray-300 font-medium">{cls.trainer}</span>
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
                  <a href="#free-trial"
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
  )
}
