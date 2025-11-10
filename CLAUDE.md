# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
npm run dev      # Starts dev server on port 3900
```

**Production Build:**
```bash
npm run build    # Creates production build
npm start        # Starts production server on port 3900
```

**Note:** This application uses port 3900 by default (not 3000).

## Architecture Overview

### Authentication System

This application uses **Shared Cookie SSO** with the main BANTAL application:

- **Cookie-based authentication** - No client-side token storage (XSS protection)
- **auth_session cookie** (15 min) - Contains JWT access token
- **refresh_token cookie** (24 hours) - For automatic token refresh
- **Domain:** Cookies set on `.centri.id` (shared across all subdomains)
- **Centralized login:** Redirects to `https://web.centri.id/auth/login` when unauthenticated
- **Backend:** Keycloak + Microsoft Entra ID

**Key Files:**
- [src/proxy.ts](src/proxy.ts) - Middleware for route protection (NOT middleware.ts)
- [lib/auth/client.ts](lib/auth/client.ts) - JWT decoding and user utilities
- [lib/auth/constants.ts](lib/auth/constants.ts) - Protected/public paths configuration
- [lib/hooks/useAuth.ts](lib/hooks/useAuth.ts) - React hook for client-side auth state

**Middleware Logic:**
- `/surat-tugas/[uuid]` routes are PUBLIC (single UUID segment only)
- `/surat-tugas` (listing) is PROTECTED
- Routes defined in `PROTECTED_PATHS` require authentication
- Routes in `PUBLIC_PATHS` are always accessible

### API Architecture

**Pattern: Next.js API Routes as Proxy**

All API calls go through Next.js API routes that proxy to the backend:

```
Client → Next.js API Route → Backend (api.centri.id)
```

**Benefits:**
- Avoids CORS issues
- Automatic cookie forwarding
- Centralized error handling

**Key Patterns:**
- All services use native `fetch` with `credentials: 'include'`
- API routes forward cookies from client to backend
- 401 errors trigger automatic token refresh via `/api/auth/refresh`

**Service Layer Files:**
- [lib/api/services/suratTugas.ts](lib/api/services/suratTugas.ts) - Assignment letter CRUD
- [lib/api/services/client.ts](lib/api/services/client.ts) - Client management
- [lib/api/services/identity.ts](lib/api/services/identity.ts) - Personnel data

### Path Aliases

TypeScript path alias `@/*` maps to both `./src/*` and `./*` (root):

```typescript
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/api';
```

### Client vs Server Components

**App Router (Next.js 14+):**
- **Server Components:** Default for all components (layouts, static pages)
- **Client Components:** Require `'use client'` directive
  - Interactive forms and state management
  - Components using React hooks
  - Auth-dependent UI (useAuth hook)

**Important:** The `useAuth` hook only works in client components. Always add `'use client'` at the top of files using it.

### Template Features

**Included Examples:**

1. **Client Management** - Full CRUD example
   - API routes: [src/app/api/clients/](src/app/api/clients/)
   - Service: [lib/api/services/client.ts](lib/api/services/client.ts)
   - Types: [lib/api/types/client.ts](lib/api/types/client.ts)
   - Components: [src/components/ui/ClientBrowser/](src/components/ui/ClientBrowser/)

2. **Identity/Personnel** - Personnel data management
   - API routes: [src/app/api/identities/](src/app/api/identities/)
   - Service: [lib/api/services/identity.ts](lib/api/services/identity.ts)

**Pattern:** Service layer with typed methods

These examples demonstrate the template's patterns and can be used as reference for building your own features

## Configuration System

### Centralized Configuration

This template uses a centralized configuration system for type-safe, validated environment variables:

**Key Files:**
- [lib/config/env.ts](lib/config/env.ts) - Environment variable validation (using Zod)
- [lib/config/index.ts](lib/config/index.ts) - Centralized module configuration
- [.env.template](.env.template) - Environment variable template with documentation

**Usage:**
```typescript
import { config } from '@/lib/config';
import { env } from '@/lib/config/env';

// Use config for structured settings
const apiUrl = config.api.baseUrl;
const moduleName = config.displayName;
const isAuthEnabled = config.auth.enabled;

// Use env for direct environment variable access
const appUrl = env.NEXT_PUBLIC_APP_URL;
```

### Environment Variables

