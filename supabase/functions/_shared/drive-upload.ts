// ============================================================
// Google Drive Upload Utility
// Uses a Google Cloud Service Account to upload files to Drive.
// Works in Deno (Supabase Edge Functions).
//
// SETUP:
// 1. Go to console.cloud.google.com → IAM & Admin → Service Accounts
// 2. Create a service account → generate a JSON key
// 3. Share your target Drive folder with the service account email
//    (the email looks like: something@project-id.iam.gserviceaccount.com)
// 4. Add the JSON key content as GOOGLE_SERVICE_ACCOUNT_JSON env var in Supabase
// 5. Add the target folder ID as GOOGLE_DRIVE_FOLDER_ID env var
//    (the folder ID is the long string at the end of the Drive URL)
// ============================================================

interface ServiceAccount {
  client_email: string
  private_key: string
}

/**
 * Get a Google OAuth2 access token using a service account.
 * Implements the JWT Bearer flow (RFC 7523).
 */
async function getAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiry = now + 3600 // 1 hour

  // JWT Header
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  // JWT Payload
  const payload = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const signingInput = `${header}.${payload}`

  // Import the private key (PEM → CryptoKey)
  const privateKeyPem = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\n/g, '')

  const privateKeyDer = Uint8Array.from(atob(privateKeyPem), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  // Sign the JWT
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  )
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const jwt = `${signingInput}.${signature}`

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Failed to get Google access token: ${err}`)
  }

  const { access_token } = await tokenRes.json()
  return access_token
}


/**
 * Upload a file (as a Blob/ArrayBuffer) to a Google Drive folder.
 * Returns the public URL of the uploaded file.
 *
 * @param fileData   - Raw file bytes as ArrayBuffer
 * @param fileName   - e.g. "ironclad-logo.png"
 * @param mimeType   - e.g. "image/png", "image/jpeg"
 * @param folderId   - Google Drive folder ID to upload into
 * @param accessToken - OAuth2 access token from getAccessToken()
 * @returns           - Google Drive file ID and shareable URL
 */
export async function uploadFileToDrive(
  fileData: ArrayBuffer,
  fileName: string,
  mimeType: string,
  folderId: string,
  accessToken: string
): Promise<{ fileId: string; viewUrl: string; downloadUrl: string }> {

  // Metadata for the file
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  })

  // Build multipart upload body
  const boundary = '-------314159265358979323846'
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadataPart =
    `${delimiter}Content-Type: application/json\r\n\r\n${metadata}`

  const metadataBytes = new TextEncoder().encode(metadataPart)
  const fileHeaderBytes = new TextEncoder().encode(
    `${delimiter}Content-Type: ${mimeType}\r\n\r\n`
  )
  const closeBytes = new TextEncoder().encode(closeDelimiter)

  const fileBytes = new Uint8Array(fileData)

  const body = new Uint8Array(
    metadataBytes.length + fileHeaderBytes.length + fileBytes.length + closeBytes.length
  )
  let offset = 0
  body.set(metadataBytes, offset); offset += metadataBytes.length
  body.set(fileHeaderBytes, offset); offset += fileHeaderBytes.length
  body.set(fileBytes, offset); offset += fileBytes.length
  body.set(closeBytes, offset)

  // Upload via resumable/multipart upload
  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
        'Content-Length': String(body.length),
      },
      body,
    }
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    throw new Error(`Drive upload failed for "${fileName}": ${err}`)
  }

  const file = await uploadRes.json()

  // Make the file publicly readable so the site can use the URL directly
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  })

  return {
    fileId: file.id,
    viewUrl: file.webViewLink,
    // Direct image URL usable in <img src="...">
    downloadUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
  }
}


/**
 * Main helper: initialise the Drive client from env vars and upload a file.
 * Usage inside an Edge Function:
 *
 *   const url = await uploadToJengaDrive(imageBuffer, 'logo.png', 'image/png')
 */
export async function uploadToJengaDrive(
  fileData: ArrayBuffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')
  const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')

  if (!serviceAccountJson || !folderId) {
    throw new Error(
      'Missing env vars: GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_DRIVE_FOLDER_ID'
    )
  }

  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson)
  const accessToken = await getAccessToken(serviceAccount)

  const { downloadUrl } = await uploadFileToDrive(
    fileData,
    fileName,
    mimeType,
    folderId,
    accessToken
  )

  return downloadUrl
}
