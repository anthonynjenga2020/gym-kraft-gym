// ============================================================
// JENGA SYSTEMS — Supabase Edge Function: on-intake-submit
//
// Triggered by a Supabase DB Webhook on INSERT to intake_submissions.
// Full pipeline:
//   1. Validate the submission
//   2. Upload images (logo, hero, gallery) to Google Drive
//   3. Generate gym.config.json from the submission data
//   4. Create a GitHub repo from the gym template
//   5. Inject gym.config.json into the new repo
//   6. Trigger a Vercel deployment
//   7. Update the Supabase row with deployed URL + status
//   8. Send WhatsApp notification to Anthony
//
// Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   GITHUB_PAT                      — Personal Access Token with repo scope
//   GITHUB_TEMPLATE_REPO            — e.g. "anthonynjenga2020/jenga-gym-template"
//   VERCEL_TOKEN
//   VERCEL_TEAM_ID                  — Optional, for team accounts
//   GOOGLE_SERVICE_ACCOUNT_JSON     — Full JSON string of service account key
//   GOOGLE_DRIVE_FOLDER_ID          — Drive folder ID for client media
//   WHATSAPP_TOKEN                  — Meta Cloud API token
//   WHATSAPP_PHONE_ID               — Meta Cloud API phone number ID
//   ANTHONY_WHATSAPP                — Anthony's number e.g. "254700000000"
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { uploadToJengaDrive } from '../_shared/drive-upload.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ─── Entry point ─────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  try {
    // Supabase DB webhooks POST the record as JSON
    const body = await req.json()
    const record = body.record ?? body // handle both webhook formats

    console.log(`[on-intake-submit] Processing submission for: ${record.gym_name}`)

    // 1. Mark as generating (shows "Building" in the dashboard)
    await updateStatus(record.id, 'generating')

    // 2. Upload images to Google Drive
    const mediaUrls = await uploadMedia(record)
    console.log('[on-intake-submit] Media uploaded:', mediaUrls)

    // 3. Generate gym.config.json
    const config = buildConfig(record, mediaUrls)
    console.log('[on-intake-submit] Config generated')

    // 4. Create GitHub repo from template
    const repoName = `gym-${record.id.split('-')[0]}` // e.g. gym-3b8cf7bf
    const repoUrl = await createGithubRepo(repoName, config)
    console.log(`[on-intake-submit] Repo created: ${repoUrl}`)

    // 5. Deploy to Vercel
    const deployedUrl = await deployToVercel(repoName)
    console.log(`[on-intake-submit] Deployed: ${deployedUrl}`)

    // 6. Update Supabase row
    await supabase.from('intake_submissions').update({
      status: 'deployed',
      config_json: config,
      github_repo_url: repoUrl,
      deployed_url: deployedUrl,
      ...mediaUrls,
    }).eq('id', record.id)

    // 7. Notify Anthony via WhatsApp
    await notifyAnthony(record, deployedUrl)

    return new Response(
      JSON.stringify({ success: true, deployed_url: deployedUrl }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[on-intake-submit] ERROR:', error)

    // Try to extract the record ID for error logging
    try {
      const body = await req.clone().json()
      const id = (body.record ?? body)?.id
      if (id) {
        await updateStatus(id, 'failed', String(error))
      }
    } catch (_) { /* ignore */ }

    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})


// ─── Step 2: Upload media to Google Drive ────────────────────
async function uploadMedia(record: Record<string, any>) {
  const urls: Record<string, any> = {}

  // Helper: download a base64 data URL or external URL and upload to Drive
  async function processImage(
    dataOrUrl: string,
    name: string
  ): Promise<string | null> {
    if (!dataOrUrl) return null

    try {
      let buffer: ArrayBuffer
      let mimeType = 'image/jpeg'

      if (dataOrUrl.startsWith('data:')) {
        // Base64 data URL from form upload
        const [meta, data] = dataOrUrl.split(',')
        mimeType = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
        const binary = atob(data)
        buffer = new Uint8Array(binary.length).map((_, i) => binary.charCodeAt(i)).buffer
      } else {
        // External URL — fetch and re-upload
        const res = await fetch(dataOrUrl)
        buffer = await res.arrayBuffer()
        mimeType = res.headers.get('content-type') ?? 'image/jpeg'
      }

      const ext = mimeType.split('/')[1] ?? 'jpg'
      const fileName = `${record.gym_name.replace(/\s+/g, '-').toLowerCase()}-${name}.${ext}`
      return await uploadToJengaDrive(buffer, fileName, mimeType)

    } catch (err) {
      console.warn(`[uploadMedia] Failed to upload ${name}:`, err)
      return null
    }
  }

  // Logo
  if (record.logo_url) {
    urls.logo_url = await processImage(record.logo_url, 'logo')
  }

  // Hero image
  if (record.hero_image_url) {
    urls.hero_image_url = await processImage(record.hero_image_url, 'hero')
  }

  // Gallery images (array)
  if (record.gallery_urls?.length) {
    const uploaded = await Promise.all(
      record.gallery_urls.map((url: string, i: number) =>
        processImage(url, `gallery-${i + 1}`)
      )
    )
    urls.gallery_urls = uploaded.filter(Boolean)
  }

  return urls
}


