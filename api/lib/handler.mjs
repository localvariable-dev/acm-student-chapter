import { ApplicationInputError, validateApplication } from './applications.mjs'

const MAX_BODY_BYTES = 8192

function send(res, status, payload) {
  return res.status(status).json(payload)
}

function allowedOrigins(raw) {
  return new Set((raw || '').split(',').map(value => value.trim()).filter(Boolean))
}

function parseBody(body) {
  if (Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body ?? null), 'utf8') > MAX_BODY_BYTES) {
    const error = new Error('Request is too large.')
    error.status = 413
    throw error
  }
  if (typeof body === 'string') {
    try { return JSON.parse(body) } catch {
      const error = new Error('Send valid JSON.')
      error.status = 400
      throw error
    }
  }
  return body
}

const DIAGNOSTIC_PHASES = new Set(['rate_limit', 'supabase_insert'])
const DIAGNOSTIC_CATEGORIES = new Set([
  'missing_configuration', 'network_error', 'timeout', 'upstream_http_error',
  'invalid_json', 'invalid_response', 'database_error',
  'invalid_configuration', 'unexpected_error',
])

function logDependencyFailure(error, fallbackPhase) {
  const phase = DIAGNOSTIC_PHASES.has(error?.diagnosticPhase) ? error.diagnosticPhase : fallbackPhase
  const category = DIAGNOSTIC_CATEGORIES.has(error?.diagnosticCategory) ? error.diagnosticCategory : 'unexpected_error'
  const status = Number.isInteger(error?.upstreamStatus) && error.upstreamStatus >= 100 && error.upstreamStatus <= 599
    ? error.upstreamStatus
    : undefined
  const details = { phase, category }
  if (status !== undefined) details.upstreamStatus = status
  console.error('Application dependency failure', details)
}

export function createApplicationHandler({ appendRow, rateLimit, env = process.env }) {
  return async function applicationsHandler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Vary', 'Origin')

    const origin = req.headers?.origin
    const origins = allowedOrigins(env.ALLOWED_ORIGINS)
    if (typeof origin !== 'string' || !origins.has(origin)) {
      return send(res, 403, { success: false, code: 'origin_not_allowed', message: 'This request could not be accepted from this website.' })
    }
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Max-Age', '600')

    if (req.method === 'OPTIONS') return res.status(204).end()
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS')
      return send(res, 405, { success: false, code: 'method_not_allowed', message: 'Use POST to submit an application.' })
    }

    const contentType = req.headers?.['content-type'] || ''
    if (!/^application\/json(?:\s*;|\s*$)/i.test(contentType)) {
      return send(res, 415, { success: false, code: 'unsupported_media_type', message: 'Send the application as JSON.' })
    }

    let phase = 'rate_limit'
    try {
      const input = parseBody(req.body)
      const clientIp = req.headers?.['x-real-ip'] || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
      if (!clientIp || !(await rateLimit(clientIp))) {
        return send(res, 429, { success: false, code: 'rate_limited', message: 'Please wait before trying to submit again.' })
      }
      const application = validateApplication(input)
      phase = 'supabase_insert'
      await appendRow(application)
      return send(res, 201, { success: true, message: 'Application recorded.' })
    } catch (error) {
      if (error instanceof ApplicationInputError) {
        return send(res, 400, { success: false, code: 'invalid_application', message: error.message, fields: error.fields })
      }
      if (error?.status === 413 || error?.status === 400) {
        return send(res, error.status, { success: false, code: error.status === 413 ? 'request_too_large' : 'invalid_json', message: error.message })
      }
      if (error?.code === 'RATE_LIMIT_UNAVAILABLE'
        || error?.code === 'SUPABASE_NOT_CONFIGURED'
        || error?.code === 'SUPABASE_CONFIGURATION_INVALID') {
        logDependencyFailure(error, phase)
        return send(res, 503, { success: false, code: 'service_unavailable', message: 'Application submission is temporarily unavailable. Please use the Google Form fallback.' })
      }
      logDependencyFailure(error, phase)
      return send(res, 502, { success: false, code: 'submission_failed', message: 'We could not confirm that the application was recorded. Please try again or use the Google Form fallback.' })
    }
  }
}
