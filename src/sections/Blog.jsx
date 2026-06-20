import { useReveal } from '../hooks/useReveal.js'

export default function Blog({ config }) {
  const headerRef = useReveal()
  const cardsRef = useReveal()

  if (!config.blog || config.blog.length === 0) return null

  return (
    <section id="blog" className="py-28 lg:py-40" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Header */}
        <div ref={headerRef} className="section-reveal mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
              Latest News & Tips
            </span>
            <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
          </div>
          <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight mb-6">
            Our Blog
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Stay updated with the latest from Kraft Gym, training tips, and rules.
          </p>
        </div>

        {/* Blog Grid */}
        <div ref={cardsRef} className="section-reveal grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {config.blog.map((post, i) => (
            <div 
              key={i} 
              className="group rounded-lg overflow-hidden border border-gray-800 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_10px_40px_rgba(220,38,38,0.1)]"
              style={{ backgroundColor: 'var(--surface)' }}
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                    {post.category}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-xs text-gray-500 font-medium">
                    {post.date}
                  </span>
                </div>

                <h3 className="font-headline font-black text-xl text-white uppercase mb-3">
                  {post.title}
                </h3>

                <div className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 space-y-2">
                  {post.content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
                  ))}
                </div>

                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
                  style={{ color: 'var(--primary)' }}
                  onClick={e => e.preventDefault()}
                >
                  Read More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
