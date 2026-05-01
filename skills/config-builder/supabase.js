/**
 * supabase.js
 * Fetch an intake_submissions row by ID
 */

export async function fetchIntakeRow(id, url, key) {
  const res = await fetch(
    `${url}/rest/v1/intake_submissions?id=eq.${id}&select=*&limit=1`,
    {
      headers: {
        'apikey':        key,
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json'
      }
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase error ${res.status}: ${body}`)
  }

  const rows = await res.json()
  if (!rows || rows.length === 0) {
    throw new Error(`No intake submission found with id: ${id}`)
  }

  return rows[0]
}

export async function updateIntakeStatus(id, status, url, key, extra = {}) {
  const body = { status, ...extra }
  const res = await fetch(
    `${url}/rest/v1/intake_submissions?id=eq.${id}`,
    {
      method:  'PATCH',
      headers: {
        'apikey':        key,
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(body)
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to update status: ${res.status} ${text}`)
  }
}
