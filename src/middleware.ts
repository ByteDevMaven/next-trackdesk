import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth-token")
  const { pathname } = request.nextUrl

  // Skip middleware for static files and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/logo.png") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)
  ) {
    return NextResponse.next()
  }

  // Allow access to login page and API routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!authToken) {
    // Preserve the alias parameter if it exists
    const alias = request.nextUrl.searchParams.get("alias")
    const redirectUrl = new URL("/login", request.url)

    if (alias) {
      redirectUrl.searchParams.set("alias", alias)
    }

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

// Use a simpler matcher pattern and handle exclusions in the middleware function
export const config = {
  matcher: [
    // Match all paths except _next and api
    "/((?!_next/|api/).+)",
  ],
}