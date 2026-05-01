-- ============================================================
-- JENGA SYSTEMS — Supabase Schema
-- Run this in the Supabase SQL Editor to initialize the database
-- Last updated: April 2026
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- TABLE: intake_submissions
-- One row per gym client who fills the onboarding form.
-- The Edge Function reads this to trigger the full pipeline.
-- ============================================================
CREATE TABLE IF NOT EXISTS intake_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- Basic business info
  gym_name            TEXT NOT NULL,
  owner_name          TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,          -- WhatsApp preferred
  location            TEXT,                   -- Physical address
  google_maps_link    TEXT,                   -- Link from Google Maps share

  -- Branding
  tagline             TEXT,
  about_text          TEXT,                   -- "Our story" paragraph
  primary_color       TEXT DEFAULT '#FF4E1A', -- Hex color
  template_variant    TEXT DEFAULT 'V1',      -- V1–V5

  -- Media (Google Drive URLs after upload)
  logo_url            TEXT,
  hero_image_url      TEXT,
  gallery_urls        TEXT[]  DEFAULT '{}',

  -- Services & pricing
  services            JSONB   DEFAULT '[]',   -- [{ name, desc, icon }]
  membership_plans    JSONB   DEFAULT '[]',   -- [{ name, price, currency, features }]

  -- Trainers
  trainers            JSONB   DEFAULT '[]',   -- [{ name, specialty, bio, image_url }]

  -- Social & contact
  social_links        JSONB   DEFAULT '{}',   -- { instagram, facebook, whatsapp, tiktok }
  whatsapp_number     TEXT,

  -- Extra notes from client
  notes               TEXT,

  -- Pipeline status
  status              TEXT    DEFAULT 'pending'
                      CHECK (status IN ('pending','processing','deployed','failed')),
  error_message       TEXT,

  -- Output
  config_json         JSONB,                  -- Generated gym.config.json
  github_repo_url     TEXT,
  deployed_url        TEXT,
  vercel_project_id   TEXT,
  domain              TEXT
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS intake_submissions_updated_at ON intake_submissions;
CREATE TRIGGER intake_submissions_updated_at
  BEFORE UPDATE ON intake_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_intake_status    ON intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_intake_email     ON intake_submissions(email);
CREATE INDEX IF NOT EXISTS idx_intake_created   ON intake_submissions(created_at DESC);


-- ============================================================
-- TABLE: gym_clients
-- Active paying clients. Created after a submission deploys.
-- ============================================================
CREATE TABLE IF NOT EXISTS gym_clients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Identity
  gym_name              TEXT NOT NULL,
  owner_name            TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,

  -- Links
  intake_id             UUID REFERENCES intake_submissions(id) ON DELETE SET NULL,
  deployed_url          TEXT,
  domain                TEXT,
  github_repo_url       TEXT,

  -- Billing (Paystack)
  paystack_customer_id  TEXT,
  subscription_status   TEXT DEFAULT 'active'
                        CHECK (subscription_status IN ('active','paused','cancelled','overdue')),
  setup_fee_paid        BOOLEAN DEFAULT FALSE,
  monthly_fee           INTEGER DEFAULT 3999,    -- KES
  setup_fee             INTEGER DEFAULT 10000,   -- KES
  next_billing_date     DATE,

  -- Internal notes
  notes                 TEXT,
  referred_by           TEXT
);

DROP TRIGGER IF EXISTS gym_clients_updated_at ON gym_clients;
CREATE TRIGGER gym_clients_updated_at
  BEFORE UPDATE ON gym_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_clients_status   ON gym_clients(subscription_status);
CREATE INDEX IF NOT EXISTS idx_clients_email    ON gym_clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_billing  ON gym_clients(next_billing_date);


-- ============================================================
-- TABLE: leads
-- Gyms scraped from Google Maps. Fed into outreach pipeline.
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Scraped data
  gym_name        TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  neighborhood    TEXT,                         -- e.g. "Westlands", "Karen"
  maps_url        TEXT,
  rating          NUMERIC(2,1),
  review_count    INTEGER,
  website_url     TEXT,
  has_website     BOOLEAN DEFAULT FALSE,

  -- Qualification
  lead_score      INTEGER DEFAULT 0             -- 0–10; 10 = no website at all
                  CHECK (lead_score BETWEEN 0 AND 10),
  scrape_source   TEXT DEFAULT 'google_maps',

  -- Outreach tracking
  status          TEXT DEFAULT 'scraped'
                  CHECK (status IN (
                    'scraped',       -- Just pulled from Maps
                    'qualified',     -- Scored, decided to pursue
                    'contacted',     -- Outreach sent
                    'responded',     -- They replied
                    'call_booked',   -- Demo call scheduled
                    'closed',        -- Became a client
                    'rejected',      -- Not interested
                    'skip'           -- Has good website, not worth pursuing
                  )),

  outreach_sent_at    TIMESTAMPTZ,
  outreach_channel    TEXT,                     -- 'whatsapp' | 'email' | 'call'
  outreach_step       INTEGER DEFAULT 0,        -- 0=not contacted, 1–5=sequence step
  last_contact_at     TIMESTAMPTZ,
  demo_url            TEXT,                     -- Generated preview URL sent to lead
  notes               TEXT,

  -- If they converted
  client_id           UUID REFERENCES gym_clients(id) ON DELETE SET NULL,

  -- Deduplication — required for upsert resolution=ignore-duplicates
  UNIQUE (gym_name, address)
);

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score      ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_hood       ON leads(neighborhood);
CREATE INDEX IF NOT EXISTS idx_leads_website    ON leads(has_website);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- The Edge Function uses the service role key so it bypasses RLS.
-- The anon key (used from the public intake form) can INSERT
-- into intake_submissions but cannot read other rows.
-- ============================================================

ALTER TABLE intake_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;

-- Allow anonymous form submissions (public intake form)
DROP POLICY IF EXISTS "anon_can_insert_intake"   ON intake_submissions;
DROP POLICY IF EXISTS "anon_cannot_read_intake"  ON intake_submissions;
DROP POLICY IF EXISTS "auth_can_read_intake"     ON intake_submissions;
DROP POLICY IF EXISTS "auth_can_update_intake"   ON intake_submissions;
DROP POLICY IF EXISTS "auth_can_read_clients"    ON gym_clients;
DROP POLICY IF EXISTS "auth_can_all_clients"     ON gym_clients;
DROP POLICY IF EXISTS "auth_can_all_leads"       ON leads;

CREATE POLICY "anon_can_insert_intake"
  ON intake_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon cannot read submissions (privacy)
CREATE POLICY "anon_cannot_read_intake"
  ON intake_submissions FOR SELECT
  TO anon
  USING (false);

-- Service role (Edge Function) can do everything — handled automatically
-- Authenticated users (Anthony's dashboard) can read everything
CREATE POLICY "auth_can_read_intake"
  ON intake_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_can_update_intake"
  ON intake_submissions FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "auth_can_read_clients"
  ON gym_clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "auth_can_all_clients"
  ON gym_clients FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "auth_can_all_leads"
  ON leads FOR ALL
  TO authenticated
  USING (true);


-- ============================================================
-- HELPER VIEW: pipeline_status
-- Quick overview for Anthony's dashboard
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
  c.next_billing_date
FROM intake_submissions s
LEFT JOIN gym_clients c ON c.intake_id = s.id
ORDER BY s.created_at DESC;
