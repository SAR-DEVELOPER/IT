# BANTAL Module Template - Usage Guide

Welcome to the SAR Module Template! This template provides a production-ready foundation for building business applications with Next.js, complete with authentication, API management, and modern UI components.

## 🚀 Quick Start

### 1. Clone/Fork This Repository

```bash
# Clone the template
git clone git@github.com:SAR-DEVELOPER/BANTAL-Module-Template.git
cd BANTAL-Module-Template

# Or use GitHub's "Use this template" feature
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the template
cp .env.template .env.local

# Edit .env.local with your values
```

**Required variables:**
```env
NEXT_PUBLIC_API_URL=https://api.centri.id
NEXT_PUBLIC_APP_URL=https://yourmodule.centri.id
NEXT_PUBLIC_MAIN_APP_URL=https://web.centri.id

# Optional - customize your module
NEXT_PUBLIC_MODULE_NAME=your-module
NEXT_PUBLIC_MODULE_DISPLAY_NAME=Your Module
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3900](http://localhost:3900)

## 📁 What's Included

### Core Infrastructure (Keep These)

- **Authentication System**
  - Cookie-based SSO with Keycloak
  - Middleware for route protection
  - `useAuth` hook for client components
  - Auth API routes (`/api/auth/profile`, `/api/auth/refresh`)

- **Configuration Management**
  - Centralized config in `lib/config/`
  - Environment variable validation with Zod
  - Type-safe access to all settings

- **API Layer**
  - Proxy pattern through Next.js API routes
  - Automatic cookie forwarding
  - Consistent error handling

- **UI Components**
  - Material-UI (MUI) v6 with custom theme
  - `UserInfoSidebar` - displays current user
  - Framer Motion animations
  - Responsive Grid layout

### Example Features (Customize or Remove)

1. **Client Management** (`src/app/api/clients/`, `lib/api/services/client.ts`)
   - Full CRUD operations
   - Search and filter
   - Modal-based browser component
   - Example of entity management

2. **Identity/Personnel** (`src/app/api/identities/`, `lib/api/services/identity.ts`)
   - Personnel data management
   - Search functionality
   - Example of data transformation

**You can:**
- ✅ Keep these as reference examples
- ✅ Customize them for your needs
- ✅ Remove them entirely if not needed

## 🛠️ Customizing for Your Module

### Step 1: Update Module Information

**File:** `.env.local`
```env
NEXT_PUBLIC_MODULE_NAME=inventory
NEXT_PUBLIC_MODULE_DISPLAY_NAME=Inventory Management
NEXT_PUBLIC_MODULE_VERSION=1.0.0
```

**File:** `package.json`
```json
{
  "name": "inventory-module",
  "version": "1.0.0"
}
```

### Step 2: Update Home Page

**File:** `src/app/page.tsx`

Replace the example module cards with your own:

```typescript
const businessModules = [
  {
    title: "Products",
    description: "Manage product inventory",
    urlTarget: "/products",
    icon: <InventoryIcon />,
    color: "#1976d2",
    badge: "Core",
    available: true, // Set to true when ready
  },
  // Add more modules...
];
```

### Step 3: Add Your Features

#### Creating a New Feature

1. **Create API Routes** (`src/app/api/your-feature/`)

```typescript
// src/app/api/products/route.ts
export async function GET(request: NextRequest) {
  const cookies = request.cookies.toString();

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookies && { 'Cookie': cookies }),
    },
  });

  return NextResponse.json(await response.json());
}
```

2. **Create Service Layer** (`lib/api/services/your-feature.ts`)

```typescript
// lib/api/services/products.ts
export const ProductService = {
  getAll: async () => {
    const response = await fetch('/api/products', {
      credentials: 'include', // Important!
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },
};
```

3. **Create Type Definitions** (`lib/types/your-feature.ts`)

```typescript
// lib/types/products.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  // ...
}
```

4. **Create Pages** (`src/app/your-feature/page.tsx`)

```typescript
'use client';
import { useAuth } from '@/lib/hooks/useAuth';
import { ProductService } from '@/lib/api/services/products';

export default function ProductsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Unauthorized</div>;

  // Your component logic...
}
```

### Step 4: Configure Route Protection

**File:** `lib/auth/constants.ts`

```typescript
export const PROTECTED_PATHS = [
  "/",
  "/products",      // Add your routes
  "/inventory",
  // ...
];

