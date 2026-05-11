import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ config }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname])

  const navLinks = [
    { label: 'About', href: '/#about' },
    { label: 'Classes', href: '/classes' },
    { label: 'Trainers', href: '/trainers' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Contact', href: '/#contact' },
  ]

  const isExternal = (href) => href.startsWith('/#')

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'navbar-scrolled' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.gymName} className="h-10 w-auto" />
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center font-headline font-black text-white text-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {config.gymName.charAt(0)}
              </div>
              <span className="font-headline font-bold text-white text-lg tracking-wider uppercase">
                {config.gymName}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            isExternal(link.href) ? (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white text-sm font-medium uppercase tracking-widest transition-colors duration-200"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium uppercase tracking-widest transition-colors duration-200 ${
                  location.pathname === link.href ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* CTA — Phone number */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`tel:${config.phone}`}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-sm border border-white/15 text-white text-sm font-bold uppercase tracking-widest hover:border-white/35 hover:bg-white/5 transition-all duration-200 group"
          >
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            </span>
            {config.phone}
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-96' : 'max-h-0'}`}
        style={{ backgroundColor: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)' }}
      >
        <div className="px-6 pb-8 pt-4 flex flex-col gap-6">
          {navLinks.map((link) =>
            isExternal(link.href) ? (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="text-gray-300 hover:text-white text-base font-medium uppercase tracking-widest transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={link.href}
                className="text-gray-300 hover:text-white text-base font-medium uppercase tracking-widest transition-colors">
                {link.label}
              </Link>
            )
          )}
          <a href={`tel:${config.phone}`} onClick={() => setMenuOpen(false)}
            className="btn-primary px-6 py-4 rounded-sm text-sm text-center mt-2 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Call {config.phone}
          </a>
        </div>
      </div>
    </nav>
  )
}
