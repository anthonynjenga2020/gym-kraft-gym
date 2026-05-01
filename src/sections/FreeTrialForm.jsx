import { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'
import { insertLead } from '../lib/supabase.js'

export default function FreeTrialForm({ config }) {
  const ref = useReveal()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', goal: '', classInterest: '', preferredTime: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const goals = ['Lose Weight', 'Build Muscle', 'Improve Fitness', 'Train for Competition', 'Stress Relief', 'Just Explore']
  const times = ['Early Morning (5–8am)', 'Morning (8–12pm)', 'Afternoon (12–5pm)', 'Evening (5–9pm)']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await insertLead({
        gymName:       config.gymName,
        name:          form.name,
        email:         form.email,
        phone:         form.phone,
        goal:          form.goal,
        classInterest: form.classInterest,
        preferredTime: form.preferredTime,
        source:        'website_free_trial',
      })
    } catch (err) {
      console.error('Lead submit error:', err)
      // Don't block UX — still show success to user
    }
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section
      id="free-trial"
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* BG glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--primary)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div ref={ref} className="section-reveal">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                No Commitment
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-6">
              7 Days.<br />
              On Us.<br />
              <span style={{ color: 'var(--primary)' }}>No Excuses.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Try every class, use all the equipment, meet every coach. Seven full days of access — completely free. No credit card, no lock-in, no sales pressure.
            </p>
            <div className="space-y-4">
              {[
                'Unlimited access to all group classes',
                'Full gym floor access — weights, cardio, everything',
                'One free fitness assessment with a coach',
                'No commitment, cancel anytime after your trial',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary)' }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-sm border p-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-headline font-black text-2xl text-white uppercase mb-3">You're In!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We'll call you within 24 hours to confirm your trial start date. Get ready to work.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-headline font-bold text-xl text-white uppercase mb-6">
                  Claim Your Free Trial
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Full Name *</label>
                      <input type="text" required value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        placeholder="John Kamau"
                        className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Phone *</label>
                      <input type="tel" required value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="+254 700 000 000"
                        className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Email</label>
                    <input type="email" value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="john@email.com"
                      className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">What's your goal? *</label>
                    <select required value={form.goal}
                      onChange={e => setForm({...form, goal: e.target.value})}
                      className="w-full px-4 py-3 rounded-sm text-sm border focus:outline-none transition-colors appearance-none"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: form.goal ? 'white' : '#4b5563' }}
                    >
                      <option value="" disabled>Select your goal...</option>
                      {goals.map(g => <option key={g} value={g} className="text-white bg-gray-900">{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Class you'd like to try</label>
                    <select value={form.classInterest}
                      onChange={e => setForm({...form, classInterest: e.target.value})}
                      className="w-full px-4 py-3 rounded-sm text-sm border focus:outline-none transition-colors appearance-none"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: form.classInterest ? 'white' : '#4b5563' }}
                    >
                      <option value="">No preference / open gym</option>
                      {config.services.map(s => <option key={s.name} value={s.name} className="text-white bg-gray-900">{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Preferred training time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {times.map(t => (
                        <button key={t} type="button"
                          onClick={() => setForm({...form, preferredTime: t})}
                          className={`py-2.5 px-3 rounded-sm text-xs font-bold border transition-all text-left ${
                            form.preferredTime === t ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                          }`}
                          style={{
                            borderColor: form.preferredTime === t ? 'var(--primary)' : 'var(--border)',
                            backgroundColor: form.preferredTime === t ? 'rgba(255,78,26,0.1)' : 'transparent'
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-4 rounded-sm text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Start My Free Trial →'}
                  </button>

                  <p className="text-gray-600 text-xs text-center">
                    We'll call you within 24 hours to set your start date.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
