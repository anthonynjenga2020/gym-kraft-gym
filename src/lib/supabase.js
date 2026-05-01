// ─────────────────────────────────────────────────────────────
// Supabase client for gym template
// Uses Vite env vars injected at build time:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//   VITE_GYM_ID  (set per-deployment to scope data to this gym)
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  ?? ''
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
export const GYM_ID = import.meta.env.VITE_GYM_ID ?? 'demo'

const headers = {
  apikey:          SUPABASE_KEY,
  Authorization:   `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json',
  Prefer:          'return=minimal',
}

/**
 * Insert a lead into the Supabase `leads` table.
 * Returns { ok: true } or { ok: false, error }
 */
export async function insertLead(data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[Supabase] Missing env vars — lead not saved')
    return { ok: true } // fail silently in demo mode
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method:  'POST',
      headers,
      body: JSON.stringify({
        gym_id:     GYM_ID,
        gym_name:   data.gymName,
        source:     'website_form',
        status:     'scraped',
        lead_score: 9,            // website form = high intent
        ...data,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[Supabase] insertLead failed:', err)
      return { ok: false, error: err }
    }
    return { ok: true }
  } catch (err) {
    console.error('[Supabase] insertLead error:', err)
    return { ok: false, error: err.message }
  }
}

/**
 * Insert a contact/enquiry message.
 */
export async function insertContact(data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: true }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gym_contact_messages`, {
      method:  'POST',
      headers,
      body: JSON.stringify({ gym_id: GYM_ID, ...data }),
    })
    return { ok: res.ok }
  } catch (err) {
    console.error('[Supabase] insertContact error:', err)
    return { ok: false, error: err.message }
  }
}

/**
 * Insert a private review / feedback submission.
 */
export async function insertFeedback(data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: true }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/gym_feedback`, {
      method:  'POST',
      headers,
      body: JSON.stringify({ gym_id: GYM_ID, ...data }),
    })
    return { ok: res.ok }
  } catch (err) {
    console.error('[Supabase] insertFeedback error:', err)
    return { ok: false, error: err.message }
  }
}
