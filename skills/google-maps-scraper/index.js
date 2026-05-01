#!/usr/bin/env node
// ============================================================
// JENGA SYSTEMS — Google Maps Gym Lead Scraper
//
// Usage:
//   node index.js                         Run all neighborhoods
//   node index.js --tier1                 Run Tier 1 only (faster, 9 areas)
//   node index.js --hood "Westlands"      Run one neighborhood
//   node index.js --report                Print weekly leads report
//   node index.js --outreach              Generate outreach for top leads
//   node index.js --outreach --limit 5    Generate for top 5 leads only
//
// Required env vars (in .env file):
//   GOOGLE_PLACES_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Optional:
//   ANTHROPIC_API_KEY   (enables AI-written outreach messages)
// ============================================================

import { config } from 'dotenv'
import { searchGyms, normalizeLead } from './scraper.js'
import { scoreLeads } from './scorer.js'
import { generateOutreachBatch } from './outreach.js'
import { upsertLeads, getExistingLeadKeys, getTopLeads, getLeadsSummary } from './supabase.js'
import { NEIGHBORHOODS, TIER_1 } from './neighborhoods.js'

config() // Load .env

// ─── ENV validation ───────────────────────────────────────────
const PLACES_KEY    = process.env.GOOGLE_PLACES_API_KEY
const SUPABASE_URL  = process.env.SUPABASE_URL
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY // optional

function validateEnv() {
  const missing = []
  if (!PLACES_KEY)   missing.push('GOOGLE_PLACES_API_KEY')
  if (!SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!SUPABASE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (missing.length) {
    console.error(`\n❌ Missing env vars: ${missing.join(', ')}`)
    console.error('   Add them to skills/google-maps-scraper/.env\n')
    process.exit(1)
  }
}

// ─── CLI arg parsing ──────────────────────────────────────────
const args    = process.argv.slice(2)
const isTier1 = args.includes('--tier1')
const isReport = args.includes('--report')
const isOutreach = args.includes('--outreach')
const hoodArg = args.find((_, i) => args[i - 1] === '--hood')
const limitArg = parseInt(args.find((_, i) => args[i - 1] === '--limit') ?? '20')

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('\n🏋️  JENGA SYSTEMS — Gym Lead Scraper\n')

  // ── Report mode ──
  if (isReport) {
    validateEnv()
    await printReport()
    return
  }

  // ── Outreach mode ──
  if (isOutreach) {
    validateEnv()
    await generateOutreachMessages(limitArg)
    return
  }

  // ── Scrape mode ──
  validateEnv()

  let neighborhoods = NEIGHBORHOODS
  if (isTier1) {
    neighborhoods = TIER_1
    console.log('📍 Running Tier 1 neighborhoods only (9 areas)\n')
  } else if (hoodArg) {
    const match = NEIGHBORHOODS.find(n => n.name.toLowerCase() === hoodArg.toLowerCase())
    if (!match) {
      console.error(`❌ Neighborhood "${hoodArg}" not found. Available: ${NEIGHBORHOODS.map(n => n.name).join(', ')}`)
      process.exit(1)
    }
    neighborhoods = [match]
    console.log(`📍 Running single neighborhood: ${hoodArg}\n`)
  } else {
    console.log(`📍 Running all ${neighborhoods.length} neighborhoods\n`)
  }

  await runScraper(neighborhoods)
}

