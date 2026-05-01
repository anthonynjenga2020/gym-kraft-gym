import { useReveal } from '../hooks/useReveal.js'

export default function About({ config }) {
  const textRef = useReveal()
  const imgRef = useReveal()

  const paragraphs = config.aboutDescription.split('\n\n').filter(Boolean)

  return (
    <section id="about" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text */}
          <div ref={textRef} className="section-reveal">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                Our Story
              </span>
            </div>

            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-8">
              {config.aboutTitle}
            </h2>

            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-gray-400 text-lg leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { icon: '✓', text: 'Professional Coaching' },
                { icon: '✓', text: 'Modern Equipment' },
                { icon: '✓', text: 'Supportive Community' },
                { icon: '✓', text: 'Flexible Membership' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-black text-sm" style={{ color: 'var(--primary)' }}>{item.icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <a
              href="#pricing"
              className="btn-primary inline-block mt-10 px-8 py-4 rounded-sm text-sm"
            >
              Start Your Journey
            </a>
          </div>

          {/* Image */}
          <div ref={imgRef} className="section-reveal stagger-2 relative">
            {/* Decorative frame */}
            <div
              className="absolute -top-4 -right-4 w-full h-full rounded-sm border-2 z-0"
              style={{ borderColor: 'var(--primary)', opacity: 0.3 }}
            />
            <div className="relative z-10 overflow-hidden rounded-sm">
              <img
                src={config.aboutImageUrl}
                alt="About Us"
                className="w-full aspect-[4/5] object-cover object-center filter grayscale hover:grayscale-0 transition-all duration-700"
              />
              {/* Overlay bar */}
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.95), transparent)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-white text-sm font-bold">5.0 Google Rating</span>
                  <span className="text-gray-400 text-xs">· 200+ reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
