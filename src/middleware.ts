import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
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
  const protectedRoutes = ['/dashboard', '/profile', '/api/protected']
  
  // Rotas de auth que não devem ser acessadas se já logado
  const authRoutes = ['/login', '/register']

  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Verifica se é uma rota de auth
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  console.log('[Middleware] isProtectedRoute:', isProtectedRoute, 'isAuthRoute:', isAuthRoute)

  if (isProtectedRoute) {
    console.log('[Middleware] Protected route detected')
    
    // Tenta pegar token do header ou cookie
    let token = getTokenFromHeader(request)
    
    if (!token) {
      // Se não tiver no header, tenta pegar do cookie
      token = request.cookies.get('token')?.value || null
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

    console.log('[Middleware] Access granted to protected route')

    // Adiciona dados do usuário no header para as rotas protegidas
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)

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