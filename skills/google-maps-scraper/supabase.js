// ============================================================
// Supabase Client — REST API (no SDK needed)
// ============================================================

/**
 * Insert leads into the `leads` table.
 * Skips duplicates based on gym_name + address (upsert).
 *
 * @param {object[]} leads
 * @param {string} supabaseUrl
 * @param {string} serviceRoleKey
 * @returns {Promise<{ inserted: number, skipped: number }>}
 */
export async function upsertLeads(leads, supabaseUrl, serviceRoleKey) {
  if (!leads.length) return { inserted: 0, skipped: 0 }

  const res = await fetch(`${supabaseUrl}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':         serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      // onConflict: if gym_name + address match, skip (don't overwrite existing status/notes)
      'Prefer':        'return=representation,resolution=ignore-duplicates',
    },
    body: JSON.stringify(leads),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase insert error: ${err}`)
  }

  const inserted = await res.json()
  return {
    inserted: inserted.length,
    skipped:  leads.length - inserted.length,
  }
}

/**
 * Fetch existing gym names from the leads table for deduplication.
 * Returns a Set of "gym_name|address" keys.
 */
export async function getExistingLeadKeys(supabaseUrl, serviceRoleKey) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/leads?select=gym_name,address&limit=2000`,
    {
      headers: {
        'apikey':         serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    }
  )

  if (!res.ok) return new Set()

  const rows = await res.json()
  return new Set(rows.map(r => `${r.gym_name}|${r.address ?? ''}`))
}

/**
 * Fetch top-scored uncontacted leads for outreach generation.
 */
export async function getTopLeads(supabaseUrl, serviceRoleKey, limit = 20) {
  const res = await fetch(
    `${supabaseUrl}/rest/v1/leads?status=eq.scraped&lead_score=gte.7&order=lead_score.desc,review_count.desc&limit=${limit}`,
    {
      headers: {
        'apikey':         serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    }
  )

  if (!res.ok) return []
  return await res.json()
}

/**
 * Fetch a summary of the leads table for the weekly report.
 */
export async function getLeadsSummary(supabaseUrl, serviceRoleKey) {
  const [allRes, uncontactedRes, topRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/leads?select=status,lead_score,neighborhood`, {
      headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` },
    }),
    fetch(`${supabaseUrl}/rest/v1/leads?status=eq.scraped&lead_score=gte.7&select=gym_name,phone,address,neighborhood,rating,review_count,lead_score,website_url&order=lead_score.desc&limit=10`, {
      headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` },
    }),
    fetch(`${supabaseUrl}/rest/v1/leads?status=eq.closed&select=gym_name`, {
      headers: { 'apikey': serviceRoleKey, 'Authorization': `Bearer ${serviceRoleKey}` },
    }),
  ])

  const all         = allRes.ok         ? await allRes.json()         : []
  const topLeads    = uncontactedRes.ok  ? await uncontactedRes.json() : []
  const closed      = topRes.ok         ? await topRes.json()         : []

  const byStatus = all.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return { total: all.length, byStatus, topLeads, closed: closed.length }
}
