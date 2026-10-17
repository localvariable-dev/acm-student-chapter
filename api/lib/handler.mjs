import { ApplicationInputError, buildSheetRow, validateApplication } from './applications.mjs'

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

export function createApplicationHandler({ appendRow, rateLimit, env = process.env, now = () => new Date() }) {
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

    try {
      const input = parseBody(req.body)
      const clientIp = req.headers?.['x-real-ip'] || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
      if (!clientIp || !(await rateLimit(clientIp))) {
        return send(res, 429, { success: false, code: 'rate_limited', message: 'Please wait before trying to submit again.' })
      }
      const application = validateApplication(input)
      await appendRow(buildSheetRow(application, now().toISOString()))
      return send(res, 201, { success: true, message: 'Application recorded.' })
    } catch (error) {
      if (error instanceof ApplicationInputError) {
        return send(res, 400, { success: false, code: 'invalid_application', message: error.message, fields: error.fields })
      }
      if (error?.status === 413 || error?.status === 400) {
        return send(res, error.status, { success: false, code: error.status === 413 ? 'request_too_large' : 'invalid_json', message: error.message })
      }
      if (error?.code === 'RATE_LIMIT_UNAVAILABLE' || error?.code === 'SHEETS_NOT_CONFIGURED') {
        return send(res, 503, { success: false, code: 'service_unavailable', message: 'Application submission is temporarily unavailable. Please use the Google Form fallback.' })
      }
      console.error('Application submission failed while contacting the configured service.')
      return send(res, 502, { success: false, code: 'submission_failed', message: 'We could not confirm that the application was recorded. Please try again or use the Google Form fallback.' })
    }
  }
}
