// ============================================================
// Supabase — Outreach-specific queries
// ============================================================

/**
 * Fetch leads ready for outreach (scored 7+, not yet closed/rejected).
 */
export async function getOutreachLeads(url, key, limit = 50) {
  const res = await fetch(
    `${url}/rest/v1/leads?lead_score=gte.7&status=in.(scraped,qualified,contacted)&order=lead_score.desc,review_count.desc&limit=${limit}`,
    { headers: headers(key) }
  )
  if (!res.ok) return []
  return res.json()
}

/**
 * Fetch leads that are due for a follow-up message today.
 * Returns all non-closed leads that have been contacted at least once.
 */
export async function getFollowUpLeads(url, key) {
  const res = await fetch(
    `${url}/rest/v1/leads?status=eq.contacted&outreach_step=gte.1&order=outreach_sent_at.asc`,
    { headers: headers(key) }
  )
  if (!res.ok) return []
  return res.json()
}

/**
 * Mark a lead as contacted and record outreach metadata.
 *
 * @param {string} id - Lead UUID
 * @param {number} step - Sequence step (1–5)
 * @param {string} channel - 'whatsapp' | 'call' | 'email'
 */
export async function markContacted(id, url, key, { step, channel = 'whatsapp', demoUrl = null, notes = null } = {}) {
  const now = new Date().toISOString()

  const patch = {
    status:           'contacted',
    outreach_step:    step,
    outreach_channel: channel,
    last_contact_at:  now,
  }

  // Only set outreach_sent_at on first contact
  if (step === 1) {
    patch.outreach_sent_at = now
    if (demoUrl) patch.demo_url = demoUrl
  }

  if (notes) patch.notes = notes

  const res = await fetch(`${url}/rest/v1/leads?id=eq.${id}`, {
    method:  'PATCH',
    headers: { ...headers(key), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body:    JSON.stringify(patch),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update lead ${id}: ${err}`)
  }
}

/**
 * Update lead status (e.g. when they reply, book a call, close, etc.)
 */
export async function updateLeadStatus(id, status, url, key, notes = null) {
  const patch = {
    status,
    last_contact_at: new Date().toISOString(),
  }
  if (notes) patch.notes = notes

  const res = await fetch(`${url}/rest/v1/leads?id=eq.${id}`, {
    method:  'PATCH',
    headers: { ...headers(key), 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
    body:    JSON.stringify(patch),
  })

  if (!res.ok) throw new Error(`Status update failed: ${await res.text()}`)
}

/**
 * Get a quick summary of the outreach pipeline.
 */
export async function getOutreachSummary(url, key) {
  const res = await fetch(
    `${url}/rest/v1/leads?select=status,outreach_step,lead_score`,
    { headers: headers(key) }
  )
  if (!res.ok) return null

  const leads = await res.json()

  const byStatus = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1
    return acc
  }, {})

  const inSequence = leads.filter(l => l.status === 'contacted').length
  const hot        = leads.filter(l => l.lead_score >= 7 && l.status === 'scraped').length
  const closed     = byStatus['closed'] ?? 0

  return { total: leads.length, byStatus, inSequence, hot, closed }
}

function headers(key) {
  return {
    'apikey':        key,
    'Authorization': `Bearer ${key}`,
  }
}
