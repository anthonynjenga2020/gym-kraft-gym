#!/usr/bin/env node
// ============================================================
// JENGA SYSTEMS — Outreach CLI
//
// Usage:
//   node index.js                       Show pipeline summary
//   node index.js --queue               List leads ready for first contact
//   node index.js --followups           List leads due for follow-up today
//   node index.js --gen [--limit N]     Generate WhatsApp messages (ready to send)
//   node index.js --gen --step 3        Generate a specific follow-up step for due leads
//   node index.js --sent ID [--step N]  Mark a lead as contacted (after you send the WA)
//   node index.js --status ID STATUS    Update lead status (responded/call_booked/closed/etc)
//   node index.js --demo ID             Print demo URL for a lead
//
// Lead statuses: scraped → qualified → contacted → responded → call_booked → closed
//
// Required env vars (in .env):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Optional:
//   DEMO_BASE_URL   (default: https://demo.jengasystems.online)
// ============================================================

import { config }                         from 'dotenv'
import { getOutreachLeads, getFollowUpLeads, markContacted, updateLeadStatus, getOutreachSummary } from './supabase.js'
import { generateSequence, getStep, afterCallMessage, buildContext } from './messages.js'
import { generateDemoUrl, describeDemoUrl }   from './demo.js'
import { getLeadsDueToday, describeSequence } from './sequence.js'

config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function validateEnv() {
  const missing = []
  if (!SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!SUPABASE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (missing.length) {
    console.error(`\n❌ Missing env vars: ${missing.join(', ')}\n`)
    process.exit(1)
  }
}

// ─── CLI parsing ─────────────────────────────────────────────
const args      = process.argv.slice(2)
const isQueue   = args.includes('--queue')
const isFollowups = args.includes('--followups')
const isGen     = args.includes('--gen')
const isSent    = args.includes('--sent')
const isStatus  = args.includes('--status')
const isDemoCmd = args.includes('--demo')
const limitArg  = parseInt(args.find((_, i) => args[i - 1] === '--limit') ?? '20')
const stepArg   = parseInt(args.find((_, i) => args[i - 1] === '--step') ?? '0')
const idArg     = args.find((_, i) => ['--sent', '--status', '--demo'].includes(args[i - 1]))
const statusArg = args.find((_, i) => args[i - 1] === '--status' && i > 1 && args[i - 2] === idArg)

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('\n📱 JENGA SYSTEMS — Outreach Manager\n')
  validateEnv()

  if (isQueue)    { await showQueue();    return }
  if (isFollowups){ await showFollowups(); return }
  if (isGen)      { await generateMessages(); return }
  if (isSent)     { await markSent();     return }
  if (isStatus)   { await setStatus();    return }
  if (isDemoCmd)  { await showDemo();     return }

  // Default: pipeline summary
  await showSummary()
}

// ─── Pipeline summary ────────────────────────────────────────
async function showSummary() {
  const s = await getOutreachSummary(SUPABASE_URL, SUPABASE_KEY)
  if (!s) { console.log('No data yet.'); return }

  console.log(`Total leads in database: ${s.total}`)
  console.log(`Hot leads waiting for first contact (score 7+): ${s.hot}`)
  console.log(`Currently in follow-up sequence: ${s.inSequence}`)
  console.log(`Closed (became clients): ${s.closed}`)
  console.log('\nBy status:')
  Object.entries(s.byStatus).forEach(([status, count]) => {
    const bar = '█'.repeat(Math.min(25, Math.round((count / s.total) * 25)))
    console.log(`  ${status.padEnd(14)} ${String(count).padStart(4)}  ${bar}`)
  })
  console.log('\n💡 Run "node index.js --queue" to see leads ready for first contact')
  console.log('   Run "node index.js --followups" to see leads due for follow-up today\n')
}

// ─── Queue: leads ready for first contact ────────────────────
async function showQueue() {
  console.log('🔥 LEADS READY FOR FIRST CONTACT (score 7+)\n')
  const leads = await getOutreachLeads(SUPABASE_URL, SUPABASE_KEY, limitArg)

  const fresh = leads.filter(l => l.status === 'scraped' || l.status === 'qualified')
  if (!fresh.length) {
    console.log('No uncontacted leads found. Run the scraper to add more.\n')
    return
  }

  fresh.forEach((l, i) => {
    const demoUrl = generateDemoUrl(l)
    console.log(`${i + 1}. ${l.gym_name}`)
    console.log(`   📍 ${l.address ?? l.neighborhood}`)
    console.log(`   📞 ${l.phone ?? 'NO PHONE'}`)
    console.log(`   ⭐ Score ${l.lead_score}/10 | ${l.rating ?? '?'}★ | ${l.review_count ?? 0} reviews`)
    console.log(`   🌐 ${l.website_url ?? 'NO WEBSITE'}`)
    console.log(`   🔗 Demo: ${demoUrl}`)
    console.log(`   🆔 ${l.id}`)
    console.log()
  })

  console.log(`\n💡 Run "node index.js --gen --limit ${fresh.length}" to generate WhatsApp messages\n`)
}

