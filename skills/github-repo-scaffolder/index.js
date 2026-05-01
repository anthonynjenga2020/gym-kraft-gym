/**
 * github-repo-scaffolder
 * Creates a GitHub repo from the jenga-gym-template and injects gym.config.json
 *
 * Usage:
 *   node index.js --config ./gym.config.json
 *   node index.js --gymId iron-forge-gym --config ./gym.config.json
 *   cat gym.config.json | node index.js
 *
 * Env required:
 *   GITHUB_PAT            — Personal Access Token (repo scope)
 *   GITHUB_ORG_OR_USER    — e.g. "anthonynjenga2020"
 *   GITHUB_TEMPLATE_REPO  — e.g. "jenga-gym-template"
 *
 * Outputs the new repo URL to stdout on success.
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createRepoFromTemplate, injectConfig, repoExists } from './github.js'

const args   = process.argv.slice(2)
const get    = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null }

const configFile = get('--config')
const gymIdArg   = get('--gymId')

const PAT      = process.env.GITHUB_PAT
const OWNER    = process.env.GITHUB_ORG_OR_USER
const TEMPLATE = process.env.GITHUB_TEMPLATE_REPO ?? 'jenga-gym-template'

async function main() {
  // ── Validate env ──────────────────────────────────────────────────────────
  if (!PAT || !OWNER) {
    console.error('❌  GITHUB_PAT and GITHUB_ORG_OR_USER are required in .env')
    process.exit(1)
  }

  // ── Load config ───────────────────────────────────────────────────────────
  let config
  if (configFile) {
    config = JSON.parse(fs.readFileSync(path.resolve(configFile), 'utf-8'))
  } else if (!process.stdin.isTTY) {
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    config = JSON.parse(chunks.join(''))
  } else {
    console.error('Usage: node index.js --config <path>  |  pipe JSON via stdin')
    process.exit(1)
  }

  const gymId   = gymIdArg ?? config.gymId
  const repoName = `gym-${gymId}`

  console.log(`\n🏗️   GitHub Repo Scaffolder`)
  console.log(`    Template : ${OWNER}/${TEMPLATE}`)
  console.log(`    New repo : ${OWNER}/${repoName}`)
  console.log(`    Gym      : ${config.gymName}\n`)

  // ── Check if repo already exists ──────────────────────────────────────────
  const exists = await repoExists(repoName, OWNER, PAT)
  if (exists) {
    console.log(`⚠️   Repo ${repoName} already exists — skipping creation, injecting config only`)
  } else {
    // ── Create from template ──────────────────────────────────────────────────
    console.log(`📦  Creating repo from template…`)
    await createRepoFromTemplate(TEMPLATE, repoName, OWNER, PAT, config.gymName)
    console.log(`✅  Repo created: https://github.com/${OWNER}/${repoName}`)

    // GitHub takes a moment to initialize the repo
    console.log(`⏳  Waiting for repo to initialize…`)
    await sleep(4000)
  }

  // ── Inject gym.config.json ────────────────────────────────────────────────
  console.log(`💉  Injecting gym.config.json…`)
  await injectConfig(repoName, OWNER, PAT, config)
  console.log(`✅  Config injected into src/config/gym.config.json`)

  const repoUrl = `https://github.com/${OWNER}/${repoName}`
  console.log(`\n🎉  Scaffolding complete!`)
  console.log(`    Repo URL : ${repoUrl}`)

  // Output repo URL to stdout for piping to vercel-deploy
  process.stdout.write(repoUrl + '\n')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(err => {
  console.error('❌  github-repo-scaffolder error:', err.message)
  process.exit(1)
})
