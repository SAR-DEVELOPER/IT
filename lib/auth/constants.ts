// lib/auth/constants.ts

export const AUTH_COOKIE_NAME = "auth_session";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

// From Technical Design Doc: Access Token 15min, Refresh Token 24h
export const TOKEN_EXPIRY = {
  ACCESS: 15 * 60, // 15 minutes in seconds
  REFRESH: 24 * 60 * 60, // 24 hours in seconds
};

export const PROTECTED_PATHS = [
  "/", // Root path (home/dashboard)
  // Add your module-specific protected paths here
  // Example: "/employees", "/payroll", etc.
];

export const PUBLIC_PATHS = [
  "/api/*", // API routes are public (handled by API itself)
  "/_next/*", // Next.js internal routes
  "/favicon.ico", // Favicon
  "/robots.txt", // Robots
  "/sitemap.xml", // Sitemap
  // Add other public paths as needed
  // Example: "/feature/:id" for public detail pages
];

// Optional: Path Patterns for different roles (based on your role hierarchy)
export const ROLE_PATHS = {
  SUPER_ADMIN: ["/admin/*"],
  ADMIN: ["/management/*"],
  MANAGEMENT: ["/department/*"],
  STAFF: ["/workspace/*"],
  VIEWER: ["/view/*"],
};
