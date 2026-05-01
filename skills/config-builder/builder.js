/**
 * builder.js
 * Pure function: intake_submissions row → gym.config.json object
 * No side effects, no network calls. Easy to unit-test.
 *
 * Produces the FULL config shape the template expects, including
 * defaults for schedule, faqs, stats, and other fields not
 * captured in the intake form (gym can update these later).
 */

/**
 * Slugify a gym name into a safe ID
 * "Iron Forge Gym - Westlands" → "iron-forge-gym-westlands"
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

// ── Service icon map (name → emoji) ──────────────────────────────────────────
const SERVICE_ICONS = {
  'weight training':    '🏋️',
  'cardio':             '🏃',
  'hiit':               '🔥',
  'yoga':               '🧘',
  'boxing':             '🥊',
  'mma':                '🥊',
  'martial arts':       '🥋',
  'cycling':            '🚴',
  'spin':               '🚴',
  'pilates':            '🤸',
  'crossfit':           '💪',
  'group classes':      '👥',
  'personal training':  '🎯',
  'zumba':              '💃',
  'swimming':           '🏊',
  'nutrition':          '🥗',
  'recovery':           '🛁',
}

function serviceIcon(name) {
  const key = name.toLowerCase()
  for (const [k, icon] of Object.entries(SERVICE_ICONS)) {
    if (key.includes(k)) return icon
  }
  return '💪'
}

/**
 * Parse services: handles array of strings or objects, or comma-string
 * Returns array of { name, icon, desc, image } objects
 */
function parseServices(raw) {
  const defaults = [
    { name: 'Weight Training', icon: '🏋️', desc: 'Fully equipped free weights and machines for all levels.', image: '' },
    { name: 'Cardio',          icon: '🏃', desc: 'Treadmills, bikes, and rowers available all day.',        image: '' },
    { name: 'HIIT Classes',    icon: '🔥', desc: 'High-intensity interval training for maximum results.',   image: '' },
    { name: 'Group Classes',   icon: '👥', desc: 'Energetic group sessions led by certified coaches.',      image: '' },
  ]

  if (!raw) return defaults

  // Array of objects already — merge with required fields
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
    return raw.map(s => ({
      name:  s.name  ?? 'Class',
      icon:  s.icon  ?? serviceIcon(s.name ?? ''),
      desc:  s.desc  ?? s.description ?? '',
      image: s.image ?? ''
    }))
  }

  // Array of strings
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
    return raw.filter(Boolean).map(name => ({
      name,
      icon:  serviceIcon(name),
      desc:  '',
      image: ''
    }))
  }

  // Comma-separated string
  if (typeof raw === 'string') {
    return raw.split(',').map(s => s.trim()).filter(Boolean).map(name => ({
      name,
      icon:  serviceIcon(name),
      desc:  '',
      image: ''
    }))
  }

  return defaults
}

/**
 * Parse membership plans — returns full object shape the Pricing section expects
 */
function parseMembershipPlans(raw) {
  if (!raw) return defaultPlans()

  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object') {
    return raw.map((p, i) => ({
      name:      p.name      ?? p.plan_name ?? `Plan ${i + 1}`,
      price:     Number(p.price ?? p.monthly_fee ?? 0),
      currency:  'KES',
      period:    'month',
      highlight: p.highlight ?? i === 1,  // default: middle plan is highlighted
      badge:     p.badge     ?? (i === 1 ? 'Most Popular' : undefined),
      features:  Array.isArray(p.features) ? p.features : []
    }))
  }

  if (typeof raw === 'string') {
    try { return parseMembershipPlans(JSON.parse(raw)) } catch { /* fall through */ }
  }

  return defaultPlans()
}

function defaultPlans() {
  return [
    {
      name: 'Basic', price: 2500, currency: 'KES', period: 'month', highlight: false,
      features: ['Full gym access', 'Locker room', '2 group classes/week']
    },
    {
      name: 'Pro', price: 4500, currency: 'KES', period: 'month', highlight: true, badge: 'Most Popular',
      features: ['Full gym access', 'Unlimited group classes', 'Locker + towel service', 'Monthly trainer check-in']
    },
    {
      name: 'Elite', price: 8000, currency: 'KES', period: 'month', highlight: false,
      features: ['Everything in Pro', '4 PT sessions/month', 'Nutrition consultation', 'Priority class booking']
    }
  ]
}

