import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define which routes require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute) {
        // Look for our secure tokens
        const accessToken = request.cookies.get('access_token')
        const refreshToken = request.cookies.get('refresh_token')

        // If neither token exists, user is definitely logged out
        if (!accessToken && !refreshToken) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // If they only have a refresh token (access token expired),
        // we could redirect them to a special /refresh client route,
        // or let the client-side API layer handle the 401.
        // For standard Edge middleware, we let them through if they have a refresh token,
        // and let the client-side App handle the actual fetch failure -> retry logic.
        if (!accessToken && refreshToken) {
            // Optional: you could force them to login, or trust the client will refresh it.
            // For best UX, we let them load the dashboard layout, and the data fetch will refresh.
            return NextResponse.next()
        }
    }

    return NextResponse.next()
}

// Optimize middleware to only run on relevant paths
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/settings/:path*',
        '/profile/:path*',
    ],
}
