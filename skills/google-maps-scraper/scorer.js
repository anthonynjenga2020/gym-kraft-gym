// ============================================================
// Lead Scorer
//
// Scores each gym lead from 1–10.
// Higher score = better prospect = more likely to pay for a site.
//
// Scoring rubric:
//   No website at all          → 10  (easiest sell)
//   Broken / 404 website       → 9   (they tried, it failed)
//   Very old / not mobile      → 7   (has site, but bad)
//   Basic site (no React/WP)   → 5   (some effort, still improvable)
//   Decent mobile site         → 2   (probably not interested)
//   Google Business only       → 8   (just a GMB, no real site)
//
// Also boosts score based on:
//   +1 if rating >= 4.0 (good business, worth investing)
//   +1 if review_count >= 50 (established gym)
// ============================================================

const TIMEOUT_MS = 8000

/**
 * Score a lead based on their website quality.
 * Does a quick HTTP check if they have a website.
 *
 * @param {object} lead - Normalized lead from scraper.js
 * @returns {Promise<{ score: number, websiteStatus: string, notes: string }>}
 */
export async function scoreLead(lead) {
  let score       = 0
  let websiteStatus = 'none'
  let notes       = ''

  // ── Base score from website presence ──────────────────────
  if (!lead.has_website || !lead.website_url) {
    score         = 10
    websiteStatus = 'none'
    notes         = 'No website — best lead. Easy pitch.'

  } else {
    // Check if it's just a Google Business link (not a real site)
    if (isGoogleBusinessOnly(lead.website_url)) {
      score         = 8
      websiteStatus = 'google_business_only'
      notes         = 'Only has Google Business, no real website.'

    } else {
      // Fetch the website and assess quality
      const check = await checkWebsite(lead.website_url)

      if (!check.reachable) {
        score         = 9
        websiteStatus = 'broken'
        notes         = `Website unreachable: ${check.error}`

      } else if (!check.hasMobileViewport) {
        score         = 7
        websiteStatus = 'not_mobile_friendly'
        notes         = 'Site exists but has no mobile viewport — old/bad site.'

      } else if (check.isWordPress || check.isWix || check.isBuilderSite) {
        score         = 5
        websiteStatus = 'basic_builder_site'
        notes         = `Has a basic ${check.builderType} site — improvable.`

      } else {
        score         = 2
        websiteStatus = 'decent_site'
        notes         = 'Has a decent website. Low priority.'
      }
    }
  }

  // ── Bonus points ────────────────────────────────────────────
  if (lead.rating && lead.rating >= 4.0) {
    score = Math.min(10, score + 1)
    notes += ' High-rated business.'
  }
  if (lead.review_count >= 50) {
    score = Math.min(10, score + 1)
    notes += ' Established (50+ reviews).'
  }

  return {
    score:         Math.max(1, Math.min(10, score)),
    websiteStatus,
    notes: notes.trim(),
  }
}

/**
 * Quick website check — is it reachable? Does it have mobile viewport?
 * Times out after TIMEOUT_MS to avoid hanging on slow sites.
 */
async function checkWebsite(url) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JengaSystems/1.0; +https://jengasystems.co.ke)',
      },
      redirect: 'follow',
    })
    clearTimeout(timer)

    if (!res.ok) {
      return { reachable: false, error: `HTTP ${res.status}` }
    }

    const html = await res.text()
    const lower = html.toLowerCase()

    const hasMobileViewport = lower.includes('name="viewport"') ||
                               lower.includes("name='viewport'")

    const isWordPress = lower.includes('wp-content') ||
                        lower.includes('wordpress')

    const isWix       = lower.includes('wix.com') ||
                        lower.includes('wixsite')

    const isSquarespace = lower.includes('squarespace')
    const isWeebly      = lower.includes('weebly')
    const isBlogspot    = lower.includes('blogspot')

    const isBuilderSite = isWix || isSquarespace || isWeebly || isBlogspot

    let builderType = 'custom'
    if (isWordPress) builderType = 'WordPress'
    else if (isWix) builderType = 'Wix'
    else if (isSquarespace) builderType = 'Squarespace'
    else if (isWeebly) builderType = 'Weebly'
    else if (isBlogspot) builderType = 'Blogspot'

    return {
      reachable: true,
      hasMobileViewport,
      isWordPress,
      isWix,
      isBuilderSite,
      builderType,
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      return { reachable: false, error: 'Timeout' }
    }
    return { reachable: false, error: String(err.message ?? err) }
  }
}

function isGoogleBusinessOnly(url) {
  return url.includes('business.google.com') ||
         url.includes('g.co/kgs') ||
         url.includes('maps.google.com')
}

/**
 * Batch score an array of leads concurrently (max 5 at a time to avoid hammering sites).
 */
export async function scoreLeads(leads) {
  const results = []
  const batchSize = 5

  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    const scored = await Promise.all(
      batch.map(async lead => {
        const { score, websiteStatus, notes } = await scoreLead(lead)
        return { ...lead, lead_score: score, website_status: websiteStatus, notes }
      })
    )
    results.push(...scored)
    // Brief pause between batches
    if (i + batchSize < leads.length) {
      await sleep(500)
    }
  }

  return results
}

const sleep = ms => new Promise(r => setTimeout(r, ms))
