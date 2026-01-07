import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

interface JWTPayload {
  userId: string
  email: string
  role?: string
  iat?: number
  exp?: number
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Validate that payload has required properties
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string'
    ) {
      return payload as unknown as JWTPayload
    }

    return null
  } catch (error) {
    // Log apenas tipo de erro, sem dados sensíveis
    console.log('[Middleware] Token verification failed:', error instanceof Error ? error.name : 'Unknown error')
    return null
  }
}

function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('[Middleware] Request to:', pathname)

  // Rotas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/profile', '/favorites', '/admin', '/api/protected']

  // Rotas que requerem admin
  const adminRoutes = ['/admin']

  // Rotas de auth que não devem ser acessadas se já logado
  const authRoutes = ['/login', '/register']

  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Verifica se é uma rota admin
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Verifica se é uma rota de auth
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  console.log('[Middleware] isProtectedRoute:', isProtectedRoute, 'isAdminRoute:', isAdminRoute, 'isAuthRoute:', isAuthRoute)

  if (isProtectedRoute) {
    console.log('[Middleware] Protected route detected')

    // Tenta pegar token do header ou cookie
    let token = getTokenFromHeader(request)

    if (!token) {
      // Se não tiver no header, tenta pegar do cookie
      token = request.cookies.get('auth-token')?.value || null
    }

    if (!token) {
      console.log('[Middleware] No token found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyToken(token)

    if (!payload) {
      console.log('[Middleware] Invalid token, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Para rotas admin, verifica se o usuário é admin
    if (isAdminRoute) {
      console.log('[Middleware] Admin route detected, checking role:', payload.role)

      if (payload.role !== 'ADMIN') {
        console.log('[Middleware] User is not admin, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      console.log('[Middleware] Admin access granted')
    }

    console.log('[Middleware] Access granted to protected route')

    // Adiciona dados do usuário no header para as rotas protegidas
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    if (payload.role) {
      requestHeaders.set('x-user-role', payload.role)
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (isAuthRoute) {
    // Tenta pegar token do header ou cookie
    let token = getTokenFromHeader(request)

    if (!token) {
      token = request.cookies.get('token')?.value || null
    }

    if (token && await verifyToken(token)) {
      // Usuário já está logado, redireciona para dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}