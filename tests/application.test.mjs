import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync } from 'node:crypto'
import { APPLICATION_FIELDS, buildSheetRow, validateApplication } from '../api/lib/applications.mjs'
import { createApplicationHandler } from '../api/lib/handler.mjs'
import { appendApplicationRow } from '../api/lib/google-sheets.mjs'
import { enforceRateLimit } from '../api/lib/rate-limit.mjs'

const sample = {
  name: '  Ada Student ',
  contactNumber: '+91 98765 43210',
  email: 'ADA@example.edu',
  rollNo: 'SE-101',
  gender: 'Female',
  year: 'SE',
  domain: 'Tech Team',
  experience: '  Built a small project.  ',
}

test('validates and normalizes exactly the supplied application fields', () => {
  assert.deepEqual(Object.keys(validateApplication(sample)), APPLICATION_FIELDS)
  assert.deepEqual(validateApplication(sample), {
    ...sample,
    name: 'Ada Student',
    email: 'ada@example.edu',
    experience: 'Built a small project.',
  })
})

test('rejects missing, malformed, out-of-range, and unexpected values', () => {
  for (const input of [
    { ...sample, email: '' },
    { ...sample, contactNumber: 'call me maybe' },
    { ...sample, gender: 'Prefer not to say' },
    { ...sample, year: 'FY' },
    { ...sample, domain: 'Something else' },
    { ...sample, name: 'n'.repeat(101) },
    { ...sample, extra: 'not in the application schema' },
    { ...sample, website: 'bot-filled-trap' },
    { ...sample, website: 42 },
  ]) assert.throws(() => validateApplication(input))
  assert.throws(() => validateApplication(null))
})

test('accepts the optional experience field when omitted', () => {
  const { experience: _experience, ...withoutExperience } = sample
  assert.equal(validateApplication(withoutExperience).experience, '')
})

test('builds the stable timestamp-first Google Sheet row', () => {
  const row = buildSheetRow(validateApplication(sample), '2026-10-18T00:00:00.000Z')
  assert.deepEqual(row, [
    '2026-10-18T00:00:00.000Z', 'Ada Student', '+91 98765 43210', 'ada@example.edu',
    'SE-101', 'Female', 'SE', 'Tech Team', 'Built a small project.',
  ])
})

function fakeResponse() {
  return {
    code: 200,
    headers: {},
    payload: undefined,
    status(code) { this.code = code; return this },
    setHeader(name, value) { this.headers[name] = value },
    json(payload) { this.payload = payload; return this },
    end() { this.ended = true; return this },
  }
}

function request(overrides = {}) {
  return {
    method: 'POST',
    headers: {
      origin: 'https://chapter.example',
      'content-type': 'application/json',
      'x-real-ip': '203.0.113.7',
    },
    body: { ...sample, website: '' },
    ...overrides,
  }
}

test('API reports success only after the row writer resolves', async () => {
  const writes = []
  const handler = createApplicationHandler({
    appendRow: async row => { writes.push(row) },
    rateLimit: async () => true,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
    now: () => new Date('2026-10-18T00:00:00.000Z'),
  })
  const res = fakeResponse()
  await handler(request(), res)
  assert.equal(res.code, 201)
  assert.equal(res.payload.success, true)
  assert.equal(writes.length, 1)
  assert.equal(writes[0][0], '2026-10-18T00:00:00.000Z')
})

