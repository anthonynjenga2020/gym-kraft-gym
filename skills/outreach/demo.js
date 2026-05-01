// ============================================================
// Demo URL Generator
//
// Generates a preview URL for a gym lead using the deployed
// demo site at demo.jengasystems.online.
//
// The demo site is just the V1 gym template deployed once to Vercel.
// URL params inject the gym's name, area, and phone into the page.
//
// Setup: Deploy gym-template to Vercel and point
//        demo.jengasystems.online at it. That's it.
// ============================================================

const DEMO_BASE_URL = process.env.DEMO_BASE_URL ?? 'https://demo.jengasystems.online'

/**
 * Generate a demo preview URL for a lead.
 * Encodes gym name, area, and phone as query params.
 *
 * @param {object} lead
 * @returns {string} Full demo URL
 */
export function generateDemoUrl(lead) {
  const params = new URLSearchParams()

  if (lead.gym_name)    params.set('gym',   lead.gym_name)
  if (lead.neighborhood) params.set('area',  lead.neighborhood)
  if (lead.phone)        params.set('phone', lead.phone)
  if (lead.rating)       params.set('rating', String(lead.rating))

  return `${DEMO_BASE_URL}?${params.toString()}`
}

/**
 * Generate a short demo URL (no params) — just shows the generic demo.
 * Use this when you want a cleaner-looking link.
 */
export function genericDemoUrl() {
  return DEMO_BASE_URL
}

/**
 * Print a summary of the demo URL and what it will show.
 */
export function describeDemoUrl(lead, url) {
  console.log(`\n🌐 Demo URL for ${lead.gym_name}:`)
  console.log(`   ${url}`)
  console.log(`   (Shows template with: name="${lead.gym_name}", area="${lead.neighborhood ?? 'Nairobi'}", phone="${lead.phone ?? 'N/A'}")`)
}
