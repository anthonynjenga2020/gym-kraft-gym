/**
 * vercel.js
 * Vercel REST API helpers
 * Docs: https://vercel.com/docs/rest-api
 */

const VERCEL_API = 'https://api.vercel.com'
const POLL_INTERVAL_MS  = 5000   // 5 seconds between checks
const POLL_MAX_ATTEMPTS = 60     // give up after 5 minutes

function headers(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type':  'application/json'
  }
}

function teamQuery(teamId) {
  return teamId ? `?teamId=${teamId}` : ''
}

/**
 * Check if a Vercel project already exists
 * Returns the project object if it exists, null otherwise
 */
export async function projectExists(projectName, token, teamId) {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${projectName}${teamQuery(teamId)}`,
    { headers: headers(token) }
  )
  if (res.status === 404) return null
  if (!res.ok) return null
  return await res.json()
}

/**
 * Create a new Vercel project linked to a GitHub repo
 * https://vercel.com/docs/rest-api/endpoints/projects#create-a-new-project
 */
export async function createProject(projectName, repoName, githubOwner, token, teamId) {
  const body = {
    name: projectName,
    framework: 'vite',
    gitRepository: {
      type:   'github',
      repo:   `${githubOwner}/${repoName}`
    },
    buildCommand:  'npm run build',
    outputDirectory: 'dist',
    installCommand: 'npm install'
  }

  const res = await fetch(
    `${VERCEL_API}/v9/projects${teamQuery(teamId)}`,
    {
      method:  'POST',
      headers: headers(token),
      body:    JSON.stringify(body)
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(`Vercel create project failed: ${res.status} — ${data.error?.message ?? JSON.stringify(data)}`)
  }

  return await res.json()
}

/**
 * Trigger a deployment from the latest GitHub commit
 * https://vercel.com/docs/rest-api/endpoints/deployments#create-a-new-deployment
 */
export async function triggerDeploy(projectName, repoName, githubOwner, token, teamId) {
  const body = {
    name: projectName,
    gitSource: {
      type:   'github',
      org:    githubOwner,
      repo:   repoName,
      ref:    'main'
    }
  }

  const res = await fetch(
    `${VERCEL_API}/v13/deployments${teamQuery(teamId)}`,
    {
      method:  'POST',
      headers: headers(token),
      body:    JSON.stringify(body)
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(`Vercel deploy trigger failed: ${res.status} — ${data.error?.message ?? JSON.stringify(data)}`)
  }

  return await res.json()
}

/**
 * Poll a deployment until it's READY or ERROR
 * Returns the final deployment object
 */
export async function pollDeployment(deploymentId, token, teamId) {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS)

    const res = await fetch(
      `${VERCEL_API}/v13/deployments/${deploymentId}${teamQuery(teamId)}`,
      { headers: headers(token) }
    )

    if (!res.ok) {
      console.error(`  Poll attempt ${attempt + 1}: HTTP ${res.status}`)
      continue
    }

    const data = await res.json()
    const state = data.state ?? data.readyState

    const elapsed = ((attempt + 1) * POLL_INTERVAL_MS / 1000).toFixed(0)
    process.stdout.write(`\r  Status: ${state.padEnd(12)} (${elapsed}s elapsed)  `)

    if (state === 'READY' || state === 'ERROR' || state === 'CANCELED') {
      process.stdout.write('\n')
      return { state, url: data.url, id: data.id }
    }
  }

  process.stdout.write('\n')
  throw new Error(`Deployment timed out after ${(POLL_MAX_ATTEMPTS * POLL_INTERVAL_MS / 1000 / 60).toFixed(0)} minutes`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
