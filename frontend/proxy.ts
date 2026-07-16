import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const hasToken = request.cookies.has('access_token');
    const { pathname } = request.nextUrl;
    
    const isPublicRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/projects') || pathname.startsWith('/settings');

    if (!hasToken && isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (hasToken && isPublicRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
