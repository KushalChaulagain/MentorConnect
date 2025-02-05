import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Prevent redirect loops for login page
  if (path === '/login') {
    // If already logged in, redirect to appropriate dashboard
    if (token) {
      const dashboardPath = token.role === 'MENTOR' ? '/dashboard/mentor' : '/dashboard/mentee';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
    return NextResponse.next();
  }

  // Allow access to the become-mentor landing page
  if (path === '/become-mentor') {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected routes
  if (!token && (path.startsWith('/dashboard') || path.startsWith('/become-mentor/'))) {
    // Get the role parameter if it exists
    const role = searchParams.get('role');
    const callbackUrl = encodeURIComponent(path);
    const loginUrl = role 
      ? `/login?callbackUrl=${callbackUrl}&role=${role}`
      : `/login?callbackUrl=${callbackUrl}`;
    
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // If logged in user tries to access auth pages
  if (token && (path === '/register')) {
    const dashboardPath = token.role === 'MENTOR' ? '/dashboard/mentor' : '/dashboard/mentee';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Role-based redirects for dashboard
  if (path.startsWith('/dashboard')) {
    if (token?.role === 'MENTOR' && path.startsWith('/dashboard/mentee')) {
      return NextResponse.redirect(new URL('/dashboard/mentor', request.url));
    }
    if (token?.role === 'MENTEE' && path.startsWith('/dashboard/mentor')) {
      return NextResponse.redirect(new URL('/dashboard/mentee', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/become-mentor/:path*',
    '/login',
    '/register',
  ],
}; 