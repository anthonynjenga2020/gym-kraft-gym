# Apify Lead Machine — Setup Guide
**Target:** 50 gym leads/day from Google Maps, Instagram, Facebook
**Last updated:** April 2026

---

## Step 1: Get Your Webhook URL

After deploying the Edge Function, your webhook URL is:
```
https://rilaoadkfifovxypjsbh.supabase.co/functions/v1/apify-webhook-receiver
```

Set an optional secret header in Supabase env vars:
```
APIFY_WEBHOOK_SECRET=your-random-secret-here
APIFY_API_TOKEN=your-apify-api-token
```

---

## Step 2: Google Maps Scraper (~20-25 gyms/day)

**Actor:** `compass/google-maps-scraper`
**URL:** https://apify.com/compass/google-maps-scraper

### Input Config (paste into Apify):
```json
{
  "searchStringsArray": [
    "gym Westlands Nairobi",
    "gym Kilimani Nairobi",
    "gym Karen Nairobi",
    "gym Lavington Nairobi",
    "gym Parklands Nairobi",
    "gym Kasarani Nairobi",
    "gym Thika Road Nairobi",
    "gym Upperhill Nairobi",
    "gym South C Nairobi",
    "gym Embakasi Nairobi",
    "fitness center Nairobi",
    "crossfit Nairobi",
    "gym Ruaka Nairobi"
  ],
  "maxCrawledPlacesPerSearch": 5,
  "language": "en",
  "maxImages": 0,
  "exportPlaceUrls": false,
  "includeHistogram": false,
  "includeOpeningHours": false,
  "includePeopleAlsoSearch": false,
  "additionalInfo": false,
  "reviewsSort": "newest",
  "maxReviews": 0,
  "scrapeDirectories": false,
  "deeperCityScrape": false
}
```

### Schedule:
- **Cron:** `0 7 * * *` (7:00 AM EAT / 4:00 AM UTC daily)
- **Rotate search terms** — don't hit the same 13 terms every day or Maps will rate-limit you. Split them across days using Apify's schedule.

### Webhook:
- Event: `ACTOR.RUN.SUCCEEDED`
- URL: `https://rilaoadkfifovxypjsbh.supabase.co/functions/v1/apify-webhook-receiver`
- Header: `x-apify-webhook-secret: your-random-secret-here`

---

## Step 3: Instagram Hashtag Scraper (~15-20 gyms/day)

**Actor:** `apify/instagram-hashtag-scraper`
**URL:** https://apify.com/apify/instagram-hashtag-scraper

### Input Config:
```json
{
  "hashtags": [
    "nairobigym",
    "gymnairobi",
    "nairobifitness",
    "fitnessnbi",
    "nairobicrossfit",
    "nairobiyoga",
    "gymwestlands",
    "gymkilimani",
    "kenyagym",
    "nairobipilates",
    "gymkaren",
    "fitkenya"
  ],
  "resultsLimit": 30,
  "addParentData": false,
  "scrapeType": "posts"
}
```

> **Note:** The hashtag scraper returns posts, not accounts. Use `apify/instagram-profile-scraper` as the follow-up to enrich profiles found in posts.

### Better approach — Profile Scraper directly:
**Actor:** `apify/instagram-profile-scraper`

```json
{
  "usernames": [
    "gymwestlandsnbi",
    "nairobigymofficial"
  ],
  "resultsType": "details",
  "resultsLimit": 1
}
```
Run this after manually finding handles from hashtag searches, or chain actors.

### Schedule: `0 8 * * *` (8:00 AM EAT)

---

## Step 4: Facebook Pages Scraper (~10-15 pages/day)

**Actor:** `apify/facebook-pages-scraper`
**URL:** https://apify.com/apify/facebook-pages-scraper

### Input Config:
```json
{
  "startUrls": [
    { "url": "https://www.facebook.com/search/pages/?q=gym%20nairobi" },
    { "url": "https://www.facebook.com/search/pages/?q=fitness%20center%20nairobi" },
    { "url": "https://www.facebook.com/search/pages/?q=crossfit%20nairobi" }
  ],
  "maxPagesPerQuery": 5,
  "scrapeAbout": true,
  "scrapeReviews": false,
  "scrapePosts": false,
  "scrapeServices": false
}
```

### Schedule: `0 9 * * *` (9:00 AM EAT)

---

## Step 5: Daily Lead Flow Summary

| Time (EAT) | Actor | Expected Leads |
|------------|-------|----------------|
| 7:00 AM | Google Maps Scraper | 20–25 |
| 8:00 AM | Instagram Scraper | 15–20 |
| 9:00 AM | Facebook Pages Scraper | 10–15 |
| **Total** | | **45–60 leads/day** |

All three actors fire their webhooks → Edge Function qualifies + upserts → Supabase `leads` table.

---

## Step 6: Lead Scoring Reference

| Score | What It Means | Action |
|-------|---------------|--------|
| 8–10 | No website at all | 🔥 Call today |
| 5–7 | Linktree / Wix / bad site | Warm — WhatsApp outreach |
| 0–4 | Real website | Skip unless big gym |

Status set automatically: `qualified` (7+), `scraped` (4–6), `skip` (0–3)

---

## Step 7: Apify API Token

1. Go to https://console.apify.com/account/integrations
2. Copy your API token
3. Add to Supabase: Dashboard → Edge Functions → Secrets → `APIFY_API_TOKEN`

---

## Step 8: Deploy the Edge Function

```bash
# From the gym-template/ directory
supabase functions deploy apify-webhook-receiver --project-ref rilaoadkfifovxypjsbh

# Set secrets
supabase secrets set APIFY_API_TOKEN=your-token --project-ref rilaoadkfifovxypjsbh
supabase secrets set APIFY_WEBHOOK_SECRET=your-secret --project-ref rilaoadkfifovxypjsbh
```

---

## Step 9: View Your Leads

Quick query to see today's hot leads:
```sql
SELECT gym_name, phone, neighborhood, website_url, lead_score, scrape_source, status
FROM leads
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND lead_score >= 7
ORDER BY lead_score DESC, review_count DESC;
```

Export to CSV from Supabase dashboard for your cold call list.

---

## What's Next

- [ ] Wire leads into a WhatsApp outreach sequence (via Meta Cloud API)
- [ ] Build `lead-qualifier` CoWork skill to review + approve leads
- [ ] Build `outreach-email-generator` skill to draft personalized WhatsApp messages per lead
- [ ] Build a live leads dashboard in Supabase (or Cowork artifact)