test('API rejects invalid requests and never writes rejected applications', async () => {
  let writes = 0
  const handler = createApplicationHandler({
    appendRow: async () => { writes += 1 },
    rateLimit: async () => true,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const invalid = fakeResponse()
  await handler(request({ body: { ...sample, year: 'FY' } }), invalid)
  assert.equal(invalid.code, 400)
  assert.equal(writes, 0)

  const wrongOrigin = fakeResponse()
  await handler(request({ headers: { ...request().headers, origin: 'https://other.example' } }), wrongOrigin)
  assert.equal(wrongOrigin.code, 403)
  assert.equal(writes, 0)

  const limitedHandler = createApplicationHandler({
    appendRow: async () => { writes += 1 },
    rateLimit: async () => false,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const limited = fakeResponse()
  await limitedHandler(request(), limited)
  assert.equal(limited.code, 429)
  assert.equal(writes, 0)
})

test('API returns failure when the sheet writer fails and does not claim success', async () => {
  const handler = createApplicationHandler({
    appendRow: async () => { throw new Error('private upstream details') },
    rateLimit: async () => true,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const res = fakeResponse()
  const originalError = console.error
  console.error = () => {}
  try { await handler(request(), res) } finally { console.error = originalError }
  assert.equal(res.code, 502)
  assert.equal(res.payload.success, false)
  assert.equal(JSON.stringify(res.payload).includes('private upstream details'), false)
})

test('API fails closed if durable rate limiting is unavailable', async () => {
  const handler = createApplicationHandler({
    appendRow: async () => assert.fail('must not write when throttling is unavailable'),
    rateLimit: async () => { const error = new Error('private infrastructure detail'); error.code = 'RATE_LIMIT_UNAVAILABLE'; throw error },
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const res = fakeResponse()
  await handler(request(), res)
  assert.equal(res.code, 503)
  assert.equal(res.payload.code, 'service_unavailable')
})

test('API rejects wrong methods, malformed JSON, and oversized bodies', async () => {
  const handler = createApplicationHandler({
    appendRow: async () => assert.fail('must not write'),
    rateLimit: async () => true,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const method = fakeResponse()
  await handler(request({ method: 'GET' }), method)
  assert.equal(method.code, 405)

  const malformed = fakeResponse()
  await handler(request({ body: '{broken' }), malformed)
  assert.equal(malformed.code, 400)

  const oversized = fakeResponse()
  await handler(request({ body: 'x'.repeat(9000) }), oversized)
  assert.equal(oversized.code, 413)
})

test('Google Sheets adapter exchanges a signed service-account assertion and appends one RAW row', async () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const env = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: 'chapter-writer@example.iam.gserviceaccount.com',
    GOOGLE_PRIVATE_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    GOOGLE_SHEET_ID: 'sheet-id-123',
    GOOGLE_SHEET_RANGE: 'Applications!A:I',
  }
  const calls = []
  const fakeFetch = async (url, options) => {
    calls.push({ url: String(url), options })
    if (String(url).includes('oauth2.googleapis.com')) {
      return { ok: true, json: async () => ({ access_token: 'test-access-token', expires_in: 3600 }) }
    }
    return { ok: true, json: async () => ({ updates: { updatedRows: 1 } }) }
  }
  await appendApplicationRow(buildSheetRow(validateApplication(sample)), env, fakeFetch)
  assert.equal(calls.length, 2)
  assert.match(calls[0].options.body.toString(), /grant_type=/)
  assert.match(calls[1].url, /valueInputOption=RAW/)
  assert.equal(calls[1].options.headers.Authorization, 'Bearer test-access-token')
  assert.equal(JSON.parse(calls[1].options.body).values.length, 1)
})

test('durable rate limiter uses an atomic hashed-IP counter and enforces its limit', async () => {
  const calls = []
  const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test-token' }
  const allowed = await enforceRateLimit('203.0.113.7', env, async (url, options) => {
    calls.push({ url: String(url), options })
    return { ok: true, json: async () => ({ result: 10 }) }
  })
  assert.equal(allowed, true)
  const command = JSON.parse(calls[0].options.body)
  assert.equal(command[0], 'EVAL')
  assert.equal(command[2], '1')
  assert.match(command[3], /^acm:application:[a-f0-9]{64}$/)
  assert.equal(command[3].includes('203.0.113.7'), false)

  const limited = await enforceRateLimit('203.0.113.7', env, async () => ({ ok: true, json: async () => ({ result: 11 }) }))
  assert.equal(limited, false)
  await assert.rejects(() => enforceRateLimit('203.0.113.7', {}, async () => assert.fail()), error => error.code === 'RATE_LIMIT_UNAVAILABLE')
})
