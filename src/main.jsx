import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import config from './config/gym.config.json'
import { applyTheme } from './themes/themes.js'

// Apply the full theme (colors + fonts + body class) before render
// This reads config.templateVariant (V1–V5) and config.primaryColor
applyTheme(config.templateVariant ?? 'V1', config.primaryColor)

// ─────────────────────────────────────────────────────────────
// Config-driven SEO — title, description, Open Graph, canonical
// ─────────────────────────────────────────────────────────────
const siteUrl   = config.deployedUrl || window.location.origin
const siteName  = config.gymName
const siteDesc  = config.seoDescription || `${config.gymName} — ${config.tagline}. ${config.location}.`
const heroImage = config.heroImageUrl || ''

// Helper: upsert a <meta> tag
function setMeta(selector, attr, value) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

// Title
document.title = `${siteName} | ${config.tagline ?? 'Gym & Fitness Center'} — ${config.location ?? 'Nairobi'}`

// Standard meta
setMeta('meta[name="description"]',        'content',  siteDesc)
setMeta('meta[name="keywords"]',           'name',     'keywords')
document.querySelector('meta[name="keywords"]')?.setAttribute('content',
  `gym, fitness, ${config.location}, ${config.gymName}, ${(config.services ?? []).map(s => s.name ?? s).join(', ')}`
)

// Open Graph
setMeta('meta[property="og:type"]',        'property', 'og:type')
setMeta('meta[property="og:title"]',       'property', 'og:title')
setMeta('meta[property="og:description"]', 'property', 'og:description')
setMeta('meta[property="og:image"]',       'property', 'og:image')
setMeta('meta[property="og:url"]',         'property', 'og:url')
setMeta('meta[property="og:site_name"]',   'property', 'og:site_name')
document.querySelector('meta[property="og:type"]').setAttribute('content',        'website')
document.querySelector('meta[property="og:title"]').setAttribute('content',       siteName)
document.querySelector('meta[property="og:description"]').setAttribute('content', siteDesc)
document.querySelector('meta[property="og:image"]').setAttribute('content',       heroImage)
document.querySelector('meta[property="og:url"]').setAttribute('content',         siteUrl)
document.querySelector('meta[property="og:site_name"]').setAttribute('content',   siteName)

// Twitter Card
setMeta('meta[name="twitter:card"]',        'name',    'twitter:card')
setMeta('meta[name="twitter:title"]',       'name',    'twitter:title')
setMeta('meta[name="twitter:description"]', 'name',    'twitter:description')
setMeta('meta[name="twitter:image"]',       'name',    'twitter:image')
document.querySelector('meta[name="twitter:card"]').setAttribute('content',        'summary_large_image')
document.querySelector('meta[name="twitter:title"]').setAttribute('content',       siteName)
document.querySelector('meta[name="twitter:description"]').setAttribute('content', siteDesc)
document.querySelector('meta[name="twitter:image"]').setAttribute('content',       heroImage)

// Canonical URL
let canonical = document.querySelector('link[rel="canonical"]')
if (!canonical) {
  canonical = document.createElement('link')
  canonical.rel = 'canonical'
  document.head.appendChild(canonical)
}
canonical.href = siteUrl

// JSON-LD structured data (LocalBusiness)
const schema = {
  "@context":       "https://schema.org",
  "@type":          "HealthClub",
  "name":           siteName,
  "description":    siteDesc,
  "url":            siteUrl,
  "image":          heroImage,
  "telephone":      config.phone,
  "email":          config.email,
  "address": {
    "@type":           "PostalAddress",
    "streetAddress":   config.location,
    "addressCountry":  "KE"
  },
  "sameAs": [
    config.socialLinks?.instagram,
    config.socialLinks?.facebook,
  ].filter(Boolean)
}
const ldScript = document.createElement('script')
ldScript.type        = 'application/ld+json'
ldScript.textContent = JSON.stringify(schema)
document.head.appendChild(ldScript)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
