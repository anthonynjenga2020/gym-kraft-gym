import { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'

export default function FAQ({ config }) {
  const [openIndex, setOpenIndex] = useState(null)
  const headerRef = useReveal()
  const contentRef = useReveal()

  return (
    <section className="py-28 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
          {/* Left: header */}
          <div ref={headerRef} className="section-reveal lg:sticky lg:top-28">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                FAQ
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl text-white uppercase leading-tight mb-6">
              Questions?<br />
              <span style={{ color: 'var(--primary)' }}>We've got<br />answers.</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Can't find what you're looking for? Drop us a message and we'll get back to you within the hour.
            </p>
            <a href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-sm text-sm font-black uppercase tracking-widest border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'rgba(255,78,26,0.08)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Ask a Question →
            </a>
          </div>

          {/* Right: accordion */}
          <div ref={contentRef} className="section-reveal space-y-2">
            {config.faqs.map((faq, i) => (
              <div key={i}
                className="border rounded-sm overflow-hidden transition-all duration-200"
                style={{
                  borderColor: openIndex === i ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="font-headline font-bold text-base text-white uppercase tracking-wide">
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 transition-all duration-300 ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                    style={{
                      backgroundColor: openIndex === i ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16M4 12h16" />
                    </svg>
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-96' : 'max-h-0'
                }`}>
                  <p className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
