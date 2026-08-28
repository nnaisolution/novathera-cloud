type CookieJar = Map<string, string>

function parseSetCookie(header: string): { name: string; value: string } | null {
  const [pair] = header.split(';')
  const eq = pair.indexOf('=')
  if (eq === -1) return null
  return { name: pair.slice(0, eq).trim(), value: pair.slice(eq + 1).trim() }
}

export function createCookieFetch(
  initialCookies?: CookieJar,
  defaultHeaders?: Record<string, string>,
) {
  const jar: CookieJar = new Map(initialCookies)

  const fetchWithCookies: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers)

    for (const [key, value] of Object.entries(defaultHeaders ?? {})) {
      if (!headers.has(key)) headers.set(key, value)
    }

    const cookieHeader = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
    if (cookieHeader) headers.set('cookie', cookieHeader)

    const response = await fetch(input, { ...init, headers })

    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : response.headers.get('set-cookie')
          ? [response.headers.get('set-cookie')!]
          : []

    for (const raw of setCookies) {
      const parsed = parseSetCookie(raw)
      if (parsed) jar.set(parsed.name, parsed.value)
    }

    return response
  }

  return { fetch: fetchWithCookies, jar }
}
