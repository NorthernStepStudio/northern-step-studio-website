import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabasePublicKey, getSupabaseUrl } from '@/lib/env'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

const publicRoutes = ['/login', '/offline', '/register-company', '/accept-invite']
const adminRoutes = [
  '/dashboard',
  '/projects',
  '/team',
  '/time-entries',
  '/reports',
  '/settings'
]

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublicKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      }
    }
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isWorker = profile?.role === 'worker'

  if (isWorker && adminRoutes.some((route) => pathname.startsWith(route))) {
    const clockUrl = request.nextUrl.clone()
    clockUrl.pathname = '/clock'
    return NextResponse.redirect(clockUrl)
  }

  if (pathname === '/') {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = isWorker ? '/clock' : '/dashboard'
    return NextResponse.redirect(homeUrl)
  }

  return supabaseResponse
}
