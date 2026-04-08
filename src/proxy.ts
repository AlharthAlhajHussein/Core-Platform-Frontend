import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Grab the tokens from the browser's cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // Check if the user is currently trying to load the /login page
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  // RULE 1: If the user has no tokens and isn't on the login page, kick them to /login
  if (!accessToken && !refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // RULE 2: If the user HAS tokens and is trying to access /login, send them to /dashboard
  if ((accessToken || refreshToken) && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Otherwise, let them proceed normally
  return NextResponse.next();
}

// The matcher tells Next.js which routes this proxy should run on.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};