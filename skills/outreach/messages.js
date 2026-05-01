// ============================================================
// JENGA SYSTEMS — Outreach Message Templates
//
// Five-touch WhatsApp sequence + call script hooks.
// Pricing: FREE website build. Ksh 2,000/month (hosting + maintenance).
// Primary channel: WhatsApp.
// Goal of first touch: book a 10-min video call to show the demo.
// ============================================================

/**
 * Generate the full outreach sequence for a lead.
 *
 * @param {object} lead - Lead record from Supabase
 * @param {string} demoUrl - Preview URL for their demo site
 * @returns {object} { step1, step2, step3, step4, step5 }
 */
export function generateSequence(lead, demoUrl) {
  const ctx = buildContext(lead, demoUrl)
  return {
    step1: initialMessage(ctx),      // Day 0  — cold intro + demo link
    step2: followUp1(ctx),           // Day 3  — soft nudge
    step3: followUp2(ctx),           // Day 7  — ROI math
    step4: followUp3(ctx),           // Day 14 — case study hook
    step5: lastAttempt(ctx),         // Day 21 — final message, leave door open
  }
}

/**
 * Get just one specific step.
 */
export function getStep(lead, demoUrl, step) {
  const all = generateSequence(lead, demoUrl)
  return all[`step${step}`] ?? null
}

// ─── Context builder ──────────────────────────────────────────
function buildContext(lead, demoUrl) {
  const hasWebsite   = lead.has_website && lead.website_status !== 'none' && lead.website_status !== 'broken'
  const websiteIssue = websiteIssueLine(lead.website_status)
  const rating       = lead.rating ? `${lead.rating}★` : null
  const reviews      = lead.review_count > 0 ? `${lead.review_count} reviews` : null
  const socialProof  = [rating, reviews].filter(Boolean).join(', ')
  const neighborhood = lead.neighborhood ?? 'Nairobi'

  // ROI math: average Nairobi gym membership = Ksh 3,500/month
  // One new member = 3,500 KES. Our fee = 2,000 KES.
  const membershipValue = 3500

  return {
    gymName:       lead.gym_name,
    phone:         lead.phone,
    neighborhood,
    socialProof,
    hasWebsite,
    websiteIssue,
    demoUrl,
    membershipValue,
    roiMonths:     Math.ceil(2000 / membershipValue * 12), // months to break even per member
  }
}

function websiteIssueLine(status) {
  switch (status) {
    case 'none':               return "don't have a website"
    case 'broken':             return 'had a website but it\'s currently down'
    case 'google_business_only': return 'only have a Google listing, not a proper website'
    case 'not_mobile_friendly':  return 'have a website but it doesn\'t load properly on phones'
    case 'basic_builder_site':   return 'have a basic website that\'s not doing much for you'
    default:                   return 'have a website'
  }
}

// ─── Step 1: Initial cold message ─────────────────────────────
// Day 0. Hook: demo is already built. Goal: get a reply / book call.
function initialMessage(ctx) {
  const opening = ctx.socialProof
    ? `Came across ${ctx.gymName} on Google Maps — ${ctx.socialProof}. Clearly running a solid operation.`
    : `Came across ${ctx.gymName} on Google Maps.`

  const websiteLine = ctx.hasWebsite
    ? `Noticed your website ${ctx.websiteIssue}. Most gym leads in Nairobi now check online before they visit.`
    : `Noticed you ${ctx.websiteIssue}. You're losing members who check Google before they call.`

  return [
    `Hey, ${opening}`,
    ``,
    websiteLine,
    ``,
    `I went ahead and built a free demo for ${ctx.gymName}:`,
    `👉 ${ctx.demoUrl}`,
    ``,
    `No setup cost — just Ksh 2,000/month for hosting and maintenance. Site goes live in 48 hours after you fill a quick form.`,
    ``,
    `Worth a 10-min call to walk you through it?`,
    ``,
    `— Anthony | Jenga Systems`,
    `jengasystems.online`,
  ].join('\n')
}

// ─── Step 2: Follow-up 1 ─────────────────────────────────────
// Day 3. Soft nudge. Don't re-pitch — just re-surface the demo.
function followUp1(ctx) {
  return [
    `Hey, just checking if you got a chance to see the demo I sent for ${ctx.gymName}:`,
    `👉 ${ctx.demoUrl}`,
    ``,
    `Any thoughts? Can walk you through it in 10 minutes whenever works for you.`,
    ``,
    `— Anthony`,
  ].join('\n')
}

// ─── Step 3: Follow-up 2 ─────────────────────────────────────
// Day 7. ROI math. Make 2,000 KES feel like a no-brainer.
function followUp2(ctx) {
  return [
    `Hey ${ctx.gymName}, quick one —`,
    ``,
    `Average gym membership in Nairobi is around Ksh 3,500/month. Our fee is Ksh 2,000/month.`,
    ``,
    `If the website brings you even one new member, you've already made your money back — every month after that is pure profit.`,
    ``,
    `If it doesn't get you a single new member I'll probably go play in traffic 😄`,
    ``,
    `Still happy to do a quick 10-min demo whenever works: ${ctx.demoUrl}`,
    ``,
    `— Anthony | Jenga Systems`,
  ].join('\n')
}

// ─── Step 4: Follow-up 3 ─────────────────────────────────────
// Day 14. Case study hook — break the silence with proof/value.
function followUp3(ctx) {
  return [
    `Hey, wanted to share something that might be useful for you:`,
    ``,
    `A gym we worked with in ${ctx.neighborhood} had no online presence — 6 weeks after launching their site they started getting 3-5 new membership enquiries a week, all from Google.`,
    ``,
    `Your demo is still live if you want to check it out: ${ctx.demoUrl}`,
    ``,
    `Happy to show you exactly how it works on a 10-min call.`,
    ``,
    `— Anthony`,
  ].join('\n')
}

// ─── Step 5: Last attempt ─────────────────────────────────────
// Day 21. Low pressure. Leave the door open.
function lastAttempt(ctx) {
  return [
    `Hey, last message I promise 🙏`,
    ``,
    `The free demo I built for ${ctx.gymName} is still up: ${ctx.demoUrl}`,
    ``,
    `Ksh 2,000/month. No setup fee. Cancel anytime.`,
    ``,
    `If the timing isn't right now, no stress — feel free to reach out whenever. Always happy to help.`,
    ``,
    `— Anthony | Jenga Systems`,
    `jengasystems.online`,
  ].join('\n')
}

// ─── After-call thank you (send immediately post-call) ────────
export function afterCallMessage(ctx) {
  return [
    `Hey, great chatting just now!`,
    ``,
    `Here's the demo link again: ${ctx.demoUrl}`,
    ``,
    `When you're ready to go live, just fill this quick form and we'll have your site up in 48 hours:`,
    `👉 jengasystems.online/onboarding`,
    ``,
    `Looking forward to working with ${ctx.gymName}!`,
    ``,
    `— Anthony`,
  ].join('\n')
}

export { buildContext }
