/**
 * gym-site-generator
 * Master pipeline: Supabase intake row → live gym website on Vercel
 *
 * Pipeline:
 *   1. Fetch intake_submissions row from Supabase
 *   2. Update status → 'processing'
 *   3. Build gym.config.json (config-builder)
 *   4. Create GitHub repo + inject config (github-repo-scaffolder)
 *   5. Create Vercel project + deploy (vercel-deploy)
 *   6. Update intake row: status='deployed', deployed_url, config_json
 *   7. Insert row into gym_clients table
 *
 * Usage:
 *   node index.js --id <supabase-row-uuid>
 *   node index.js --id <uuid> --dry-run     # build config only, skip GitHub/Vercel
 *
 * Env required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   GITHUB_PAT, GITHUB_ORG_OR_USER, GITHUB_TEMPLATE_REPO
 *   VERCEL_TOKEN, VERCEL_TEAM_ID (optional)
 */

import 'dotenv/config'
import { buildConfig, slugify } from '../config-builder/builder.js'
import { fetchIntakeRow, updateIntakeStatus } from '../config-builder/supabase.js'
import { repoExists, createRepoFromTemplate, injectConfig } from '../github-repo-scaffolder/github.js'
import { projectExists, createProject, triggerDeploy, pollDeployment } from '../vercel-deploy/vercel.js'
import { createGymClient } from './supabase.js'

const args   = process.argv.slice(2)
const get    = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null }
const has    = (flag) => args.includes(flag)

const rowId  = get('--id')
const dryRun = has('--dry-run')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GH_PAT       = process.env.GITHUB_PAT
const GH_OWNER     = process.env.GITHUB_ORG_OR_USER
const GH_TEMPLATE  = process.env.GITHUB_TEMPLATE_REPO ?? 'jenga-gym-template'
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM  = process.env.VERCEL_TEAM_ID ?? null

