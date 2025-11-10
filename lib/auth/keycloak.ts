// lib/auth/keycloak.ts
import { config } from '@/lib/config';
import { env } from '@/lib/config/env';

/**
 * Keycloak Configuration
 *
 * ⚠️ SECURITY NOTE:
 * - Client secrets should NEVER be exposed to the browser
 * - KEYCLOAK_CLIENT_SECRET is only accessible server-side (no NEXT_PUBLIC_ prefix)
 * - Only use client secret in API routes or server components
 * - All client-facing config is loaded from environment variables
 */
export const KEYCLOAK_CONFIG = {
  baseUrl: config.auth.keycloak?.baseUrl || 'https://auth.centri.id',
  realm: config.auth.keycloak?.realm || 'BANTAL',
  clientId: config.auth.keycloak?.clientId || 'bantal-web',
  redirectUri: config.auth.keycloak?.redirectUri || 'https://api.centri.id/auth/callback',
  // Client secret is NOT included here - it should only be accessed via process.env in server-side code
};

/**
 * Get Keycloak client secret (SERVER-SIDE ONLY)
 *
 * ⚠️ WARNING: This function should ONLY be called in:
 * - API routes (src/app/api/*)
 * - Server components
 * - Server actions
 *
 * NEVER call this in client components or expose it to the browser!
 *
 * @returns The client secret from environment variables
 * @throws Error if called without client secret configured
 */
export function getKeycloakClientSecret(): string {
  const secret = env.KEYCLOAK_CLIENT_SECRET;
  if (!secret) {
    throw new Error(
      'KEYCLOAK_CLIENT_SECRET is not configured. ' +
      'This should be set as a server-side environment variable.'
    );
  }
  return secret;
}

/**
 * Generate Keycloak login URL
 * Note: For SAR modules, we redirect to BANTAL-FE login page
 * which handles the Keycloak flow centrally
 *
 * @param callbackUrl Optional URL to redirect to after login
 * @returns The login URL with optional callback parameter
 */
export function getKeycloakLoginUrl(callbackUrl?: string) {
  // Redirect to main app's login page with callback URL
  const loginUrl = config.auth.loginUrl;
  if (callbackUrl) {
    return `${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return loginUrl;
}

/**
 * Direct Keycloak login URL (if needed for debugging or direct access)
 */
export function getDirectKeycloakLoginUrl() {
  return `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth?` +
    `client_id=${KEYCLOAK_CONFIG.clientId}&` +
    `redirect_uri=${encodeURIComponent(KEYCLOAK_CONFIG.redirectUri)}&` +
    'response_type=code&' +
    'scope=openid profile email';
}
