# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Human Capital (IT) Module** for the BANTAL/SAR ecosystem - a Next.js application built on a standardized template for SAR business modules. It provides a production-ready starting point with authentication, API management, and modern UI components.

**Key Technologies:**
- Next.js 16 (App Router)
- TypeScript 5 (strict mode enabled)
- Material-UI v6 with Emotion styling
- Cookie-based SSO authentication
- Zod for runtime validation

## Development Commands

```bash
# Development server (port 3100)
npm run dev

# Production build
npm run build

# Start production server (port 3100)
npm start
```

**Note:** This module runs on port 3100 (not 3900 as shown in some docs) - check `package.json` and `docker-compose.yml`.

## Architecture Overview

### 1. Cookie-Based Authentication Flow

Authentication is **centralized** across all SAR modules using shared cookies on `.centri.id` domain:

- **auth_session** cookie (15 min) - JWT access token
- **refresh_token** cookie (24 hours) - Refresh token
- Middleware (`src/proxy.ts`) checks for auth_session and redirects to main BANTAL app for login
- Backend API manages cookie creation/validation

**Important:** This module does NOT handle login/logout directly - it delegates to `NEXT_PUBLIC_MAIN_APP_URL`.

### 2. API Proxy Pattern

All API calls flow through Next.js API routes to avoid CORS issues:

```
Frontend → /api/* (Next.js Route) → Backend API (with cookies)
```

**Pattern for new API routes:**
1. Create route in `src/app/api/[feature]/route.ts`
2. Forward cookies from request: `request.cookies.toString()`
3. Proxy to `NEXT_PUBLIC_API_URL` with cookies in headers
4. Return response with proper status codes

**Example:** `src/app/api/clients/route.ts`

### 3. Configuration Management

All environment variables and config live in `lib/config/`:

- **`lib/config/env.ts`** - Zod schema validation for all env vars
- **`lib/config/index.ts`** - Centralized config object with typed access

**Usage:**
```typescript
import { config } from '@/lib/config';
const apiUrl = config.api.baseUrl;
```

Environment variables are validated at startup. Missing/invalid vars will cause detailed error messages.

### 4. Route Protection

**Middleware:** `src/proxy.ts` handles authentication checks
**Configuration:**
- `lib/auth/constants.ts` - Define `PROTECTED_PATHS` and `PUBLIC_PATHS`
- `src/proxy.ts` config matcher - List paths that trigger middleware

**To add a protected route:**
1. Add path to `PROTECTED_PATHS` array in `lib/auth/constants.ts`
2. Add matcher in `src/proxy.ts` config.matcher array

### 5. Component Structure

```
src/
├── app/
│   ├── api/          # API proxy routes (GET/POST/PUT/DELETE)
│   ├── layout.tsx    # Root layout with MUI theme provider
│   └── page.tsx      # Home page/dashboard
├── components/
│   ├── auth/         # Auth-related components
│   └── ui/           # Reusable UI components
lib/
├── api/              # API client setup (axios, interceptors)
├── auth/             # Auth utilities (JWT parsing, constants)
├── config/           # Environment and configuration
├── hooks/            # React hooks (useAuth, etc.)
└── theme.ts          # MUI theme customization
```

### 6. TypeScript Path Aliases

The project uses `@/*` path aliases configured in `tsconfig.json`:

```typescript
import { config } from '@/lib/config';
import { useAuth } from '@/lib/hooks/useAuth';
import UserInfoSidebar from '@/src/components/ui/UserInfoSidebar';
```

**Note:** Both `./src/*` and `./*` map to `@/*`, so imports from root `lib/` use `@/lib/...`

## Common Development Tasks

### Adding a New Feature Module

1. **Create API routes:**
   ```
   src/app/api/[feature]/route.ts          # GET all, POST create
   src/app/api/[feature]/[id]/route.ts     # GET one, PUT update, DELETE
   src/app/api/[feature]/search/route.ts   # Search endpoint (if needed)
   ```

