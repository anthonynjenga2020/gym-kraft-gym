import { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'
import { insertLead } from '../lib/supabase.js'

const levelColors = {
  'All Levels': '#33D169',
  'Beginner': '#4C9FFF',
  'Intermediate': '#FFB800',
  'Advanced': '#FF4E1A',
}

export default function Schedule({ config }) {
  const [bookingClass, setBookingClass] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!config.schedule?.length) return null
  const days = config.schedule.map(d => d.day)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const defaultDay = days.includes(today) ? today : days[0]
  const [activeDay, setActiveDay] = useState(defaultDay)
  
  const headerRef = useReveal()
  const contentRef = useReveal()

  const dayData = config.schedule.find(d => d.day === activeDay)

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await insertLead({
        gymName: config.gymName,
        name: form.name,
        phone: form.phone,
        source: 'class_booking_modal',
        classInterest: `${bookingClass.name} on ${activeDay} at ${bookingClass.time}`,
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const openBooking = (cls) => {
    setBookingClass(cls)
    setSubmitted(false)
    setForm({ name: '', phone: '' })
  }

  return (
    <section id="schedule" className="py-28 lg:py-40 relative" style={{ backgroundColor: 'var(--bg)' }}>
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
                  <button 
                    onClick={() => openBooking(cls)}
                    className="px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest border transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.1)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    Book
                  </button>
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

      {/* Booking Modal */}
      {bookingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md bg-gray-900 border rounded-lg p-6 relative"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <button 
              onClick={() => setBookingClass(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--primary)' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-headline font-black text-2xl text-white uppercase mb-2">Spot Reserved!</h3>
                <p className="text-gray-400 text-sm">
                  You're booked for {bookingClass.name} on {activeDay} at {bookingClass.time}. We'll send you a reminder via WhatsApp.
                </p>
                <button 
                  onClick={() => setBookingClass(null)}
                  className="mt-8 px-6 py-3 rounded-sm text-sm font-bold bg-white text-black hover:bg-gray-200 w-full"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-headline font-black text-2xl text-white uppercase mb-1">
                  Book a Spot
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {bookingClass.name} — {activeDay} at {bookingClass.time}
                </p>

                <form onSubmit={handleBookSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Full Name *</label>
                    <input type="text" required value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="John Kamau"
                      className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none bg-black"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">WhatsApp Number *</label>
                    <input type="tel" required value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="+254 700 000 000"
                      className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none bg-black"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-4 rounded-sm text-sm font-black uppercase tracking-widest text-white mt-4 flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Reserving...
                      </>
                    ) : 'Confirm Booking'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
