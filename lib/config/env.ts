// lib/config/env.ts
import { z } from 'zod';

/**
 * Environment variable schema for the SAR Module Template
 *
 * This file validates all required environment variables at runtime.
 * Add new environment variables here as the template grows.
 */
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url({
    message: 'NEXT_PUBLIC_API_URL must be a valid URL (e.g., https://api.centri.id)',
  }),

  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url({
    message: 'NEXT_PUBLIC_APP_URL must be a valid URL (e.g., https://hc.centri.id)',
  }),
  NEXT_PUBLIC_MAIN_APP_URL: z.string().url({
    message: 'NEXT_PUBLIC_MAIN_APP_URL must be a valid URL (e.g., https://web.centri.id)',
  }),

  // Module Configuration (optional, with defaults)
  NEXT_PUBLIC_MODULE_NAME: z.string().default('sar-module'),
  NEXT_PUBLIC_MODULE_DISPLAY_NAME: z.string().default('SAR Module'),
  NEXT_PUBLIC_MODULE_VERSION: z.string().default('0.1.0'),

  // Keycloak Configuration (optional for modules that don't use Keycloak directly)
  KEYCLOAK_BASE_URL: z.string().url().optional(),
  KEYCLOAK_REALM: z.string().optional(),
  KEYCLOAK_CLIENT_ID: z.string().optional(),
  KEYCLOAK_REDIRECT_URI: z.string().url().optional(),

  // Server-side only: NEVER expose client secrets to the browser
  // These should only be accessed in API routes or server components
  KEYCLOAK_CLIENT_SECRET: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validates and parses environment variables
 * @throws {ZodError} if validation fails with detailed error messages
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err) => {
        const path = err.path.join('.');
        return `  ❌ ${path}: ${err.message}`;
      });

      console.error('\n🚨 Environment Variable Validation Failed:\n');
      console.error(errorMessages.join('\n'));
      console.error('\n📝 Please check your .env.local file against .env.template\n');

      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

/**
 * Validated environment variables
 *
 * Usage:
 * ```typescript
 * import { env } from '@/lib/config/env';
 *
 * const apiUrl = env.NEXT_PUBLIC_API_URL;
 * ```
 */
export const env = validateEnv();

/**
 * Type-safe environment variable access
 * Use this type for environment variable references
 */
export type Env = z.infer<typeof envSchema>;
