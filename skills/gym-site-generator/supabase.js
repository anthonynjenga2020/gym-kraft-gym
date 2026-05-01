/**
 * supabase.js
 * Gym-site-generator specific Supabase helpers
 */

/**
 * Create a gym_clients record after successful deployment
 */
export async function createGymClient(intake, deployedUrl, intakeId, url, key) {
  const client = {
    gym_name:           intake.gym_name,
    owner_name:         intake.owner_name,
    email:              intake.email,
    phone:              intake.phone,
    intake_id:          intakeId,
    deployed_url:       deployedUrl,
    subscription_status: 'active',
    monthly_fee:        2000,  // Ksh 2,000/month default
    next_billing_date:  nextBillingDate()
  }

  const res = await fetch(
    `${url}/rest/v1/gym_clients`,
    {
      method:  'POST',
      headers: {
        'apikey':        key,
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal,resolution=ignore-duplicates'
      },
      body: JSON.stringify(client)
    }
  )

  if (!res.ok && res.status !== 409) {
    const text = await res.text()
    throw new Error(`Failed to create gym client: ${res.status} ${text}`)
  }
}

/**
 * Returns a date 30 days from now (first billing date)
 */
function nextBillingDate() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}
