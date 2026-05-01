// ============================================================
// JENGA SYSTEMS — Template Variant Themes
//
// Each variant defines:
//   css       — CSS variables injected onto :root
//   font      — Google Fonts URL to load dynamically
//   bodyClass — Class added to <body> for variant-specific CSS overrides
//
// The primaryColor in gym.config.json overrides `css.primary` unless
// the theme defines `lockPrimary: true`.
// ============================================================

export const themes = {

  // ──────────────────────────────────────────────────────────
  // V1 — DARK POWER
  // The default. Black, bold, high-contrast. Orange aggression.
  // Font: Space Grotesk (already loaded in index.html)
  // ──────────────────────────────────────────────────────────
  V1: {
    name: 'Dark Power',
    css: {
      '--primary':        '#FF4E1A',
      '--primary-dark':   '#CC3E14',
      '--accent':         '#FFFFFF',
      '--bg':             '#0A0A0A',
      '--surface':        '#141414',
      '--border':         '#222222',
      '--font-headline':  "'Space Grotesk', sans-serif",
      '--font-body':      "'Inter', sans-serif",
      '--radius':         '2px',
      '--shadow-primary': '0 20px 60px rgba(255,78,26,0.2)',
    },
    font: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap',
    bodyClass: 'theme-v1',
  },

  // ──────────────────────────────────────────────────────────
  // V2 — CLEAN PRO
  // Deep charcoal, not pure black. Emerald green.
  // Rounded corners, subtle shadows, airy spacing.
  // Font: Plus Jakarta Sans — modern, professional, slightly rounded.
  // Best for: premium gyms, pilates, yoga, boutique studios.
  // ──────────────────────────────────────────────────────────
  V2: {
    name: 'Clean Pro',
    css: {
      '--primary':        '#10B981',
      '--primary-dark':   '#059669',
      '--accent':         '#FFFFFF',
      '--bg':             '#0E0E0E',
      '--surface':        '#1A1A1A',
      '--border':         '#2E2E2E',
      '--font-headline':  "'Plus Jakarta Sans', sans-serif",
      '--font-body':      "'Plus Jakarta Sans', sans-serif",
      '--radius':         '10px',
      '--shadow-primary': '0 20px 60px rgba(16,185,129,0.18)',
    },
    font: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    bodyClass: 'theme-v2',
  },

  // ──────────────────────────────────────────────────────────
  // V3 — ENERGY RUSH
  // Pure black, electric yellow/gold. Maximum energy.
  // Bold diagonal accents, wide condensed headlines.
  // Font: Barlow Condensed — tall, sporty, aggressive.
  // Best for: HIIT, crossfit, boxing, high-energy brands.
  // ──────────────────────────────────────────────────────────
  V3: {
    name: 'Energy Rush',
    css: {
      '--primary':        '#FACC15',
      '--primary-dark':   '#EAB308',
      '--accent':         '#000000',
      '--bg':             '#080808',
      '--surface':        '#111111',
      '--border':         '#1E1E1E',
      '--font-headline':  "'Barlow Condensed', sans-serif",
      '--font-body':      "'Barlow', sans-serif",
      '--radius':         '0px',
      '--shadow-primary': '0 20px 60px rgba(250,204,21,0.2)',
    },
    font: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap',
    bodyClass: 'theme-v3',
  },

  // ──────────────────────────────────────────────────────────
  // V4 — URBAN GRIT
  // Warm dark (brown-black tones). Amber/gold.
  // Industrial, raw, street-level. Grain texture.
  // Font: Oswald — tall, condensed, muscular.
  // Best for: boxing gyms, martial arts, street workout.
  // ──────────────────────────────────────────────────────────
  V4: {
    name: 'Urban Grit',
    css: {
      '--primary':        '#D97706',
      '--primary-dark':   '#B45309',
      '--accent':         '#FFFFFF',
      '--bg':             '#100E0B',
      '--surface':        '#1A1713',
      '--border':         '#2A2520',
      '--font-headline':  "'Oswald', sans-serif",
      '--font-body':      "'Inter', sans-serif",
      '--radius':         '0px',
      '--shadow-primary': '0 20px 60px rgba(217,119,6,0.2)',
    },
    font: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap',
    bodyClass: 'theme-v4',
  },

  // ──────────────────────────────────────────────────────────
  // V5 — MIDNIGHT BLUE
  // Deep navy-black. Cyan/electric blue.
  // Modern, tech-forward, premium.
  // Font: DM Sans — clean, geometric, contemporary.
  // Best for: modern fitness studios, tech-forward gyms, recovery/wellness.
  // ──────────────────────────────────────────────────────────
  V5: {
    name: 'Midnight Blue',
    css: {
      '--primary':        '#06B6D4',
      '--primary-dark':   '#0891B2',
      '--accent':         '#FFFFFF',
      '--bg':             '#070B14',
      '--surface':        '#0D1526',
      '--border':         '#1A2744',
      '--font-headline':  "'DM Sans', sans-serif",
      '--font-body':      "'DM Sans', sans-serif",
      '--radius':         '6px',
      '--shadow-primary': '0 20px 60px rgba(6,182,212,0.2)',
    },
    font: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap',
    bodyClass: 'theme-v5',
  },
}

/**
 * Apply a theme to the document.
 * Call this from main.jsx before rendering the app.
 *
 * @param {string} variant   — 'V1'|'V2'|'V3'|'V4'|'V5'
 * @param {string} primaryOverride — hex color from gym.config.json
 */
export function applyTheme(variant, primaryOverride) {
  const theme = themes[variant] ?? themes.V1
  const root  = document.documentElement
  const body  = document.body

  // 1. Set CSS variables
  Object.entries(theme.css).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // 2. Override primary color with gym's brand color (unless locked)
  if (primaryOverride && !theme.lockPrimary) {
    root.style.setProperty('--primary', primaryOverride)
    // Auto-darken by ~15% for hover states
    root.style.setProperty('--primary-dark', darken(primaryOverride, 0.15))
    // Update shadow colour
    const rgb = hexToRgb(primaryOverride)
    if (rgb) {
      root.style.setProperty('--shadow-primary', `0 20px 60px rgba(${rgb},0.2)`)
    }
  }

  // 3. Add body class for variant-specific CSS
  body.classList.remove('theme-v1','theme-v2','theme-v3','theme-v4','theme-v5')
  body.classList.add(theme.bodyClass)

  // 4. Dynamically load the variant font (skip if already loaded)
  const linkId = `theme-font-${variant}`
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link')
    link.id   = linkId
    link.rel  = 'stylesheet'
    link.href = theme.font
    document.head.appendChild(link)
  }
}

// ── Helpers ───────────────────────────────────────────────────

/** Darken a hex color by a fraction (0–1) */
function darken(hex, amount) {
  const rgb = parseHex(hex)
  if (!rgb) return hex
  const [r, g, b] = rgb.map(c => Math.max(0, Math.round(c * (1 - amount))))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

/** Return "r,g,b" string from hex, or null */
function hexToRgb(hex) {
  const rgb = parseHex(hex)
  return rgb ? rgb.join(',') : null
}

function parseHex(hex) {
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    return clean.split('').map(c => parseInt(c + c, 16))
  }
  if (clean.length === 6) {
    return [
      parseInt(clean.slice(0,2), 16),
      parseInt(clean.slice(2,4), 16),
      parseInt(clean.slice(4,6), 16),
    ]
  }
  return null
}
