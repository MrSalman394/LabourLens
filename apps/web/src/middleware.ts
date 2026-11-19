import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('labourlens_access_token')?.value;
  const refreshToken = request.cookies.get('labourlens_refresh_token')?.value;
  const userRoleCookie = request.cookies.get('labourlens_user_role')?.value;

  const isAuthenticated = Boolean(accessToken || refreshToken);

  let roles: string[] = [];
  if (userRoleCookie) {
    try {
      roles = JSON.parse(userRoleCookie);
    } catch {
      roles = [];
    }
  }

  // Backwards compatibility: redirect legacy /dashboard/:role to /:role/dashboard
  if (pathname.startsWith('/dashboard/')) {
    const targetRole = pathname.replace('/dashboard/', '').split('/')[0];
    if (targetRole === 'worker' || targetRole === 'employer' || targetRole === 'admin') {
      return NextResponse.redirect(new URL(`/${targetRole}/dashboard`, request.url));
    }
  }

  // Redirect authenticated users away from public auth pages to their respective dashboards
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/sign-in' ||
    pathname === '/register';

  if (isAuthRoute && isAuthenticated && roles.length > 0) {
    if (roles.includes('ADMIN')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (roles.includes('EMPLOYER')) {
      return NextResponse.redirect(new URL('/employer/dashboard', request.url));
    }
    if (roles.includes('WORKER')) {
      return NextResponse.redirect(new URL('/worker/dashboard', request.url));
    }
  }

  // Route Protection: /admin/*
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!roles.includes('ADMIN')) {
      // Role boundary enforcement
      if (roles.includes('EMPLOYER')) {
        return NextResponse.redirect(new URL('/employer/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/worker/dashboard', request.url));
    }
  }

  // Route Protection: /employer/*
  if (pathname.startsWith('/employer')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!roles.includes('EMPLOYER') && !roles.includes('ADMIN')) {
      // Non-employers attempting to access employer routes
      return NextResponse.redirect(new URL('/worker/dashboard', request.url));
    }
  }

  // Route Protection: /worker/*
  if (pathname.startsWith('/worker')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!roles.includes('WORKER') && !roles.includes('ADMIN')) {
      // Non-workers attempting to access worker routes
      return NextResponse.redirect(new URL('/employer/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/employer/:path*',
    '/worker/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/sign-in',
    '/register',
  ],
};
