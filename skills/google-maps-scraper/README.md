# Google Maps Gym Lead Scraper

A Node.js CLI tool that finds gyms in Nairobi via Google Places API, scores each lead based on their website quality, and generates personalized outreach messages (WhatsApp + email).

Built for **Jenga Systems** — your automated lead generation pipeline.

---

## What It Does

1. **Scrapes** gym listings from Google Maps across 32 Nairobi neighborhoods
2. **Deduplicates** against your existing Supabase `leads` table
3. **Scores** each lead 1–10 based on website presence and quality
4. **Upserts** new leads into Supabase
5. **Generates** personalized WhatsApp + email outreach via Claude (or a template fallback)

---

## Setup

### 1. Install dependencies

```bash
cd skills/google-maps-scraper
npm install
```

### 2. Create a `.env` file

Copy the example below into a new file called `.env` in this folder:

```env
# Required
GOOGLE_PLACES_API_KEY=your_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional — enables AI-written outreach (falls back to template if missing)
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Get your API keys

| Key | Where to get it |
|-----|----------------|
| `GOOGLE_PLACES_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Enable **Places API (New)** → Credentials → Create API Key |
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API → `service_role` key (not the anon key) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |

### 4. Set up the Supabase `leads` table

Run this in your Supabase SQL editor (already included in `supabase/schema.sql`):

```sql
CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  gym_name        TEXT NOT NULL,
  phone           TEXT,
  address         TEXT,
  neighborhood    TEXT,
  maps_url        TEXT,
  rating          NUMERIC(3,1),
  review_count    INTEGER DEFAULT 0,
  website_url     TEXT,
  has_website     BOOLEAN DEFAULT FALSE,
  lead_score      INTEGER DEFAULT 0,
  website_status  TEXT,
  notes           TEXT,
  scrape_source   TEXT DEFAULT 'google_maps',
  status          TEXT DEFAULT 'scraped',
  outreach_sent_at TIMESTAMPTZ,
  UNIQUE (gym_name, address)
);
```

---

## Usage

### Scrape all neighborhoods (32 areas)
```bash
node index.js
```

### Scrape Tier 1 only (9 highest-density areas — faster)
```bash
node index.js --tier1
```

### Scrape a single neighborhood
```bash
node index.js --hood "Westlands"
node index.js --hood "Karen"
node index.js --hood "Kilimani"
```

### Print weekly leads report
```bash
node index.js --report
```
Shows total leads, breakdown by status, and top uncontacted high-score leads.

### Generate outreach messages for top leads
```bash
node index.js --outreach              # Top 20 leads (default)
node index.js --outreach --limit 5   # Top 5 leads only
```
Prints WhatsApp + email messages to the console and saves them to `outreach-YYYY-MM-DD.json`.

---

## Lead Scoring System

| Website Situation | Score | Notes |
|-------------------|-------|-------|
| No website at all | 10 | Best lead — easiest pitch |
| Broken / 404 | 9 | Tried and failed — motivated |
| Google Business only | 8 | Needs a real site |
| Not mobile-friendly | 7 | Has site, but it's bad |
| Wix / Squarespace / WordPress | 5 | Can be improved |
| Decent mobile site | 2 | Low priority |

**Bonus points:**
- +1 if Google rating ≥ 4.0 (good business worth investing)
- +1 if 50+ reviews (established gym — can afford monthly fee)

Score ≥ 7 = **hot lead** — prioritise for outreach.

---

## Neighborhoods Covered

**Tier 1 (highest density — run these first):**
Westlands, Kilimani, Karen, Lavington, Parklands, Upperhill, Hurlingham, Kileleshwa, Ngong Road

**Tier 2:**
South B, South C, Langata, Ruaka, Thika Road, Kasarani, Eastleigh, Buruburu, Embakasi, Donholm, Ruiru

**Tier 3:**
Rongai, Ngong, Limuru Road, Spring Valley, Muthaiga, Runda, Gigiri, Kitisuru, Loresho, Ridgeways, Kahawa West, Garden Estate

---

## Output Files

| File | Description |
|------|-------------|
| `outreach-YYYY-MM-DD.json` | Generated outreach messages, saved locally after `--outreach` run |

All lead data is stored in your Supabase `leads` table.

---

## Lead Status Flow

```
scraped → contacted → replied → meeting_booked → closed
                                               → lost
```

Update lead statuses directly in Supabase as you work through outreach.

---

## Cost Estimate

| API | Cost per run (all 32 neighborhoods) |
|-----|--------------------------------------|
| Google Places API (Text Search) | ~$1.02 (32 × $0.032) |
| Anthropic Claude (outreach, 20 leads) | ~$0.002 (Haiku pricing) |

Running Tier 1 only costs ~$0.29.

---

## Troubleshooting

**"Missing env vars" error**
→ Check that `.env` exists in this folder (not the project root) and has all three required keys.

**"Places API error"**
→ Make sure **Places API (New)** is enabled in Google Cloud Console — not the legacy Places API.

**"Supabase insert error"**
→ Check that the `leads` table exists and has the UNIQUE constraint on `(gym_name, address)`.

**Slow run / timeouts**
→ Website scoring fetches each gym's site. Use `--tier1` for a faster run. Slow sites timeout at 8 seconds automatically.

---

*Part of the Jenga Systems automation stack — [jengasystems.online](https://jengasystems.online)*