function validateEnv() {
  const required = {
    SUPABASE_URL:             SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_KEY,
    GITHUB_PAT:               GH_PAT,
    GITHUB_ORG_OR_USER:       GH_OWNER,
    VERCEL_TOKEN:             VERCEL_TOKEN
  }
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (missing.length) {
    console.error(`❌  Missing env vars: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function main() {
  if (!rowId) {
    console.error('Usage: node index.js --id <supabase-row-uuid>')
    process.exit(1)
  }

  if (!dryRun) validateEnv()

  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║       Jenga Systems — Gym Site Generator     ║')
  console.log('╚══════════════════════════════════════════════╝\n')
  if (dryRun) console.log('⚠️   DRY RUN MODE — GitHub/Vercel steps will be skipped\n')

  // ── Step 1: Fetch intake row ─────────────────────────────────────────────
  log('step', 1, 'Fetching intake submission…')
  const intake = await fetchIntakeRow(rowId, SUPABASE_URL, SUPABASE_KEY)
  console.log(`     Gym: ${intake.gym_name}`)
  console.log(`     Owner: ${intake.owner_name}`)
  console.log(`     Template: ${intake.template_variant ?? 'V1'}`)

  // ── Step 2: Mark as processing ───────────────────────────────────────────
  log('step', 2, 'Updating status → processing…')
  if (!dryRun) {
    await updateIntakeStatus(rowId, 'processing', SUPABASE_URL, SUPABASE_KEY)
  }
  console.log('     ✅ Status updated')

  // ── Step 3: Build config ─────────────────────────────────────────────────
  log('step', 3, 'Building gym.config.json…')
  const config = buildConfig(intake)
  const repoName = `gym-${config.gymId}`
  console.log(`     gymId : ${config.gymId}`)
  console.log(`     repo  : ${repoName}`)

  if (dryRun) {
    console.log('\n📄  Config preview:')
    console.log(JSON.stringify(config, null, 2))
    console.log('\n✅  Dry run complete. No GitHub/Vercel changes made.')
    return
  }

  // ── Step 4: GitHub repo scaffolding ──────────────────────────────────────
  log('step', 4, 'Scaffolding GitHub repo…')
  const exists = await repoExists(repoName, GH_OWNER, GH_PAT)

  if (exists) {
    console.log(`     Repo exists — injecting updated config`)
  } else {
    await createRepoFromTemplate(GH_TEMPLATE, repoName, GH_OWNER, GH_PAT, intake.gym_name)
    console.log(`     ✅ Repo created: github.com/${GH_OWNER}/${repoName}`)
    await sleep(4000)  // let GitHub initialize
  }

  await injectConfig(repoName, GH_OWNER, GH_PAT, config)
  console.log(`     ✅ gym.config.json injected`)

  // ── Step 5: Vercel deploy ─────────────────────────────────────────────────
  log('step', 5, 'Deploying to Vercel…')
  const vercelProject = await projectExists(config.gymId, VERCEL_TOKEN, VERCEL_TEAM)

  if (!vercelProject) {
    await createProject(config.gymId, repoName, GH_OWNER, VERCEL_TOKEN, VERCEL_TEAM)
    console.log(`     ✅ Vercel project created`)
    await sleep(2000)
  } else {
    console.log(`     Project exists — triggering redeploy`)
  }

  const deployment = await triggerDeploy(config.gymId, repoName, GH_OWNER, VERCEL_TOKEN, VERCEL_TEAM)
  console.log(`     ✅ Deployment triggered: ${deployment.id}`)
  console.log(`\n⏳  Polling deployment status…`)

  const result = await pollDeployment(deployment.id, VERCEL_TOKEN, VERCEL_TEAM)

  if (result.state !== 'READY') {
    const errMsg = `Deployment ended with state: ${result.state}`
    await updateIntakeStatus(rowId, 'failed', SUPABASE_URL, SUPABASE_KEY, {
      error_message: errMsg
    })
    console.error(`\n❌  ${errMsg}`)
    process.exit(1)
  }

  const deployedUrl = `https://${result.url}`
  console.log(`\n     🌐  Live at: ${deployedUrl}`)

  // ── Step 6: Update Supabase row ───────────────────────────────────────────
  log('step', 6, 'Updating Supabase…')
  const finalConfig = { ...config, deployedUrl, vercelProjectId: config.gymId }

  await updateIntakeStatus(rowId, 'deployed', SUPABASE_URL, SUPABASE_KEY, {
    deployed_url:       deployedUrl,
    vercel_project_id:  config.gymId,
    config_json:        finalConfig
  })
  console.log('     ✅ intake_submissions updated')

  // ── Step 7: Create gym client record + send welcome email ────────────────
  log('step', 7, 'Creating gym client record…')
  await createGymClient(intake, deployedUrl, rowId, SUPABASE_URL, SUPABASE_KEY)
  console.log('     ✅ gym_clients record created')

  // Send welcome email via jengasystems API (non-blocking)
  const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY
  const APP_URL          = process.env.APP_URL ?? 'https://jengasystems.online'
  if (INTERNAL_API_KEY && intake.email) {
    fetch(`${APP_URL}/api/email/site-deployed`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': INTERNAL_API_KEY },
      body:    JSON.stringify({
        ownerName:   intake.owner_name,
        gymName:     intake.gym_name,
        deployedUrl,
        email:       intake.email
      })
    }).then(() => console.log('     ✅ Welcome email triggered'))
      .catch(e => console.warn('     ⚠️  Welcome email failed (non-critical):', e.message))
  } else {
    console.log('     ℹ️  Welcome email skipped (no INTERNAL_API_KEY or no client email)')
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║              ✅  SITE IS LIVE!               ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log(`\n  Gym     : ${intake.gym_name}`)
  console.log(`  URL     : ${deployedUrl}`)
  console.log(`  Repo    : github.com/${GH_OWNER}/${repoName}`)
  console.log(`  Next    : Connect custom domain in Vercel dashboard\n`)

  process.stdout.write(deployedUrl + '\n')
}

function log(type, step, msg) {
  console.log(`\n[${step}/7] ${msg}`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(async (err) => {
  console.error('\n❌  Pipeline failed:', err.message)

  // Try to mark the row as failed in Supabase
  if (rowId && SUPABASE_URL && SUPABASE_KEY) {
    try {
      await updateIntakeStatus(rowId, 'failed', SUPABASE_URL, SUPABASE_KEY, {
        error_message: err.message.slice(0, 500)
      })
      console.error('     Intake submission marked as failed in Supabase.')
    } catch (supaErr) {
      console.error('     Also failed to update Supabase status:', supaErr.message)
    }
  }

  process.exit(1)
})
