import { createClient } from '@supabase/supabase-js'

function storageError(code, category, upstreamStatus) {
  const error = new Error('Application storage dependency failed.')
  error.code = code
  error.diagnosticPhase = 'supabase_insert'
  error.diagnosticCategory = category
  if (Number.isInteger(upstreamStatus) && upstreamStatus >= 100 && upstreamStatus <= 599) {
    error.upstreamStatus = upstreamStatus
  }
  return error
}

export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) {
    throw storageError('SUPABASE_NOT_CONFIGURED', 'missing_configuration')
  }

  try {
    return createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  } catch {
    throw storageError('SUPABASE_CONFIGURATION_INVALID', 'invalid_configuration')
  }
}

export function createSupabaseApplicationWriter({ clientFactory = createSupabaseClient } = {}) {
  return async function appendApplication(application) {
    const client = clientFactory()
    let result
    try {
      result = await client.from('applications').insert({
        name: application.name,
        contact_number: application.contactNumber,
        email: application.email,
        roll_no: application.rollNo,
        gender: application.gender,
        year: application.year,
        domain: application.domain,
        experience: application.experience,
      })
    } catch (error) {
      throw storageError(
        'SUPABASE_INSERT_FAILED',
        error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'timeout' : 'network_error',
      )
    }

    if (!result || typeof result !== 'object' || !('error' in result)) {
      throw storageError('SUPABASE_INSERT_FAILED', 'invalid_response')
    }
    if (result.error) {
      throw storageError('SUPABASE_INSERT_FAILED', 'database_error', result.error.status)
    }
  }
}

export const appendApplication = createSupabaseApplicationWriter()
