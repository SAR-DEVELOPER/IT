// lib/config/index.ts
import { env } from './env';

/**
 * Module Configuration Interface
 *
 * This defines the structure for all module-specific configuration.
 * Each new SAR module should customize these values.
 */
export interface ModuleConfig {
  /** Internal module name (lowercase, hyphenated) */
  name: string;

  /** Display name shown in UI */
  displayName: string;

  /** Module version */
  version: string;

  /** Module-specific port for development (optional) */
  port?: number;

  /** API configuration */
  api: {
    /** Backend API base URL */
    baseUrl: string;
    /** Request timeout in milliseconds */
    timeout: number;
  };

  /** Authentication configuration */
  auth: {
    /** Whether authentication is enabled */
    enabled: boolean;
    /** Login URL (usually main BANTAL app) */
    loginUrl: string;
    /** Logout URL */
    logoutUrl: string;
    /** Keycloak configuration (if used) */
    keycloak?: {
      baseUrl: string;
      realm: string;
      clientId: string;
      redirectUri: string;
    };
  };

  /** Route configuration */
  routes: {
    /** Paths that require authentication */
    protected: string[];
    /** Paths that are publicly accessible */
    public: string[];
    /** Home/landing page path */
    home: string;
    /** Patterns for public detail routes (e.g., ['/feature/:id']) */
    publicDetailPatterns?: string[];
  };

  /** Application URLs */
  urls: {
    /** This module's base URL */
    app: string;
    /** Main BANTAL application URL */
    main: string;
  };
}

/**
 * Centralized Configuration for the SAR Module
 *
 * This configuration is loaded from environment variables and provides
 * type-safe access to all module settings.
 *
 * Usage:
 * ```typescript
 * import { config } from '@/lib/config';
 *
 * const apiUrl = config.api.baseUrl;
 * const moduleName = config.displayName;
 * ```
 */
export const config: ModuleConfig = {
  name: env.NEXT_PUBLIC_MODULE_NAME,
  displayName: env.NEXT_PUBLIC_MODULE_DISPLAY_NAME,
  version: env.NEXT_PUBLIC_MODULE_VERSION,
  port: 3100, // Default port for IT modules

  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeout: 30000, // 30 seconds
  },

  auth: {
    enabled: true,
    loginUrl: `${env.NEXT_PUBLIC_MAIN_APP_URL}/auth/login`,
    logoutUrl: `${env.NEXT_PUBLIC_MAIN_APP_URL}/auth/logout`,
    keycloak: env.KEYCLOAK_BASE_URL && env.KEYCLOAK_REALM && env.KEYCLOAK_CLIENT_ID
      ? {
          baseUrl: env.KEYCLOAK_BASE_URL,
          realm: env.KEYCLOAK_REALM,
          clientId: env.KEYCLOAK_CLIENT_ID,
          redirectUri: env.KEYCLOAK_REDIRECT_URI || `${env.NEXT_PUBLIC_API_URL}/auth/callback`,
        }
      : undefined,
  },

  routes: {
    // Default protected routes - customize per module
    protected: [
      '/', // Home page
    ],
    // Default public routes - customize per module
    public: [
      '/api/*', // API routes handle their own auth
      '/_next/*', // Next.js internals
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
    ],
    home: '/',
    // Add module-specific public detail patterns here
    // Example: ['/surat-tugas/:id', '/documents/:id']
    publicDetailPatterns: [],
  },

  urls: {
    app: env.NEXT_PUBLIC_APP_URL,
    main: env.NEXT_PUBLIC_MAIN_APP_URL,
  },
};

/**
 * Helper function to check if a path matches a pattern
 *
 * @param path - The path to check
 * @param pattern - The pattern to match against (supports wildcards)
 * @returns true if the path matches the pattern
 *
 * @example
 * ```typescript
 * matchPath('/api/users', '/api/*') // true
 * matchPath('/users/123', '/users/:id') // true
 * matchPath('/about', '/api/*') // false
 * ```
 */
export function matchPath(path: string, pattern: string): boolean {
  // Handle exact matches
  if (pattern === path) return true;

  // Handle wildcard patterns (e.g., '/api/*')
  if (pattern.endsWith('*')) {
    const basePattern = pattern.slice(0, -1);
    return path.startsWith(basePattern);
  }

  // Handle parameter patterns (e.g., '/users/:id')
  if (pattern.includes(':')) {
    const regex = new RegExp(
      '^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$'
    );
    return regex.test(path);
  }

  return false;
}

/**
 * Helper function to check if a path is a public detail route
 *
 * This is useful for routes like /feature/[uuid] that should be public
 * for validation/viewing purposes.
 *
 * @param path - The path to check
 * @param publicDetailPatterns - Array of patterns (e.g., ['/surat-tugas/:id'])
 * @returns true if the path matches any public detail pattern
 */
export function isPublicDetailRoute(
  path: string,
  publicDetailPatterns: string[]
): boolean {
  return publicDetailPatterns.some((pattern) => matchPath(path, pattern));
}