export const PUBLIC_PATHS = [
  "/api/*",
  "/_next/*",
  "/product/:id",   // Public detail pages
  // ...
];
```

**File:** `src/proxy.ts`

```typescript
export const config = {
  matcher: [
    "/",
    "/products/:path*",    // Add matchers for your routes
    "/inventory/:path*",
  ],
};
```

## 🎨 Customizing the Theme

**File:** `lib/theme.ts`

Customize colors, typography, and component styles:

```typescript
export const customColors = {
  primary: "#your-primary-color",
  secondary: "#your-secondary-color",
  // ...
};
```

## 📚 Key Patterns

### 1. Authentication

```typescript
'use client';
import { useAuth } from '@/lib/hooks/useAuth';

export default function MyComponent() {
  const { user, displayName, role, isAuthenticated } = useAuth();

  return <div>Welcome, {displayName}!</div>;
}
```

### 2. API Calls

```typescript
// Always use credentials: 'include' for cookies
const response = await fetch('/api/endpoint', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

### 3. Configuration Access

```typescript
import { config } from '@/lib/config';

const apiUrl = config.api.baseUrl;
const moduleName = config.displayName;
```

## 🔒 Security Best Practices

1. **Never expose secrets**
   - Don't prefix secrets with `NEXT_PUBLIC_`
   - Use `getKeycloakClientSecret()` only server-side

2. **Cookie-based auth**
   - Never store tokens in localStorage
   - Always use `credentials: 'include'`

3. **Route protection**
   - Add all protected routes to `PROTECTED_PATHS`
   - Test middleware configuration

## 🧪 Testing Your Module

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Check for TypeScript errors
npx tsc --noEmit
```

## 📝 Removing Example Features

If you don't need the Client/Identity examples:

```bash
# Remove Client Management
rm -rf src/app/api/clients
rm -rf src/components/ui/ClientBrowser
rm lib/api/services/client.ts
rm lib/api/types/client.ts

# Remove Identity Management
rm -rf src/app/api/identities
rm lib/api/services/identity.ts
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables in Production

Ensure all required variables are set:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MAIN_APP_URL`
- `KEYCLOAK_CLIENT_SECRET` (server-side only!)

### Docker Deployment

A `docker-compose.yml` is included for containerized deployment.

## 📖 Additional Documentation

- [CLAUDE.md](CLAUDE.md) - Development guidelines for Claude Code
- [README.md](README.md) - Project overview
- [AUTH_SETUP.md](AUTH_SETUP.md) - Authentication details
- [PHASE1_CHANGES.md](PHASE1_CHANGES.md) - Phase 1 improvements
- [.env.template](.env.template) - Environment variable reference

## 🆘 Troubleshooting

### Authentication Issues

**Problem:** Constantly redirected to login
- Check cookies in browser dev tools
- Ensure backend sets cookies on `.centri.id` domain
- Verify you're not in private/incognito mode

**Problem:** 401 errors on API calls
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify `credentials: 'include'` in fetch calls
- Check backend CORS configuration

### Build Issues

**Problem:** TypeScript errors
- Run `npx tsc --noEmit` to see all errors
- Check imports and type definitions
- Verify all dependencies are installed

### Configuration Issues

**Problem:** Environment validation fails
- Check `.env.local` against `.env.template`
- Ensure all required variables are set
- Check for typos in variable names

## 💡 Tips

1. **Start Small**: Begin with one feature, get it working, then expand
2. **Follow Patterns**: Use Client/Identity examples as reference
3. **Type Everything**: Leverage TypeScript for safety
4. **Test Often**: Build frequently to catch errors early
5. **Document**: Add comments and update docs as you go

## 🤝 Support

For questions or issues:
- Check [CLAUDE.md](CLAUDE.md) for detailed patterns
- Review example features (Client, Identity)
- Contact the SAR development team

---

**Happy Building! 🚀**

Built with ❤️ using Next.js, Material-UI, and modern web technologies.
