import { useReveal } from '../hooks/useReveal.js'

export default function CTA({ config }) {
  const ref = useReveal()

  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: 'var(--surface)' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
        }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div ref={ref} className="section-reveal relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
            Limited Spots Available
          </span>
          <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
        </div>

        <h2 className="font-headline font-black text-5xl sm:text-6xl lg:text-7xl text-white uppercase leading-tight mb-6">
          Your First Week.<br />
          <span style={{ color: 'var(--primary)' }}>On Us.</span>
        </h2>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Try any class, use all the equipment, meet the coaches — for 7 full days, completely free. No credit card, no pressure, no BS.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#free-trial"
            className="btn-primary px-10 py-5 rounded-sm text-base inline-block"
          >
            {config.trialCTA}
          </a>
          <a
            href="#contact"
            className="btn-outline px-10 py-5 rounded-sm text-base inline-block"
          >
            Ask a Question
          </a>
        </div>

        <p className="text-gray-600 text-xs mt-8 uppercase tracking-widest">
          No commitment required · Cancel anytime · M-Pesa accepted
        </p>
      </div>
    </section>
  )
}
