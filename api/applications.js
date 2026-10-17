import { createApplicationHandler } from './lib/handler.mjs'
import { appendApplicationRow } from './lib/google-sheets.mjs'
import { enforceRateLimit } from './lib/rate-limit.mjs'

export default createApplicationHandler({
  appendRow: row => appendApplicationRow(row),
  rateLimit: ip => enforceRateLimit(ip),
})