// ─── Step 3: Build gym.config.json ───────────────────────────
function buildConfig(
  record: Record<string, any>,
  mediaUrls: Record<string, any>
): Record<string, any> {
  const gymId = `gym-${record.id.split('-')[0]}`

  return {
    gymId,
    gymName: record.gym_name,
    tagline: record.tagline ?? `${record.gym_name} — Where Results Happen`,
    subTagline: '',
    phone: record.phone,
    email: record.email,
    location: record.location ?? '',
    googleMapsEmbed: record.google_maps_link
      ? convertMapsLinkToEmbed(record.google_maps_link)
      : '',

    // Media — use Drive URLs if available, else originals
    logoUrl: mediaUrls.logo_url ?? record.logo_url ?? '',
    heroImageUrl: mediaUrls.hero_image_url ?? record.hero_image_url ?? '',
    aboutImageUrl: '',
    galleryImages: mediaUrls.gallery_urls ?? record.gallery_urls ?? [],

    // Theming
    primaryColor: record.primary_color ?? '#FF4E1A',
    primaryDark: '',
    accentColor: '#FFFFFF',
    bgColor: '#0A0A0A',
    surfaceColor: '#141414',
    borderColor: '#222222',
    templateVariant: record.template_variant ?? 'V1',

    // Content — use submitted data or smart defaults
    aboutTitle: `We Don't Do Half Reps. In Training or in Life.`,
    aboutDescription: record.about_text ?? '',
    stats: [
      { value: '500+', label: 'Active Members' },
      { value: '10+', label: 'Expert Trainers' },
      { value: '5★', label: 'Google Rating' },
      { value: '20+', label: 'Classes / Week' },
    ],

    // Services (submitted as array of { name, desc, icon })
    services: normalizeServices(record.services),

    // Schedule — empty by default, client adds later
    schedule: [],

    // Programs — empty by default
    programs: [],

    // Transformations — empty by default
    transformations: [],

    // Trainers
    trainers: normalizeTrainers(record.trainers ?? []),

    // Testimonials — empty by default
    testimonials: [],

    // Membership plans
    membershipPlans: normalizePlans(record.membership_plans),

    // FAQs — empty by default
    faqs: [],

    // Social
    socialLinks: {
      instagram: record.social_links?.instagram ?? '',
      facebook: record.social_links?.facebook ?? '',
      whatsapp: record.social_links?.whatsapp ?? `https://wa.me/${record.whatsapp_number ?? ''}`,
      tiktok: record.social_links?.tiktok ?? '',
    },
    whatsappNumber: record.whatsapp_number ?? record.phone.replace(/\D/g, ''),
    whatsappMessage: `Hi! I'd like to know more about joining ${record.gym_name}.`,
    trialCTA: 'Claim Your Free 7-Day Trial',

    // Pipeline metadata
    paystackPublicKey: '',
    deployedUrl: '',
    vercelProjectId: '',
    supabaseRowId: record.id,
  }
}

function normalizeServices(services: any): any[] {
  if (!services || !Array.isArray(services)) return []
  return services.map((s: any) => ({
    name: s.name ?? s,
    icon: '',
    desc: s.desc ?? s.description ?? '',
    image: s.image ?? '',
  }))
}

