import { useReveal } from '../hooks/useReveal.js'

export default function Events({ config }) {
  const headerRef = useReveal()
  const imageRef = useReveal()

  return (
    <section id="events" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Header */}
        <div ref={headerRef} className="section-reveal mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              Upcoming Events
            </span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-6">
            Don't Miss Out
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Join us for our upcoming challenges, seminars, and community events. 
          </p>
        </div>

        {/* Poster Image */}
        <div ref={imageRef} className="section-reveal stagger-1 max-w-4xl mx-auto">
          <div className="relative rounded-lg overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform hover:scale-[1.02] duration-500" style={{ borderColor: 'var(--border)' }}>
            <img 
              src={config.eventsImageUrl || '/kraft27.jpeg'} 
              alt="Upcoming Event Poster" 
              className="w-full h-auto object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  )
}
