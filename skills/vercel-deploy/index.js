/**
 * vercel-deploy
 * Creates a Vercel project linked to a GitHub gym repo and triggers deployment.
 * Polls until the deployment is live, then returns the URL.
 *
 * Usage:
 *   node index.js --repo gym-iron-forge-gym --gymId iron-forge-gym
 *   node index.js --repo gym-iron-forge-gym --gymId iron-forge-gym --wait
 *
 * Env required:
 *   VERCEL_TOKEN     — Vercel API token
 *   VERCEL_TEAM_ID   — Optional, for team accounts
 *   GITHUB_ORG_OR_USER — GitHub owner of the repo
 *
 * Outputs the deployment URL to stdout on success.
 */

import 'dotenv/config'
import {
  projectExists,
  createProject,
  triggerDeploy,
  pollDeployment,
  getProjectDomains
} from './vercel.js'

const args  = process.argv.slice(2)
const get   = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null }
const has   = (flag) => args.includes(flag)

const repoName = get('--repo')
const gymId    = get('--gymId')
const waitFlag = has('--wait')  // wait for deployment to complete (default: yes)

const TOKEN   = process.env.VERCEL_TOKEN
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? null
const GH_USER = process.env.GITHUB_ORG_OR_USER

async function main() {
  // ── Validate ──────────────────────────────────────────────────────────────
  if (!TOKEN) {
    console.error('❌  VERCEL_TOKEN is required in .env')
    process.exit(1)
  }
  if (!GH_USER) {
    console.error('❌  GITHUB_ORG_OR_USER is required in .env')
    process.exit(1)
  }
  if (!repoName) {
    console.error('Usage: node index.js --repo <github-repo-name> --gymId <gym-id>')
    process.exit(1)
  }

  const projectName = gymId ?? repoName
  console.log(`\n🚀  Vercel Deploy`)
  console.log(`    Project  : ${projectName}`)
  console.log(`    Repo     : ${GH_USER}/${repoName}\n`)

  // ── Create project if it doesn't exist ────────────────────────────────────
  const exists = await projectExists(projectName, TOKEN, TEAM_ID)
  let project

  if (exists) {
    console.log(`ℹ️   Vercel project "${projectName}" already exists — triggering redeploy`)
    project = exists
  } else {
    console.log(`📁  Creating Vercel project…`)
    project = await createProject(projectName, repoName, GH_USER, TOKEN, TEAM_ID)
    console.log(`✅  Project created: ${project.id}`)
    // Small delay for Vercel to wire up the GitHub integration
    await sleep(2000)
  }

  // ── Trigger deployment ────────────────────────────────────────────────────
  console.log(`🔨  Triggering deployment…`)
  const deployment = await triggerDeploy(projectName, repoName, GH_USER, TOKEN, TEAM_ID)
  console.log(`✅  Deployment queued: ${deployment.id}`)
  console.log(`    Build URL: https://vercel.com/${TEAM_ID ?? GH_USER}/${projectName}/deployments`)

  // ── Poll until ready ──────────────────────────────────────────────────────
  const shouldWait = waitFlag !== false  // wait by default
  let deployUrl = `https://${projectName}.vercel.app`

  if (shouldWait) {
    console.log(`\n⏳  Waiting for deployment to go live…`)
    const result = await pollDeployment(deployment.id, TOKEN, TEAM_ID)

    if (result.state === 'READY') {
      deployUrl = `https://${result.url}`
      console.log(`\n🎉  Deployment live!`)
      console.log(`    URL: ${deployUrl}`)
    } else if (result.state === 'ERROR') {
      console.error(`❌  Deployment failed. Check Vercel dashboard.`)
      process.exit(1)
    }
  } else {
    console.log(`\n⚡  Deploy triggered (not waiting for completion)`)
    console.log(`    Expected URL: ${deployUrl}`)
  }

  // Output the URL for piping to next step
  process.stdout.write(deployUrl + '\n')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(err => {
  console.error('❌  vercel-deploy error:', err.message)
  process.exit(1)
})