function normalizeTrainers(trainers: any[]): any[] {
  return trainers.map((t: any, i: number) => ({
    id: `trainer-${i + 1}`,
    name: t.name ?? '',
    specialty: t.specialty ?? '',
    experience: t.experience ?? '',
    image: t.image_url ?? t.image ?? '',
    coverImage: '',
    bio: t.bio ?? '',
    certifications: t.certifications ?? [],
    specialties: t.specialties ?? [],
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    quote: t.quote ?? '',
  }))
}

function normalizePlans(plans: any): any[] {
  if (!plans || !Array.isArray(plans)) {
    // Default plans if none submitted
    return [
      { name: 'Starter', price: 2500, currency: 'KES', period: 'month', highlight: false, features: ['Full gym access', '2 group classes/week', 'Locker access'] },
      { name: 'Pro', price: 4500, currency: 'KES', period: 'month', highlight: true, badge: 'Most Popular', features: ['Full gym access', 'Unlimited group classes', 'Monthly trainer check-in'] },
      { name: 'Elite', price: 8000, currency: 'KES', period: 'month', highlight: false, features: ['Everything in Pro', '4 PT sessions/month', 'Nutrition consultation'] },
    ]
  }
  return plans.map((p: any, i: number) => ({
    name: p.name,
    price: Number(p.price),
    currency: p.currency ?? 'KES',
    period: 'month',
    highlight: i === 1, // Middle plan is featured
    badge: i === 1 ? 'Most Popular' : undefined,
    features: p.features ?? [],
  }))
}

function convertMapsLinkToEmbed(url: string): string {
  // If it's already an embed URL, return as-is
  if (url.includes('/maps/embed')) return url

  // Convert share URL to embed URL
  // e.g. https://maps.app.goo.gl/... → use the query param approach
  try {
    const encoded = encodeURIComponent(url)
    return `https://maps.google.com/maps?q=${encoded}&output=embed`
  } catch {
    return url
  }
}


// ─── Step 4: Create GitHub repo from template ────────────────
async function createGithubRepo(
  repoName: string,
  config: Record<string, any>
): Promise<string> {
  const pat = Deno.env.get('GITHUB_PAT')!
  const templateRepo = Deno.env.get('GITHUB_TEMPLATE_REPO')! // "owner/repo-name"
  const [templateOwner, templateRepoName] = templateRepo.split('/')

  const headers = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }

  // 1. Create repo from template
  const createRes = await fetch(
    `https://api.github.com/repos/${templateOwner}/${templateRepoName}/generate`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        owner: templateOwner,
        name: repoName,
        description: `${config.gymName} — Jenga Systems gym site`,
        private: false,
        include_all_branches: false,
      }),
    }
  )

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Failed to create GitHub repo: ${err}`)
  }

  const repo = await createRes.json()
  const repoFullName = repo.full_name

  // Wait a moment for GitHub to finish setting up the repo
  await new Promise(r => setTimeout(r, 3000))

  // 2. Inject gym.config.json into the repo
  const configContent = toBase64(JSON.stringify(config, null, 2))
  const injectRes = await fetch(
    `https://api.github.com/repos/${repoFullName}/contents/src/config/gym.config.json`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Configure site for ${config.gymName}`,
        content: configContent,
      }),
    }
  )

  if (!injectRes.ok) {
    const err = await injectRes.text()
    throw new Error(`Failed to inject config into repo: ${err}`)
  }

  return repo.html_url
}


