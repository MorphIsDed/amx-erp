import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  if (pathname.startsWith("/auth") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("amx_auth");
  const isAuthenticated = authCookie?.value === "true";

  // Check if trying to access a protected route without auth
  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Example role-aware logic:
  // If we had a role cookie, we could redirect non-admins away from certain paths.
  const userRole = request.cookies.get("amx_role")?.value;
  if (pathname.startsWith("/hr") && userRole !== "Admin" && userRole !== "HR") {
    // Just a placeholder to show role-aware routing
    // return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
