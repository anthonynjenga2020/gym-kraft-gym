// ============================================================
// Outreach Sequence Manager
//
// Tracks where each lead is in the follow-up sequence and
// determines which message should be sent next.
//
// Sequence timing:
//   Step 1 — Day 0   (initial cold message)
//   Step 2 — Day 3   (soft nudge)
//   Step 3 — Day 7   (ROI math)
//   Step 4 — Day 14  (case study)
//   Step 5 — Day 21  (last attempt)
// ============================================================

const SEQUENCE_DAYS = [0, 3, 7, 14, 21]

/**
 * Given a lead, determine which step should be sent today.
 * Returns null if no action is needed yet (too early) or sequence is exhausted.
 *
 * @param {object} lead
 * @returns {{ step: number, daysOverdue: number } | null}
 */
export function getNextStep(lead) {
  const currentStep = lead.outreach_step ?? 0
  const lastContact = lead.last_contact_at ? new Date(lead.last_contact_at) : null

  // Never contacted — send step 1
  if (currentStep === 0 || !lastContact) {
    return { step: 1, daysOverdue: 0 }
  }

  // Sequence complete (5 steps done)
  if (currentStep >= 5) return null

  // Lead replied or booked — don't auto-follow-up
  if (['responded', 'call_booked', 'closed', 'rejected', 'skip'].includes(lead.status)) {
    return null
  }

  const daysSinceContact = daysBetween(lastContact, new Date())
  const nextStep         = currentStep + 1
  const requiredDays     = SEQUENCE_DAYS[nextStep - 1]  // days since *first* contact
  const firstContact     = lead.outreach_sent_at ? new Date(lead.outreach_sent_at) : lastContact
  const daysSinceFirst   = daysBetween(firstContact, new Date())

  if (daysSinceFirst >= requiredDays) {
    return {
      step: nextStep,
      daysOverdue: daysSinceFirst - requiredDays,
    }
  }

  const daysUntilDue = requiredDays - daysSinceFirst
  return { step: nextStep, daysUntilDue, notYet: true }
}

/**
 * Get all leads that need action today, sorted by urgency.
 *
 * @param {object[]} leads
 * @returns {Array<{ lead, step, daysOverdue }>}
 */
export function getLeadsDueToday(leads) {
  return leads
    .map(lead => {
      const next = getNextStep(lead)
      if (!next || next.notYet) return null
      return { lead, step: next.step, daysOverdue: next.daysOverdue }
    })
    .filter(Boolean)
    .sort((a, b) => b.daysOverdue - a.daysOverdue) // most overdue first
}

/**
 * Format the sequence schedule for a lead, showing what's been sent and what's coming.
 */
export function describeSequence(lead) {
  const step      = lead.outreach_step ?? 0
  const firstDate = lead.outreach_sent_at ? new Date(lead.outreach_sent_at) : null
  const lines     = []

  lines.push(`\n📅 Sequence for ${lead.gym_name} (step ${step}/5):`)

  SEQUENCE_DAYS.forEach((day, i) => {
    const stepNum  = i + 1
    const label    = stepLabels[stepNum]
    const isDone   = stepNum <= step
    const isCurrent = stepNum === step + 1

    let dateStr = ''
    if (firstDate && isDone) {
      const d = new Date(firstDate)
      d.setDate(d.getDate() + day)
      dateStr = ` — sent ~${d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
    } else if (firstDate) {
      const d = new Date(firstDate)
      d.setDate(d.getDate() + day)
      dateStr = ` — due ${d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
    }

    const icon = isDone ? '✅' : isCurrent ? '👉' : '⏳'
    lines.push(`   ${icon} Step ${stepNum}: ${label} (day +${day})${dateStr}`)
  })

  return lines.join('\n')
}

const stepLabels = {
  1: 'Initial cold message + demo link',
  2: 'Soft nudge',
  3: 'ROI math close',
  4: 'Case study hook',
  5: 'Final message, leave door open',
}

function daysBetween(a, b) {
  return Math.floor((b - a) / (1000 * 60 * 60 * 24))
}