// ─── Step 5: Deploy to Vercel ────────────────────────────────
async function deployToVercel(repoName: string): Promise<string> {
  const token = Deno.env.get('VERCEL_TOKEN')!
  const teamId = Deno.env.get('VERCEL_TEAM_ID') // optional
  const githubOrg = Deno.env.get('GITHUB_ORG') ?? 'anthonynjenga2020'

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const baseUrl = `https://api.vercel.com`
  const teamParam = teamId ? `?teamId=${teamId}` : ''
  const fullRepo = `${githubOrg}/${repoName}`

  // Give GitHub time to fully propagate the new repo + config commit
  // before Vercel tries to access it. Without this, Vercel 404s.
  console.log(`[deployToVercel] Waiting 10s for GitHub to propagate ${fullRepo}...`)
  await new Promise(r => setTimeout(r, 10_000))

  // 1. Create Vercel project linked to GitHub repo
  //    If Vercel's GitHub App isn't installed on the GitHub account,
  //    this call (and the deploy below) will return "repository can't be found".
  //    Fix: go to https://vercel.com/account/git → Install GitHub App → grant
  //    access to the anthonynjenga2020 account (or all repos).
  const projectRes = await fetch(`${baseUrl}/v9/projects${teamParam}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: repoName,
      framework: 'vite',
      gitRepository: {
        type: 'github',
        repo: fullRepo,
      },
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
    }),
  })

  let projectId: string
  if (projectRes.ok) {
    const project = await projectRes.json()
    projectId = project.id
    console.log(`[deployToVercel] Project created: ${projectId}`)
  } else {
    const projectErr = await projectRes.text()
    // 409 = project name already exists — that's fine, just grab its ID
    if (projectRes.status === 409) {
      console.warn(`[deployToVercel] Project already exists, fetching ID...`)
      const getRes = await fetch(`${baseUrl}/v9/projects/${repoName}${teamParam}`, { headers })
      if (!getRes.ok) {
        throw new Error(`Could not fetch existing Vercel project "${repoName}": ${await getRes.text()}`)
      }
      const existing = await getRes.json()
      projectId = existing.id
    } else {
      // Any other error (401, 404 "repo not found", etc.) — surface the full message
      throw new Error(
        `Failed to create Vercel project for GitHub repo "${fullRepo}".\n` +
        `Vercel error: ${projectErr}\n\n` +
        `Most likely fix: install the Vercel GitHub App at https://vercel.com/account/git ` +
        `and grant it access to the "${githubOrg}" GitHub account.`
      )
    }
  }

  // 2. Trigger deployment from the main branch
  const deployRes = await fetch(`${baseUrl}/v13/deployments${teamParam}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: repoName,
      target: 'production',
      gitSource: {
        type: 'github',
        org: githubOrg,
        repo: repoName,
        ref: 'main',
      },
      projectSettings: {
        framework: 'vite',
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
      },
    }),
  })

  if (!deployRes.ok) {
    const deployErr = await deployRes.text()
    throw new Error(
      `Vercel deployment trigger failed for project "${repoName}".\n` +
      `Vercel error: ${deployErr}`
    )
  }

  const deployment = await deployRes.json()
  console.log(`[deployToVercel] Deployment queued: ${deployment.url}`)

  // Return the canonical production URL
  return `https://${deployment.url ?? `${repoName}.vercel.app`}`
}


// ─── Step 7: Notify Anthony via WhatsApp ─────────────────────
async function notifyAnthony(
  record: Record<string, any>,
  deployedUrl: string
): Promise<void> {
  const token = Deno.env.get('WHATSAPP_TOKEN')
  const phoneId = Deno.env.get('WHATSAPP_PHONE_ID')
  const anthonyNumber = Deno.env.get('ANTHONY_WHATSAPP')

  // If WhatsApp isn't configured yet, just log
  if (!token || !phoneId || !anthonyNumber) {
    console.log('[notifyAnthony] WhatsApp not configured — skipping notification')
    console.log(`[notifyAnthony] Deployed: ${record.gym_name} → ${deployedUrl}`)
    return
  }

  const message = [
    `🏋️ *New Gym Site Deployed!*`,
    ``,
    `*${record.gym_name}*`,
    `Owner: ${record.owner_name}`,
    `Phone: ${record.phone}`,
    `Email: ${record.email}`,
    ``,
    `🌐 Site: ${deployedUrl}`,
    ``,
    `Next: Connect custom domain + send site link to client.`,
  ].join('\n')

  await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: anthonyNumber,
        type: 'text',
        text: { body: message },
      }),
    }
  )
}


// ─── UTF-8 safe base64 encoder ───────────────────────────────
// Deno's btoa() only handles Latin1 (bytes 0–255). Any Unicode character
// above U+00FF (curly quotes, em-dashes, etc.) will throw
// "Cannot encode string: string contains characters outside of the Latin1 range".
// Fix: encode to UTF-8 bytes first via TextEncoder, then btoa each byte.
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// ─── Helpers ─────────────────────────────────────────────────
async function updateStatus(
  id: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  const update: Record<string, any> = { status }
  if (errorMessage) update.error_message = errorMessage
  await supabase.from('intake_submissions').update(update).eq('id', id)
}
