import { createHash } from 'node:crypto'

const incrementWithExpiry = "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count"

function rateLimitFailure(category, upstreamStatus) {
  const error = new Error('Durable rate limiting is unavailable.')
  error.code = 'RATE_LIMIT_UNAVAILABLE'
  error.diagnosticPhase = 'rate_limit'
  error.diagnosticCategory = category
  if (Number.isInteger(upstreamStatus)) error.upstreamStatus = upstreamStatus
  return error
}

function networkCategory(error) {
  return error?.name === 'AbortError' || error?.name === 'TimeoutError' ? 'timeout' : 'network_error'
}

export async function enforceRateLimit(clientIp, env = process.env, fetcher = fetch) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    throw rateLimitFailure('missing_configuration')
  }
  const digest = createHash('sha256').update(clientIp).digest('hex')
  const endpoint = `${env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '')}/`
  let response
  try {
    response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['EVAL', incrementWithExpiry, '1', `acm:application:${digest}`, '3600']),
      signal: AbortSignal.timeout(5000),
    })
  } catch (error) {
    throw rateLimitFailure(networkCategory(error))
  }

  if (!response.ok) throw rateLimitFailure('upstream_http_error', response.status)

  let result
  try {
    result = await response.json()
  } catch {
    throw rateLimitFailure('invalid_json', response.status)
  }
  if (!Number.isInteger(result?.result)) {
    throw rateLimitFailure('invalid_response', response.status)
  }
  return result.result <= 10
}
