import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';

  // 1. Proactive Expiration Check
  if (token) {
    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(atob(base64Payload));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired && !isLoginPage) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }
    } catch (e) {
      // Malformed token -> trigger logout
      if (!isLoginPage) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
      }
    }
  }

  // 2. Auth Route Protection
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all paths except static files, images, favicon, and api routes
    '/((?!_next/static|_next/image|favicon.ico|api|login).*)',
    '/login'
  ],
};
