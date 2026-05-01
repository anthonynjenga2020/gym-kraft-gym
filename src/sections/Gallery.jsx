import { useState } from 'react'
import { useReveal } from '../hooks/useReveal.js'

export default function Gallery({ config }) {
  const [lightbox, setLightbox] = useState(null)
  const headerRef = useReveal()
  const gridRef = useReveal()

  const layouts = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
  ]

  return (
    <section
      id="gallery"
      className="py-28 lg:py-40"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div ref={headerRef} className="section-reveal flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10" style={{ backgroundColor: 'var(--primary)' }} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
                The Space
              </span>
            </div>
            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl text-white uppercase leading-tight">
              Our Gym
            </h2>
          </div>
          <p className="text-gray-500 max-w-sm lg:text-right">
            State-of-the-art equipment. Clean facilities. A space that makes you actually want to show up.
          </p>
        </div>

        {/* Gallery Grid */}
        <div
          ref={gridRef}
          className="section-reveal grid grid-cols-2 lg:grid-cols-4 grid-rows-3 gap-3 h-[600px] lg:h-[700px]"
        >
          {config.galleryImages.map((img, i) => (
            <div
              key={i}
              className={`${layouts[i] || 'col-span-1 row-span-1'} overflow-hidden rounded-sm cursor-pointer group relative`}
              onClick={() => setLightbox(img)}
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Gallery"
            className="max-w-4xl w-full max-h-[85vh] object-contain rounded-sm"
          />
          <button
            className="absolute top-6 right-6 text-white w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  )
}
