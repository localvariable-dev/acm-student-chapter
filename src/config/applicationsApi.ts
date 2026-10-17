const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

/**
 * The public value is the Vercel API origin only, for example
 * https://acm-applications.vercel.app. The API path is owned by this client.
 */
export function applicationEndpoint(): string | null {
  if (!apiBaseUrl) return null

  try {
    const url = new URL(apiBaseUrl)
    const isOriginOnly = url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password
    if (!isOriginOnly || !['http:', 'https:'].includes(url.protocol)) return null
    return `${url.origin}/api/applications`
  } catch {
    return null
  }
}
