import { createApplicationHandler } from './lib/handler.mjs'
import { appendApplication } from './lib/supabase.mjs'
import { enforceRateLimit } from './lib/rate-limit.mjs'

export default createApplicationHandler({
  appendRow: application => appendApplication(application),
  rateLimit: ip => enforceRateLimit(ip),
})
