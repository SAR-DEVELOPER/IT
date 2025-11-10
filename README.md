# BANTAL Module Template

A production-ready Next.js template for building SAR business applications with authentication, API management, and modern UI components.

## 🎯 What Is This?

This is a **template repository** - a starting point for creating new business modules in the SAR ecosystem. It provides:

- ✅ **Complete authentication** - Cookie-based SSO with Keycloak
- ✅ **Centralized configuration** - Type-safe, validated environment management
- ✅ **API proxy pattern** - Clean separation with automatic cookie forwarding
- ✅ **Modern UI** - Material-UI v6 with custom theme and animations
- ✅ **Example features** - Client and Identity management as reference
- ✅ **Production-ready** - Security best practices and error handling

## 🚀 Quick Start

```bash
# 1. Use this template
# Click "Use this template" on GitHub, or clone it

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.template .env.local
# Edit .env.local with your values

# 4. Run development server
npm run dev
```

Open [http://localhost:3900](http://localhost:3900)

**📚 See [TEMPLATE_USAGE.md](TEMPLATE_USAGE.md) for complete setup and customization guide.**

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript 5
- **UI Library**: [Material-UI (MUI) v6](https://mui.com/)
- **Styling**: Emotion (CSS-in-JS)
- **HTTP Client**: Fetch API with credentials
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Validation**: Zod

## 📁 What's Included

### Core Infrastructure

```
lib/
├── auth/              # Authentication system
│   ├── client.ts      # JWT utilities
│   ├── constants.ts   # Route protection
│   └── keycloak.ts    # Keycloak config
├── config/            # Configuration management
│   ├── env.ts         # Environment validation
│   └── index.ts       # Centralized config
├── hooks/
│   └── useAuth.ts     # Auth hook for components
└── theme.ts           # MUI theme customization

src/
├── app/
│   ├── api/
│   │   ├── auth/      # Auth endpoints
│   │   ├── clients/   # Example: Client CRUD
│   │   └── identities/ # Example: Personnel data
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Dashboard with UserInfoSidebar
├── components/
│   └── ui/
│       ├── UserInfoSidebar.tsx  # Current user display
│       └── ClientBrowser/       # Example entity browser
└── proxy.ts           # Middleware for route protection
```

### Example Features

1. **Client Management** - Full CRUD with search and modals
2. **Identity/Personnel** - Personnel data management

These serve as reference implementations showing the template patterns.

## ⚙️ Key Features

### 1. Authentication System

- **Cookie-based SSO** - Shared authentication across SAR modules
- **Automatic redirects** - Middleware handles login flow
- **Token refresh** - Transparent token renewal
- **User hook** - `useAuth()` for easy access to user data

### 2. Configuration Management

- **Environment validation** - Zod schemas catch errors at startup
- **Type-safe access** - Full TypeScript support
- **Centralized** - Single source of truth for all config

### 3. API Layer

- **Proxy pattern** - Next.js API routes proxy to backend
- **Cookie forwarding** - Automatic authentication
- **CORS-free** - No cross-origin issues
- **Consistent errors** - Standardized error handling

### 4. Modern UI

- **Material-UI v6** - Latest component library
- **Custom theme** - SAR branding colors
- **Responsive** - Mobile-first design
- **Animations** - Smooth transitions with Framer Motion
- **UserInfoSidebar** - Built-in user identity display

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Access to BANTAL API backend
- Keycloak authentication (for SSO)

## 🔧 Available Scripts

```bash
npm run dev      # Start development server (port 3900)
npm run build    # Create production build
npm start        # Start production server (port 3900)
```

## 🌐 Environment Variables

**Required:**

```env
NEXT_PUBLIC_API_URL=https://api.centri.id
NEXT_PUBLIC_APP_URL=https://yourmodule.centri.id
NEXT_PUBLIC_MAIN_APP_URL=https://web.centri.id
```

**Optional:**

```env
NEXT_PUBLIC_MODULE_NAME=your-module
NEXT_PUBLIC_MODULE_DISPLAY_NAME=Your Module
NEXT_PUBLIC_MODULE_VERSION=1.0.0
```

See [.env.template](.env.template) for complete reference.

## 🎨 Customizing for Your Module

### 1. Update Module Info

- Edit `.env.local` with your module name and URLs
- Update `package.json` name and version

### 2. Customize Home Page

- Edit `src/app/page.tsx`
- Replace example module cards with your features

### 3. Add Your Features

```typescript
// 1. Create API routes
src/app/api/your-feature/route.ts

// 2. Create service layer
lib/api/services/yourFeature.ts

// 3. Create types
lib/types/yourFeature.ts

// 4. Create pages
src/app/your-feature/page.tsx
```

### 4. Configure Routes

- Add protected paths to `lib/auth/constants.ts`
- Update matchers in `src/proxy.ts`

**📚 Full guide:** [TEMPLATE_USAGE.md](TEMPLATE_USAGE.md)

## 🔒 Security

- **HTTP-only cookies** - XSS protection
- **Server-side validation** - JWT checked by backend
- **No secrets in code** - Environment variables only
- **HTTPS enforcement** - Secure flag on cookies
- **Route protection** - Middleware guards protected routes

## 📚 Documentation

- **[TEMPLATE_USAGE.md](TEMPLATE_USAGE.md)** - Complete setup and customization guide
- **[CLAUDE.md](CLAUDE.md)** - Development guidelines for Claude Code
- **[AUTH_SETUP.md](AUTH_SETUP.MD)** - Authentication system details
- **[PHASE1_CHANGES.md](PHASE1_CHANGES.md)** - Security improvements (Phase 1)
- **[.env.template](.env.template)** - Environment variable reference

## 🏗️ Architecture Highlights

### Cookie-Based SSO

Authentication is shared across all SAR modules using cookies on `.centri.id` domain. The middleware checks for `auth_session` cookie and redirects to the main BANTAL app for login if missing.

### API Proxy Pattern

All API calls go through Next.js API routes, which proxy to the backend. This avoids CORS issues and centralizes authentication cookie handling.

### Service Layer

Business logic is abstracted into service modules, keeping components clean and focused on UI. Services use native `fetch` with `credentials: 'include'`.

### Type Safety

Full TypeScript coverage with strict mode enabled. Zod schemas validate environment variables at runtime.

## 🚧 Removing Example Features

Don't need the Client/Identity examples?

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

## 🆘 Troubleshooting

### Auth Issues

**Redirecting to login constantly:**
- Check cookies in browser dev tools (look for `auth_session`)
- Ensure backend sets cookies on `.centri.id` domain
- Not in private/incognito mode

**401 errors:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check `credentials: 'include'` in all fetch calls
- Verify backend CORS configuration

### Build Issues

**TypeScript errors:**
```bash
npx tsc --noEmit  # See all errors
```

**Environment validation fails:**
- Compare `.env.local` with `.env.template`
- Check for typos in variable names
- Ensure all required variables are set

## 🤝 Contributing

This template is actively maintained by the SAR development team. For improvements:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

This project is private and proprietary to SAR Tax & Management Consultant.

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 💡 Tips for Success

1. **Start with examples** - Study Client/Identity features
2. **Follow patterns** - Use existing code as reference
3. **Type everything** - Leverage TypeScript
4. **Test often** - Build frequently
5. **Read docs** - Check TEMPLATE_USAGE.md and CLAUDE.md

---

## 📞 Support

For questions or issues:
- Check documentation files
- Review example features
- Contact SAR development team

---

**Built with ❤️ using Next.js, Material-UI, and modern web technologies.**

Ready to build your module? Start with [TEMPLATE_USAGE.md](TEMPLATE_USAGE.md)!