**Required:** Copy `.env.template` to `.env.local` and configure:

```env
# API & Application URLs (REQUIRED)
NEXT_PUBLIC_API_URL=https://api.centri.id
NEXT_PUBLIC_APP_URL=https://hc.centri.id
NEXT_PUBLIC_MAIN_APP_URL=https://web.centri.id

# Module Configuration (OPTIONAL)
NEXT_PUBLIC_MODULE_NAME=human-capital
NEXT_PUBLIC_MODULE_DISPLAY_NAME=Human Capital
NEXT_PUBLIC_MODULE_VERSION=0.1.0

# Keycloak (OPTIONAL - only if using directly)
KEYCLOAK_BASE_URL=https://auth.centri.id
KEYCLOAK_REALM=BANTAL
KEYCLOAK_CLIENT_ID=bantal-web
KEYCLOAK_REDIRECT_URI=https://api.centri.id/auth/callback

# SERVER-SIDE ONLY (NEVER prefix with NEXT_PUBLIC_)
KEYCLOAK_CLIENT_SECRET=your-secret-here
```

**Important:**
- All environment variables are validated at runtime using Zod
- Missing or invalid variables will show detailed error messages
- Client secrets must NEVER have `NEXT_PUBLIC_` prefix
- See [.env.template](.env.template) for full documentation

## Important Implementation Notes

### When Adding Protected Routes

1. Add path to `PROTECTED_PATHS` in [lib/auth/constants.ts](lib/auth/constants.ts)
2. Add matcher pattern in `config.matcher` in [src/proxy.ts](src/proxy.ts)
3. Ensure middleware logic handles the route correctly

### When Adding Public UUID Routes

Pattern: `/feature/[uuid]` should be public for validation/viewing

Check in [src/proxy.ts](src/proxy.ts) middleware:
```typescript
const isFeatureUuidRoute = path.startsWith("/feature/") &&
  path.split("/").length === 3;  // Exactly 3 segments
```

### When Creating API Routes

**Pattern:** API route proxies to backend

```typescript
// src/app/api/feature/route.ts
export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  const authToken = cookies.get('auth_session')?.value;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feature`, {
    headers: {
      'Cookie': `auth_session=${authToken}`,
    },
  });

  return NextResponse.json(await response.json());
}
```

### When Creating Service Layer

**Pattern:** Service object with typed methods

```typescript
// lib/api/services/feature.ts
export const FeatureService = {
  getData: async (): Promise<DataType> => {
    const response = await fetch('/api/feature', {
      credentials: 'include',  // Required for cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    return response.json();
  },
};
```

### When Using Authentication in Components

```tsx
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyPage() {
  const { user, displayName, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Unauthorized</div>;

  return <div>Welcome, {displayName}!</div>;
}
```

## Security Considerations

- **Never store tokens in localStorage/sessionStorage** - Use HTTP-only cookies only
- **All API routes must forward auth cookies** to backend
- **JWT validation happens server-side** - Client-side decode is for display only
- **Cookies require domain `.centri.id`** for cross-subdomain sharing
- **QR codes contain UUIDs** - Never include sensitive data
- **Client secrets must be server-side only** - Never prefix with `NEXT_PUBLIC_`
- **Use `getKeycloakClientSecret()`** - Only call in API routes or server components
- **Environment variables are validated** - Zod schema catches configuration errors early

## Common Patterns

### Material-UI Theming

Custom theme defined in app layout with SAR branding colors. Use MUI components consistently:
- `<Button>`, `<TextField>`, `<Dialog>` from `@mui/material`
- Icons from `@mui/icons-material`
- Date pickers from `@mui/x-date-pickers`

### Error Handling

Service layer throws errors, components catch and display:
```typescript
try {
  await SuratTugasService.createSuratTugas(data);
} catch (error) {
  setError(error instanceof Error ? error.message : 'Operation failed');
}
```

### Form State Management

Multi-step forms use useState with validation:
```typescript
const [activeStep, setActiveStep] = useState(0);
const [formData, setFormData] = useState<FormType>({...});
```

## Documentation References

- [README.md](README.md) - Project overview and quick start
- [AUTH_SETUP.md](AUTH_SETUP.md) - Detailed authentication documentation
- [SSO_IMPLEMENTATION_SUMMARY.md](SSO_IMPLEMENTATION_SUMMARY.md) - SSO technical details
