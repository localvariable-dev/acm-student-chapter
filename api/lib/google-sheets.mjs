import { createSign } from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const b64url = value => Buffer.from(value).toString('base64url')
let cachedToken

function serviceAccountCredentials(env) {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !privateKey || !env.GOOGLE_SHEET_ID) {
    const error = new Error('Google Sheets configuration is incomplete.')
    error.code = 'SHEETS_NOT_CONFIGURED'
    throw error
  }
  return { email, privateKey }
}

async function getAccessToken(env, fetcher = fetch) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value
  const { email, privateKey } = serviceAccountCredentials(env)
  const issuedAt = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(JSON.stringify({
    iss: email,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: issuedAt,
    exp: issuedAt + 3600,
  }))
  const unsignedToken = `${header}.${claims}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  const assertion = `${unsignedToken}.${signer.sign(privateKey, 'base64url')}`
  const tokenResponse = await fetcher(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(12000),
  })
  if (!tokenResponse.ok) throw new Error('Google authorization failed.')
  const tokenData = await tokenResponse.json()
  if (typeof tokenData.access_token !== 'string' || !Number.isFinite(tokenData.expires_in)) throw new Error('Google returned an invalid authorization response.')
  cachedToken = { value: tokenData.access_token, expiresAt: Date.now() + tokenData.expires_in * 1000 }
  return cachedToken.value
}

export async function appendApplicationRow(row, env = process.env, fetcher = fetch) {
  serviceAccountCredentials(env)
  if (!env.GOOGLE_SHEET_RANGE) {
    const error = new Error('Google Sheets range is not configured.')
    error.code = 'SHEETS_NOT_CONFIGURED'
    throw error
  }
  const token = await getAccessToken(env, fetcher)
  const range = encodeURIComponent(env.GOOGLE_SHEET_RANGE)
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(env.GOOGLE_SHEET_ID)}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`
  const response = await fetcher(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ majorDimension: 'ROWS', values: [row] }),
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw new Error('Google Sheets did not accept the application row.')
  const result = await response.json()
  if (result?.updates?.updatedRows !== 1) throw new Error('Google Sheets did not confirm the application row.')
  return true
}
