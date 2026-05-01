-- ============================================================
-- JENGA SYSTEMS — Schema Additions (April 2026)
-- Run this in the Supabase SQL Editor.
-- Safe to run on top of the existing schema — all idempotent.
-- ============================================================


-- ============================================================
-- 1. ALTER: gym_clients — add payment tracking columns
--    (used by the Paystack webhook to record successful payments)
-- ============================================================

ALTER TABLE gym_clients
  ADD COLUMN IF NOT EXISTS last_payment_ref  TEXT,
  ADD COLUMN IF NOT EXISTS last_payment_at   TIMESTAMPTZ;


-- ============================================================
-- 2. TABLE: contact_submissions
--    Public contact form at /contact on jengasystems.online
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT NOT NULL,
  message     TEXT NOT NULL,

  -- Tracking (set manually or via automation later)
  replied     BOOLEAN DEFAULT FALSE,
  notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_replied ON contact_submissions(replied);


-- ============================================================
-- 3. TABLE: reviews
--    Submitted via /review/[userId] public funnel page.
--    High ratings (>=4) get redirected to Google Reviews.
--    Low ratings stay internal as feedback.
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  owner_id     TEXT,           -- The userId from the URL param (links to a gym client)
  client_name  TEXT NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  source       TEXT DEFAULT 'public_funnel',   -- 'public_funnel' | 'manual' | 'import'
  status       TEXT DEFAULT 'internal'
               CHECK (status IN ('verified', 'internal', 'flagged'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_owner   ON reviews(owner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating  ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status  ON reviews(status);


-- ============================================================
-- 4. ROW LEVEL SECURITY for new tables
-- ============================================================

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form (public page)
DROP POLICY IF EXISTS "anon_can_insert_contact" ON contact_submissions;
CREATE POLICY "anon_can_insert_contact"
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only Anthony (authenticated) can read contact submissions
DROP POLICY IF EXISTS "auth_can_read_contact" ON contact_submissions;
CREATE POLICY "auth_can_read_contact"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_can_update_contact" ON contact_submissions;
CREATE POLICY "auth_can_update_contact"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (true);

-- Anyone can submit a review (public page)
DROP POLICY IF EXISTS "anon_can_insert_review" ON reviews;
CREATE POLICY "anon_can_insert_review"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only Anthony can read reviews
DROP POLICY IF EXISTS "auth_can_all_reviews" ON reviews;
CREATE POLICY "auth_can_all_reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true);


-- ============================================================
-- 5. UPDATE: pipeline_status view — include payment info
-- ============================================================

CREATE OR REPLACE VIEW pipeline_status AS
SELECT
  s.id,
  s.gym_name,
  s.owner_name,
  s.email,
  s.phone,
  s.template_variant,
  s.status,
  s.deployed_url,
  s.created_at,
  s.updated_at,
  CASE WHEN c.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_active_client,
  c.subscription_status,
  c.monthly_fee,
  c.next_billing_date,
  c.last_payment_ref,
  c.last_payment_at
FROM intake_submissions s
LEFT JOIN gym_clients c ON c.intake_id = s.id
ORDER BY s.created_at DESC;
