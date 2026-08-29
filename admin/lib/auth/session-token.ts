const STORAGE_KEY = 'novathera.admin.session-token'

export function readSessionToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeSessionToken(token: string | null | undefined) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    if (!token) {
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch {
    // Private mode / quota — cookie auth may still work.
  }
}

export function authorizationHeaders(): HeadersInit {
  const token = readSessionToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
