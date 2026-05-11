import { useState, useEffect } from 'react'

/**
 * PreviewBanner
 *
 * Shown when config.isPreview === true. A fixed bottom bar that:
 *   - Shows the prospect their gym name is already live
 *   - Has a single CTA to pay and activate the site
 *   - Has a WhatsApp fallback to chat with Anthony
 *
 * Set config.isPreview = false (or remove this component from App.jsx)
 * once the client pays and the domain is connected.
 */
export default function PreviewBanner({ config }) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [pulse, setPulse] = useState(true)

  // Stop the pulse badge animation after 4s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000)
    return () => clearTimeout(t)
  }, [])

  // Re-show after dismiss (every 2 min — they can't escape the close 😄)
  useEffect(() => {
    if (!dismissed) return
    const t = setTimeout(() => setDismissed(false), 120_000)
    return () => clearTimeout(t)
  }, [dismissed])

  if (!config.isPreview || dismissed) return null

  const firstName = config.previewOwnerName
    ? config.previewOwnerName.split(' ')[0]
    : null

  const payUrl   = config.previewPaymentUrl || 'https://jengasystems.online/pricing'
  const waUrl    = `https://wa.me/254104926969?text=${encodeURIComponent(
    `Habari Anthony! I've seen the preview for ${config.gymName}. I'm ready to go live.`
  )}`

  return (
    <>
      {/* Backdrop blur strip at top — subtle "watermark" so they know it's a preview */}
      <div style={styles.topBar}>
        <span style={styles.topBadge}>👁 PREVIEW MODE</span>
        <span style={styles.topText}>
          This site is not yet public — activate it to own this URL.
        </span>
      </div>

      {/* Main bottom bar */}
      <div style={styles.bar}>
        {expanded ? (
          <div style={styles.inner}>
            {/* Left: copy */}
            <div style={styles.copy}>
              <div style={styles.copyTop}>
                <span style={{
                  ...styles.pulseDot,
                  animation: pulse ? 'previewPulse 1.2s ease-in-out infinite' : 'none',
                }} />
                <span style={styles.headline}>
                  {firstName
                    ? `${firstName}, this is your website.`
                    : `This is the ${config.gymName} website.`}
                </span>
              </div>
              <p style={styles.sub}>
                Pay once to go live — custom domain, 48-hour setup, cancel anytime.
              </p>
            </div>

            {/* Right: CTAs */}
            <div style={styles.actions}>
              <a
                href={payUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.primaryBtn}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                🚀 Activate My Site
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.waBtn}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat with Anthony
              </a>
            </div>

            {/* Collapse button */}
            <button
              style={styles.collapseBtn}
              onClick={() => setExpanded(false)}
              title="Minimise"
            >
              ▼
            </button>
          </div>
        ) : (
          /* Collapsed pill */
          <div style={styles.pill} onClick={() => setExpanded(true)}>
            <span style={{ ...styles.pulseDot, animation: 'previewPulse 1.2s ease-in-out infinite' }} />
            <span style={styles.pillText}>Preview mode — tap to activate</span>
            <span style={styles.pillChevron}>▲</span>
          </div>
        )}
      </div>

      {/* Keyframe animation injected inline */}
      <style>{`
        @keyframes previewPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}

// ── Styles (inline so the component is zero-dependency) ──────────────────────

const styles = {
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 20px',
    fontSize: '12px',
  },
  topBadge: {
    background: '#FF4E1A22',
    color: '#FF4E1A',
    border: '1px solid #FF4E1A55',
    borderRadius: '99px',
    padding: '2px 10px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  topText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '12px',
  },

  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    background: 'rgba(10,10,10,0.97)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },

  copy: {
    flex: 1,
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  copyTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#33D169',
    display: 'inline-block',
    flexShrink: 0,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: 1.2,
  },
  sub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '12px',
    margin: 0,
    paddingLeft: '16px',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#33D169',
    color: '#000',
    fontWeight: '800',
    fontSize: '14px',
    padding: '11px 22px',
    borderRadius: '8px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
    letterSpacing: '-0.01em',
  },
  waBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: '13px',
    padding: '10px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  },

  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '4px 8px',
    flexShrink: 0,
  },

  // Collapsed pill
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    cursor: 'pointer',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pillText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '13px',
    fontWeight: '600',
    flex: 1,
  },
  pillChevron: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '11px',
  },
}
