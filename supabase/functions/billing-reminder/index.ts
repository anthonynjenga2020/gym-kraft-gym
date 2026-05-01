/**
 * billing-reminder — Supabase Edge Function
 *
 * Runs daily at 09:00 EAT via Supabase CRON.
 * Finds active gym clients whose next_billing_date is exactly 3 days away,
 * sends them a reminder email, and pings Anthony with a summary.
 *
 * CRON schedule (set in Supabase Dashboard → Edge Functions → Schedule):
 *   0 6 * * *   (06:00 UTC = 09:00 EAT)
 *
 * Required secrets (set via `supabase secrets set`):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   RESEND_API_KEY
 *   NOTIFY_EMAIL          (defaults to anthonynjenga2020@gmail.com)
 *   APP_URL               (https://jengasystems.online)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_KEY    = Deno.env.get('RESEND_API_KEY')!
const NOTIFY_EMAIL  = Deno.env.get('NOTIFY_EMAIL') ?? 'anthonynjenga2020@gmail.com'
const FROM_ADDRESS  = 'Jenga Systems <hello@jengasystems.online>'
const APP_URL       = Deno.env.get('APP_URL') ?? 'https://jengasystems.online'
const WHATSAPP_BASE = 'https://wa.me/254700000000'

// ─── Email helpers ────────────────────────────────────────────────────────────
function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:'Inter',Arial,sans-serif;color:#F0F4F8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding-bottom:32px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;height:32px;background:#33D169;border-radius:6px;text-align:center;vertical-align:middle;">
                <span style="font-family:Georgia,serif;font-weight:900;font-size:18px;color:#0D1117;line-height:32px;">J</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="font-size:16px;font-weight:700;color:#ffffff;letter-spacing:0.05em;text-transform:uppercase;">Jenga Systems</span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:#161B22;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.07);">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding-top:28px;text-align:center;">
            <p style="margin:0;font-size:12px;color:rgba(240,244,248,0.35);line-height:1.8;">
              Jenga Systems · Nairobi, Kenya<br/>
              <a href="${APP_URL}" style="color:#33D169;text-decoration:none;">jengasystems.online</a>
              &nbsp;·&nbsp;
              <a href="${WHATSAPP_BASE}" style="color:#33D169;text-decoration:none;">WhatsApp</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function billingReminderHtml(data: {
  ownerName:   string
  gymName:     string
  amount:      number
  billingDate: string
}): { subject: string; html: string } {
  const dateStr = new Date(data.billingDate).toLocaleDateString('en-KE', {
    dateStyle: 'long', timeZone: 'Africa/Nairobi'
  })
  const subject = `Upcoming payment — Jenga Systems · ${dateStr}`
  const html = layout(subject, `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;text-transform:uppercase;">
      Heads up, ${data.ownerName.split(' ')[0]}!
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(240,244,248,0.5);">Your next Jenga Systems payment is coming up in 3 days.</p>

    <div style="background:#D99A2E18;border:1px solid #D99A2E30;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#D99A2E;font-weight:600;">
        Ksh ${data.amount.toLocaleString()} due on ${dateStr}
      </p>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:rgba(240,244,248,0.75);line-height:1.7;">
      This is a friendly reminder that your monthly subscription for
      <strong style="color:#ffffff;">${data.gymName}</strong> will be charged in 3 days.
      Make sure your M-Pesa or card is ready.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.4);">Business</span>
        </td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">
          <span style="font-size:14px;font-weight:600;color:#F0F4F8;">${data.gymName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.4);">Amount due</span>
        </td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">
          <span style="font-size:14px;font-weight:600;color:#33D169;">Ksh ${data.amount.toLocaleString()}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.4);">Due date</span>
        </td>
        <td style="padding:10px 0 10px 16px;text-align:right;">
          <span style="font-size:14px;font-weight:600;color:#F0F4F8;">${dateStr}</span>
        </td>
      </tr>
    </table>

    <div style="background:rgba(51,209,105,0.05);border-radius:10px;padding:14px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:rgba(240,244,248,0.6);line-height:1.7;">
        Questions? WhatsApp us anytime — we respond within a few hours.
      </p>
    </div>

    <a href="${WHATSAPP_BASE}?text=Hi%2C%20I%20have%20a%20question%20about%20my%20upcoming%20Jenga%20Systems%20payment."
       style="display:inline-block;padding:14px 28px;background:#33D169;color:#0D1117;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;border-radius:10px;">
      WhatsApp Support
    </a>
  `)
  return { subject, html }
}

function anthonySummaryHtml(clients: Array<{ gym_name: string; email: string; phone: string; monthly_fee: number; next_billing_date: string }>): { subject: string; html: string } {
  const subject = `Billing reminders sent — ${clients.length} client${clients.length !== 1 ? 's' : ''} due in 3 days`
  const rows = clients.map(c => {
    const dateStr = new Date(c.next_billing_date).toLocaleDateString('en-KE', { dateStyle: 'medium' })
    const waLink  = `https://wa.me/${c.phone.replace(/[^0-9]/g,'')}?text=Hi%20${encodeURIComponent(c.gym_name)}%2C%20just%20a%20reminder%20your%20Jenga%20Systems%20payment%20is%20due%20soon!`
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">${c.gym_name}</p>
          <p style="margin:2px 0 0;font-size:12px;color:rgba(240,244,248,0.4);">${c.email}</p>
        </td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;">
          <span style="font-size:13px;font-weight:600;color:#33D169;">Ksh ${c.monthly_fee.toLocaleString()}</span>
        </td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;">
          <span style="font-size:12px;color:#F0F4F8;">${dateStr}</span>
        </td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right;">
          <a href="${waLink}" style="font-size:12px;font-weight:700;color:#33D169;text-decoration:none;">WhatsApp →</a>
        </td>
      </tr>`
  }).join('')

  const html = layout(subject, `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;text-transform:uppercase;">
      Billing Reminders Sent
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:rgba(240,244,248,0.5);">
      ${clients.length} client${clients.length !== 1 ? 's' : ''} billing in 3 days — reminders delivered.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.35);padding-bottom:8px;">Client</th>
          <th style="text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.35);padding-bottom:8px;">Amount</th>
          <th style="text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.35);padding-bottom:8px;">Due Date</th>
          <th style="text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(240,244,248,0.35);padding-bottom:8px;">Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <a href="${APP_URL}/dashboard/billing"
       style="display:inline-block;padding:14px 28px;background:#33D169;color:#0D1117;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:0.1em;text-decoration:none;border-radius:10px;">
      View Billing Dashboard
    </a>
  `)
  return { subject, html }
}

// ─── Send email via Resend ────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html })
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[BILLING-REMINDER] Resend error (${to}):`, err)
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (_req) => {
  try {
    // Target date: today + 3 days (in EAT / Africa/Nairobi)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 3)
    const targetStr = targetDate.toISOString().slice(0, 10) // YYYY-MM-DD

    console.log(`[BILLING-REMINDER] Checking for clients due on ${targetStr}`)

    // Query active clients due on that date
    const params = new URLSearchParams({
      subscription_status: 'eq.active',
      next_billing_date:   `eq.${targetStr}`,
      select:              'id,gym_name,owner_name,email,phone,monthly_fee,next_billing_date'
    })

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gym_clients?${params.toString()}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    )

    const clients: Array<{
      id:                 string
      gym_name:           string
      owner_name:         string
      email:              string
      phone:              string
      monthly_fee:        number
      next_billing_date:  string
    }> = await res.json()

    if (!Array.isArray(clients) || clients.length === 0) {
      console.log('[BILLING-REMINDER] No clients due in 3 days — done.')
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`[BILLING-REMINDER] ${clients.length} client(s) to remind`)

    // Send reminder to each client + collect results
    const sends = clients.map(async (client) => {
      const { subject, html } = billingReminderHtml({
        ownerName:   client.owner_name,
        gymName:     client.gym_name,
        amount:      client.monthly_fee,
        billingDate: client.next_billing_date
      })
      await sendEmail(client.email, subject, html)
      console.log(`[BILLING-REMINDER] Sent to ${client.gym_name} <${client.email}>`)
    })

    // Also send Anthony a summary digest
    const summaryEmail = async () => {
      const { subject, html } = anthonySummaryHtml(clients)
      await sendEmail(NOTIFY_EMAIL, subject, html)
      console.log(`[BILLING-REMINDER] Summary sent to Anthony`)
    }

    await Promise.allSettled([...sends, summaryEmail()])

    return new Response(
      JSON.stringify({ ok: true, sent: clients.length, date: targetStr }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[BILLING-REMINDER] Fatal error:', msg)
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
