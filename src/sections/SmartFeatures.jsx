import { useReveal } from '../hooks/useReveal.js'

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
    color: '#25D366',
    label: 'Instant WhatsApp Booking',
    title: 'Book Classes in 30 Seconds',
    desc: "No apps to download, no forms to fill. Just WhatsApp us and you're booked. Get instant confirmation, class reminders, and follow-ups — all on the app you already use every day.",
    highlight: 'No app needed',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: '#FFB800',
    label: 'Review Automation',
    title: '5-Star Reviews on Autopilot',
    desc: 'After every milestone — first week done, 10th session, first month — we automatically ask your happy members to drop a Google review. More reviews. Better ranking. More new members finding you.',
    highlight: 'Google Maps #1',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    color: '#4C9FFF',
    label: 'Missed Call Text-Back',
    title: 'Never Lose a Lead to Voicemail',
    desc: "If a potential member calls and nobody picks up, they automatically get a WhatsApp message within 60 seconds: 'Hey! We missed your call at Ironclad. How can we help?' Most leads are won or lost in that first minute.",
    highlight: 'Responds in 60 sec',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: '#FF4E1A',
    label: 'Retention Campaigns',
    title: 'Keep Members Coming Back',
    desc: "One-click WhatsApp campaigns to inactive members, birthday messages, referral offers, and seasonal promos — sent automatically. Your members feel remembered. Your retention numbers reflect it.",
    highlight: 'One-click sends',
  },
]

export default function SmartFeatures({ config }) {
  const headerRef = useReveal()
  const gridRef = useReveal()

  return (
    <section
      className="py-28 lg:py-40 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Background accent */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 pointer-events-none"
        style={{ backgroundColor: 'var(--primary)' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal max-w-2xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              Smart Gym Technology
            </span>
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-6">
            The Digital Gym<br />
            <span style={{ color: 'var(--primary)' }}>Experience</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            We're not just a place to lift weights. We've built the tools to make your fitness journey seamless — from booking to billing to beating your personal best.
          </p>
        </div>

        {/* Feature grid */}
        <div ref={gridRef} className="section-reveal grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-sm p-8 border relative overflow-hidden card-hover"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: feature.color }}
              />

              {/* Icon + Label */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <span
                  className="text-xs font-black uppercase tracking-[0.2em]"
                  style={{ color: feature.color }}
                >
                  {feature.label}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-headline font-bold text-xl text-white uppercase mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {feature.desc}
              </p>

              {/* Highlight badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-widest"
                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: feature.color }} />
                {feature.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