// ─── Follow-ups due today ─────────────────────────────────────
async function showFollowups() {
  console.log('⏰ FOLLOW-UPS DUE TODAY\n')
  const leads = await getFollowUpLeads(SUPABASE_URL, SUPABASE_KEY)
  const due   = getLeadsDueToday(leads)

  if (!due.length) {
    console.log('No follow-ups due today. Check back tomorrow.\n')
    return
  }

  due.forEach(({ lead, step, daysOverdue }) => {
    const overdue = daysOverdue > 0 ? ` (${daysOverdue} days overdue)` : ''
    console.log(`${lead.gym_name} → Step ${step}${overdue}`)
    console.log(`   📞 ${lead.phone ?? 'NO PHONE'}`)
    console.log(`   🆔 ${lead.id}`)
    console.log(describeSequence(lead))
    console.log()
  })

  console.log(`\n💡 Run "node index.js --gen --followups" to generate these messages\n`)
}

// ─── Generate messages ────────────────────────────────────────
async function generateMessages() {
  const isFollowupMode = args.includes('--followups')

  let leads
  if (isFollowupMode) {
    const all = await getFollowUpLeads(SUPABASE_URL, SUPABASE_KEY)
    const due = getLeadsDueToday(all)
    leads = due.map(d => ({ ...d.lead, _nextStep: d.step }))
  } else {
    const all = await getOutreachLeads(SUPABASE_URL, SUPABASE_KEY, limitArg)
    leads = all.filter(l => l.status === 'scraped' || l.status === 'qualified')
               .map(l => ({ ...l, _nextStep: 1 }))
  }

  if (!leads.length) {
    console.log('No leads to generate messages for.\n')
    return
  }

  console.log(`Generating ${leads.length} WhatsApp message(s)...\n`)
  console.log('═'.repeat(72))

  leads.forEach((lead, i) => {
    const demoUrl = generateDemoUrl(lead)
    const step    = stepArg || lead._nextStep || 1
    const message = getStep(lead, demoUrl, step)

    console.log(`\n${i + 1}. ${lead.gym_name} — Step ${step}`)
    console.log(`   📍 ${lead.address ?? lead.neighborhood}`)
    console.log(`   📞 ${lead.phone ?? 'NO PHONE — skip this one'}`)
    console.log(`   🔗 Demo: ${demoUrl}`)
    console.log(`   🆔 ID: ${lead.id}`)
    console.log('\n─── WhatsApp Message ──────────────────────────────────')
    console.log(message)
    console.log('───────────────────────────────────────────────────────')
  })

  console.log(`\n\n📌 After sending each message, run:`)
  console.log(`   node index.js --sent <ID>     to mark as contacted\n`)
}

// ─── Mark as sent ─────────────────────────────────────────────
async function markSent() {
  if (!idArg) {
    console.error('Usage: node index.js --sent <lead-id> [--step N]')
    process.exit(1)
  }
  const step = stepArg || 1
  const demoUrl = `https://demo.jengasystems.online` // placeholder
  await markContacted(idArg, SUPABASE_URL, SUPABASE_KEY, { step, demoUrl })
  console.log(`✅ Marked ${idArg} as contacted (step ${step})\n`)
}

// ─── Update status ────────────────────────────────────────────
async function setStatus() {
  const id     = args[args.indexOf('--status') + 1]
  const status = args[args.indexOf('--status') + 2]

  const valid = ['scraped','qualified','contacted','responded','call_booked','closed','rejected','skip']
  if (!id || !status || !valid.includes(status)) {
    console.error(`Usage: node index.js --status <id> <status>`)
    console.error(`Valid statuses: ${valid.join(', ')}`)
    process.exit(1)
  }

  await updateLeadStatus(id, status, SUPABASE_URL, SUPABASE_KEY)
  console.log(`✅ Lead ${id} → status: ${status}\n`)
}

// ─── Demo URL ────────────────────────────────────────────────
async function showDemo() {
  const id = args[args.indexOf('--demo') + 1]
  if (!id) { console.error('Usage: node index.js --demo <lead-id>'); process.exit(1) }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?id=eq.${id}&select=gym_name,neighborhood,phone,rating`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  )
  const leads = await res.json()
  if (!leads.length) { console.error('Lead not found'); process.exit(1) }

  const url = generateDemoUrl(leads[0])
  describeDemoUrl(leads[0], url)
  console.log()
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
