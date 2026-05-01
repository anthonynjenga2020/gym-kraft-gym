/**
 * github.js
 * GitHub REST API v3 helpers — no external SDK needed
 */

const GITHUB_API = 'https://api.github.com'

function headers(pat) {
  return {
    'Authorization': `Bearer ${pat}`,
    'Accept':        'application/vnd.github+json',
    'Content-Type':  'application/json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
}

/**
 * Check if a repo already exists under OWNER
 */
export async function repoExists(repoName, owner, pat) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repoName}`, {
    headers: headers(pat)
  })
  return res.status === 200
}

/**
 * Create a new repo from a template repo
 * https://docs.github.com/en/rest/repos/repos#create-a-repository-using-a-template
 */
export async function createRepoFromTemplate(templateRepo, newRepoName, owner, pat, gymName) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${templateRepo}/generate`,
    {
      method: 'POST',
      headers: headers(pat),
      body: JSON.stringify({
        owner,
        name:        newRepoName,
        description: `Jenga Systems gym site — ${gymName}`,
        private:     false,
        include_all_branches: false
      })
    }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`GitHub create-from-template failed: ${res.status} — ${body.message ?? JSON.stringify(body)}`)
  }

  return await res.json()
}

/**
 * Get the current SHA of a file (needed for updates)
 * Returns null if file doesn't exist yet
 */
async function getFileSha(repoName, owner, pat, filePath) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/contents/${filePath}`,
    { headers: headers(pat) }
  )
  if (res.status === 404) return null
  if (!res.ok) return null
  const data = await res.json()
  return data.sha ?? null
}

/**
 * Create or update a file in the repo
 * https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
 */
export async function injectConfig(repoName, owner, pat, config) {
  const filePath = 'src/config/gym.config.json'
  const content  = Buffer.from(JSON.stringify(config, null, 2)).toString('base64')
  const sha      = await getFileSha(repoName, owner, pat, filePath)

  const body = {
    message: `Configure site for ${config.gymName}`,
    content,
    branch: 'main'
  }
  if (sha) body.sha = sha  // Required for updates

  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/contents/${filePath}`,
    {
      method:  'PUT',
      headers: headers(pat),
      body:    JSON.stringify(body)
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(`GitHub file inject failed: ${res.status} — ${data.message ?? JSON.stringify(data)}`)
  }

  return await res.json()
}

/**
 * Get the latest commit SHA on main (used to verify repo is ready)
 */
export async function getLatestCommit(repoName, owner, pat) {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repoName}/commits?per_page=1`,
    { headers: headers(pat) }
  )
  if (!res.ok) return null
  const commits = await res.json()
  return commits[0]?.sha ?? null
}
