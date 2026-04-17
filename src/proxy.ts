import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: In Next.js, this file is usually named middleware.ts, 
// but if you are exporting it as proxy from proxy.ts, this logic applies perfectly!
export function middleware(request: NextRequest) {
  // Grab the tokens from the browser's cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
  // Identify the pages
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isHomePage = request.nextUrl.pathname === '/'; // <-- NEW: Identify the root Home Page

  // RULE 1: If the user has no tokens and isn't on the login page AND isn't on the home page, kick them to /login
  // This allows unauthenticated users to safely view the Home Page (`/`) and Login Page (`/login`)
  if (!accessToken && !refreshToken && !isAuthPage && !isHomePage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // RULE 2: If the user HAS tokens (is logged in) and is trying to access /login OR the Home page, send them directly to /dashboard
  // This saves logged-in users a click!
  if ((accessToken || refreshToken) && (isAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Otherwise, let them proceed normally
  return NextResponse.next();
}

// Make sure you are exporting it whatever way your app expects. 
// If your app expects `export function proxy`, change `middleware` above to `proxy`.
export { middleware as proxy };

// The matcher tells Next.js which routes this proxy should run on.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};