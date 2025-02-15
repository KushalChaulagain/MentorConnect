import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  console.log('Middleware Token:', token);
  console.log('Current Path:', path);

  // Allow access to the become-mentor landing page
  if (path === '/become-mentor') {
    return NextResponse.next();
  }

  // If user is not logged in and trying to access protected routes
  if (!token && (path.startsWith('/dashboard') || path.startsWith('/become-mentor/'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in user tries to access auth pages
  if (token && (path === '/login' || path === '/register')) {
    if (token.role === 'MENTOR' && token.onboardingCompleted === false) {
      return NextResponse.redirect(new URL('/become-mentor/get-started', request.url));
    }
    const dashboardPath = token.role === 'MENTOR' ? '/dashboard/mentor' : '/dashboard/mentee';
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Redirect users without a role to role selection, except when coming from become-mentor
  if (token && !token.role && !path.startsWith('/become-mentor')) {
    return NextResponse.redirect(new URL('/role-selection', request.url));
  }

  // Role-based redirects for dashboard
  if (path.startsWith('/dashboard')) {
    // Check if user is a mentor and hasn't completed onboarding
    if (token?.role === 'MENTOR' && token.onboardingCompleted === false) {
      return NextResponse.redirect(new URL('/become-mentor/get-started', request.url));
    }

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