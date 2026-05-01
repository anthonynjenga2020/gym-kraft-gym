# Jenga Gym Template — V1

A config-driven gym website template built with React + Vite + Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

## Customizing for a New Gym

All content is driven by a single file: `src/config/gym.config.json`

Edit that file to change:
- Gym name, tagline, location, phone, email
- Colors (`primaryColor`, `accentColor`, `bgColor`, `surfaceColor`)
- Hero and about images
- Gallery images (6 URLs)
- Services (icons + descriptions)
- Trainers (name, specialty, experience, photo)
- Testimonials
- Membership plans and pricing
- Social links + WhatsApp number

## Build for Production

```bash
npm run build
```

Output goes to `dist/` — ready to deploy to Vercel.

## Sections

| Section | File |
|---------|------|
| Navbar (sticky, mobile) | `src/components/Navbar.jsx` |
| Hero (full-screen, animated) | `src/sections/Hero.jsx` |
| Stats bar | `src/sections/Stats.jsx` |
| About / Our Story | `src/sections/About.jsx` |
| Classes & Services | `src/sections/Classes.jsx` |
| Smart Features (WhatsApp, Reviews, Missed Call, Campaigns) | `src/sections/SmartFeatures.jsx` |
| Trainers | `src/sections/Trainers.jsx` |
| Gallery (lightbox) | `src/sections/Gallery.jsx` |
| Testimonials (Google-styled) | `src/sections/Testimonials.jsx` |
| Membership Pricing | `src/sections/Pricing.jsx` |
| Free Trial CTA | `src/sections/CTA.jsx` |
| Contact + Map + Form | `src/sections/Contact.jsx` |
| Footer | `src/components/Footer.jsx` |
| WhatsApp floating button | `src/components/WhatsAppButton.jsx` |
