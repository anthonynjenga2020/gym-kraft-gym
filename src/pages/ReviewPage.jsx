import { useState } from 'react'
import { insertFeedback } from '../lib/supabase.js'

const HAPPY_THRESHOLD = 4   // 4–5 stars → redirect to Google

export default function ReviewPage({ config }) {
  const [rating,    setRating]    = useState(0)
  const [hovered,   setHovered]   = useState(0)
  const [step,      setStep]      = useState('rate')   // rate | feedback | done | redirect
  const [feedback,  setFeedback]  = useState({ name: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const googleReviewUrl = config.googleReviewUrl ?? `https://search.google.com/local/writereview?placeid=${config.googlePlaceId ?? ''}`

  const handleRating = async (stars) => {
    setRating(stars)
    if (stars >= HAPPY_THRESHOLD) {
      // Happy member — send them to Google review
      setStep('redirect')
      setTimeout(() => {
        window.location.href = googleReviewUrl
      }, 1800)
    } else {
      // Less happy — collect private feedback
      setStep('feedback')
    }
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await insertFeedback({
        rating,
        name:    feedback.name,
        phone:   feedback.phone,
        message: feedback.message,
        source:  'review_funnel',
      })
    } catch (err) {
      console.error('Feedback submit error:', err)
    }
    setSubmitting(false)
    setStep('done')
  }

  const stars = [1, 2, 3, 4, 5]
  const displayRating = hovered || rating

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-20"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-lg">

        {/* Gym logo / name */}
        <div className="text-center mb-12">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.gymName} className="h-12 mx-auto mb-4 object-contain" />
          ) : (
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-sm mb-4 font-headline font-black text-2xl text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {config.gymName.charAt(0)}
            </div>
          )}
          <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--primary)' }}>
            {config.gymName}
          </p>
        </div>

        {/* ── STEP: RATE ──────────────────────────────── */}
        {step === 'rate' && (
          <div
            className="rounded-sm border p-10 text-center"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h1 className="font-headline font-black text-3xl text-white uppercase mb-3">
              How Are We Doing?
            </h1>
            <p className="text-gray-400 text-sm mb-10">
              Your honest feedback helps us keep getting better.
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-8">
              {stars.map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleRating(star)}
                  className="transition-transform duration-100 hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    className="w-12 h-12 transition-colors duration-150"
                    viewBox="0 0 24 24"
                    fill={displayRating >= star ? 'var(--primary)' : 'none'}
                    stroke={displayRating >= star ? 'var(--primary)' : '#444'}
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
            </div>

            {/* Rating label */}
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
              {displayRating === 5 ? 'Excellent! 🙌' :
               displayRating === 4 ? 'Great! 💪' :
               displayRating === 3 ? 'Good — room to improve' :
               displayRating === 2 ? 'Not great — tell us more' :
               displayRating === 1 ? 'Disappointed — please tell us' :
               'Tap a star to rate us'}
            </p>
          </div>
        )}

        {/* ── STEP: REDIRECT (happy member) ────────────── */}
        {step === 'redirect' && (
          <div
            className="rounded-sm border p-10 text-center"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="font-headline font-black text-3xl text-white uppercase mb-3">
              That Means the World 🙌
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              We're taking you to Google to leave your review now. It only takes 30 seconds and it helps us reach more people like you.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Redirecting to Google…
            </div>
            <a
              href={googleReviewUrl}
              className="mt-6 inline-block text-xs text-gray-600 hover:text-gray-400 underline"
            >
              Click here if you&apos;re not redirected
            </a>
          </div>
        )}

        {/* ── STEP: FEEDBACK (unhappy member) ──────────── */}
        {step === 'feedback' && (
          <div
            className="rounded-sm border p-10"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex mb-2">
              {stars.map(s => (
                <svg key={s} className="w-5 h-5" viewBox="0 0 24 24"
                  fill={rating >= s ? 'var(--primary)' : 'none'}
                  stroke={rating >= s ? 'var(--primary)' : '#444'}
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <h2 className="font-headline font-black text-2xl text-white uppercase mb-2">
              We&apos;re Sorry to Hear That
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Your feedback goes directly to the gym manager. We&apos;ll follow up personally within 24 hours.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    value={feedback.name}
                    onChange={e => setFeedback({ ...feedback, name: e.target.value })}
                    placeholder="John Kamau"
                    className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={feedback.phone}
                    onChange={e => setFeedback({ ...feedback, phone: e.target.value })}
                    placeholder="+254 700 000 000"
                    className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">
                  What can we improve? *
                </label>
                <textarea
                  required
                  rows={5}
                  value={feedback.message}
                  onChange={e => setFeedback({ ...feedback, message: e.target.value })}
                  placeholder="Tell us what happened and what we could have done better…"
                  className="w-full px-4 py-3 rounded-sm text-white text-sm placeholder-gray-600 border focus:outline-none transition-colors resize-none"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-4 rounded-sm text-sm flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Sending…
                  </>
                ) : 'Send Feedback →'}
              </button>

              <p className="text-gray-600 text-xs text-center">
                Your feedback is private — only the gym manager sees this.
              </p>
            </form>
          </div>
        )}

        {/* ── STEP: DONE (after feedback) ───────────────── */}
        {step === 'done' && (
          <div
            className="rounded-sm border p-10 text-center"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgba(255,78,26,0.1)' }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-headline font-black text-2xl text-white uppercase mb-3">
              Feedback Received
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Thank you for taking the time. The gym manager will personally review your message and follow up with you shortly.
            </p>
            <a
              href="/"
              className="mt-8 inline-block text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--primary)' }}
            >
              ← Back to {config.gymName}
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
