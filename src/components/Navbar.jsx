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

        {/* CTA */}
        <div className="hidden lg:block">
          <a
            href="#free-trial"
            className="btn-primary px-6 py-3 rounded-sm text-sm"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault()
                document.getElementById('free-trial')?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            Free Trial
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
          <a href="/#free-trial" onClick={() => setMenuOpen(false)}
            className="btn-primary px-6 py-4 rounded-sm text-sm text-center mt-2">
            Free Trial
          </a>
        </div>
      </div>
    </nav>
  )
}
