import test from 'node:test'
import assert from 'node:assert/strict'
import { APPLICATION_FIELDS, validateApplication } from '../api/lib/applications.mjs'
import { createApplicationHandler } from '../api/lib/handler.mjs'
import { createSupabaseApplicationWriter, createSupabaseClient } from '../api/lib/supabase.mjs'
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

test('API reports success only after the database writer resolves', async () => {
  const writes = []
  const handler = createApplicationHandler({
    appendRow: async application => { writes.push(application) },
    rateLimit: async () => true,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const res = fakeResponse()
  await handler(request(), res)
  assert.equal(res.code, 201)
  assert.equal(res.payload.success, true)
  assert.equal(writes.length, 1)
  assert.deepEqual(writes[0], validateApplication(sample))
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

test('API returns failure when the database writer fails and does not claim success', async () => {
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

test('API logs only sanitized phase diagnostics for a failed dependency', async () => {
  const logs = []
  const handler = createApplicationHandler({
    appendRow: async () => {
      const error = new Error('applicant data and secret token must not appear')
      error.diagnosticPhase = 'supabase_insert'
      error.diagnosticCategory = 'database_error'
      error.upstreamStatus = 503
      throw error
    },
    rateLimit: async () => true,
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const res = fakeResponse()
  const originalError = console.error
  console.error = (...args) => logs.push(args)
  try { await handler(request(), res) } finally { console.error = originalError }
  assert.equal(res.code, 502)
  assert.deepEqual(logs, [['Application dependency failure', {
    phase: 'supabase_insert', category: 'database_error', upstreamStatus: 503,
  }]])
  assert.equal(JSON.stringify(logs).includes('applicant data'), false)
  assert.equal(JSON.stringify(logs).includes('secret token'), false)
})

test('API fails closed if durable rate limiting is unavailable', async () => {
  const handler = createApplicationHandler({
    appendRow: async () => assert.fail('must not write when throttling is unavailable'),
    rateLimit: async () => { const error = new Error('private infrastructure detail'); error.code = 'RATE_LIMIT_UNAVAILABLE'; throw error },
    env: { ALLOWED_ORIGINS: 'https://chapter.example' },
  })
  const res = fakeResponse()
  const originalError = console.error
  console.error = () => {}
  try { await handler(request(), res) } finally { console.error = originalError }
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

test('Supabase adapter inserts only the confirmed application columns and relies on database defaults', async () => {
  const calls = []
  const writer = createSupabaseApplicationWriter({
    clientFactory: () => ({
      from: table => ({
        insert: async payload => {
          calls.push({ table, payload })
          return { error: null }
        },
      }),
    }),
  })

  await writer(validateApplication(sample))
  assert.deepEqual(calls, [{
    table: 'applications',
    payload: {
      name: 'Ada Student',
      contact_number: '+91 98765 43210',
      email: 'ada@example.edu',
      roll_no: 'SE-101',
      gender: 'Female',
      year: 'SE',
      domain: 'Tech Team',
      experience: 'Built a small project.',
    },
  }])
  assert.equal('id' in calls[0].payload, false)
  assert.equal('created_at' in calls[0].payload, false)
  assert.equal('status' in calls[0].payload, false)
})

test('Supabase adapter sanitizes database and network failures', async () => {
  const databaseWriter = createSupabaseApplicationWriter({
    clientFactory: () => ({
      from: () => ({ insert: async () => ({ error: { message: 'private applicant content', status: 503 } }) }),
    }),
  })
  await assert.rejects(
    () => databaseWriter(validateApplication(sample)),
    error => error.code === 'SUPABASE_INSERT_FAILED'
      && error.diagnosticPhase === 'supabase_insert'
      && error.diagnosticCategory === 'database_error'
      && error.upstreamStatus === 503
      && !error.message.includes('private applicant'),
  )

  const networkWriter = createSupabaseApplicationWriter({
    clientFactory: () => ({ from: () => ({ insert: async () => { throw new Error('secret URL and applicant data') } }) }),
  })
  await assert.rejects(
    () => networkWriter(validateApplication(sample)),
    error => error.diagnosticCategory === 'network_error'
      && !error.message.includes('secret URL')
      && !error.message.includes('applicant'),
  )
})

test('missing Supabase configuration fails closed without exposing credential values', async () => {
  const previousUrl = process.env.SUPABASE_URL
  const previousKey = process.env.SUPABASE_SECRET_KEY
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SECRET_KEY
  try {
    assert.throws(
      () => createSupabaseClient(),
      error => error.code === 'SUPABASE_NOT_CONFIGURED'
        && error.diagnosticPhase === 'supabase_insert'
        && error.diagnosticCategory === 'missing_configuration',
    )

    const handler = createApplicationHandler({
      appendRow: application => createSupabaseApplicationWriter()(application),
      rateLimit: async () => true,
      env: { ALLOWED_ORIGINS: 'https://chapter.example' },
    })
    const res = fakeResponse()
    const originalError = console.error
    console.error = () => {}
    try { await handler(request(), res) } finally { console.error = originalError }
    assert.equal(res.code, 503)
    assert.equal(res.payload.success, false)
    assert.match(res.payload.message, /Google Form fallback/)
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_URL
    else process.env.SUPABASE_URL = previousUrl
    if (previousKey === undefined) delete process.env.SUPABASE_SECRET_KEY
    else process.env.SUPABASE_SECRET_KEY = previousKey
  }
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

test('durable rate limiter fails closed and safely classifies network and timeout failures', async () => {
  const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'secret-token' }
  await assert.rejects(
    () => enforceRateLimit('203.0.113.7', env, async () => { throw new Error('secret-token and URL') }),
    error => error.code === 'RATE_LIMIT_UNAVAILABLE'
      && error.diagnosticPhase === 'rate_limit'
      && error.diagnosticCategory === 'network_error'
      && !('upstreamStatus' in error)
      && !error.message.includes('secret-token'),
  )
  const timeout = new Error('sensitive timeout details')
  timeout.name = 'TimeoutError'
  await assert.rejects(
    () => enforceRateLimit('203.0.113.7', env, async () => { throw timeout }),
    error => error.diagnosticCategory === 'timeout' && !error.message.includes('sensitive'),
  )
})

test('durable rate limiter fails closed on malformed Upstash JSON without retaining its body', async () => {
  const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'secret-token' }
  await assert.rejects(
    () => enforceRateLimit('203.0.113.7', env, async () => ({
      ok: true,
      status: 200,
      json: async () => { throw new SyntaxError('private upstream response body') },
    })),
    error => error.code === 'RATE_LIMIT_UNAVAILABLE'
      && error.diagnosticPhase === 'rate_limit'
      && error.diagnosticCategory === 'invalid_json'
      && error.upstreamStatus === 200
      && !error.message.includes('private upstream'),
  )
})
