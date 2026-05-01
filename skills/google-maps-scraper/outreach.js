// ============================================================
// Outreach Message Generator
//
// Generates personalized WhatsApp/email messages for each lead.
// Uses the Anthropic Claude API to write the message.
// Falls back to a template if no API key is set.
//
// Required env var (optional): ANTHROPIC_API_KEY
// ============================================================

/**
 * Generate a personalized outreach message for a gym lead.
 *
 * @param {object} lead - Scored lead from scorer.js
 * @param {string} [apiKey] - Anthropic API key (optional)
 * @returns {Promise<{ whatsapp: string, email: string, subject: string }>}
 */
export async function generateOutreach(lead, apiKey) {
  const context = buildContext(lead)

  if (apiKey) {
    try {
      return await generateWithClaude(context, apiKey)
    } catch (err) {
      console.warn('[outreach] Claude API failed, using template fallback:', err.message)
    }
  }

  return generateTemplate(context)
}

function buildContext(lead) {
  const websiteStatus = lead.website_status ?? (lead.has_website ? 'decent_site' : 'none')
  const hasWebsite    = lead.has_website && websiteStatus !== 'none' && websiteStatus !== 'broken'

  let websiteLine = ''
  if (!hasWebsite) {
    websiteLine = "don't have a website"
  } else if (websiteStatus === 'not_mobile_friendly') {
    websiteLine = 'have a website, but it doesn\'t work properly on phones'
  } else if (websiteStatus === 'basic_builder_site') {
    websiteLine = 'have a basic website that could be a lot more effective'
  } else if (websiteStatus === 'broken') {
    websiteLine = 'had a website but it\'s no longer working'
  } else if (websiteStatus === 'google_business_only') {
    websiteLine = 'only have a Google Business listing, not a proper website'
  } else {
    websiteLine = 'have a website'
  }

  return {
    gymName:     lead.gym_name,
    address:     lead.address ?? lead.neighborhood ?? 'Nairobi',
    neighborhood: lead.neighborhood ?? 'Nairobi',
    rating:      lead.rating,
    reviews:     lead.review_count,
    websiteLine,
    websiteUrl:  lead.website_url,
    hasWebsite,
  }
}

async function generateWithClaude(ctx, apiKey) {
  const prompt = `You are Anthony from Jenga Systems, a Nairobi-based digital agency that builds professional websites for gyms. Write a short, punchy WhatsApp message and a slightly longer email to reach out to a gym lead.

Tone: Direct, confident, no fluff. Slightly casual but professional. Kenya context (KES pricing). NO emojis unless very sparing.

Lead details:
- Gym name: ${ctx.gymName}
- Location: ${ctx.neighborhood}
- Google rating: ${ctx.rating ?? 'unknown'}
- Reviews: ${ctx.reviews ?? 0}
- Website situation: They ${ctx.websiteLine}

Rules:
- WhatsApp: Max 6 lines. Lead with the fact that you already built them a free demo. End with a CTA to book a 10-min call.
- Email: 6–8 lines. Subject line required. Mention the specific problem.
- Pricing: Website is FREE to build. Just Ksh 2,000/month for hosting and maintenance. No setup fee. No contract.
- Demo hook: You already built a demo for them at demo.jengasystems.online — mention this.
- CTA: 10-minute WhatsApp call to walk through the demo
- Do NOT sound like a bot or template. Sound like a real person who just found them on Google Maps.

Return ONLY a JSON object like this (no markdown, no explanation):
{
  "whatsapp": "the WhatsApp message here",
  "email": "the email body here",
  "subject": "the email subject line"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''

  // Strip markdown code blocks if present
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(clean)
}

function generateTemplate(ctx) {
  const whatsapp = [
    ctx.rating
      ? `Hey, came across ${ctx.gymName} on Google Maps — ${ctx.rating}★, ${ctx.reviews ?? 0} reviews. Solid gym.`
      : `Hey, came across ${ctx.gymName} on Google Maps.`,
    ``,
    ctx.hasWebsite
      ? `Noticed your website ${ctx.websiteLine} — most gym leads in Nairobi check online before visiting.`
      : `Noticed you ${ctx.websiteLine} — you're losing members who search Google before calling.`,
    ``,
    `I went ahead and built a free demo for ${ctx.gymName}: demo.jengasystems.online`,
    ``,
    `No setup cost — just Ksh 2,000/month for hosting and maintenance. Site live in 48 hours.`,
    ``,
    `Worth a 10-min call to walk you through it? — Anthony, Jenga Systems`,
  ].join('\n')

  const subject = ctx.hasWebsite
    ? `${ctx.gymName} — your website is costing you members`
    : `${ctx.gymName} — you're invisible online (free fix inside)`

  const email = [
    `Hi,`,
    ``,
    `Found ${ctx.gymName} on Google Maps — ${ctx.rating ? `${ctx.rating} stars, ${ctx.reviews} reviews. Clearly running a solid operation.` : 'looks like you\'ve built a solid gym.'}`,
    ``,
    `Noticed you ${ctx.websiteLine}. Gym leads in Nairobi are searching online before deciding where to sign up — every week without a proper site is members going to the gym down the road.`,
    ``,
    `I built a free demo for ${ctx.gymName} that you can see here: demo.jengasystems.online`,
    ``,
    `No setup fee. Just Ksh 2,000/month for hosting and maintenance — site goes live within 48 hours. If it doesn't bring you at least one new member, you're not out anything significant.`,
    ``,
    `Worth a 10-minute call to walk you through it? Just reply here or WhatsApp me directly.`,
    ``,
    `— Anthony Njenga`,
    `Jenga Systems | jengasystems.online`,
  ].join('\n')

  return { whatsapp, email, subject }
}

/**
 * Generate outreach messages for multiple leads.
 * Respects rate limits — 1 API call per second for Claude.
 */
export async function generateOutreachBatch(leads, apiKey) {
  const results = []

  for (const lead of leads) {
    const outreach = await generateOutreach(lead, apiKey)
    results.push({ ...lead, outreach })

    // Rate limit: 1 req/sec if using Claude
    if (apiKey) await new Promise(r => setTimeout(r, 1100))
  }

  return results
}