/** Parse gallery images */
function parseGallery(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return [] } }
  return []
}

/** Parse social links JSONB */
function parseSocialLinks(raw) {
  const phone    = typeof raw === 'object' && raw !== null ? raw.whatsapp ?? '' : ''
  const defaults = { instagram: '', facebook: '', whatsapp: '', tiktok: '' }
  if (!raw) return defaults
  if (typeof raw === 'string') { try { return { ...defaults, ...JSON.parse(raw) } } catch { return defaults } }
  if (typeof raw === 'object') return { ...defaults, ...raw }
  return defaults
}

/** Default weekly schedule (gym updates this later) */
function defaultSchedule() {
  return [
    { day: 'Monday',    classes: [{ time: '6:00 AM', name: 'Morning HIIT',   trainer: 'Head Trainer', duration: '45 min', level: 'All Levels', spots: 15 }, { time: '6:00 PM', name: 'Strength',        trainer: 'Head Trainer', duration: '60 min', level: 'All Levels', spots: 20 }] },
    { day: 'Tuesday',   classes: [{ time: '6:00 AM', name: 'Cardio Blast',   trainer: 'Head Trainer', duration: '45 min', level: 'All Levels', spots: 15 }, { time: '6:00 PM', name: 'HIIT',             trainer: 'Head Trainer', duration: '45 min', level: 'All Levels', spots: 15 }] },
    { day: 'Wednesday', classes: [{ time: '6:00 AM', name: 'Morning HIIT',   trainer: 'Head Trainer', duration: '45 min', level: 'All Levels', spots: 15 }, { time: '6:00 PM', name: 'Strength',        trainer: 'Head Trainer', duration: '60 min', level: 'All Levels', spots: 20 }] },
    { day: 'Thursday',  classes: [{ time: '6:00 AM', name: 'Yoga & Stretch', trainer: 'Head Trainer', duration: '60 min', level: 'All Levels', spots: 12 }, { time: '6:00 PM', name: 'HIIT',             trainer: 'Head Trainer', duration: '45 min', level: 'All Levels', spots: 15 }] },
    { day: 'Friday',    classes: [{ time: '6:00 AM', name: 'Morning HIIT',   trainer: 'Head Trainer', duration: '45 min', level: 'All Levels', spots: 15 }, { time: '6:00 PM', name: 'Friday Strength',  trainer: 'Head Trainer', duration: '60 min', level: 'All Levels', spots: 20 }] },
    { day: 'Saturday',  classes: [{ time: '7:00 AM', name: 'Weekend HIIT',   trainer: 'Head Trainer', duration: '60 min', level: 'All Levels', spots: 20 }, { time: '9:00 AM', name: 'Open Gym',         trainer: 'Head Trainer', duration: '120 min', level: 'All Levels', spots: 30 }] },
    { day: 'Sunday',    classes: [{ time: '9:00 AM', name: 'Recovery Yoga',  trainer: 'Head Trainer', duration: '60 min', level: 'All Levels', spots: 15 }] },
  ]
}

/** Default FAQs */
function defaultFaqs(gymName) {
  return [
    { q: 'Do I need fitness experience to join?',    a: `Not at all. ${gymName} welcomes members of every fitness level. Our trainers will set you up in the right class for you from day one.` },
    { q: 'What does the free trial include?',         a: '7 full days of unlimited access — any class, all equipment, open gym. No commitment required.' },
    { q: 'How do payments work?',                     a: 'We accept M-Pesa, bank transfer, and cash. Monthly memberships renew on your join date. Cancel anytime with 7 days notice.' },
    { q: 'Is there parking?',                         a: 'Yes, parking is available for members at the facility.' },
    { q: 'Can I freeze my membership?',               a: 'Yes. You can freeze for up to 60 days per year for travel or injury. Just let us know in advance.' },
    { q: 'Do you offer personal training?',           a: 'Yes. Our certified coaches offer one-on-one PT sessions. Ask at the front desk for availability and pricing.' },
  ]
}

/**
 * Main builder: intake row → full config object
 */