2. **Create type definitions:**
   ```typescript
   // lib/api/types/[feature].ts
   export interface Feature {
     id: string;
     // ... fields
   }
   ```

3. **Create service layer (optional):**
   ```typescript
   // lib/api/services/[feature].ts
   export async function getFeatures() { /* ... */ }
   ```

4. **Create UI components:**
   ```
   src/app/[feature]/page.tsx           # Feature page
   src/components/ui/[Feature]/...      # Feature components
   ```

5. **Update route protection** (if needed):
   - Add to `PROTECTED_PATHS` in `lib/auth/constants.ts`
   - Add to matcher in `src/proxy.ts`

### Working with Authentication

**Get current user in components:**
```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, displayName, role, isLoading, isAuthenticated } = useAuth();
  // ...
}
```

**Important:** The `useAuth` hook reads JWT from cookies client-side for display only. Actual auth validation happens server-side via middleware and backend API.

### Environment Variables

**Required variables** (see `env.template`):
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_APP_URL` - This module's URL
- `NEXT_PUBLIC_MAIN_APP_URL` - Main BANTAL app for SSO

**Optional variables:**
- `NEXT_PUBLIC_MODULE_NAME` - defaults to "sar-module"
- `NEXT_PUBLIC_MODULE_DISPLAY_NAME` - defaults to "SAR Module"
- `NEXT_PUBLIC_MODULE_VERSION` - defaults to "0.1.0"

**Setup:** `cp env.template .env.local`

### Styling and Theming

- MUI theme defined in `lib/theme.ts`
- Uses Emotion for CSS-in-JS
- Custom SAR branding colors included
- Framer Motion available for animations

**Usage:**
```typescript
import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/config/env.ts` | Environment variable validation with Zod |
| `lib/config/index.ts` | Centralized configuration object |
| `src/proxy.ts` | Authentication middleware |
| `lib/auth/constants.ts` | Protected/public path definitions |
| `lib/auth/client.ts` | JWT parsing utilities |
| `lib/hooks/useAuth.ts` | React hook for current user |
| `lib/theme.ts` | MUI theme customization |
| `src/app/layout.tsx` | Root layout with providers |
| `src/app/api/*/route.ts` | API proxy routes |

## Example Features

The template includes two example features for reference:

1. **Client Management** (`/api/clients`) - Full CRUD operations
2. **Identity Management** (`/api/identities`) - Personnel data

Study these patterns when implementing new features.

## Security Considerations

- **Never** commit `.env.local` to version control
- **Never** prefix sensitive secrets with `NEXT_PUBLIC_` (they'll be exposed to browser)
- **Always** use `credentials: 'include'` in fetch calls to include cookies
- **Always** forward cookies in API proxy routes: `request.cookies.toString()`
- **Always** validate input with Zod schemas before sending to backend
- Cookie security (HTTPOnly, Secure, SameSite) is handled by backend API

## Troubleshooting

**Auth redirect loops:**
- Check `auth_session` cookie exists in browser DevTools
- Verify `NEXT_PUBLIC_MAIN_APP_URL` is correct
- Ensure backend sets cookies on `.centri.id` domain

**401 errors from API:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check cookies are being forwarded in API route
- Confirm backend CORS allows credentials

**TypeScript errors:**
- Run `npx tsc --noEmit` to see all errors
- Check `tsconfig.json` strict mode is enabled
- Verify path aliases are correct (`@/*`)

**Environment validation fails:**
- Compare `.env.local` with `env.template`
- Check for typos in variable names
- Ensure all required variables are set

## Docker Development

```bash
# Run with docker-compose
docker-compose up

# Module runs on port 3100
# Access at http://localhost:3100
```

Note: Docker config mounts current directory as `/app` volume for live reloading.

## Additional Documentation

- **README.md** - Template overview and quick start
- **TEMPLATE_USAGE.md** - Complete customization guide
- **AUTH_SETUP.md** - Authentication system details
- **env.template** - Environment variable reference
