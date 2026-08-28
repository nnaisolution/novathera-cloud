import { NextRequest, NextResponse } from 'next/server'
import superjson, { type SuperJSONResult } from 'superjson'

const HEALTH_STAFF_ROLES = new Set(['admin', 'manager', 'staff'])

type SessionPayload = {
  user?: { role?: string | null }
}

function patientApiUrl() {
  return (
    process.env.PATIENT_API_URL ??
    process.env.NEXT_PUBLIC_PATIENT_API_URL ??
    ''
  ).replace(/\/$/, '')
}

function staffToken() {
  return process.env.PATIENT_API_STAFF_TOKEN ?? ''
}

async function getStaffSession(request: NextRequest): Promise<SessionPayload | null> {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const authUrl = (
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:4000'
  ).replace(/\/$/, '')
  const response = await fetch(`${authUrl}/api/auth/get-session`, {
    headers: { cookie },
    cache: 'no-store',
  })
  if (!response.ok) return null
  return (await response.json()) as SessionPayload
}

function unwrapTrpcBatch(payload: unknown): unknown {
  if (!Array.isArray(payload) || payload[0] === undefined) {
    throw new Error('Unexpected response from the patient API')
  }
  const first = payload[0] as {
    result?: { data?: unknown }
    error?: { json?: { message?: string } }
  }
  if (first.error) {
    throw new Error(first.error.json?.message ?? 'Patient API error')
  }
  const data = first.result?.data
  if (data && typeof data === 'object' && data !== null && 'json' in data) {
    return superjson.deserialize(data as SuperJSONResult)
  }
  return data
}

export async function GET(request: NextRequest) {
  const session = await getStaffSession(request)
  const role = session?.user?.role?.split(',')[0]
  if (!role || !HEALTH_STAFF_ROLES.has(role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const base = patientApiUrl()
  const token = staffToken()
  if (!base || !token) {
    return NextResponse.json(
      {
        configured: false,
        items: [],
        nextCursor: undefined,
        hint: 'Set NEXT_PUBLIC_PATIENT_API_URL (or PATIENT_API_URL) and PATIENT_API_STAFF_TOKEN on the admin app, and HEALTH_STAFF_API_KEY on the patient API to the same secret.',
      },
      { status: 200 },
    )
  }

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') ?? undefined
  const search = searchParams.get('search') ?? undefined
  const cursor = searchParams.get('cursor') ?? undefined
  const limitRaw = Number(searchParams.get('limit') ?? '50')
  const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, limitRaw)) : 50

  const input: Record<string, unknown> = { limit }
  if (type) input.type = type
  if (search) input.search = search
  if (cursor) input.cursor = cursor

  const response = await fetch(`${base}/api/trpc/health.staffList?batch=1`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ 0: { json: input } }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const status = response.status === 401 ? 401 : 502
    return NextResponse.json(
      {
        configured: true,
        error:
          status === 401
            ? 'The patient API rejected the staff token. Confirm HEALTH_STAFF_API_KEY matches PATIENT_API_STAFF_TOKEN.'
            : 'The patient API is unreachable.',
      },
      { status },
    )
  }

  try {
    const payload: unknown = await response.json()
    const data = unwrapTrpcBatch(payload) as {
      items?: unknown[]
      nextCursor?: string
    }
    return NextResponse.json({
      configured: true,
      items: data.items ?? [],
      nextCursor: data.nextCursor,
    })
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        error: error instanceof Error ? error.message : 'Could not read observations',
      },
      { status: 502 },
    )
  }
}
