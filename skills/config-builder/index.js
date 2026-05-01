/**
 * config-builder
 * Transforms a Supabase intake_submissions row into a valid gym.config.json
 *
 * Usage:
 *   node index.js --id <uuid>              # fetch from Supabase by row ID
 *   node index.js --id <uuid> --out ./     # write file to directory
 *   node index.js --file intake.json       # build from local JSON file
 *   cat intake.json | node index.js        # pipe JSON via stdin
 *
 * Outputs gym.config.json to --out dir, or prints to stdout if omitted.
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { buildConfig } from './builder.js'
import { fetchIntakeRow } from './supabase.js'

const args = process.argv.slice(2)
const get  = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null }

const rowId   = get('--id')
const outDir  = get('--out')
const inFile  = get('--file')

async function main() {
  let intakeRow

  if (rowId) {
    // ── Fetch from Supabase ──────────────────────────────────────────────────
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
      process.exit(1)
    }
    console.log(`🔍  Fetching intake row ${rowId} …`)
    intakeRow = await fetchIntakeRow(rowId, url, key)
    console.log(`✅  Found: ${intakeRow.gym_name}`)

  } else if (inFile) {
    // ── Read from file ───────────────────────────────────────────────────────
    const raw = fs.readFileSync(path.resolve(inFile), 'utf-8')
    intakeRow = JSON.parse(raw)

  } else if (!process.stdin.isTTY) {
    // ── Read from stdin ──────────────────────────────────────────────────────
    const chunks = []
    for await (const chunk of process.stdin) chunks.push(chunk)
    intakeRow = JSON.parse(chunks.join(''))

  } else {
    console.error('Usage: node index.js --id <uuid>  |  --file <path>  |  pipe JSON via stdin')
    process.exit(1)
  }

  // ── Build config ─────────────────────────────────────────────────────────
  const config = buildConfig(intakeRow)
  const json   = JSON.stringify(config, null, 2)

  if (outDir) {
    const dest = path.join(path.resolve(outDir), 'gym.config.json')
    fs.writeFileSync(dest, json, 'utf-8')
    console.log(`📄  Config written to ${dest}`)
    console.log(`    gymId: ${config.gymId}`)
    console.log(`    template: ${config.templateVariant}`)
  } else {
    // Print to stdout so other scripts can pipe it
    process.stdout.write(json + '\n')
  }
}

main().catch(err => {
  console.error('❌  config-builder error:', err.message)
  process.exit(1)
})
