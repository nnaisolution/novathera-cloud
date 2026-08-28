import { createCookieFetch } from './cookie-fetch'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'

function browserLikeHeaders() {
  return {
    origin: APP_ORIGIN,
    referer: `${APP_ORIGIN}/`,
  }
}

async function postAuth(
  path: string,
  body: Record<string, unknown>,
  fetchFn: typeof fetch,
) {
  let response: Response
  try {
    response = await fetchFn(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Could not reach the API at ${API_URL} (${reason}). Start the NestJS backend with: cd nova_thera_backend_nest_app && pnpm start:dev`,
    )
  }

  const payload = (await response.json().catch(() => ({}))) as {
    message?: string
    code?: string
  }

  if (!response.ok) {
    const message = payload.message ?? `Auth request failed (${response.status})`
    if (message.toLowerCase().includes('origin')) {
      throw new Error(
        `${message}. Ensure NEXT_PUBLIC_APP_URL (${APP_ORIGIN}) is listed in the API's BETTER_AUTH_TRUSTED_ORIGINS.`,
      )
    }
    throw new Error(message)
  }

  return payload
}

export async function signUp(email: string, password: string, name: string) {
  const { fetch, jar } = createCookieFetch(undefined, browserLikeHeaders())
  await postAuth(
    '/api/auth/sign-up/email',
    { email, password, name, rememberMe: true },
    fetch,
  )
  return { fetch, jar }
}

export async function signIn(email: string, password: string) {
  const { fetch, jar } = createCookieFetch(undefined, browserLikeHeaders())
  await postAuth(
    '/api/auth/sign-in/email',
    { email, password, rememberMe: true },
    fetch,
  )

  if (jar.size === 0) {
    throw new Error('Sign-in succeeded but no session cookie was returned')
  }

  return { fetch, jar }
}
