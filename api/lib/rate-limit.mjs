import { createHash } from 'node:crypto'

const incrementWithExpiry = "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count"

export async function enforceRateLimit(clientIp, env = process.env, fetcher = fetch) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    const error = new Error('Durable rate limiting is not configured.')
    error.code = 'RATE_LIMIT_UNAVAILABLE'
    throw error
  }
  const digest = createHash('sha256').update(clientIp).digest('hex')
  const endpoint = `${env.UPSTASH_REDIS_REST_URL.replace(/\/$/, '')}/`
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['EVAL', incrementWithExpiry, '1', `acm:application:${digest}`, '3600']),
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) {
    const error = new Error('Durable rate limit service is unavailable.')
    error.code = 'RATE_LIMIT_UNAVAILABLE'
    throw error
  }
  const result = await response.json()
  if (!Number.isInteger(result.result)) {
    const error = new Error('Durable rate limit service returned an invalid response.')
    error.code = 'RATE_LIMIT_UNAVAILABLE'
    throw error
  }
  return result.result <= 10
}
