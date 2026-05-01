import { useReveal } from '../hooks/useReveal.js'

export default function Pricing({ config }) {
  const headerRef = useReveal()
  const cardsRef = useReveal()

  return (
    <section id="pricing" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              Membership Plans
            </span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-4">
            Invest in Yourself
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No hidden fees. No lock-in contracts. Cancel anytime. Just show up and do the work.
          </p>
        </div>

        {/* Plans */}
        <div ref={cardsRef} className={`section-reveal grid gap-6 ${config.membershipPlans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} max-w-5xl mx-auto`}>
          {config.membershipPlans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-sm border flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'scale-105 z-10 shadow-[0_0_80px_rgba(255,78,26,0.2)]'
                  : 'hover:border-primary/40'
              }`}
              style={{
                backgroundColor: plan.highlight ? 'var(--primary)' : 'var(--surface)',
                borderColor: plan.highlight ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-sm text-xs font-black uppercase tracking-widest text-white bg-black">
                  ★ {plan.badge}
                </div>
              )}

              <div className="p-8 flex-1">
                {/* Plan name */}
                <h3
                  className={`font-headline font-black text-2xl uppercase tracking-wide mb-2 ${plan.highlight ? 'text-white' : 'text-white'}`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-sm font-bold ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}>
                    {plan.currency}
                  </span>
                  <span className={`font-headline font-black text-5xl ${plan.highlight ? 'text-white' : 'text-white'}`}>
                    {plan.price.toLocaleString()}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-gray-500'}`}>
                    /{plan.period}
                  </span>
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full mb-6"
                  style={{ backgroundColor: plan.highlight ? 'rgba(255,255,255,0.2)' : 'var(--border)' }}
                />

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <svg
                        className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-white' : ''}`}
                        style={!plan.highlight ? { color: 'var(--primary)' } : {}}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span
                        className={`text-sm font-medium ${plan.highlight ? 'text-white/90' : 'text-gray-400'}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <a
                  href="#free-trial"
                  className={`block w-full py-4 text-center rounded-sm text-sm font-black uppercase tracking-widest transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-white text-black hover:bg-gray-100 hover:shadow-xl'
                      : 'border-2 text-white hover:bg-primary/10'
                  }`}
                  style={!plan.highlight ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
                >
                  Get Started →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-600 text-sm mt-10">
          All plans include access to the gym's facilities during operating hours. M-Pesa payments accepted.
        </p>
      </div>
    </section>
  )
}
