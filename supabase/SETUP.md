# Jenga Systems — Pipeline Setup Guide

Step-by-step instructions to get the full form → auto-deploy pipeline running.

---

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `jenga-systems`, choose the closest region (e.g. `eu-west-1` or `us-east-1`)
3. Once created, go to **SQL Editor** → paste the contents of `schema.sql` → Run
4. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon / public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret — server only)*

---

## 2. Google Drive Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable the **Google Drive API** (APIs & Services → Library → search "Drive")
4. Go to **IAM & Admin → Service Accounts** → Create Service Account
   - Name: `jenga-drive-uploader`
   - Role: Editor (or Basic > Editor)
5. Click the service account → **Keys tab** → Add Key → JSON
6. Download the JSON file — this is your `GOOGLE_SERVICE_ACCOUNT_JSON`
7. **Share your Drive folder** with the service account email
   - Open Google Drive → right-click the folder you want uploads in → Share
   - Add the service account email (looks like `jenga-drive-uploader@your-project.iam.gserviceaccount.com`)
   - Give it **Editor** access
8. Copy the folder ID from the Drive URL (the long string after `/folders/`)
   → `GOOGLE_DRIVE_FOLDER_ID`

---

## 3. GitHub Setup

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic)
2. Scopes: check `repo` (full control of private repositories)
3. Copy the token → `GITHUB_PAT`
4. Make sure your gym template repo is at `anthonynjenga2020/jenga-gym-template`
5. In the repo settings → Template repository (check this box)
   → `GITHUB_TEMPLATE_REPO=anthonynjenga2020/jenga-gym-template`

---

## 4. Vercel Setup

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token
2. Copy the token → `VERCEL_TOKEN`
3. If you're on a team account, get the Team ID from Settings → General → Team ID
   → `VERCEL_TEAM_ID` (leave blank if personal account)

---

## 5. Deploy the Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets (do this for every env var below)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key_here
supabase secrets set GITHUB_PAT=your_pat_here
supabase secrets set GITHUB_TEMPLATE_REPO=anthonynjenga2020/jenga-gym-template
supabase secrets set GITHUB_ORG=anthonynjenga2020
supabase secrets set VERCEL_TOKEN=your_token_here
supabase secrets set VERCEL_TEAM_ID=your_team_id_here
supabase secrets set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
supabase secrets set GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
supabase secrets set WHATSAPP_TOKEN=your_token_here
supabase secrets set WHATSAPP_PHONE_ID=your_phone_id_here
supabase secrets set ANTHONY_WHATSAPP=254700000000

# Deploy the function
supabase functions deploy on-intake-submit
```

---

## 6. Set Up the DB Webhook (triggers the Edge Function)

1. Go to Supabase Dashboard → **Database → Webhooks**
2. Create new webhook:
   - Name: `on-intake-submit`
   - Table: `intake_submissions`
   - Events: `INSERT`
   - Type: HTTP Request
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/on-intake-submit`
   - Headers: `Authorization: Bearer YOUR_SUPABASE_ANON_KEY`
3. Save

---

## 7. Add env vars to jengasystems (onboarding form)

Create or edit `jengasystems/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 8. Full Environment Variables Reference

### Supabase Edge Function Secrets
```
SUPABASE_URL                  — Your project URL
SUPABASE_SERVICE_ROLE_KEY     — Service role key (bypass RLS)
GITHUB_PAT                    — GitHub Personal Access Token (repo scope)
GITHUB_TEMPLATE_REPO          — "anthonynjenga2020/jenga-gym-template"
GITHUB_ORG                    — "anthonynjenga2020"
VERCEL_TOKEN                  — Vercel API token
VERCEL_TEAM_ID                — Vercel team ID (optional)
GOOGLE_SERVICE_ACCOUNT_JSON   — Full JSON string of service account key
GOOGLE_DRIVE_FOLDER_ID        — Drive folder ID for client media uploads
WHATSAPP_TOKEN                — Meta Cloud API Bearer token
WHATSAPP_PHONE_ID             — Meta Cloud API phone number ID
ANTHONY_WHATSAPP              — e.g. "254700000000" (no + sign)
```

### jengasystems/.env.local (onboarding form)
```
NEXT_PUBLIC_SUPABASE_URL      — Your project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key
```

---

## 9. Test the Pipeline End-to-End

1. Go to `jengasystems.online/onboarding` (or localhost:9002/onboarding)
2. Fill in the form with test data → Submit
3. Go to Supabase Dashboard → Table Editor → `intake_submissions`
   → You should see a new row with `status = "processing"`
4. Watch it change to `deployed` within a few minutes
5. Check your Google Drive folder for uploaded images
6. Check GitHub for the new repo
7. Check Vercel for the new deployment
8. Anthony should receive a WhatsApp notification with the live URL

---

## Notes

- **WhatsApp API** (steps 8 + notification) can be skipped until you set up Meta Cloud API. The function handles missing credentials gracefully.
- **Image size limit**: The form enforces 4MB per image. For best results, compress to under 1MB using [squoosh.app](https://squoosh.app).
- **Manual domain connection**: After the site deploys, connect a custom domain in Vercel → Domains and update the DNS in Namecheap/Cloudflare.
