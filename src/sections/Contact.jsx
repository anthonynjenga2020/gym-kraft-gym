import { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'
import { insertContact } from '../lib/supabase.js'

export default function Contact({ config }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const headerRef = useReveal()
  const contentRef = useReveal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await insertContact({
        name:    form.name,
        phone:   form.phone,
        email:   form.email,
        message: form.message,
        source:  'website_contact',
      })
    } catch (err) {
      console.error('Contact submit error:', err)
    }
    setLoading(false)
    setSent(true)
    setForm({ name: '', phone: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              Find Us
            </span>
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight">
            Get in Touch
          </h2>
        </div>

        <div ref={contentRef} className="section-reveal grid lg:grid-cols-2 gap-12">
          {/* Left: Info + Form */}
          <div className="space-y-10">
            {/* Contact details */}
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  label: 'Location',
                  value: config.location,
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  label: 'Phone',
                  value: config.phone,
                  href: `tel:${config.phone}`,
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: 'Email',
                  value: config.email,
                  href: `mailto:${config.email}`,
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                  label: 'Hours',
                  value: (config.openingHours ?? 'Mon–Fri: 5:30am–9pm\nSat–Sun: 6am–7pm').replace(/\n/g, ' · '),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 rounded-sm border"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                >
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--primary)' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white text-sm font-medium hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white text-sm font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="p-8 rounded-sm border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
              <h3 className="font-headline font-bold text-xl text-white uppercase mb-6">
                Send Us a Message
              </h3>
              {sent ? (
                <div className="py-6">
                  {/* Success header */}
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary)' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-headline font-black text-white uppercase text-lg leading-tight">Message Received!</p>
                      <p className="text-gray-500 text-sm mt-0.5">Here's what happens next...</p>
                    </div>
                  </div>

                  {/* Automation pipeline — the money shot */}
                  <div className="space-y-1">
                    {[
                      {
                        step: '1',
                        color: 'var(--primary)',
                        title: 'Lead captured instantly',
                        desc: 'Your enquiry is saved in the gym\'s dashboard with your name, number, and message.',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        ),
                      },
                      {
                        step: '2',
                        color: '#25D366',
                        title: 'WhatsApp alert sent to owner',
                        desc: 'The gym manager gets an instant WhatsApp: "New enquiry from [your name] — tap to reply."',
                        icon: (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        ),
                      },
                      {
                        step: '3',
                        color: '#3B82F6',
                        title: 'Follow-up scheduled automatically',
                        desc: 'If there\'s no reply in 24 hours, the system flags the lead and sends a reminder to follow up.',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                      },
                    ].map((item, i, arr) => (
                      <div key={i} className="relative flex gap-4">
                        {/* Connector line */}
                        {i < arr.length - 1 && (
                          <div className="absolute left-5 top-10 w-px h-6 opacity-20" style={{ backgroundColor: item.color }} />
                        )}
                        {/* Icon circle */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${item.color}20`, color: item.color, border: `1px solid ${item.color}30` }}
                        >
                          {item.icon}
                        </div>
                        <div className="pb-5">
                          <p className="text-white text-sm font-bold leading-tight">{item.title}</p>
                          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-gray-600 text-xs">Powered by Jenga Systems</p>
                    <button onClick={() => setSent(false)} className="text-xs font-bold uppercase tracking-widest hover:text-white transition-colors" style={{ color: 'var(--primary)' }}>
                      Send another
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        placeholder="e.g. John Kamau"
                        className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="+254 700 000 000"
                        className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="john@email.com"
                      className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Message *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="I'm interested in the Pro membership..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors resize-none"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 rounded-sm text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending...
                      </>
                    ) : 'Send Message →'}
                  </button>
                  <p className="text-gray-600 text-xs text-center">
                    We respond within a few hours during operating hours.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right: Google Map */}
          <div className="rounded-sm overflow-hidden border h-full min-h-[400px] lg:min-h-0" style={{ borderColor: 'var(--border)' }}>
            {config.googleMapsEmbed ? (
              <iframe
                src={config.googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(0.85)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gym Location"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-600"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-center">
                  <p className="font-bold text-white text-sm">{config.gymName}</p>
                  <p className="text-xs mt-1">{config.location}</p>
                </div>
                <a
                  href={`https://maps.google.com?q=${encodeURIComponent(config.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
                  style={{ color: 'var(--primary)' }}
                >
                  Get Directions →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
