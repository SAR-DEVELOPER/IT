import { NextRequest, NextResponse } from "next/server";
import { PROTECTED_PATHS, PUBLIC_PATHS } from "../lib/auth/constants";
import { config as appConfig } from "../lib/config";

/**
 * Middleware for SAR Module Template
 *
 * Handles authentication and route protection for the application.
 * Routes are configured in lib/auth/constants.ts
 */
export function proxy(request: NextRequest) {
  // 1. Get path requested by user
  const path = request.nextUrl.pathname;

  console.log("Middleware called for path:", path);

  // 2. Check if path is protected
  const isProtectedPath = PROTECTED_PATHS.some((protectedPath) => {
    if (protectedPath.endsWith("*")) {
      return path.startsWith(protectedPath.slice(0, -1));
    }
    return path === protectedPath;
  });
  console.log("Is Protected Path?", isProtectedPath);

  // 3. Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((publicPath) => {
    if (publicPath.endsWith("*")) {
      return path.startsWith(publicPath.slice(0, -1));
    }
    return path === publicPath;
  });
  console.log("Is Public Path?", isPublicPath);

  // 4. Get authentication token
  const token = request.cookies.get("auth_session")?.value;

  // 5. Handle routing logic
  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Redirect to login if accessing protected path without token
  if (isProtectedPath && !token) {
    const loginUrl = new URL(appConfig.auth.loginUrl);

    // Construct callback URL using configured app URL
    const appUrl = appConfig.urls.app;
    const callbackUrl = `${appUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;

    // Store the attempted URL to redirect back after login
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configure paths that trigger middleware
 *
 * Matches all routes except:
 * - API routes (/api/*)
 * - Static files (_next/static, _next/image, favicon.ico, etc.)
 * - Public files (robots.txt, sitemap.xml)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