export function buildConfig(row) {
  const gymId   = slugify(row.gym_name)
  const gymName = row.gym_name ?? 'Your Gym'
  const phone   = row.phone   ?? ''
  const social  = parseSocialLinks(row.social_links)
  const waNum   = social.whatsapp?.replace(/\D/g, '') || phone.replace(/\D/g, '')

  return {
    // ── Identity ─────────────────────────────────────────────────────────────
    gymId,
    gymName,
    tagline:         row.tagline    ?? 'Train Hard. Live Strong.',
    subTagline:      row.subTagline ?? `${gymName} — where results happen.`,
    ownerName:       row.owner_name ?? '',

    // ── Contact ───────────────────────────────────────────────────────────────
    phone,
    email:           row.email      ?? '',
    location:        row.location   ?? 'Nairobi, Kenya',
    googleMapsEmbed: row.google_maps_embed ?? row.google_maps_link ?? '',

    // ── Media ─────────────────────────────────────────────────────────────────
    logoUrl:         row.logo_url       ?? '',
    heroImageUrl:    row.hero_image_url ?? '',
    aboutImageUrl:   row.about_image_url ?? '',
    galleryImages:   parseGallery(row.gallery_urls),

    // ── Theme ─────────────────────────────────────────────────────────────────
    primaryColor:    row.primary_color   ?? '#FF4E1A',
    accentColor:     row.accent_color    ?? '#FFFFFF',
    templateVariant: row.template_variant ?? 'V1',

    // ── Stats (displayed in hero/stats bar) ───────────────────────────────────
    stats: row.stats ?? [
      { value: '500+', label: 'Active Members' },
      { value: '10+',  label: 'Certified Trainers' },
      { value: '5★',   label: 'Google Rating' },
      { value: '20+',  label: 'Classes / Week' },
    ],

    // ── About section ─────────────────────────────────────────────────────────
    aboutTitle:       row.about_title       ?? `Built for People Who Are Serious About Results.`,
    aboutDescription: row.about_description ?? `${gymName} was built for people who want real results without the nonsense. Whether you're just starting out or training for competition — you belong here.\n\nWe're Nairobi's no-excuse gym. Show up, put in the work, leave better than you came in.`,

    // ── Services / Classes ────────────────────────────────────────────────────
    services:  parseServices(row.services),

    // ── Schedule ──────────────────────────────────────────────────────────────
    schedule: Array.isArray(row.schedule) && row.schedule.length > 0
      ? row.schedule
      : defaultSchedule(),

    // ── Programs ──────────────────────────────────────────────────────────────
    programs: Array.isArray(row.programs) && row.programs.length > 0
      ? row.programs
      : [],

    // ── Transformations ───────────────────────────────────────────────────────
    transformations: Array.isArray(row.transformations) && row.transformations.length > 0
      ? row.transformations
      : [],

    // ── Trainers ──────────────────────────────────────────────────────────────
    trainers: Array.isArray(row.trainers) && row.trainers.length > 0
      ? row.trainers
      : [],

    // ── Testimonials ─────────────────────────────────────────────────────────
    testimonials: Array.isArray(row.testimonials) && row.testimonials.length > 0
      ? row.testimonials
      : [],

    // ── Membership Pricing ───────────────────────────────────────────────────
    membershipPlans: parseMembershipPlans(row.membership_plans),

    // ── FAQs ─────────────────────────────────────────────────────────────────
    faqs: Array.isArray(row.faqs) && row.faqs.length > 0
      ? row.faqs
      : defaultFaqs(gymName),

    // ── Social & WhatsApp ────────────────────────────────────────────────────
    socialLinks:      social,
    whatsappNumber:   waNum,
    whatsappMessage:  `Hi! I'd like to know more about joining ${gymName}.`,

    // ── CTAs ─────────────────────────────────────────────────────────────────
    trialCTA: row.trial_cta ?? 'Claim Your Free 7-Day Trial',

    // ── Payment ───────────────────────────────────────────────────────────────
    paystackPublicKey: row.paystack_public_key ?? process.env.PAYSTACK_PUBLIC_KEY ?? '',

    // ── Pipeline metadata ─────────────────────────────────────────────────────
    supabaseRowId:   row.id ?? '',
    deployedUrl:     '',
    vercelProjectId: '',

    // ── Build timestamp ───────────────────────────────────────────────────────
    generatedAt: new Date().toISOString()
  }
}