// ─── Scraper ─────────────────────────────────────────────────
async function runScraper(neighborhoods) {
  const startTime = Date.now()
  let totalInserted = 0
  let totalSkipped  = 0
  let totalScraped  = 0

  // Load existing leads for deduplication
  console.log('🔍 Loading existing leads for deduplication...')
  const existingKeys = await getExistingLeadKeys(SUPABASE_URL, SUPABASE_KEY)
  console.log(`   Found ${existingKeys.size} existing leads in database\n`)

  for (const hood of neighborhoods) {
    process.stdout.write(`🗺️  ${hood.name.padEnd(20)} `)

    try {
      // 1. Fetch from Google Places
      const places = await searchGyms(hood.query, PLACES_KEY)
      process.stdout.write(`${places.length} found → `)

      // 2. Normalize
      const leads = places.map(p => normalizeLead(p, hood.name))

      // 3. Deduplicate against existing records
      const newLeads = leads.filter(l => !existingKeys.has(`${l.gym_name}|${l.address ?? ''}`))
      process.stdout.write(`${newLeads.length} new → `)

      if (newLeads.length === 0) {
        console.log('skipped (all duplicates)')
        continue
      }

      // 4. Score leads (checks websites)
      const scored = await scoreLeads(newLeads)
      const highValue = scored.filter(l => l.lead_score >= 7).length
      process.stdout.write(`scored (${highValue} hot) → `)

      // 5. Insert into Supabase
      const { inserted, skipped } = await upsertLeads(scored, SUPABASE_URL, SUPABASE_KEY)
      console.log(`✅ inserted ${inserted}, skipped ${skipped}`)

      totalInserted += inserted
      totalSkipped  += skipped
      totalScraped  += places.length

      // Add new keys to the dedup set
      scored.forEach(l => existingKeys.add(`${l.gym_name}|${l.address ?? ''}`))

    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`)
    }

    // Throttle: 1 request/second to respect Places API rate limits
    await sleep(1000)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`\n📊 Done in ${duration}s`)
  console.log(`   Scraped: ${totalScraped} | New: ${totalInserted} | Dupes: ${totalSkipped}`)
  console.log(`\n💡 Run "node index.js --report" to see your full pipeline\n`)
}

// ─── Report ──────────────────────────────────────────────────
async function printReport() {
  console.log('📊 WEEKLY LEADS REPORT\n')

  const { total, byStatus, topLeads, closed } = await getLeadsSummary(SUPABASE_URL, SUPABASE_KEY)

  console.log(`Total leads:  ${total}`)
  console.log(`Converted:    ${closed}`)
  console.log('\nBy status:')
  Object.entries(byStatus).forEach(([status, count]) => {
    const bar = '█'.repeat(Math.min(30, Math.round((count / total) * 30)))
    console.log(`  ${status.padEnd(15)} ${String(count).padStart(4)}  ${bar}`)
  })

  if (topLeads.length) {
    console.log('\n🔥 TOP UNCONTACTED LEADS (score 7+):')
    console.log('─'.repeat(80))
    topLeads.forEach((l, i) => {
      console.log(`\n${i + 1}. ${l.gym_name}`)
      console.log(`   📍 ${l.address ?? l.neighborhood}`)
      console.log(`   📞 ${l.phone ?? 'No phone'}`)
      console.log(`   ⭐ ${l.rating ?? '?'} rating · ${l.review_count ?? 0} reviews · Score: ${l.lead_score}/10`)
      console.log(`   🌐 ${l.website_url ?? 'NO WEBSITE'}`)
    })
    console.log('\n' + '─'.repeat(80))
    console.log(`\n💡 Run "node index.js --outreach --limit ${topLeads.length}" to generate messages\n`)
  }
}

// ─── Outreach generation ─────────────────────────────────────
async function generateOutreachMessages(limit) {
  console.log(`✍️  Generating outreach messages for top ${limit} leads...\n`)

  if (!ANTHROPIC_KEY) {
    console.log('ℹ️  No ANTHROPIC_API_KEY set — using template messages (still good!)\n')
  }

  const leads = await getTopLeads(SUPABASE_URL, SUPABASE_KEY, limit)

  if (!leads.length) {
    console.log('No uncontacted leads with score 7+ found. Run the scraper first.')
    return
  }

  const withOutreach = await generateOutreachBatch(leads, ANTHROPIC_KEY)

  // Print each one
  withOutreach.forEach((lead, i) => {
    console.log(`\n${'═'.repeat(70)}`)
    console.log(`${i + 1}. ${lead.gym_name} — ${lead.address ?? lead.neighborhood}`)
    console.log(`   Score: ${lead.lead_score}/10 | ${lead.rating ?? '?'}★ | ${lead.review_count ?? 0} reviews`)
    console.log(`   Phone: ${lead.phone ?? 'NO PHONE — skip'}`)

    console.log('\n📱 WHATSAPP:')
    console.log(lead.outreach.whatsapp)

    console.log('\n📧 EMAIL:')
    console.log(`Subject: ${lead.outreach.subject}`)
    console.log(lead.outreach.email)
  })

  // Also save to a file for easy copy-paste
  const filename = `outreach-${new Date().toISOString().slice(0,10)}.json`
  const fs = await import('fs')
  fs.writeFileSync(filename, JSON.stringify(withOutreach, null, 2))
  console.log(`\n\n💾 Saved to ${filename}\n`)
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
